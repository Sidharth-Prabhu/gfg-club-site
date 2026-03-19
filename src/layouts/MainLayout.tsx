import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatbotWidget from '../components/ChatbotWidget';
import { ThemeProvider } from '../context/ThemeContext';

const MainLayout = ({ children }) => {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-background text-text transition-colors duration-300">
        <Navbar />
        {/* AWS Free Tier Disclaimer Banner - Sticky below navbar */}
        <div className="bg-gradient-to-r from-amber-500/90 via-orange-500/90 to-amber-500/90 text-white text-[9px] font-black uppercase tracking-widest py-2 px-4 text-center backdrop-blur-sm border-b border-white/20 shadow-lg sticky top-[60px] z-[99]">
          <span className="inline-flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span className="hidden sm:inline">Demo Site Alert:</span>
            <span className="font-bold">This site runs on Amazon AWS Free Tier</span>
            <span className="text-white/70 font-bold">•</span>
            <span className="font-medium">You may experience slow loading or temporary bugs</span>
            <span className="text-white/70 font-bold">•</span>
            <span className="font-bold text-green-300">✓ Production version is fully functional & deployable</span>
          </span>
        </div>
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <ChatbotWidget />
      </div>
    </ThemeProvider>
  );
};

export default MainLayout;
