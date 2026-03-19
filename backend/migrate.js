import mysql from 'mysql2/promise';
import admin, { db, auth } from './config/firebase.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

// Batch size for Firestore writes
const BATCH_SIZE = 500;

const migrate = async () => {
  console.log('Starting MySQL to Firebase migration...');
  
  // Connect to MySQL
  let mysqlConnection;
  try {
    mysqlConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'gfg_club',
    });
    console.log('Connected to MySQL database');
  } catch (error) {
    console.error('Failed to connect to MySQL:', error.message);
    console.log('Skipping data migration (no MySQL connection)');
    return;
  }

  try {
    // Migrate Users
    console.log('\n📦 Migrating users...');
    const [users] = await mysqlConnection.execute('SELECT * FROM users');
    let successCount = 0;
    let failCount = 0;
    
    for (const user of users) {
      try {
        // Create Firebase Auth user if doesn't exist
        try {
          await auth.getUserByEmail(user.email);
        } catch (e) {
          // User doesn't exist in Firebase Auth, create them
          try {
            await auth.createUser({
              uid: user.id.toString(),
              email: user.email,
              displayName: user.name,
              passwordHash: user.password,
              passwordHashAlgorithm: 'BCRYPT',
            });
          } catch (authError) {
            console.log(`  Skipping auth creation for ${user.email}: ${authError.message}`);
          }
        }
        
        // Create Firestore document
        const userData = {
          name: user.name,
          email: user.email,
          role: user.role || 'User',
          status: user.status || 'Approved',
          department: user.department || null,
          year: user.year || null,
          gfg_profile: user.gfg_profile || null,
          leetcode_profile: user.leetcode_profile || null,
          codeforces_profile: user.codeforces_profile || null,
          github_profile: user.github_profile || null,
          gfg_score: user.gfg_score || 0,
          gfg_solved: user.gfg_solved || 0,
          problems_solved: user.problems_solved || 0,
          leetcode_solved: user.leetcode_solved || 0,
          github_repos: user.github_repos || 0,
          weekly_points: user.weekly_points || 0,
          streak: user.streak || 0,
          skills: user.skills || null,
          about: user.about || null,
          resume_url: user.resume_url || null,
          profile_pic: user.profile_pic || null,
          last_login: user.last_login ? user.last_login.toISOString().split('T')[0] : null,
          created_at: user.created_at || admin.firestore.FieldValue.serverTimestamp(),
          password_hash: user.password // Store hashed password for login compatibility
        };
        
        await db.collection('users').doc(user.id.toString()).set(userData);
        successCount++;
        process.stdout.write(`\r  Migrated ${successCount}/${users.length} users`);
      } catch (error) {
        failCount++;
        console.error(`\n  Error migrating user ${user.id}: ${error.message}`);
      }
    }
    console.log(`\n  ✅ Users migrated: ${successCount} successful, ${failCount} failed`);

    // Migrate Events
    console.log('\n📦 Migrating events...');
    const [events] = await mysqlConnection.execute('SELECT * FROM events');
    successCount = 0;
    
    for (const event of events) {
      try {
        const eventData = {
          title: event.title,
          description: event.description || null,
          poster: event.poster || null,
          date: event.date || null,
          location: event.location || null,
          organizer: event.organizer || null,
          is_open: Boolean(event.is_open),
          participation_type: event.participation_type || 'individual',
          max_team_size: event.max_team_size || 1,
          rules: event.rules || null,
          requirements: event.requirements || null,
          created_at: event.created_at || admin.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('events').doc(event.id.toString()).set(eventData);
        successCount++;
        process.stdout.write(`\r  Migrated ${successCount}/${events.length} events`);
      } catch (error) {
        console.error(`\n  Error migrating event ${event.id}: ${error.message}`);
      }
    }
    console.log(`\n  ✅ Events migrated: ${successCount}`);

    // Migrate Teams
    console.log('\n📦 Migrating teams...');
    const [teams] = await mysqlConnection.execute('SELECT * FROM teams');
    successCount = 0;
    
    for (const team of teams) {
      try {
        const teamData = {
          name: team.name,
          leader_id: team.leader_id.toString(),
          event_id: team.event_id.toString(),
          created_at: team.created_at || admin.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('teams').doc(team.id.toString()).set(teamData);
        successCount++;
        process.stdout.write(`\r  Migrated ${successCount}/${teams.length} teams`);
      } catch (error) {
        console.error(`\n  Error migrating team ${team.id}: ${error.message}`);
      }
    }
    console.log(`\n  ✅ Teams migrated: ${successCount}`);

    // Migrate Event Registrations
    console.log('\n📦 Migrating event registrations...');
    const [registrations] = await mysqlConnection.execute('SELECT * FROM event_registrations');
    successCount = 0;
    
    for (const reg of registrations) {
      try {
        const regData = {
          user_id: reg.user_id.toString(),
          event_id: reg.event_id.toString(),
          team_id: reg.team_id ? reg.team_id.toString() : null,
          status: reg.status || 'Accepted',
          is_leader: Boolean(reg.is_leader),
          registered_at: reg.registered_at || admin.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('event_registrations').doc(reg.id.toString()).set(regData);
        successCount++;
        process.stdout.write(`\r  Migrated ${successCount}/${registrations.length} registrations`);
      } catch (error) {
        console.error(`\n  Error migrating registration ${reg.id}: ${error.message}`);
      }
    }
    console.log(`\n  ✅ Event registrations migrated: ${successCount}`);

    // Migrate Problems
    console.log('\n📦 Migrating problems...');
    const [problems] = await mysqlConnection.execute('SELECT * FROM problems');
    successCount = 0;
    
    for (const problem of problems) {
      try {
        const problemData = {
          title: problem.title,
          difficulty: problem.difficulty,
          topic: problem.topic || null,
          link: problem.link,
          created_at: problem.created_at || admin.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('problems').doc(problem.id.toString()).set(problemData);
        successCount++;
        process.stdout.write(`\r  Migrated ${successCount}/${problems.length} problems`);
      } catch (error) {
        console.error(`\n  Error migrating problem ${problem.id}: ${error.message}`);
      }
    }
    console.log(`\n  ✅ Problems migrated: ${successCount}`);

    // Migrate Blogs
    console.log('\n📦 Migrating blogs...');
    const [blogs] = await mysqlConnection.execute('SELECT * FROM blogs');
    successCount = 0;
    
    for (const blog of blogs) {
      try {
        const blogData = {
          title: blog.title,
          content: blog.content,
          author_id: blog.author_id.toString(),
          tags: blog.tags || null,
          created_at: blog.created_at || admin.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('blogs').doc(blog.id.toString()).set(blogData);
        successCount++;
        process.stdout.write(`\r  Migrated ${successCount}/${blogs.length} blogs`);
      } catch (error) {
        console.error(`\n  Error migrating blog ${blog.id}: ${error.message}`);
      }
    }
    console.log(`\n  ✅ Blogs migrated: ${successCount}`);

    // Migrate Projects
    console.log('\n📦 Migrating projects...');
    const [projects] = await mysqlConnection.execute('SELECT * FROM projects');
    successCount = 0;
    
    for (const project of projects) {
      try {
        const projectData = {
          title: project.title,
          description: project.description || null,
          github_link: project.github_link || null,
          demo_link: project.demo_link || null,
          tech_stack: project.tech_stack || null,
          category: project.category || null,
          created_by: project.created_by.toString(),
          status: project.status || 'Pending',
          created_at: project.created_at || admin.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('projects').doc(project.id.toString()).set(projectData);
        successCount++;
        process.stdout.write(`\r  Migrated ${successCount}/${projects.length} projects`);
      } catch (error) {
        console.error(`\n  Error migrating project ${project.id}: ${error.message}`);
      }
    }
    console.log(`\n  ✅ Projects migrated: ${successCount}`);

    // Migrate Project Files
    console.log('\n📦 Migrating project files...');
    const [projectFiles] = await mysqlConnection.execute('SELECT * FROM project_files');
    successCount = 0;
    
    for (const file of projectFiles) {
      try {
        const fileData = {
          project_id: file.project_id.toString(),
          file_name: file.file_name || null,
          file_url: file.file_url,
          file_type: file.file_type || null,
          created_at: file.created_at || admin.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('project_files').doc(file.id.toString()).set(fileData);
        successCount++;
        process.stdout.write(`\r  Migrated ${successCount}/${projectFiles.length} project files`);
      } catch (error) {
        console.error(`\n  Error migrating project file ${file.id}: ${error.message}`);
      }
    }
    console.log(`\n  ✅ Project files migrated: ${successCount}`);

    // Migrate Project Votes
    console.log('\n📦 Migrating project votes...');
    const [projectVotes] = await mysqlConnection.execute('SELECT * FROM project_votes');
    successCount = 0;
    
    for (const vote of projectVotes) {
      try {
        const voteData = {
          user_id: vote.user_id.toString(),
          project_id: vote.project_id.toString(),
          vote_type: vote.vote_type,
          created_at: vote.created_at || admin.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('project_votes').doc(vote.id.toString()).set(voteData);
        successCount++;
        process.stdout.write(`\r  Migrated ${successCount}/${projectVotes.length} project votes`);
      } catch (error) {
        console.error(`\n  Error migrating project vote ${vote.id}: ${error.message}`);
      }
    }
    console.log(`\n  ✅ Project votes migrated: ${successCount}`);

    // Migrate Community Groups
    console.log('\n📦 Migrating community groups...');
    const [groups] = await mysqlConnection.execute('SELECT * FROM community_groups');
    successCount = 0;
    
    for (const group of groups) {
      try {
        const groupData = {
          title: group.title,
          description: group.description || null,
          logo: group.logo || null,
          created_by: group.created_by.toString(),
          max_members: group.max_members || 100,
          allow_guests: Boolean(group.allow_guests),
          created_at: group.created_at || admin.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('community_groups').doc(group.id.toString()).set(groupData);
        successCount++;
        process.stdout.write(`\r  Migrated ${successCount}/${groups.length} community groups`);
      } catch (error) {
        console.error(`\n  Error migrating community group ${group.id}: ${error.message}`);
      }
    }
    console.log(`\n  ✅ Community groups migrated: ${successCount}`);

    // Migrate Group Members
    console.log('\n📦 Migrating group members...');
    const [groupMembers] = await mysqlConnection.execute('SELECT * FROM group_members');
    successCount = 0;
    
    for (const member of groupMembers) {
      try {
        const memberData = {
          group_id: member.group_id.toString(),
          user_id: member.user_id.toString(),
          status: member.status || 'Pending',
          role: member.role || 'Member',
          joined_at: member.joined_at || admin.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('group_members').doc(member.id.toString()).set(memberData);
        successCount++;
        process.stdout.write(`\r  Migrated ${successCount}/${groupMembers.length} group members`);
      } catch (error) {
        console.error(`\n  Error migrating group member ${member.id}: ${error.message}`);
      }
    }
    console.log(`\n  ✅ Group members migrated: ${successCount}`);

    // Migrate Discussions
    console.log('\n📦 Migrating discussions...');
    const [discussions] = await mysqlConnection.execute('SELECT * FROM discussions');
    successCount = 0;
    
    for (const discussion of discussions) {
      try {
        const discussionData = {
          title: discussion.title,
          content: discussion.content,
          author_id: discussion.author_id.toString(),
          group_id: discussion.group_id ? discussion.group_id.toString() : null,
          created_at: discussion.created_at || admin.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('discussions').doc(discussion.id.toString()).set(discussionData);
        successCount++;
        process.stdout.write(`\r  Migrated ${successCount}/${discussions.length} discussions`);
      } catch (error) {
        console.error(`\n  Error migrating discussion ${discussion.id}: ${error.message}`);
      }
    }
    console.log(`\n  ✅ Discussions migrated: ${successCount}`);

    // Migrate Post Tags
    console.log('\n📦 Migrating post tags...');
    const [postTags] = await mysqlConnection.execute('SELECT * FROM post_tags');
    successCount = 0;
    
    for (const tag of postTags) {
      try {
        const tagData = {
          post_id: tag.post_id.toString(),
          tag: tag.tag
        };
        
        await db.collection('post_tags').doc(tag.id.toString()).set(tagData);
        successCount++;
        process.stdout.write(`\r  Migrated ${successCount}/${postTags.length} post tags`);
      } catch (error) {
        console.error(`\n  Error migrating post tag ${tag.id}: ${error.message}`);
      }
    }
    console.log(`\n  ✅ Post tags migrated: ${successCount}`);

    // Migrate Post Reactions
    console.log('\n📦 Migrating post reactions...');
    const [postReactions] = await mysqlConnection.execute('SELECT * FROM post_reactions');
    successCount = 0;
    
    for (const reaction of postReactions) {
      try {
        const reactionData = {
          user_id: reaction.user_id.toString(),
          post_id: reaction.post_id.toString(),
          reaction_type: reaction.reaction_type || 'like',
          created_at: reaction.created_at || admin.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('post_reactions').doc(reaction.id.toString()).set(reactionData);
        successCount++;
        process.stdout.write(`\r  Migrated ${successCount}/${postReactions.length} post reactions`);
      } catch (error) {
        console.error(`\n  Error migrating post reaction ${reaction.id}: ${error.message}`);
      }
    }
    console.log(`\n  ✅ Post reactions migrated: ${successCount}`);

    // Migrate Post Comments
    console.log('\n📦 Migrating post comments...');
    const [postComments] = await mysqlConnection.execute('SELECT * FROM post_comments');
    successCount = 0;
    
    for (const comment of postComments) {
      try {
        const commentData = {
          user_id: comment.user_id.toString(),
          post_id: comment.post_id.toString(),
          content: comment.content,
          parent_id: comment.parent_id ? comment.parent_id.toString() : null,
          created_at: comment.created_at || admin.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('post_comments').doc(comment.id.toString()).set(commentData);
        successCount++;
        process.stdout.write(`\r  Migrated ${successCount}/${postComments.length} post comments`);
      } catch (error) {
        console.error(`\n  Error migrating post comment ${comment.id}: ${error.message}`);
      }
    }
    console.log(`\n  ✅ Post comments migrated: ${successCount}`);

    // Migrate Comment Reactions
    console.log('\n📦 Migrating comment reactions...');
    const [commentReactions] = await mysqlConnection.execute('SELECT * FROM comment_reactions');
    successCount = 0;
    
    for (const reaction of commentReactions) {
      try {
        const reactionData = {
          user_id: reaction.user_id.toString(),
          comment_id: reaction.comment_id.toString(),
          created_at: reaction.created_at || admin.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('comment_reactions').doc(reaction.id.toString()).set(reactionData);
        successCount++;
        process.stdout.write(`\r  Migrated ${successCount}/${commentReactions.length} comment reactions`);
      } catch (error) {
        console.error(`\n  Error migrating comment reaction ${reaction.id}: ${error.message}`);
      }
    }
    console.log(`\n  ✅ Comment reactions migrated: ${successCount}`);

    // Migrate Resources
    console.log('\n📦 Migrating resources...');
    const [resources] = await mysqlConnection.execute('SELECT * FROM resources');
    successCount = 0;
    
    for (const resource of resources) {
      try {
        const resourceData = {
          title: resource.title,
          description: resource.description || null,
          link: resource.link,
          category: resource.category || null,
          created_at: resource.created_at || admin.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('resources').doc(resource.id.toString()).set(resourceData);
        successCount++;
        process.stdout.write(`\r  Migrated ${successCount}/${resources.length} resources`);
      } catch (error) {
        console.error(`\n  Error migrating resource ${resource.id}: ${error.message}`);
      }
    }
    console.log(`\n  ✅ Resources migrated: ${successCount}`);

    // Migrate Conversations
    console.log('\n📦 Migrating conversations...');
    const [conversations] = await mysqlConnection.execute('SELECT * FROM conversations');
    successCount = 0;
    
    for (const conv of conversations) {
      try {
        const convData = {
          user1_id: conv.user1_id.toString(),
          user2_id: conv.user2_id.toString(),
          last_message_at: conv.last_message_at || admin.firestore.FieldValue.serverTimestamp(),
          created_at: conv.created_at || admin.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('conversations').doc(conv.id.toString()).set(convData);
        successCount++;
        process.stdout.write(`\r  Migrated ${successCount}/${conversations.length} conversations`);
      } catch (error) {
        console.error(`\n  Error migrating conversation ${conv.id}: ${error.message}`);
      }
    }
    console.log(`\n  ✅ Conversations migrated: ${successCount}`);

    // Migrate Messages
    console.log('\n📦 Migrating messages...');
    const [messages] = await mysqlConnection.execute('SELECT * FROM messages');
    successCount = 0;
    
    for (const message of messages) {
      try {
        const messageData = {
          conversation_id: message.conversation_id.toString(),
          sender_id: message.sender_id.toString(),
          content: message.content,
          is_read: Boolean(message.is_read),
          created_at: message.created_at || admin.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('messages').doc(message.id.toString()).set(messageData);
        successCount++;
        process.stdout.write(`\r  Migrated ${successCount}/${messages.length} messages`);
      } catch (error) {
        console.error(`\n  Error migrating message ${message.id}: ${error.message}`);
      }
    }
    console.log(`\n  ✅ Messages migrated: ${successCount}`);

    // Migrate Notifications
    console.log('\n📦 Migrating notifications...');
    const [notifications] = await mysqlConnection.execute('SELECT * FROM notifications');
    successCount = 0;
    
    for (const notification of notifications) {
      try {
        const notificationData = {
          user_id: notification.user_id.toString(),
          type: notification.type,
          message: notification.message,
          link: notification.link || null,
          is_read: Boolean(notification.is_read),
          created_at: notification.created_at || admin.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('notifications').doc(notification.id.toString()).set(notificationData);
        successCount++;
        process.stdout.write(`\r  Migrated ${successCount}/${notifications.length} notifications`);
      } catch (error) {
        console.error(`\n  Error migrating notification ${notification.id}: ${error.message}`);
      }
    }
    console.log(`\n  ✅ Notifications migrated: ${successCount}`);

    // Migrate User Activity
    console.log('\n📦 Migrating user activity...');
    const [userActivity] = await mysqlConnection.execute('SELECT * FROM user_activity');
    successCount = 0;
    
    for (const activity of userActivity) {
      try {
        const activityData = {
          user_id: activity.user_id.toString(),
          activity_date: activity.activity_date.toISOString().split('T')[0],
          problems_solved: activity.problems_solved || 0
        };
        
        await db.collection('user_activity').doc(`${activity.user_id}_${activity.activity_date.toISOString().split('T')[0]}`).set(activityData);
        successCount++;
        process.stdout.write(`\r  Migrated ${successCount}/${userActivity.length} user activity records`);
      } catch (error) {
        console.error(`\n  Error migrating user activity ${activity.id}: ${error.message}`);
      }
    }
    console.log(`\n  ✅ User activity migrated: ${successCount}`);

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - Users: migrated to Firestore + Firebase Auth');
    console.log('   - All other collections: migrated to Firestore');
    console.log('\n⚠️  Next steps:');
    console.log('   1. Update your .env file with Firebase credentials');
    console.log('   2. Test the application thoroughly');
    console.log('   3. Remove MySQL dependency when ready');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    if (mysqlConnection) {
      await mysqlConnection.end();
    }
  }
};

migrate();
