import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faExternalLinkAlt, faTrashAlt, faBookOpen, faFileAlt, faBookmark, 
  faGraduationCap, faLightbulb, faTimes, faFilter, faLink, faSearch, 
  faGlobe, faArrowRight, faArrowLeft, faCircleNotch, faStar, faTerminal, faMicrochip, faZap, faShieldAlt, faSave
} from '@fortawesome/free-solid-svg-icons';
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
      alert('Failed to search GfG articles');
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
      alert('Failed to load article content');
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
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-8 pb-16">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border pb-6"
      >
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black text-text tracking-tighter uppercase italic">Learning <span className="text-accent">Resources</span></h1>
          <p className="text-text/40 font-black text-[10px] tracking-[0.2em] uppercase flex items-center gap-2 italic"><FontAwesomeIcon icon={faZap} className="text-accent" /> Quality Materials</p>
        </div>
        
        <div className="flex bg-card border border-border p-1 rounded-xl shadow-inner">
            <button onClick={() => setActiveTab('gfg')} className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'gfg' ? 'bg-accent text-white shadow-md' : 'text-text/40 hover:text-text'}`}>GfG Articles</button>
            <button onClick={() => setActiveTab('archive')} className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'archive' ? 'bg-accent text-white shadow-md' : 'text-text/40 hover:text-text'}`}>Community Resources</button>
        </div>
      </motion.div>

      {activeTab === 'gfg' ? (
        <div className="space-y-8">
            {!isApproved ? (
                <div className="py-24 text-center bg-accent/5 rounded-3xl border border-accent/20 space-y-4">
                    <div className="p-6 bg-card border border-border rounded-2xl shadow-lg inline-block">
                        <FontAwesomeIcon icon={faBookmark} className="text-accent opacity-20 text-4xl" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black text-text uppercase italic tracking-tighter">Access Restricted</h3>
                        <p className="text-text/40 text-xs font-medium uppercase tracking-widest max-w-md mx-auto italic px-8">Resources restricted to approved members.</p>
                    </div>
                </div>
            ) : !selectedArticle ? (
                <>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow group">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Search GfG Articles..." 
                                className="w-full bg-card border-2 border-border rounded-2xl py-4 pl-14 pr-6 focus:border-accent outline-none transition shadow-lg text-text font-black text-lg italic"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleGfgSearch(searchQuery)}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {gfgCategories.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => handleGfgSearch(cat)}
                                className="px-5 py-2.5 bg-card border border-border rounded-xl text-[9px] font-black uppercase tracking-widest text-text/40 hover:border-accent hover:text-accent transition-all whitespace-nowrap shadow-sm active:scale-95 italic"
                            >
                                # {cat}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="py-24 text-center space-y-4">
                            <FontAwesomeIcon icon={faCircleNotch} className="mx-auto text-accent animate-spin opacity-20 text-4xl" />
                            <p className="text-accent font-black tracking-[0.3em] uppercase italic text-xs animate-pulse">Searching...</p>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {searchResults.map((res, i) => (
                                <motion.div 
                                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                    key={i}
                                    onClick={() => handleFetchArticle(res.link)}
                                    className="bg-card border border-border p-6 rounded-3xl hover:border-accent transition-all cursor-pointer group shadow-sm flex flex-col justify-between gap-4"
                                >
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div className="p-2.5 bg-accent/5 rounded-xl text-accent border border-accent/10"><FontAwesomeIcon icon={faTerminal} /></div>
                                            <div className="text-[7px] font-black text-text/20 uppercase tracking-widest">Article #{i+1}</div>
                                        </div>
                                        <h3 className="text-xl font-black text-text leading-tight group-hover:text-accent transition-colors uppercase italic">{res.title}</h3>
                                        <p className="text-text/40 text-xs font-medium line-clamp-2 italic">{res.snippet}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-accent uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
                                        Read Article <FontAwesomeIcon icon={faArrowRight} />
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="py-24 text-center bg-card/20 rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center space-y-4">
                            <div className="p-6 bg-background border border-border rounded-2xl shadow-inner">
                                <FontAwesomeIcon icon={faMicrochip} className="text-text/10 text-4xl" />
                            </div>
                            <p className="text-xl font-black text-text/20 uppercase tracking-widest italic">No articles found</p>
                        </div>
                    )}
                </>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    <button 
                        onClick={() => setSelectedArticle(null)} 
                        className="flex items-center gap-2 text-text/60 bg-card hover:bg-background px-5 py-2.5 rounded-xl border border-border transition-all font-black uppercase text-[10px] tracking-widest active:scale-95 shadow-sm"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} /> Go Back
                    </button>

                    <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-2xl space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                        <div className="space-y-4 relative z-10">
                            <div className="flex items-center gap-3">
                                <span className="bg-accent/10 text-accent text-[8px] font-black px-3 py-1 rounded-full border border-accent/20 tracking-widest uppercase backdrop-blur-md italic">Article Content</span>
                                <span className="text-[8px] font-black text-text/20 uppercase tracking-widest italic">Source: GeeksforGeeks</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-text leading-tight tracking-tighter uppercase italic">{selectedArticle.title}</h2>
                        </div>

                        {articleLoading ? (
                            <div className="py-24 text-center space-y-4">
                                <FontAwesomeIcon icon={faCircleNotch} className="mx-auto text-accent animate-spin opacity-20 text-4xl" />
                                <p className="text-accent font-black tracking-[0.3em] uppercase italic text-xs">Loading...</p>
                            </div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="prose prose-accent dark:prose-invert max-w-none text-text/80 text-lg leading-[1.7] font-medium ql-editor !p-0 italic relative z-10" 
                                dangerouslySetInnerHTML={{ __html: selectedArticle.content }} 
                            />
                        )}
                    </div>
                </motion.div>
            )}
        </div>
      ) : (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-grow">
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setArchiveCategory(cat)}
                            className={`px-5 py-2.5 rounded-xl text-[9px] font-black border transition-all uppercase tracking-widest whitespace-nowrap shadow-sm ${archiveCategory === cat ? 'bg-accent border-accent text-white shadow-md' : 'bg-card border-border text-text/40 hover:border-accent/40 hover:text-accent'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                {canManage && (
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-accent hover:bg-gfg-green-hover text-white px-6 py-2.5 rounded-xl font-black flex items-center gap-2 transition shadow-lg shadow-accent/10 text-[10px] uppercase tracking-widest active:scale-95"
                    >
                        <FontAwesomeIcon icon={faPlus} /> Add Resource
                    </button>
                )}
            </div>

            {loading ? (
                <div className="py-24 text-center text-accent font-black tracking-widest uppercase animate-pulse text-xs italic">Loading Resources...</div>
            ) : resources.length > 0 ? (
                <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.map(res => (
                        <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }} whileHover={{ y: -4, borderColor: 'var(--color-accent)' }} key={res.id} className="bg-card border border-border rounded-3xl p-6 transition-all flex flex-col group shadow-sm hover:shadow-xl" >
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 rounded-xl bg-accent/5 text-accent border border-accent/10 group-hover:bg-accent group-hover:text-white transition-all duration-500 shadow-inner">
                                    <FontAwesomeIcon icon={faBookmark} />
                                </div>
                                {canManage && (
                                    <button onClick={() => handleDelete(res.id)} className="p-2 bg-background border border-border rounded-lg text-text/40 hover:text-red-500 transition-colors shadow-sm active:scale-90">
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                    </button>
                                )}
                            </div>
                            <div className="flex-grow space-y-2 mb-8">
                                <div className="text-[7px] font-black text-accent uppercase tracking-[0.2em] italic">{res.category}</div>
                                <h3 className="text-xl font-black text-text leading-tight group-hover:text-accent transition-colors tracking-tight uppercase italic">{res.title}</h3>
                                <p className="text-text/50 text-xs leading-relaxed font-medium line-clamp-3 italic">{res.description}</p>
                            </div>
                            <a href={res.link} target="_blank" rel="noopener noreferrer" className="w-full py-3.5 bg-background border border-border rounded-xl flex items-center justify-center gap-3 text-text/60 font-black text-[10px] uppercase tracking-widest hover:border-accent hover:text-accent transition-all shadow-inner group/link active:scale-[0.98]">
                                Open Resource <FontAwesomeIcon icon={faExternalLinkAlt} className="group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                            </a>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <div className="py-24 text-center text-text/30 bg-card rounded-3xl border border-border border-dashed shadow-inner flex flex-col items-center justify-center space-y-4">
                    <div className="p-6 bg-background border border-border rounded-2xl shadow-inner">
                        <FontAwesomeIcon icon={faLink} className="opacity-10 text-4xl" />
                    </div>
                    <p className="text-xl font-black uppercase tracking-widest italic">No resources found</p>
                </div>
            )}
        </div>
      )}

      {/* Manual Resource Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/95 backdrop-blur-xl overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-card border border-border rounded-3xl w-full max-w-2xl my-auto shadow-2xl overflow-hidden">
              <div className="p-6 md:p-8 border-b border-border flex justify-between items-center bg-background/50">
                <h2 className="text-2xl font-black text-text uppercase tracking-tighter italic">Add New <span className="text-accent">Resource</span></h2>
                <button onClick={() => setIsModalOpen(false)} className="text-text/40 hover:text-red-500 p-2 rounded-full transition-all active:scale-90"><FontAwesomeIcon icon={faTimes} size="lg" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-2">Resource Title</label>
                    <input required type="text" className="w-full bg-background border-2 border-border rounded-xl py-3 px-5 focus:border-accent outline-none text-text font-black text-lg transition shadow-inner italic" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-2">Category</label>
                    <div className="relative">
                      <select className="w-full bg-background border-2 border-border rounded-xl py-3 px-5 focus:border-accent outline-none cursor-pointer font-black text-text uppercase text-[10px] appearance-none shadow-inner italic" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                        {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-text/40"><FontAwesomeIcon icon={faFilter} /></div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-2">Description</label>
                    <textarea required rows={3} className="w-full bg-background border-2 border-border rounded-xl py-3 px-5 focus:border-accent outline-none resize-none text-text font-medium text-sm leading-relaxed shadow-inner italic" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-2">Resource Link (URL)</label>
                    <input required type="url" className="w-full bg-background border-2 border-border rounded-xl py-3 px-5 focus:border-accent outline-none text-text font-bold text-sm transition shadow-inner italic" value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} />
                  </div>
                </div>
                <button type="submit" className="w-full bg-accent hover:bg-gfg-green-hover text-white font-black py-4 rounded-xl transition text-sm shadow-xl uppercase tracking-widest active:scale-[0.98]"><FontAwesomeIcon icon={faSave} /> Add Resource</button>
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
        .ql-editor img { max-width: 100%; height: auto; border-radius: 1.5rem; border: 1px solid var(--color-border); margin: 1.5rem 0; shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5); }
        .dark .ql-editor *, .dark .ql-editor span { background-color: transparent !important; color: var(--color-text) !important; }
      `}</style>
    </div>
  );
};

export default Resources;
