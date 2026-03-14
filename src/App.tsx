import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Leaderboard from './pages/Leaderboard';
import PracticeHub from './pages/PracticeHub';
import Dashboard from './pages/Dashboard';
import Community from './pages/Community';
import PostDetail from './pages/PostDetail';
import Projects from './pages/Projects';
import Blog from './pages/Blog';
import Resources from './pages/Resources';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-accent font-bold">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

// Placeholder components for remaining pages
const Placeholder = ({ title }) => (
  <div className="py-20 text-center">
    <h1 className="text-4xl font-bold mb-4">{title}</h1>
    <p className="text-gray-400">This page is under construction. Stay tuned!</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/practice" element={<PracticeHub />} />
            <Route path="/community" element={<Community />} />
            <Route path="/community/:postId" element={<PostDetail />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/resources" element={<Resources />} />
            
            <Route path="/team" element={<Placeholder title="Our Team" />} />
            
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </MainLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;
