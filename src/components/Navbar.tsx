import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, LogOut, Menu, User, Calendar, Trophy, BookOpen, MessageSquare, Briefcase, FileText, Sun, Moon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = [
    { to: "/events", icon: Calendar, label: "Events" },
    { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    { to: "/practice", icon: BookOpen, label: "Practice" },
    { to: "/community", icon: MessageSquare, label: "Community" },
    { to: "/projects", icon: Briefcase, label: "Projects" },
    { to: "/blog", icon: FileText, label: "Blog" },
  ];

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 px-4 py-3 shadow-sm transition-colors duration-300">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-accent group">
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="bg-accent text-white p-1 rounded"
          >
            GfG
          </motion.span>
          <span className="text-text group-hover:text-accent transition-colors">Club</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-6 text-text/80 font-medium">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="hover:text-accent flex items-center gap-1 transition-colors">
              <link.icon size={18} /> {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-background transition-colors text-text"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <div className="hidden sm:flex items-center gap-4 border-l border-border pl-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-text hover:text-accent flex items-center gap-1 transition-colors">
                  <LayoutDashboard size={20} />
                  <span className="hidden xl:inline">Dashboard</span>
                </Link>
                <button onClick={handleLogout} className="text-text hover:text-red-500 transition-colors">
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-text hover:text-accent font-medium">Login</Link>
                <Link to="/register" className="bg-accent hover:bg-gfg-green-hover text-white px-5 py-2 rounded-lg font-bold transition-all shadow-md hover:shadow-lg">Join Now</Link>
              </>
            )}
          </div>

          <button className="lg:hidden p-2 text-text" onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-card border-t border-border mt-3 overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-4">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={toggleMenu} className="flex items-center gap-3 text-text hover:text-accent text-lg font-medium">
                  <link.icon size={20} /> {link.label}
                </Link>
              ))}
              <hr className="border-border" />
              {user ? (
                <Link to="/dashboard" onClick={toggleMenu} className="flex items-center gap-3 text-text hover:text-accent text-lg font-medium">
                  <LayoutDashboard size={20} /> Dashboard
                </Link>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link to="/login" onClick={toggleMenu} className="text-center py-2 text-text font-medium">Login</Link>
                  <Link to="/register" onClick={toggleMenu} className="bg-accent text-center text-white py-3 rounded-lg font-bold">Join Now</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
