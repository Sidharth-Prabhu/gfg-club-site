import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { theme } = useTheme();
  return (
    <footer className="bg-card border-t border-border py-16 mt-auto transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center group">
              <img 
                src={theme === 'dark' ? "/src/assets/GfG_darkmode.png" : "/src/assets/GfG_lightmode.png"} 
                alt="GfG RIT Logo" 
                className="h-12 w-auto object-contain transition-transform group-hover:scale-105" 
              />
            </Link>
            <p className="text-text/60 leading-relaxed max-w-xs">
              Empowering students to master data structures, algorithms, and development. Join the largest coding community on campus.
            </p>
            <div className="flex gap-4">
              {[
                { icon: Github, href: "#" },
                { icon: Linkedin, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Twitter, href: "#" }
              ].map((social, i) => (
                <motion.a 
                  key={i}
                  href={social.href}
                  whileHover={{ y: -3, scale: 1.1 }}
                  className="bg-accent/10 hover:bg-accent hover:text-white p-2.5 rounded-full transition-all duration-300 text-accent shadow-sm"
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-text border-l-4 border-accent pl-3">Explore</h3>
            <ul className="space-y-4">
              {['Events', 'Leaderboard', 'Practice', 'Community', 'Projects', 'Blog'].map((item) => (
                <li key={item}>
                  <Link to={`/${item.toLowerCase()}`} className="text-text/60 hover:text-accent transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-accent/40 rounded-full"></span>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-text border-l-4 border-accent pl-3">Contact Us</h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-3 text-text/60">
                <MapPin size={20} className="text-accent shrink-0 mt-1" />
                <span>GeeksforGeeks Campus Body, Your College Name, City, State</span>
              </li>
              <li className="flex items-center gap-3 text-text/60">
                <Mail size={20} className="text-accent shrink-0" />
                <span>gfgclub@yourcollege.edu</span>
              </li>
              <li className="flex items-center gap-3 text-text/60">
                <Phone size={20} className="text-accent shrink-0" />
                <span>+91 98765 43210</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-text border-l-4 border-accent pl-3">Newsletter</h3>
            <p className="text-text/60 mb-4 text-sm leading-relaxed">
              Subscribe to stay updated on upcoming workshops and contests.
            </p>
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors text-text"
              />
              <button className="w-full bg-accent hover:bg-gfg-green-hover text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-border mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-text/50 text-sm">
            &copy; {new Date().getFullYear()} GfG Campus Body. Crafted with ❤️ by Students.
          </p>
          <div className="flex gap-8 text-sm text-text/50">
            <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-accent transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
