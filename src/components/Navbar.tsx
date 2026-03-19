import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoLight from '../assets/GfG_lightmode.png';
import logoDark from '../assets/GfG_darkmode.png';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationDropdown from './NotificationDropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGaugeHigh, 
  faSignOutAlt, 
  faBars, 
  faUser, 
  faCalendarAlt, 
  faTrophy, 
  faBookOpen, 
  faComments, 
  faBriefcase, 
  faFileAlt, 
  faSun, 
  faMoon, 
  faTimes, 
  faBookmark,
  faGraduationCap
} from '@fortawesome/free-solid-svg-icons';
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
    { to: "/events", icon: faCalendarAlt, label: "Events" },
    { to: "/leaderboard", icon: faTrophy, label: "Leaderboard" },
    { to: "/practice", icon: faBookOpen, label: "Practice", restricted: true },
    { to: "/courses", icon: faGraduationCap, label: "Courses", restricted: true },
    { to: "/community", icon: faComments, label: "Community" },
    { to: "/projects", icon: faBriefcase, label: "Projects" },
    { to: "/resources", icon: faBookmark, label: "Resources", restricted: true },
    { to: "/blog", icon: faFileAlt, label: "Blog" },
  ].filter(link => !link.restricted || (user && user.role !== 'Guest'));

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 px-4 py-2 shadow-sm transition-colors duration-300">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center group">
          <img 
            src={theme === 'dark' ? logoDark : logoLight} 
            alt="GfG RIT Logo" 
            className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105" 
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-5 text-text/80 font-medium text-sm">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="hover:text-accent flex items-center gap-1 transition-colors">
              <FontAwesomeIcon icon={link.icon} className="text-sm" /> {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={toggleTheme} 
            className="p-1.5 rounded-full hover:bg-background transition-colors text-text"
            aria-label="Toggle Theme"
          >
            <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} />
          </button>

          <div className="hidden sm:flex items-center gap-3 border-l border-border pl-3">
            {user ? (
              <>
                <NotificationDropdown />
                <Link to="/dashboard" className="text-text hover:text-accent flex items-center gap-2 transition-colors text-sm">
                  <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center overflow-hidden border border-accent/20">
                    {user.profile_pic ? (
                        <img src={user.profile_pic} className="w-full h-full object-cover" alt="" />
                    ) : (
                        <FontAwesomeIcon icon={faGaugeHigh} className="text-xs" />
                    )}
                  </div>
                  <span className="hidden xl:inline">Dashboard</span>
                </Link>
                <button onClick={handleLogout} className="text-text hover:text-red-500 transition-colors">
                  <FontAwesomeIcon icon={faSignOutAlt} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-text hover:text-accent font-medium text-sm">Login</Link>
                <Link to="/register" className="bg-accent hover:bg-gfg-green-hover text-white px-4 py-1.5 rounded-lg font-bold transition-all shadow-md hover:shadow-lg text-sm">Sign Up</Link>
              </>
            )}
          </div>

          <button className="lg:hidden p-2 text-text" onClick={toggleMenu}>
            <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} className="text-lg" />
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
                <Link key={link.to} to={link.to} onClick={toggleMenu} className="flex items-center gap-3 text-text hover:text-accent text-base font-medium">
                  <FontAwesomeIcon icon={link.icon} className="text-base" /> {link.label}
                </Link>
              ))}
              <hr className="border-border" />
              {user ? (
                <>
                  <div className="flex items-center justify-between">
                    <Link to="/dashboard" onClick={toggleMenu} className="flex items-center gap-3 text-text hover:text-accent text-base font-medium">
                        <FontAwesomeIcon icon={faGaugeHigh} className="text-base" /> Dashboard
                    </Link>
                    <NotificationDropdown />
                  </div>
                  <button onClick={handleLogout} className="flex items-center gap-3 text-text hover:text-red-500 text-base font-medium text-left">
                    <FontAwesomeIcon icon={faSignOutAlt} className="text-base" /> Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link to="/login" onClick={toggleMenu} className="text-center py-2 text-text font-medium">Login</Link>
                  <Link to="/register" onClick={toggleMenu} className="bg-accent text-center text-white py-3 rounded-lg font-bold">Sign Up</Link>
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
