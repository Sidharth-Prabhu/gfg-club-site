// Initial Local Mock Data for Frontend-Only Application
export const mockUsers = [
  {
    id: "user_1",
    name: "Sidharth Prabhu",
    email: "sidharth@ritchennai.edu.in",
    password: "12345678",
    role: "Admin",
    status: "Approved",
    department: "Computer Science",
    year: "3rd Year",
    gfg_profile: "sidharth123",
    leetcode_profile: "sidharth_l",
    github_profile: "Sidharth-Prabhu",
    gfg_score: 1250,
    gfg_solved: 350,
    problems_solved: 400,
    streak: 15,
    weekly_points: 85,
    skills: "React, Node.js, C++, Python",
    about: "Tech Lead at GfG RIT Chapter. Passionate about web development.",
    resume_url: "https://example.com/resume.pdf",
    profile_pic: null,
    created_at: new Date().toISOString()
  },
  {
    id: "user_2",
    name: "Alex Johnson",
    email: "alex@ritchennai.edu.in",
    password: "password123",
    role: "User",
    status: "Approved",
    department: "Information Technology",
    year: "2nd Year",
    gfg_profile: "alex_gfg",
    gfg_score: 800,
    gfg_solved: 200,
    problems_solved: 250,
    streak: 5,
    weekly_points: 40,
    skills: "Java, Spring Boot",
    about: "Competitive programmer and ML enthusiast.",
    profile_pic: null,
    created_at: new Date().toISOString()
  }
];

export const mockEvents = [
  {
    id: "event_1",
    title: "CodeRush Hackathon 2024",
    description: "48-hour coding marathon building solutions for campus automation.",
    date: "2024-05-15T09:00:00Z",
    deadline: "2024-05-10T23:59:59Z",
    type: "Hackathon",
    location: "Main Auditorium, RIT",
    max_team_size: 4,
    poster_url: "https://placehold.co/800x400/10b981/ffffff?text=CodeRush",
    status: "Upcoming",
    created_at: new Date().toISOString()
  },
  {
    id: "event_2",
    title: "Web Dev Workshop",
    description: "Learn modern React and serverless architectures from scratch.",
    date: "2024-04-20T10:00:00Z",
    deadline: "2024-04-18T23:59:59Z",
    type: "Workshop",
    location: "Lab 3, CS Block",
    max_team_size: 1,
    poster_url: "https://placehold.co/800x400/3b82f6/ffffff?text=Web+Dev",
    status: "Completed",
    created_at: new Date().toISOString()
  }
];

export const mockProjects = [
  {
    id: "proj_1",
    title: "GfG Club Hub Portal",
    description: "The very site you are using! Built to manage all club activities.",
    github_link: "https://github.com/Sidharth-Prabhu/gfg-club-site",
    live_link: null,
    category: "Web Development",
    tech_stack: "React, Typescript, Vite",
    status: "Approved",
    created_by: "user_1",
    created_at: new Date().toISOString()
  },
  {
    id: "proj_2",
    title: "Smart Attendance System",
    description: "Face recognition based attendance system for RIT classes.",
    github_link: "https://github.com/example/attendance",
    live_link: null,
    category: "Machine Learning",
    tech_stack: "Python, OpenCV, Flask",
    status: "Approved",
    created_by: "user_2",
    created_at: new Date().toISOString()
  }
];

export const mockBlogs = [
  {
    id: "blog_1",
    title: "How to Ace Your First Hackathon",
    content: "Hackathons can be intimidating. Here are 5 tips to succeed: \n1. Form a balanced team.\n2. Pick a realistic stack.\n3. Focus on MVP over features.\n4. Design matters.\n5. Sleep!",
    author_id: "user_1",
    tags: "Hackathon, Tips",
    created_at: new Date().toISOString()
  }
];

export const mockDiscussions = [
  {
    id: "disc_1",
    topic: "Best resources for learning Dynamic Programming?",
    content: "I've been struggling with DP logic. Anyone have suggestions on good YouTube channels or articles?",
    author_id: "user_2",
    tags: "CP, DSA, DP",
    created_at: new Date().toISOString()
  }
];

export const mockEventRegistrations = [
  {
    id: "reg_1",
    eventId: "event_1",
    userId: "user_1",
    registered_at: new Date().toISOString()
  }
];
