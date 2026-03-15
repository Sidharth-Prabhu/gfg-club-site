import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMessage, faTimes, faPaperPlane, faSearch, 
  faChevronLeft, faCircle, faUser, faMinus, faExpandAlt
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';

const DMWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewPost] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingInterval = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000); // Poll conversations every 10s
        return () => clearInterval(interval);
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (activeConv) {
        fetchMessages(activeConv.id);
        // Poll messages every 3s when conversation is active
        if (pollingInterval.current) clearInterval(pollingInterval.current);
        pollingInterval.current = setInterval(() => fetchMessages(activeConv.id, true), 3000);
        return () => clearInterval(pollingInterval.current);
    } else {
        if (pollingInterval.current) clearInterval(pollingInterval.current);
    }
  }, [activeConv]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/dm/conversations');
      setConversations(data);
    } catch (e) { console.error('Failed to fetch conversations'); }
  };

  const fetchMessages = async (convId: number, silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      const { data } = await api.get(`/dm/messages/${convId}`);
      setMessages(data);
    } catch (e) { console.error('Failed to fetch messages'); }
    finally { if (!silent) setLoadingMessages(false); }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
    }
    setIsSearching(true);
    try {
        const { data } = await api.get(`/dm/search?query=${query}`);
        setSearchResults(data);
    } catch (e) { console.error('Search failed'); }
  };

  const startConversation = async (otherUser: any) => {
    // Check if conversation already exists
    const existing = conversations.find(c => c.other_user_id === otherUser.id);
    if (existing) {
        setActiveConv(existing);
    } else {
        // Just set a temporary active conversation state
        setActiveConv({
            id: null, // New conversation
            other_user_id: otherUser.id,
            other_user_name: otherUser.name,
            other_user_pic: otherUser.profile_pic
        });
        setMessages([]);
    }
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;

    const content = newMessage;
    setNewPost('');

    try {
        const { data } = await api.post('/dm/send', {
            receiverId: activeConv.other_user_id,
            content
        });
        
        if (!activeConv.id) {
            // If it was a new conversation, update activeConv with the real ID
            setActiveConv({ ...activeConv, id: data.conversationId });
            fetchConversations();
        }
        fetchMessages(data.conversationId, true);
    } catch (e: any) {
        alert(e.response?.data?.message || 'Failed to send message');
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                height: isMinimized ? '60px' : '500px',
                width: isMinimized ? '200px' : '350px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-card border-2 border-border rounded-3xl shadow-2xl overflow-hidden mb-4 flex flex-col transition-all duration-300"
          >
            {/* Header */}
            <div className="p-4 bg-accent text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2 overflow-hidden">
                    {activeConv && !isMinimized ? (
                        <button onClick={() => setActiveConv(null)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors">
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                    ) : (
                        <div className="p-1.5 bg-white/20 rounded-lg shrink-0"><FontAwesomeIcon icon={faMessage} /></div>
                    )}
                    <div className="flex flex-col min-w-0">
                        <span className="font-black uppercase tracking-widest text-[10px] italic truncate">
                            {isMinimized ? 'Messages' : activeConv ? activeConv.other_user_name : 'Direct Messages'}
                        </span>
                        {activeConv && !isMinimized && (
                            <div className="flex items-center gap-1.5 overflow-hidden">
                                <span className="bg-white/20 px-1.5 py-0.5 rounded text-[6px] font-black uppercase shrink-0">{activeConv.other_user_role}</span>
                                <span className="text-[7px] font-medium opacity-60 truncate">{activeConv.other_user_email}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => setIsMinimized(!isMinimized)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors">
                        <FontAwesomeIcon icon={isMinimized ? faExpandAlt : faMinus} className="text-[10px]" />
                    </button>
                    <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors">
                        <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <div className="flex-grow flex flex-col overflow-hidden bg-background/50">
                    {activeConv ? (
                        /* Message Window */
                        <>
                            <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                {loadingMessages ? (
                                    <div className="h-full flex items-center justify-center">
                                        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : (
                                    <>
                                        {messages.length === 0 && (
                                            <div className="text-center py-10 space-y-2">
                                                <p className="text-[8px] font-black text-text/30 uppercase tracking-widest">Start of Transmission</p>
                                                <p className="text-[10px] font-medium text-text/40 italic">Send a message to begin the connection.</p>
                                            </div>
                                        )}
                                        {messages.map((msg, i) => (
                                            <div key={i} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium shadow-sm italic ${
                                                    msg.sender_id === user.id 
                                                        ? 'bg-accent text-white rounded-tr-none' 
                                                        : 'bg-card border border-border text-text rounded-tl-none'
                                                }`}>
                                                    {msg.content}
                                                    <p className={`text-[7px] mt-1 opacity-50 text-right font-black uppercase`}>
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>
                            <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-card/50 flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Type a message..." 
                                    className="flex-grow bg-background border border-border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-accent transition-colors italic text-text shadow-inner"
                                    value={newMessage}
                                    onChange={(e) => setNewPost(e.target.value)}
                                />
                                <button type="submit" className="bg-accent text-white p-2.5 rounded-xl hover:bg-gfg-green-hover transition-all active:scale-90 shadow-lg shadow-accent/20">
                                    <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
                                </button>
                            </form>
                        </>
                    ) : (
                        /* Conversation List & Search */
                        <>
                            <div className="p-4 space-y-4">
                                <div className="relative group">
                                    <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors text-xs" />
                                    <input 
                                        type="text" 
                                        placeholder="Search members..." 
                                        className="w-full bg-background border border-border rounded-xl py-2 pl-10 pr-4 text-xs outline-none focus:border-accent transition-colors italic text-text shadow-inner"
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex-grow overflow-y-auto custom-scrollbar">
                                {isSearching ? (
                                    <div className="space-y-1 px-2">
                                        <p className="px-2 text-[7px] font-black text-text/30 uppercase tracking-[0.2em] mb-2">Search Results</p>
                                        {searchResults.length > 0 ? searchResults.map(u => (
                                            <button key={u.id} onClick={() => startConversation(u)} className="w-full flex items-center gap-3 p-3 hover:bg-accent/5 rounded-2xl transition-all group text-left">
                                                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-black text-[10px] border border-accent/20 overflow-hidden shrink-0">
                                                    {u.profile_pic ? <img src={u.profile_pic} className="w-full h-full object-cover" /> : u.name[0]}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-black text-text uppercase italic truncate">{u.name}</p>
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="text-[7px] font-black text-accent uppercase tracking-widest bg-accent/5 px-1 rounded-md border border-accent/10">{u.role}</p>
                                                        <p className="text-[7px] font-medium text-text/30 truncate">{u.email}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        )) : (
                                            <p className="text-center py-10 text-[10px] font-black text-text/20 uppercase">No agents found</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-1 px-2">
                                        <p className="px-2 text-[7px] font-black text-text/30 uppercase tracking-[0.2em] mb-2">Active Conversations</p>
                                        {conversations.length > 0 ? conversations.map(conv => (
                                            <button key={conv.id} onClick={() => setActiveConv({
                                                id: conv.id,
                                                other_user_id: conv.other_user_id,
                                                other_user_name: conv.other_user_name,
                                                other_user_pic: conv.other_user_pic,
                                                other_user_role: conv.other_user_role,
                                                other_user_email: conv.other_user_email
                                            })} className="w-full flex items-center gap-3 p-3 hover:bg-accent/5 rounded-2xl transition-all group text-left relative">
                                                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-black text-xs border border-accent/20 overflow-hidden shrink-0">
                                                    {conv.other_user_pic ? <img src={conv.other_user_pic} className="w-full h-full object-cover" /> : conv.other_user_name[0]}
                                                </div>
                                                <div className="min-w-0 flex-grow">
                                                    <div className="flex justify-between items-start">
                                                        <p className="text-[10px] font-black text-text uppercase italic truncate">{conv.other_user_name}</p>
                                                        <p className="text-[7px] font-black text-text/20 uppercase">
                                                            {new Date(conv.last_message_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="text-[7px] font-black text-accent/60 uppercase tracking-widest shrink-0">{conv.other_user_role}</p>
                                                        <p className="text-[7px] font-medium text-text/30 truncate">{conv.other_user_email}</p>
                                                    </div>
                                                    <p className="text-[9px] font-medium text-text/40 italic truncate mt-0.5">{conv.last_message || 'No messages yet'}</p>
                                                </div>
                                                {conv.unread_count > 0 && (
                                                    <div className="absolute top-2 right-2 w-4 h-4 bg-accent rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-lg">
                                                        {conv.unread_count}
                                                    </div>
                                                )}
                                            </button>
                                        )) : (
                                            <div className="text-center py-20 space-y-3">
                                                <div className="w-12 h-12 bg-card border border-border rounded-2xl flex items-center justify-center text-text/10 mx-auto">
                                                    <FontAwesomeIcon icon={faMessage} size="lg" />
                                                </div>
                                                <p className="text-[9px] font-black text-text/20 uppercase tracking-[0.2em]">Silence in Sector 7</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { setIsOpen(true); setIsMinimized(false); }}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all border-4 border-white/5 relative group ${isOpen && !isMinimized ? 'bg-accent/20 text-accent border-accent/20' : 'bg-accent'}`}
      >
        <FontAwesomeIcon icon={faMessage} className="text-xl group-hover:rotate-12 transition-transform" />
        {conversations.some(c => c.unread_count > 0) && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-card flex items-center justify-center text-[8px] font-black animate-bounce shadow-lg">
                {conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0)}
            </span>
        )}
      </motion.button>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-accent); border-radius: 10px; opacity: 0.2; }
      `}</style>
    </div>
  );
};

export default DMWidget;
