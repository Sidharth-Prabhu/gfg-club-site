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
