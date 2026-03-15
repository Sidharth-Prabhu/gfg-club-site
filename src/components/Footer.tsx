import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope, 
  faMapPin, 
  faPhone, 
  faChevronRight 
} from '@fortawesome/free-solid-svg-icons';
import { 
  faGithub, 
  faLinkedin, 
  faInstagram, 
  faTwitter 
} from '@fortawesome/free-brands-svg-icons';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { theme } = useTheme();
  return (
    <footer className="bg-card border-t border-border py-10 mt-auto transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center group">
              <img 
                src={theme === 'dark' ? "/src/assets/GfG_darkmode.png" : "/src/assets/GfG_lightmode.png"} 
                alt="GfG RIT Logo" 
                className="h-12 w-auto object-contain transition-transform group-hover:scale-105" 
              />
            </Link>
            <p className="text-text/60 leading-relaxed max-w-xs text-sm italic">
              Empowering students to master DSA and development. Join the largest coding community.
            </p>
            <div className="flex gap-3">
              {[
                { icon: faGithub, href: "#" },
                { icon: faLinkedin, href: "#" },
                { icon: faInstagram, href: "#" },
                { icon: faTwitter, href: "#" }
              ].map((social, i) => (
                <motion.a 
                  key={i}
                  href={social.href}
                  whileHover={{ y: -2, scale: 1.1 }}
                  className="bg-accent/10 hover:bg-accent hover:text-white p-2 rounded-full transition-all duration-300 text-accent shadow-sm flex items-center justify-center w-8 h-8"
                >
                  <FontAwesomeIcon icon={social.icon} className="text-sm" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-black mb-4 text-text border-l-2 border-accent pl-2 uppercase tracking-widest">Explore</h3>
            <ul className="space-y-2">
              {['Events', 'Leaderboard', 'Practice', 'Community', 'Projects', 'Resources', 'Blog'].map((item) => (
                <li key={item}>
                  <Link to={`/${item.toLowerCase()}`} className="text-text/60 hover:text-accent transition-colors flex items-center gap-2 text-xs font-medium italic">
                    <FontAwesomeIcon icon={faChevronRight} className="text-[8px] opacity-40" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-black mb-4 text-text border-l-2 border-accent pl-2 uppercase tracking-widest">Connect</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-text/60 text-xs italic">
                <FontAwesomeIcon icon={faMapPin} className="text-accent shrink-0 mt-0.5" />
                <span>RIT Chennai, Tamil Nadu, India</span>
              </li>
              <li className="flex items-center gap-2 text-text/60 text-xs italic">
                <FontAwesomeIcon icon={faEnvelope} className="text-accent shrink-0" />
                <span>gfgclub@ritchennai.edu.in</span>
              </li>
              <li className="flex items-center gap-2 text-text/60 text-xs italic">
                <FontAwesomeIcon icon={faPhone} className="text-accent shrink-0" />
                <span>+91 98765 43210</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-black mb-4 text-text border-l-2 border-accent pl-2 uppercase tracking-widest">Sync</h3>
            <p className="text-text/60 mb-3 text-xs leading-relaxed italic">
              Subscribe for workshop and contest signals.
            </p>
            <form className="space-y-2" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Agent Email" 
                className="w-full bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-accent transition-colors text-text text-xs italic"
              />
              <button className="w-full bg-accent hover:bg-gfg-green-hover text-white font-black py-2 rounded-lg transition-all shadow-md active:scale-95 text-[10px] uppercase tracking-widest">
                Authorize
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-text/40 text-[10px] font-medium uppercase tracking-widest italic">
            &copy; {new Date().getFullYear()} GfG RITChennai. Crafted with ❤️ by Agents.
          </p>
          <div className="flex gap-6 text-[10px] text-text/40 font-medium uppercase tracking-widest italic">
            <a href="#" className="hover:text-accent transition-colors">Privacy</a>
            <a href="#" className="hover:text-accent transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
