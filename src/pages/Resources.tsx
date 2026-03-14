import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, ExternalLink, Trash2, BookOpen, FileText, Bookmark, 
  GraduationCap, Lightbulb, X, Filter, Link2, Search, 
  Globe, ArrowRight, ArrowLeft, Loader2, Sparkles, Terminal, Cpu, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Resources = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('gfg'); // 'gfg' or 'archive'
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articleLoading, setArticleLoading] = useState(false);
  
  // Archive state
  const [resources, setResources] = useState([]);
  const [archiveCategory, setArchiveCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', link: '', category: 'DSA Articles'
  });

  const categories = ['All', 'DSA Articles', 'Interview Preparation', 'Competitive Programming', 'Workshop Notes', 'System Design'];
  const gfgCategories = ['CPU Synchronization', 'DBMS Transaction', 'React Lifecycle', 'System Design', 'ML Algorithms', 'Distributed Systems'];
  
  const canManage = user?.role === 'Admin';
  const isApproved = user?.status === 'Approved';

  useEffect(() => {
    if (!user) {
        navigate('/login');
    }
  }, [user, navigate]);

  const fetchArchive = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/resources?category=${archiveCategory}`);
      setResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'archive') fetchArchive();
  }, [activeTab, archiveCategory]);

  const handleGfgSearch = async (query) => {
    setSearchQuery(query);
    setLoading(true);
    try {
      const { data } = await api.get(`/resources/search-gfg?query=${encodeURIComponent(query)}`);
      setSearchResults(data);
    } catch (error) {
      alert('Failed to sync with GfG Mainframe');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchArticle = async (url) => {
    setArticleLoading(true);
    try {
      const { data } = await api.get(`/resources/fetch-article?url=${encodeURIComponent(url)}`);
      setSelectedArticle(data);
    } catch (error) {
      alert('Failed to extract neural data');
    } finally {
      setArticleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/resources', formData);
      setFormData({ title: '', description: '', link: '', category: 'DSA Articles' });
      setIsModalOpen(false);
      fetchArchive();
    } catch (error) {
      alert('Failed to add resource');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this resource?')) {
      try {
        await api.delete(`/resources/${id}`);
        fetchArchive();
      } catch (error) {
        alert('Action failed');
      }
    }
  };

  if (!user || !isApproved) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-12 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-border pb-10"
      >
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-black text-text tracking-tighter uppercase italic">Neural <span className="text-accent">Archives</span></h1>
          <p className="text-text/40 font-black text-xs tracking-[0.3em] uppercase flex items-center gap-2 italic"><Zap size={14} className="text-accent" /> High-Fidelity Technical Intelligence</p>
        </div>
        
        <div className="flex bg-card border border-border p-1.5 rounded-2xl shadow-inner">
            <button onClick={() => setActiveTab('gfg')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'gfg' ? 'bg-accent text-white shadow-lg' : 'text-text/40 hover:text-text'}`}>GfG Synapse</button>
            <button onClick={() => setActiveTab('archive')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'archive' ? 'bg-accent text-white shadow-lg' : 'text-text/40 hover:text-text'}`}>Global Nodes</button>
        </div>
      </motion.div>

      {activeTab === 'gfg' ? (
        <div className="space-y-12">
            {!isApproved ? (
                <div className="py-40 text-center bg-accent/5 rounded-[4rem] border border-accent/20 space-y-6">
                    <div className="p-8 bg-card border border-border rounded-[2.5rem] shadow-xl inline-block">
                        <ShieldCheck size={64} className="text-accent opacity-20" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-3xl font-black text-text uppercase italic tracking-tighter">Authority Required</h3>
                        <p className="text-text/40 text-sm font-medium uppercase tracking-widest max-w-md mx-auto italic px-10">Direct GfG Synapse queries are restricted to Approved Core Agents only. Synchronize your status to access this sector.</p>
                    </div>
                </div>
            ) : !selectedArticle ? (
                <>
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="relative flex-grow group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors" size={24} />
                            <input 
                                type="text" 
                                placeholder="Query GfG Mainframe..." 
                                className="w-full bg-card border-2 border-border rounded-3xl py-6 pl-16 pr-8 focus:border-accent outline-none transition shadow-xl text-text font-black text-xl italic"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleGfgSearch(searchQuery)}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                        {gfgCategories.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => handleGfgSearch(cat)}
                                className="px-8 py-4 bg-card border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-text/40 hover:border-accent hover:text-accent transition-all whitespace-nowrap shadow-sm active:scale-95"
                            >
                                # {cat}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="py-40 text-center space-y-6">
                            <Loader2 size={64} className="mx-auto text-accent animate-spin opacity-20" />
                            <p className="text-accent font-black tracking-[0.3em] uppercase italic animate-pulse">Establishing Neural Link...</p>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {searchResults.map((res, i) => (
                                <motion.div 
                                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                    key={i}
                                    onClick={() => handleFetchArticle(res.link)}
                                    className="bg-card border border-border p-8 rounded-[2.5rem] hover:border-accent transition-all cursor-pointer group shadow-sm flex flex-col justify-between gap-6"
                                >
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="p-3 bg-accent/5 rounded-xl text-accent border border-accent/10"><Terminal size={20}/></div>
                                            <div className="text-[8px] font-black text-text/20 uppercase tracking-[0.3em]">Synapse #{i+1}</div>
                                        </div>
                                        <h3 className="text-2xl font-black text-text leading-tight group-hover:text-accent transition-colors uppercase italic">{res.title}</h3>
                                        <p className="text-text/40 text-sm font-medium line-clamp-2 italic">{res.snippet}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-accent uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                        Load Neural Data <ArrowRight size={14} />
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="py-40 text-center bg-card/20 rounded-[4rem] border-2 border-dashed border-border flex flex-col items-center justify-center space-y-6">
                            <div className="p-8 bg-background border border-border rounded-[2.5rem] shadow-inner">
                                <Cpu size={80} className="text-text/10" />
                            </div>
                            <p className="text-2xl font-black text-text/20 uppercase tracking-[0.2em] italic">Archive Sector Offline</p>
                        </div>
                    )}
                </>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                    <button 
                        onClick={() => setSelectedArticle(null)} 
                        className="flex items-center gap-3 text-text/60 bg-card hover:bg-background px-8 py-4 rounded-2xl border border-border transition-all font-black uppercase text-xs tracking-widest active:scale-95 shadow-sm"
                    >
                        <ArrowLeft size={18} /> Terminate Link
                    </button>

                    <div className="bg-card border border-border rounded-[3rem] p-10 md:p-20 shadow-2xl space-y-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                        <div className="space-y-6 relative z-10">
                            <div className="flex items-center gap-4">
                                <span className="bg-accent/10 text-accent text-[10px] font-black px-5 py-2 rounded-full border border-accent/20 tracking-widest uppercase backdrop-blur-md italic">Neural Stream</span>
                                <span className="text-[10px] font-black text-text/20 uppercase tracking-widest">Source: GeeksforGeeks Mainframe</span>
                            </div>
                            <h2 className="text-4xl md:text-7xl font-black text-text leading-tight tracking-tighter uppercase italic">{selectedArticle.title}</h2>
                        </div>

                        {articleLoading ? (
                            <div className="py-40 text-center space-y-6">
                                <Loader2 size={64} className="mx-auto text-accent animate-spin opacity-20" />
                                <p className="text-accent font-black tracking-[0.3em] uppercase italic">Decrypting Intelligence Data...</p>
                            </div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="prose prose-accent dark:prose-invert max-w-none text-text/80 text-xl leading-[1.8] font-medium ql-editor !p-0 italic relative z-10" 
                                dangerouslySetInnerHTML={{ __html: selectedArticle.content }} 
                            />
                        )}
                    </div>
                </motion.div>
            )}
        </div>
      ) : (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide flex-grow">
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setArchiveCategory(cat)}
                            className={`px-8 py-4 rounded-2xl text-[10px] font-black border transition-all uppercase tracking-widest whitespace-nowrap shadow-sm ${archiveCategory === cat ? 'bg-accent border-accent text-white shadow-lg' : 'bg-card border-border text-text/40 hover:border-accent/40 hover:text-accent'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                {canManage && (
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-accent hover:bg-gfg-green-hover text-white px-10 py-5 rounded-[1.5rem] font-black flex items-center gap-3 transition shadow-xl shadow-accent/20 text-xs uppercase tracking-widest active:scale-95"
                    >
                        <Plus size={24} /> Deploy Node
                    </button>
                )}
            </div>

            {loading ? (
                <div className="py-40 text-center text-accent font-black tracking-widest uppercase animate-pulse">Accessing Archives...</div>
            ) : resources.length > 0 ? (
                <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {resources.map(res => (
                        <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }} whileHover={{ y: -8, borderColor: 'var(--color-accent)' }} key={res.id} className="bg-card border border-border rounded-[2.5rem] p-10 transition-all flex flex-col group shadow-sm hover:shadow-2xl" >
                            <div className="flex justify-between items-start mb-10">
                                <div className="p-5 rounded-2xl bg-accent/5 text-accent border border-accent/10 group-hover:bg-accent group-hover:text-white transition-all duration-500 shadow-inner">
                                    <Bookmark size={28} />
                                </div>
                                {canManage && (
                                    <button onClick={() => handleDelete(res.id)} className="p-3 bg-background border border-border rounded-xl text-text/40 hover:text-red-500 transition-colors shadow-sm active:scale-90">
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>
                            <div className="flex-grow space-y-4 mb-12">
                                <div className="text-[9px] font-black text-accent uppercase tracking-[0.3em] italic">{res.category}</div>
                                <h3 className="text-3xl font-black text-text leading-tight group-hover:text-accent transition-colors tracking-tighter uppercase italic">{res.title}</h3>
                                <p className="text-text/50 text-sm leading-relaxed font-medium line-clamp-3 italic">{res.description}</p>
                            </div>
                            <a href={res.link} target="_blank" rel="noopener noreferrer" className="w-full py-6 bg-background border border-border rounded-[1.5rem] flex items-center justify-center gap-4 text-text/60 font-black text-xs uppercase tracking-[0.2em] hover:border-accent hover:text-accent transition-all shadow-inner group/link active:scale-[0.98]">
                                Sync Neural Node <ExternalLink size={18} className="group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                            </a>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <div className="py-40 text-center text-text/30 bg-card rounded-[4rem] border border-border border-dashed shadow-inner flex flex-col items-center justify-center space-y-6">
                    <div className="p-10 bg-background border border-border rounded-[3rem] shadow-inner">
                        <Link2 size={80} className="opacity-10" />
                    </div>
                    <p className="text-2xl font-black uppercase tracking-[0.2em] italic">No Global Nodes Found</p>
                </div>
            )}
        </div>
      )}

      {/* Manual Resource Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/95 backdrop-blur-xl overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-card border border-border rounded-[3.5rem] w-full max-w-2xl my-auto shadow-2xl overflow-hidden">
              <div className="p-10 border-b border-border flex justify-between items-center bg-background/50">
                <h2 className="text-3xl font-black text-text uppercase tracking-tighter italic">Establish Archive <span className="text-accent">Node</span></h2>
                <button onClick={() => setIsModalOpen(false)} className="text-text/40 hover:text-red-500 p-4 hover:bg-red-500/5 rounded-full transition-all active:scale-90"><X size={32} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-10 md:p-14 space-y-10">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">Node Title</label>
                    <input required type="text" className="w-full bg-background border-2 border-border rounded-2xl py-6 px-10 focus:border-accent outline-none text-text font-black text-xl transition shadow-inner italic" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">Data Classification</label>
                    <div className="relative">
                      <select className="w-full bg-background border-2 border-border rounded-2xl py-6 px-10 focus:border-accent outline-none cursor-pointer font-black text-text uppercase text-xs appearance-none shadow-inner" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                        {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-text/40"><Filter size={20} /></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">Intelligence Summary</label>
                    <textarea required rows={4} className="w-full bg-background border-2 border-border rounded-2xl py-6 px-10 focus:border-accent outline-none resize-none text-text font-medium text-lg leading-relaxed shadow-inner italic" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">Sync Link (URL)</label>
                    <input required type="url" className="w-full bg-background border-2 border-border rounded-2xl py-6 px-10 focus:border-accent outline-none text-text font-bold text-lg transition shadow-inner" value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} />
                  </div>
                </div>
                <button type="submit" className="w-full bg-accent hover:bg-gfg-green-hover text-white font-black py-8 rounded-[2rem] transition text-xl shadow-2xl uppercase tracking-widest active:scale-[0.98]">Deploy Neural Node</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .ql-editor a { color: var(--color-accent); font-weight: 800; text-decoration: underline; }
        .ql-editor h1, .ql-editor h2, .ql-editor h3 { color: var(--color-text); font-weight: 900; margin-top: 1.5em; margin-bottom: 0.5em; text-transform: uppercase; }
        .ql-editor ul, .ql-editor ol { padding-left: 1.5em; margin-bottom: 1em; list-style: disc; }
        .ql-editor p { margin-bottom: 1.5em; }
        .ql-editor img { max-width: 100%; height: auto; border-radius: 2rem; border: 1px solid var(--color-border); margin: 2rem 0; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
        .dark .ql-editor *, .dark .ql-editor span { background-color: transparent !important; color: var(--color-text) !important; }
      `}</style>
    </div>
  );
};

export default Resources;
