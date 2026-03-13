import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import Leaderboard from './pages/Leaderboard';
import PracticeHub from './pages/PracticeHub';
import Dashboard from './pages/Dashboard';

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
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/practice" element={<PracticeHub />} />
            
            <Route path="/community" element={<Placeholder title="Community" />} />
            <Route path="/projects" element={<Placeholder title="Projects Showcase" />} />
            <Route path="/blog" element={<Placeholder title="Blog" />} />
            <Route path="/team" element={<Placeholder title="Our Team" />} />
            <Route path="/resources" element={<Placeholder title="Resources" />} />
            
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
