import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Message {
  id: string;
  type: 'bot' | 'user';
  text: string;
  options?: string[];
  links?: { label: string; url: string }[];
  timestamp: Date;
}

const ChatbotWidget: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      sendWelcomeMessage();
    }
  }, [isOpen]);

  const addMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...msg,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const sendWelcomeMessage = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      if (user) {
        addMessage({
          type: 'bot',
          text: `Hi ${user.name}! Welcome back to GfG RIT. How can I assist you today?`,
          options: ['Event Status', 'Project Approvals', 'Group Approvals', 'Contact Others', 'FAQs']
        });
      } else {
        addMessage({
          type: 'bot',
          text: "Welcome! I'm GfG Bot. I can tell you about our campus body, upcoming events, and how to join. What would you like to know?",
          options: ['About GfG RIT', 'How to Join', 'Current Events', 'Membership Benefits']
        });
      }
    }, 1000);
  };

  const handleOptionClick = (option: string) => {
    addMessage({ type: 'user', text: option });
    processResponse(option);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const text = inputValue.trim();
    addMessage({ type: 'user', text });
    setInputValue('');
    processResponse(text);
  };

  const processResponse = (input: string) => {
    setIsTyping(true);
    const text = input.toLowerCase();

    setTimeout(async () => {
      setIsTyping(false);
      
      // 1. Guest flow
      if (!user) {
        if (text.includes('about') || text.includes('gfg rit')) {
          addMessage({
            type: 'bot',
            text: "GeeksforGeeks RIT Student Chapter is the official coding community of RIT. We organize workshops, hackathons, and provide resources to master DSA and Development.",
            options: ['Membership Benefits', 'How to Join', 'Upcoming Events']
          });
        } else if (text.includes('join')) {
          addMessage({
            type: 'bot',
            text: "Joining is easy! Just create an account and fill in your details. Core team applications usually open at the start of each semester.",
            links: [{ label: 'Register Now', url: '/register' }],
            options: ['Member Roles', 'Other FAQs']
          });
        } else if (text.includes('events')) {
          addMessage({
            type: 'bot',
            text: "We have regular events! Check out our events page for the latest updates.",
            links: [{ label: 'View Events', url: '/events' }],
            options: ['Recent Blogs', 'About GfG RIT']
          });
        } else if (text.includes('benefit')) {
            addMessage({
                type: 'bot',
                text: `Benefits include: 
- Early access to workshops
- Exclusive coding resources
- Mentorship from seniors
- Certificates for core team members.`,
                options: ['How to Join', 'Main Menu']
            });
        } else {
          addMessage({
            type: 'bot',
            text: "I'm not sure I understand. You can check our events, projects, or learn more about us.",
            options: ['About GfG RIT', 'How to Join', 'View Events']
          });
        }
        return;
      }

      // 2. Logged-in User Flow
      if (text.includes('event status')) {
        try {
          const res = await api.get('/events/my-registrations');
          if (res.data.length === 0) {
            addMessage({
              type: 'bot',
              text: "You haven't registered for any upcoming events yet. Check them out!",
              links: [{ label: 'Browse Events', url: '/events' }]
            });
          } else {
            const latest = res.data[0];
            addMessage({
              type: 'bot',
              text: `You're registered for "${latest.title}". Status: ${latest.status}. It's scheduled for ${new Date(latest.date).toLocaleDateString()}.`,
              links: [{ label: 'View Dashboard', url: '/dashboard' }],
              options: ['Project Approvals', 'Main Menu']
            });
          }
        } catch (e) {
          addMessage({ type: 'bot', text: "I couldn't fetch your event status right now. Please check your dashboard.", links: [{ label: 'Go to Dashboard', url: '/dashboard' }] });
        }
      } else if (text.includes('project approval')) {
        try {
          const res = await api.get('/projects/user');
          if (res.data.length === 0) {
            addMessage({ type: 'bot', text: "You haven't submitted any projects yet. Want to share your work?", links: [{ label: 'Submit Project', url: '/projects' }] });
          } else {
            const pending = res.data.filter((p: any) => p.status === 'Pending');
            if (pending.length > 0) {
              addMessage({ type: 'bot', text: `You have ${pending.length} project(s) pending approval. Our core team usually reviews them within 2-3 days.` });
            } else {
              addMessage({ type: 'bot', text: "All your projects have been reviewed! Check them out on the projects page.", links: [{ label: 'View My Projects', url: '/projects' }] });
            }
            addMessage({ type: 'bot', text: "Need anything else?", options: ['Event Status', 'Group Approvals', 'Main Menu'] });
          }
        } catch (e) {
          addMessage({ type: 'bot', text: "Error fetching project status. Try again later or visit your profile.", links: [{ label: 'Profile', url: '/profile' }] });
        }
      } else if (text.includes('group approval')) {
        try {
          const res = await api.get('/groups/my-memberships');
          const pending = res.data.filter((g: any) => g.status === 'Pending');
          if (pending.length > 0) {
            addMessage({ type: 'bot', text: `You have ${pending.length} pending group membership requests. The group moderators will approve you soon!` });
          } else {
            addMessage({ type: 'bot', text: "You have no pending group requests at the moment.", links: [{ label: 'Explore Groups', url: '/community' }] });
          }
          addMessage({ type: 'bot', text: "What's next?", options: ['Main Menu', 'Contact Others'] });
        } catch (e) {
            addMessage({ type: 'bot', text: "Unable to check group status. Visit the community page.", links: [{ label: 'Community', url: '/community' }] });
        }
      } else if (text.includes('contact') || text.includes('help')) {
        addMessage({
          type: 'bot',
          text: "You can message any Core member or Admin directly via DMs, or visit our office at the RIT Incubation Center.",
          options: ['Find People', 'Report Issue', 'Main Menu']
        });
      } else if (text.includes('main menu')) {
          sendWelcomeMessage();
      } else if (text.includes('find people')) {
          addMessage({ type: 'bot', text: "Search for members in the leaderboard or community sections.", links: [{ label: 'Leaderboard', url: '/leaderboard' }, { label: 'Community', url: '/community' }] });
      } else {
        addMessage({
          type: 'bot',
          text: "I can help with status checks and general info. Try one of these options:",
          options: ['Event Status', 'Project Approvals', 'Group Approvals', 'Contact Others']
        });
      }
    }, 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px]"
          >
            {/* Header */}
            <div className="bg-primary p-4 flex justify-between items-center text-white">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">G</div>
                <div>
                  <h3 className="font-semibold text-sm">GfG RIT Assistant</h3>
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    <span className="text-[10px] opacity-80">Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/10 p-1 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                    msg.type === 'user' 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-muted text-text rounded-tl-none border border-border'
                  }`}>
                    {msg.text.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                    
                    {msg.links && (
                      <div className="mt-2 space-y-1">
                        {msg.links.map((link, i) => (
                          <a 
                            key={i} 
                            href={link.url} 
                            className="block text-blue-400 hover:underline font-medium"
                          >
                            → {link.label}
                          </a>
                        ))}
                      </div>
                    )}

                    {msg.options && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {msg.options.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => handleOptionClick(opt)}
                            className="px-3 py-1 bg-background border border-primary/30 text-primary rounded-full text-xs hover:bg-primary hover:text-white transition-colors"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-none border border-border">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-background">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-grow px-4 py-2 rounded-full border border-border bg-muted focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                />
                <button 
                  type="submit"
                  className="bg-primary text-white p-2 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
                  disabled={!inputValue.trim()}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-white relative group overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors"></div>
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        ) : (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
        )}
      </motion.button>
    </div>
  );
};

export default ChatbotWidget;
