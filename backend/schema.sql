CREATE DATABASE IF NOT EXISTS gfg_club;
USE gfg_club;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('User', 'Core', 'Admin') DEFAULT 'User',
    department VARCHAR(255),
    year INT,
    gfg_profile VARCHAR(255),
    leetcode_profile VARCHAR(255),
    codeforces_profile VARCHAR(255),
    github_profile VARCHAR(255),
    gfg_score INT DEFAULT 0,
    gfg_solved INT DEFAULT 0,
    problems_solved INT DEFAULT 0,
    streak INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    poster VARCHAR(255),
    date DATETIME,
    location VARCHAR(255),
    organizer VARCHAR(255),
    is_open BOOLEAN DEFAULT TRUE,
    participation_type ENUM('individual', 'team', 'both') DEFAULT 'individual',
    max_team_size INT DEFAULT 1,
    rules TEXT,
    requirements TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    leader_id INT NOT NULL,
    event_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS event_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    team_id INT DEFAULT NULL,
    status ENUM('Pending', 'Accepted', 'Declined') DEFAULT 'Accepted',
    is_leader BOOLEAN DEFAULT FALSE,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
);

-- (rest of the tables like problems, blogs, projects, discussions remain)
