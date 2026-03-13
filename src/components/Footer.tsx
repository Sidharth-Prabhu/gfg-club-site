import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-gray-800 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-accent">GeeksforGeeks Campus Club</h2>
            <p className="text-gray-400 mt-1">Building the coding future together.</p>
          </div>
          <div className="flex gap-6 text-gray-400">
            <a href="#" className="hover:text-accent transition">GitHub</a>
            <a href="#" className="hover:text-accent transition">LinkedIn</a>
            <a href="#" className="hover:text-accent transition">Instagram</a>
            <a href="#" className="hover:text-accent transition">Twitter</a>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} GfG Club. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
