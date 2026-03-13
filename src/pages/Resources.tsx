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
      case 'DSA Articles': return <BookOpen size={20} />;
      case 'Interview Preparation': return <GraduationCap size={20} />;
      case 'Competitive Programming': return <Lightbulb size={20} />;
      case 'Workshop Notes': return <FileText size={20} />;
      default: return <Bookmark size={20} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase">Knowledge Base</h1>
          <p className="text-gray-400 mt-2 text-lg">Curated learning materials for the next generation of engineers.</p>
        </div>
        {canManage && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-accent hover:bg-green-700 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 transition shadow-xl shadow-accent/20 text-sm uppercase tracking-widest"
          >
            <Plus size={20} /> Add Resource
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-6 py-2.5 rounded-xl text-xs font-black border transition flex items-center gap-2 uppercase tracking-widest ${category === cat ? 'bg-accent border-accent text-white shadow-lg shadow-accent/10' : 'bg-card border-gray-800 text-gray-400 hover:border-gray-600'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-32 text-center text-accent font-black tracking-widest uppercase animate-pulse">Accessing archives...</div>
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map(res => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={res.id} 
              className="bg-card border border-gray-800 rounded-3xl p-6 hover:border-accent/40 transition-all flex flex-col group shadow-sm"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-accent/10 text-accent border border-accent/20 group-hover:bg-accent group-hover:text-white transition-all duration-500">
                  {getCategoryIcon(res.category)}
                </div>
                {canManage && (
                  <button onClick={() => handleDelete(res.id)} className="p-2 bg-background border border-gray-800 rounded-xl text-gray-600 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="flex-grow space-y-3 mb-8">
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{res.category}</div>
                <h3 className="text-xl font-bold text-gray-100 leading-tight group-hover:text-accent transition-colors">{res.title}</h3>
                <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">{res.description}</p>
              </div>

              <a 
                href={res.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-4 bg-background border border-gray-800 rounded-2xl flex items-center justify-center gap-2 text-gray-300 font-black text-[10px] uppercase tracking-[0.2em] hover:border-accent hover:text-accent transition-all shadow-inner group/link"
              >
                Access Resource <ExternalLink size={14} className="group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
              </a>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-40 text-center text-gray-500 bg-card rounded-[3rem] border border-gray-800 border-dashed">
          <Link2 size={64} className="mx-auto mb-4 opacity-10" />
          <p className="text-xl font-bold uppercase tracking-widest">No resources found in this category.</p>
        </div>
      )}

      {/* Add Resource Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-card border border-gray-800 rounded-[2.5rem] w-full max-w-xl my-auto shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-background/50">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Add Knowledge Node</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-3 hover:bg-gray-800 rounded-full transition-all"><X size={28} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-10 space-y-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Resource Title</label>
                    <input required type="text" className="w-full bg-background border-2 border-gray-800 rounded-2xl py-4 px-6 focus:border-accent outline-none text-white font-bold transition shadow-inner" placeholder="e.g. Master DP in 30 Days" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Category</label>
                    <select className="w-full bg-background border-2 border-gray-800 rounded-2xl py-4 px-6 focus:border-accent outline-none cursor-pointer font-bold text-white uppercase text-xs" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                      {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Description</label>
                    <textarea required rows={3} className="w-full bg-background border-2 border-gray-800 rounded-2xl py-4 px-6 focus:border-accent outline-none resize-none text-white font-medium shadow-inner" placeholder="Quick brief about this material..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Resource URL</label>
                    <input required type="url" className="w-full bg-background border-2 border-gray-800 rounded-2xl py-4 px-6 focus:border-accent outline-none text-white font-medium transition shadow-inner" placeholder="https://..." value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} />
                  </div>
                </div>
                <button type="submit" className="w-full bg-accent hover:bg-green-700 text-white font-black py-5 rounded-2xl transition text-lg shadow-2xl shadow-accent/30 uppercase tracking-widest">Deploy Resource</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Resources;
