import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, LogOut, Menu, User, Calendar, Trophy, BookOpen, MessageSquare, Briefcase, FileText } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-card border-b border-gray-800 sticky top-0 z-50 px-4 py-3">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-accent">
          <span className="bg-accent text-white p-1 rounded">GfG</span>
          <span>Club</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-gray-300">
          <Link to="/events" className="hover:text-accent flex items-center gap-1"><Calendar size={18} /> Events</Link>
          <Link to="/leaderboard" className="hover:text-accent flex items-center gap-1"><Trophy size={18} /> Leaderboard</Link>
          <Link to="/practice" className="hover:text-accent flex items-center gap-1"><BookOpen size={18} /> Practice</Link>
          <Link to="/community" className="hover:text-accent flex items-center gap-1"><MessageSquare size={18} /> Community</Link>
          <Link to="/projects" className="hover:text-accent flex items-center gap-1"><Briefcase size={18} /> Projects</Link>
          <Link to="/blog" className="hover:text-accent flex items-center gap-1"><FileText size={18} /> Blog</Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" className="text-gray-300 hover:text-accent flex items-center gap-1">
                <LayoutDashboard size={20} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <button onClick={handleLogout} className="text-gray-300 hover:text-red-500">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-accent">Login</Link>
              <Link to="/register" className="bg-accent hover:bg-green-700 text-white px-4 py-2 rounded-md transition duration-300">Join Now</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
