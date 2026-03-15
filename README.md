# GeeksforGeeks Campus Club Platform

### **Empowering the next generation of campus coders.**

The GeeksforGeeks Campus Club Platform is a comprehensive coding ecosystem designed to centralize and enhance the technical culture of a college campus. It moves beyond a static website to provide a dynamic, data-driven environment for students to track their progress, compete on leaderboards, and collaborate on projects.

---

## 🎬 Project Demo

Below is a walkthrough of the platform's key features and user interface.

<div align="center">
  <video width="100%" controls>
    <source src="demo.mp4" type="video/mp4">
    Your browser does not support the video tag.
  </video>
</div>

---

## 🚀 Key Features

*   **Integrated Leaderboard:** Real-time tracking of student coding performance across multiple platforms (GFG, LeetCode, Codeforces).
*   **Practice Hub:** Daily coding challenges (POTD), curated topic-wise practice sets, and learning resources.
*   **Event Management:** A streamlined system for organizing, discovering, and registering for campus workshops and hackathons.
*   **Community & Collaboration:** Discussion forums for technical doubts, a project showcase for student work, and a technical blog system.
*   **Personalized Dashboard:** In-depth analytics for individual students, showing problem-solving trends and topic distribution.
*   **Campus Insights:** High-level analytics for club leads to monitor the overall coding activity and growth within the campus.

---

## 🛠️ Tech Stack

**Frontend:**
*   **React 19** with **Vite** for a fast, modern UI.
*   **TailwindCSS** for a responsive, developer-focused dark theme.
*   **Framer Motion** for smooth animations and interactive feedback.
*   **Recharts** for visualizing coding analytics.

**Backend:**
*   **Node.js** & **Express** for a robust and scalable API.
*   **MySQL** for structured data management.
*   **JWT** for secure, token-based authentication.

---

## 🔍 Data Integration & Scraping

The platform dynamically synchronizes with GeeksforGeeks through a multi-layered data extraction strategy:

*   **Practice Hub & POTD:** Uses **Axios** and **Cheerio** to scrape the "Problem of the Day" directly from GfG, extracting titles, difficulty, and company tags in real-time.
*   **Resource Engine:** Employs a three-tier discovery system:
    1.  **WP-JSON API** for structured article metadata.
    2.  **Explore Page Scraping** for curated technical content.
    3.  **Search Sector Extraction** as a fallback for deep-link discovery.
*   **Course Synchronization:** Programmatically extracts the `__NEXT_DATA__` JSON payload from GfG course pages to retrieve accurate pricing, ratings, curriculum, and video trailers.
*   **Content Sanitization:** Automatically re-styles scraped HTML (code blocks, images, links) to maintain the platform's cohesive dark-mode aesthetic.

---

## ⚙️ Getting Started

### Prerequisites
*   Node.js (v18+)
*   MySQL Server

### 1. Setup Backend
```bash
cd backend
npm install
# Configure your .env file with DB credentials
npm run dev
```

### 2. Setup Frontend
```bash
# From the root directory
npm install
npm run dev
```

---

## 🌟 Why This Project?

This platform addresses the fragmentation in campus coding cultures. By consolidating resources, competition, and community into a single interface, it provides a clear roadmap for students from beginner to interview-ready, while fostering a healthy competitive spirit through transparent leaderboards.
