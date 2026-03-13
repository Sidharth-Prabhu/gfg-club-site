import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, ExternalLink, Trash2, 
  BookOpen, FileText, Bookmark, GraduationCap, 
  Lightbulb, X, Save, Filter, Search, Link2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Resources = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState('All');
  
  const [formData, setFormData] = useState({
    title: '', description: '', link: '', category: 'DSA Articles'
  });

  const categories = ['All', 'DSA Articles', 'Interview Preparation', 'Competitive Programming', 'Workshop Notes', 'System Design'];
  const canManage = user?.role === 'Admin' || user?.role === 'Core';

  const fetchResources = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/resources?category=${category}`);
      setResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/resources', formData);
      setFormData({ title: '', description: '', link: '', category: 'DSA Articles' });
      setIsModalOpen(false);
      fetchResources();
    } catch (error) {
      alert('Failed to add resource');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this resource?')) {
      try {
        await api.delete(`/resources/${id}`);
        fetchResources();
      } catch (error) {
        alert('Action failed');
      }
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'DSA Articles': return <BookOpen size={24} />;
      case 'Interview Preparation': return <GraduationCap size={24} />;
      case 'Competitive Programming': return <Lightbulb size={24} />;
      case 'Workshop Notes': return <FileText size={24} />;
      default: return <Bookmark size={24} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black text-text tracking-tighter uppercase">Knowledge <span className="text-accent">Base</span></h1>
          <p className="text-text/60 text-lg font-medium">Curated learning materials for the next generation of engineers.</p>
        </div>
        {canManage && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-accent hover:bg-gfg-green-hover text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition shadow-xl shadow-accent/20 text-sm uppercase tracking-widest active:scale-95"
          >
            <Plus size={24} /> Add Resource
          </button>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-6 py-3 rounded-xl text-xs font-black border transition flex items-center gap-2 uppercase tracking-widest whitespace-nowrap ${category === cat ? 'bg-accent border-accent text-white shadow-lg shadow-accent/10' : 'bg-card border-border text-text/40 hover:border-accent/40 hover:text-accent'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-32 text-center text-accent font-black tracking-widest uppercase animate-pulse text-xl">Accessing Archives...</div>
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map(res => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              key={res.id} 
              className="bg-card border border-border rounded-[2.5rem] p-8 hover:border-accent transition-all flex flex-col group shadow-sm hover:shadow-xl"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="p-4 rounded-2xl bg-accent/5 text-accent border border-accent/10 group-hover:bg-accent group-hover:text-white transition-all duration-500 shadow-inner">
                  {getCategoryIcon(res.category)}
                </div>
                {canManage && (
                  <button onClick={() => handleDelete(res.id)} className="p-2.5 bg-background border border-border rounded-xl text-text/40 hover:text-red-500 transition-colors shadow-sm">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="flex-grow space-y-4 mb-10">
                <div className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">{res.category}</div>
                <h3 className="text-2xl font-black text-text leading-tight group-hover:text-accent transition-colors tracking-tight">{res.title}</h3>
                <p className="text-text/60 text-sm leading-relaxed font-medium line-clamp-3">{res.description}</p>
              </div>

              <a 
                href={res.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-5 bg-background border border-border rounded-2xl flex items-center justify-center gap-3 text-text/60 font-black text-xs uppercase tracking-[0.2em] hover:border-accent hover:text-accent transition-all shadow-inner group/link active:scale-[0.98]"
              >
                Access Material <ExternalLink size={16} className="group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
              </a>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-40 text-center text-text/30 bg-card rounded-[3rem] border border-border border-dashed shadow-inner">
          <Link2 size={80} className="mx-auto mb-6 opacity-5" />
          <p className="text-2xl font-black uppercase tracking-widest">No resources found.</p>
        </div>
      )}

      {/* Add Resource Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/95 backdrop-blur-xl overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-card border border-border rounded-[3rem] w-full max-w-2xl my-auto shadow-2xl overflow-hidden">
              <div className="p-10 border-b border-border flex justify-between items-center bg-background/50">
                <h2 className="text-2xl font-black text-text uppercase tracking-tighter">Add Knowledge Node</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-text/40 hover:text-red-500 p-4 hover:bg-red-500/5 rounded-full transition-all group"><X size={32} className="group-hover:rotate-90 transition-transform" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-10 md:p-14 space-y-10">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">Resource Title</label>
                    <input required type="text" className="w-full bg-background border-2 border-border rounded-2xl py-5 px-8 focus:border-accent outline-none text-text font-black text-xl transition shadow-inner" placeholder="e.g. Master DP in 30 Days" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">Classification</label>
                    <div className="relative">
                      <select className="w-full bg-background border-2 border-border rounded-2xl py-5 px-8 focus:border-accent outline-none cursor-pointer font-black text-text uppercase text-xs appearance-none shadow-inner" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                        {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-text/40">
                        <Filter size={18} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">Brief Summary</label>
                    <textarea required rows={4} className="w-full bg-background border-2 border-border rounded-2xl py-5 px-8 focus:border-accent outline-none resize-none text-text font-medium text-lg leading-relaxed shadow-inner" placeholder="Provide a concise brief..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">Resource URL</label>
                    <input required type="url" className="w-full bg-background border-2 border-border rounded-2xl py-5 px-8 focus:border-accent outline-none text-text font-bold text-lg transition shadow-inner" placeholder="https://..." value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} />
                  </div>
                </div>
                <button type="submit" className="w-full bg-accent hover:bg-gfg-green-hover text-white font-black py-7 rounded-[1.5rem] transition text-xl shadow-2xl shadow-accent/20 uppercase tracking-widest active:scale-[0.98]">Deploy Node</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Resources;
