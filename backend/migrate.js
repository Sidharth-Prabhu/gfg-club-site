import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const migrate = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gfg_club',
  });

  console.log('Starting migration...');

  try {
    // 1. Update users table
    const [userCols] = await connection.execute('SHOW COLUMNS FROM users');
    const userColNames = userCols.map(c => c.Field);

    if (!userColNames.includes('role')) {
      await connection.execute("ALTER TABLE users ADD COLUMN role ENUM('User', 'Core', 'Admin') DEFAULT 'User'");
      console.log('Added role to users');
    }
    if (!userColNames.includes('gfg_score')) {
        await connection.execute("ALTER TABLE users ADD COLUMN gfg_score INT DEFAULT 0");
        console.log('Added gfg_score to users');
    }
    if (!userColNames.includes('gfg_solved')) {
        await connection.execute("ALTER TABLE users ADD COLUMN gfg_solved INT DEFAULT 0");
        console.log('Added gfg_solved to users');
    }
    if (!userColNames.includes('streak')) {
        await connection.execute("ALTER TABLE users ADD COLUMN streak INT DEFAULT 0");
        console.log('Added streak to users');
    }
    if (!userColNames.includes('skills')) {
        await connection.execute("ALTER TABLE users ADD COLUMN skills TEXT");
        console.log('Added skills to users');
    }
    if (!userColNames.includes('resume_url')) {
        await connection.execute("ALTER TABLE users ADD COLUMN resume_url VARCHAR(255)");
        console.log('Added resume_url to users');
    }
    if (!userColNames.includes('about')) {
        await connection.execute("ALTER TABLE users ADD COLUMN about TEXT");
        console.log('Added about to users');
    }
    if (!userColNames.includes('status')) {
        await connection.execute("ALTER TABLE users ADD COLUMN status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending'");
        console.log('Added status to users');
    }
    if (!userColNames.includes('profile_pic')) {
        await connection.execute("ALTER TABLE users ADD COLUMN profile_pic LONGTEXT");
        console.log('Added profile_pic to users');
    }

    // 2. Update events table
    const [eventsCols] = await connection.execute('SHOW COLUMNS FROM events');
    const eventColNames = eventsCols.map(c => c.Field);

    if (!eventColNames.includes('participation_type')) {
      await connection.execute("ALTER TABLE events ADD COLUMN participation_type ENUM('individual', 'team', 'both') DEFAULT 'individual'");
      console.log('Added participation_type to events');
    }
    if (!eventColNames.includes('max_team_size')) {
      await connection.execute("ALTER TABLE events ADD COLUMN max_team_size INT DEFAULT 1");
      console.log('Added max_team_size to events');
    }
    if (!eventColNames.includes('rules')) {
      await connection.execute("ALTER TABLE events ADD COLUMN rules TEXT");
      console.log('Added rules to events');
    }
    if (!eventColNames.includes('requirements')) {
      await connection.execute("ALTER TABLE events ADD COLUMN requirements TEXT");
      console.log('Added requirements to events');
    }
    if (!eventColNames.includes('organizer')) {
        await connection.execute("ALTER TABLE events ADD COLUMN organizer VARCHAR(255)");
        console.log('Added organizer to events');
    }
    if (!eventColNames.includes('is_open')) {
        await connection.execute("ALTER TABLE events ADD COLUMN is_open BOOLEAN DEFAULT TRUE");
        console.log('Added is_open to events');
    }

    // 3. Create teams table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS teams (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        leader_id INT NOT NULL,
        event_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      )
    `);
    console.log('Ensured teams table exists');

    // 4. Update event_registrations table
    const [regCols] = await connection.execute('SHOW COLUMNS FROM event_registrations');
    const regColNames = regCols.map(c => c.Field);

    if (!regColNames.includes('team_id')) {
      await connection.execute("ALTER TABLE event_registrations ADD COLUMN team_id INT DEFAULT NULL");
      // Add foreign key if it doesn't exist (simplified check)
      try {
          await connection.execute("ALTER TABLE event_registrations ADD FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL");
      } catch (e) { /* might already exist */ }
      console.log('Added team_id to event_registrations');
    }
    if (!regColNames.includes('status')) {
      await connection.execute("ALTER TABLE event_registrations ADD COLUMN status ENUM('Pending', 'Accepted', 'Declined') DEFAULT 'Accepted'");
      console.log('Added status to event_registrations');
    }
    if (!regColNames.includes('is_leader')) {
      await connection.execute("ALTER TABLE event_registrations ADD COLUMN is_leader BOOLEAN DEFAULT FALSE");
      console.log('Added is_leader to event_registrations');
    }

    // 5. Create user_activity table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_activity (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        activity_date DATE NOT NULL,
        problems_solved INT DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY user_date (user_id, activity_date)
      )
    `);
    console.log('Ensured user_activity table exists');

    // 6. Create community_groups table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS community_groups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        logo VARCHAR(255),
        created_by INT NOT NULL,
        max_members INT DEFAULT 100,
        allow_guests BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Ensured community_groups table exists');

    // 7. Create group_members table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS group_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_id INT NOT NULL,
        user_id INT NOT NULL,
        status ENUM('Pending', 'Accepted', 'Declined') DEFAULT 'Pending',
        role ENUM('Member', 'Moderator', 'Admin') DEFAULT 'Member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES community_groups(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY user_group (user_id, group_id)
      )
    `);
    console.log('Ensured group_members table exists');

    // 8. Update discussions table to include group_id
    const [discCols] = await connection.execute('SHOW COLUMNS FROM discussions');
    const discColNames = discCols.map(c => c.Field);
    if (!discColNames.includes('group_id')) {
      await connection.execute("ALTER TABLE discussions ADD COLUMN group_id INT DEFAULT NULL");
      try {
          await connection.execute("ALTER TABLE discussions ADD FOREIGN KEY (group_id) REFERENCES community_groups(id) ON DELETE CASCADE");
      } catch (e) { /* might exist */ }
      console.log('Added group_id to discussions');
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
};

migrate();
