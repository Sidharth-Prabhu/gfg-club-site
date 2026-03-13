# GeeksforGeeks Campus Club Platform

## Full Project Specification

## Overview

Build a full-stack web platform for a GeeksforGeeks college club that helps manage events, track coding progress, host learning resources, and maintain coding leaderboards for the campus community.

The platform should function as a **coding ecosystem for students**, not just a static club website.

---

# Tech Stack

## Frontend

* React
* Vite
* React Router
* TailwindCSS
* Axios
* Recharts (analytics charts)
* Framer Motion (UI animations)

## Backend

* Node.js
* Express.js

## Database

* MySQL

## Authentication

* JWT based authentication

## Hosting (optional)

Frontend: Vercel / Netlify
Backend: Railway / Render
Database: MySQL

---

# Core Features

## 1. Authentication

Users should be able to:

* Register with name, email, password
* Login
* Logout
* Update profile

User profile includes:

* Name
* Department
* Year
* Coding platform links:

  * GeeksforGeeks
  * LeetCode
  * Codeforces
  * GitHub

---

# 2. Home Page

Landing page introducing the club.

Sections:

### Hero Section

* Club title
* Short description
* Join button

### Campus Coding Stats

Display statistics such as:

* Total members
* Total problems solved
* Active coders this week
* Weekly contest participants

### Upcoming Events

Display upcoming events as cards.

### Leaderboard Preview

Top 5 coders of the campus.

### Learning Tracks

Cards for:

* DSA Beginner
* Competitive Programming
* Interview Preparation
* Web Development

---

# 3. Events System

Admin should be able to:

* Create events
* Edit events
* Delete events

Each event contains:

* Title
* Description
* Poster image
* Date
* Location
* Max participants

Users should be able to:

* Register for events
* View event details
* View past events

---

# 4. Leaderboard

Display coding leaderboard for campus.

Leaderboard metrics:

* Problems solved
* Weekly points
* Streak
* Contest performance

Tabs:

* Weekly leaderboard
* Monthly leaderboard
* All time leaderboard

Leaderboard columns:

Rank | Name | Problems Solved | Streak | Points

---

# 5. Practice Hub

Central place for coding practice.

Sections:

### Problem of the Day

Admin posts a daily coding problem.

Display:

* Problem title
* Difficulty
* Topic
* Link to GeeksforGeeks problem

### Weekly Challenge

A set of curated problems.

### Topic Practice

Topics list:

* Arrays
* Strings
* Trees
* Graphs
* Dynamic Programming
* Greedy
* Backtracking

Each topic page includes:

* Learning resources
* Recommended problems

---

# 6. Resources Page

Collection of learning materials.

Categories:

* DSA Articles
* Interview Preparation
* Competitive Programming
* Workshop Notes
* System Design

Each resource includes:

* Title
* Description
* Link to article or video

---

# 7. Community Discussion

Forum-like system.

Users can:

* Ask questions
* Post coding doubts
* Share solutions

Features:

* Tags (DSA, Graphs, DP, etc.)
* Upvotes
* Replies
* Accepted answer

---

# 8. Projects Showcase

Display projects built by club members.

Each project includes:

* Project title
* Description
* Tech stack
* GitHub repository
* Demo link
* Contributors

Filter by category:

* AI
* Web
* Mobile
* Systems

---

# 9. Blog System

Members can publish technical blogs.

Blog includes:

* Title
* Author
* Content
* Tags
* Publish date

Examples:

* How I solved 500 DSA problems
* Graph algorithms explained
* Competitive programming tips

---

# 10. User Dashboard

After login, users access their dashboard.

Sections:

### Profile

Display:

* User info
* Coding profiles
* Achievements

### Coding Analytics

Charts showing:

* Problems solved per week
* Topic distribution
* Difficulty breakdown

### Activity Timeline

Example activity:

* Solved problem
* Attended event
* Participated in contest

### Recommended Problems

Suggest problems based on weak topics.

---

# 11. Campus Coding Analytics (Special Feature)

Create a dashboard showing campus-wide coding insights.

Metrics:

* Total problems solved by club
* Most solved topic
* Most active department
* Top improving student
* Weekly coding activity

Visualizations:

* Bar charts
* Line charts
* Heatmap of coding activity

---

# Frontend Folder Structure

```
src
│
├── components
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── EventCard.jsx
│   ├── LeaderboardTable.jsx
│   ├── ProblemCard.jsx
│   └── StatsCard.jsx
│
├── pages
│   ├── Home.jsx
│   ├── Events.jsx
│   ├── Leaderboard.jsx
│   ├── PracticeHub.jsx
│   ├── Resources.jsx
│   ├── Community.jsx
│   ├── Projects.jsx
│   ├── Blog.jsx
│   ├── Team.jsx
│   └── Dashboard.jsx
│
├── layouts
│   └── MainLayout.jsx
│
├── services
│   └── api.js
│
├── context
│   └── AuthContext.jsx
│
└── App.jsx
```

---

# Backend Folder Structure

```
backend
│
├── controllers
│
├── routes
│
├── models
│
├── middleware
│
├── config
│
├── server.js
```

---

# MySQL Database Schema

## Users

```
users
------
id
name
email
password
department
year
gfg_profile
leetcode_profile
codeforces_profile
github_profile
created_at
```

---

## Events

```
events
------
id
title
description
poster
date
location
max_participants
created_at
```

---

## Event Registrations

```
event_registrations
------
id
user_id
event_id
registered_at
```

---

## Problems

```
problems
------
id
title
difficulty
topic
link
created_at
```

---

## Blogs

```
blogs
------
id
title
content
author_id
created_at
```

---

## Projects

```
projects
------
id
title
description
github_link
demo_link
tech_stack
created_by
```

---

## Discussions

```
discussions
------
id
title
content
author_id
created_at
```

---

# API Endpoints

## Authentication

POST /api/auth/register
POST /api/auth/login

---

## Users

GET /api/users/profile
PUT /api/users/profile

---

## Events

GET /api/events
POST /api/events
GET /api/events/:id
POST /api/events/register

---

## Leaderboard

GET /api/leaderboard
GET /api/leaderboard/weekly

---

## Problems

GET /api/problems
POST /api/problems

---

## Blogs

GET /api/blogs
POST /api/blogs

---

## Projects

GET /api/projects
POST /api/projects

---

## Discussions

GET /api/discussions
POST /api/discussions

---

# UI Design Guidelines

Use a **developer-focused dark theme**.

Colors:

Background: `#0f172a`
Card: `#1e293b`
Accent: `#2f8d46`

Design principles:

* Dashboard style interface
* Card based layout
* Minimal animations
* Clean developer aesthetic

---

# Deliverables

The AI agent should generate:

1. Full React frontend
2. Express backend
3. MySQL schema
4. API endpoints
5. Authentication system
6. Dashboard analytics
7. Leaderboard system
8. Event management system

---

# Final Goal

Create a platform that:

* Improves coding culture in the campus
* Tracks student progress
* Encourages regular problem solving
* Builds an active coding community
