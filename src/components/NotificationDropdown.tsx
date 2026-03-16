import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faTimes, faCalendarAlt, faFileAlt, faComments, faCheckCircle, faTrash, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'event': return faCalendarAlt;
      case 'blog': return faFileAlt;
      case 'community': return faComments;
      case 'approval': return faCheckCircle;
      case 'dm': return faEnvelope;
      default: return faBell;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'event': return 'text-blue-500';
      case 'blog': return 'text-purple-500';
      case 'community': return 'text-green-500';
      case 'approval': return 'text-yellow-500';
      case 'dm': return 'text-indigo-500';
      default: return 'text-accent';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen && unreadCount > 0) markAsRead();
        }}
        className="relative p-2 rounded-full hover:bg-background transition-colors text-text"
      >
        <FontAwesomeIcon icon={faBell} className="text-lg" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-card animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-2xl z-[60] overflow-hidden"
          >
            <div className="p-4 border-b border-border flex justify-between items-center bg-background/50 backdrop-blur-md">
              <h3 className="font-bold text-text">Notifications</h3>
              <button onClick={() => setIsOpen(false)} className="text-text/60 hover:text-text">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-text/50">
                  <FontAwesomeIcon icon={faBell} className="text-4xl mb-3 opacity-20" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-4 border-b border-border hover:bg-background/80 transition-colors relative group ${!n.is_read ? 'bg-accent/5' : ''}`}
                  >
                    <Link to={n.link} onClick={() => setIsOpen(false)} className="flex gap-4">
                      <div className={`w-10 h-10 rounded-full bg-background flex items-center justify-center shrink-0 shadow-inner ${getIconColor(n.type)}`}>
                        <FontAwesomeIcon icon={getIcon(n.type)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${!n.is_read ? 'font-semibold text-text' : 'text-text/80'}`}>
                          {n.message}
                        </p>
                        <p className="text-[11px] text-text/40 mt-1">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </Link>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(n.id);
                      }}
                      className="absolute right-2 top-2 p-1.5 text-text/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-xs" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-background/30 text-center border-t border-border">
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-xs font-bold text-accent hover:underline">
                View all in Dashboard
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
