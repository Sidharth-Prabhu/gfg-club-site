import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, Clock, User, Tag, Edit3, Trash2, 
  Share2, BookOpen, Calendar, Sparkles, Hash, Save, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ title: '', content: '', tags: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBlog = async () => {
    try {
      const { data } = await api.get(`/blogs/${id}`);
      setBlog(data);
    } catch (error) {
      console.error('Error fetching blog:', error);
      navigate('/blog');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchBlog();
      setLoading(false);
    };
    init();
  }, [id]);

  useEffect(() => {
    if (blog && new URLSearchParams(window.location.search).get('edit') === 'true' && (user?.id === blog.author_id || user?.role === 'Admin')) {
      handleOpenEditModal();
      window.history.replaceState({}, '', `/blog/${id}`);
    }
  }, [blog, user]);

  const handleDelete = async () => {
    if (!window.confirm('Terminate this publication?')) return;
    try {
      await api.delete(`/blogs/${id}`);
      navigate('/blog');
    } catch (error) {
      alert('Deletion failed');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.title.trim() || !editFormData.content.trim()) return;
    
    setIsSubmitting(true);
    try {
      await api.put(`/blogs/${id}`, editFormData);
      setIsEditModalOpen(false);
      fetchBlog();
    } catch (error) {
      alert('Failed to update publication');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = () => {
    setEditFormData({
      title: blog.title,
      content: blog.content,
      tags: blog.tags || ''
    });
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-accent font-black tracking-[0.3em] uppercase animate-pulse text-xl italic">
          Decrypting Publication Node...
        </div>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] md:min-h-[60vh] w-full overflow-hidden bg-card border-b border-border flex flex-col justify-end">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px] -mr-64 -mt-64"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -ml-48 -mb-48"></div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        
        <div className="absolute top-8 left-8 z-20">
          <button 
            onClick={() => navigate('/blog')} 
            className="flex items-center gap-2 text-text/60 bg-card/40 hover:bg-card backdrop-blur-md px-6 py-3 rounded-full border border-border transition-all group font-black uppercase text-xs tracking-widest active:scale-95"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Archives
          </button>
        </div>

        <div className="relative w-full p-8 md:p-20 z-10 pt-32 md:pt-48">
          <div className="max-w-7xl mx-auto space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-4">
                <span className="bg-accent/10 text-accent text-[10px] font-black px-5 py-2 rounded-full border border-accent/20 tracking-widest uppercase backdrop-blur-md">
                    OFFICIAL PUBLICATION
                </span>
                <div className="flex gap-2">
                    {blog.tags?.split(',').map((tag, i) => (
                        <span key={i} className="text-[10px] font-black text-text/40 bg-card/60 border border-border px-4 py-2 rounded-full uppercase tracking-widest backdrop-blur-sm">
                            #{tag.trim()}
                        </span>
                    ))}
                </div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }} 
              className="text-5xl md:text-8xl font-black text-text leading-[1.1] tracking-tighter uppercase max-w-5xl italic"
            >
              {blog.title}
            </motion.h1>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-12 text-text/40 pt-4"
            >
              <div className="flex items-center gap-5">
                <Link to={`/profile/${blog.author_id}`} className="w-16 h-16 rounded-[1.5rem] bg-accent/10 flex items-center justify-center text-2xl font-black text-accent border border-accent/20 shadow-inner hover:bg-accent hover:text-white transition-all overflow-hidden">
                  {blog.author_pic ? <img src={blog.author_pic} className="w-full h-full object-cover" /> : blog.author_name[0]}
                </Link>
                <div>
                  <Link to={`/profile/${blog.author_id}`} className="font-black text-2xl text-text uppercase tracking-widest hover:text-accent transition-colors">{blog.author_name}</Link>
                  <p className="text-[10px] text-accent font-black uppercase tracking-[0.3em] mt-1 italic">Technical Authority</p>
                </div>
              </div>
              <div className="h-12 w-[1px] bg-border hidden sm:block"></div>
              <span className="flex items-center gap-3 font-black uppercase text-xs tracking-widest text-text/40">
                <Calendar size={20} className="text-accent" /> {new Date(blog.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-3 font-black uppercase text-xs tracking-widest text-text/40">
                <Clock size={20} className="text-accent" /> {Math.ceil(blog.content.length / 1000)} MIN READ
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="max-w-7xl mx-auto px-8 md:px-20 mt-12 md:mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
          <div className="lg:col-span-2 space-y-20">
            {/* Article Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="prose prose-accent dark:prose-invert max-w-none text-text/80 text-xl md:text-2xl leading-[1.8] font-medium ql-editor !p-0 italic" dangerouslySetInnerHTML={{ __html: blog.content }} />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-10">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border p-10 rounded-[3rem] shadow-xl sticky top-24 space-y-10">
              <div className="space-y-8 text-center">
                <div className="p-6 bg-accent/5 rounded-[2rem] border border-accent/10 inline-block">
                    <BookOpen size={48} className="text-accent" />
                </div>
                <div>
                    <h4 className="text-xl font-black text-text uppercase tracking-widest italic">Matrix Publication</h4>
                    <p className="text-text/40 font-black uppercase text-[10px] tracking-[0.3em] mt-2">Verified Content Stream</p>
                </div>
              </div>

              {/* Author/Mod Actions */}
              <div className="space-y-4 pt-8 border-t border-border/50">
                {(user?.id === blog.author_id || user?.role === 'Admin') && (
                  <button onClick={handleOpenEditModal} className="w-full py-5 rounded-2xl bg-blue-500/5 text-blue-500 border border-border hover:bg-blue-500 hover:text-white transition-all font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 active:scale-95">
                    <Edit3 size={18} /> Modify Insight
                  </button>
                )}
                {(user?.id === blog.author_id || user?.role === 'Admin' || user?.role === 'Core') && (
                  <button onClick={handleDelete} className="w-full py-5 rounded-2xl bg-red-500/5 text-red-500 border border-border hover:bg-red-500 hover:text-white transition-all font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 active:scale-95">
                    <Trash2 size={18} /> Terminate Entry
                  </button>
                )}
                <button className="w-full py-5 bg-background border border-border text-text/40 hover:text-accent hover:border-accent rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-95"><Share2 size={18} /> Broadcast Signal</button>
              </div>

              <div className="pt-8 border-t border-border/50">
                   <div className="flex items-center gap-4 text-text/40 mb-6">
                      <Tag size={18} className="text-accent" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Metadata Nodes</span>
                   </div>
                   <div className="flex flex-wrap gap-2">
                      {blog.tags?.split(',').map((tag, i) => (
                        <span key={i} className="text-[9px] font-black text-text bg-background border border-border px-4 py-2 rounded-xl uppercase tracking-widest shadow-sm">
                          {tag.trim()}
                        </span>
                      ))}
                   </div>
                </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-xl overflow-y-auto">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="bg-card border border-border rounded-[3.5rem] w-full max-w-5xl my-auto shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-10 border-b border-border flex justify-between items-center bg-background/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/10 rounded-xl text-accent"><Edit3 size={24} /></div>
                  <h2 className="text-3xl font-black text-text uppercase tracking-tighter italic">Re-Draft Insight</h2>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="text-text/40 hover:text-red-500 p-4 hover:bg-red-500/5 rounded-full transition-all group active:scale-90"><X size={32} className="group-hover:rotate-90 transition-transform" /></button>
              </div>
              <form onSubmit={handleEdit} className="p-10 md:p-14 space-y-12 overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Headline</label>
                    <input required type="text" className="w-full bg-background border-2 border-border rounded-[1.5rem] py-6 px-10 focus:border-accent outline-none text-2xl font-black text-text shadow-inner transition-colors" value={editFormData.title} onChange={(e) => setEditFormData({...editFormData, title: e.target.value})} />
                </div>
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Content Matrix</label>
                    <div className="bg-background rounded-[2rem] overflow-hidden border-2 border-border focus-within:border-accent transition shadow-inner">
                        <ReactQuill theme="snow" value={editFormData.content} onChange={(content) => setEditFormData({...editFormData, content: content})} />
                    </div>
                </div>
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Tags (CSV)</label>
                    <input type="text" className="w-full bg-background border-2 border-border rounded-[1.5rem] py-6 px-10 focus:border-accent outline-none font-bold text-text shadow-inner transition-colors" value={editFormData.tags} onChange={(e) => setEditFormData({...editFormData, tags: e.target.value})} />
                </div>
                <div className="flex gap-6 pt-4">
                    <button type="submit" disabled={isSubmitting} className="flex-grow bg-accent hover:bg-gfg-green-hover text-white font-black py-7 px-14 rounded-[1.5rem] transition text-xl shadow-2xl shadow-accent/20 uppercase tracking-widest active:scale-[0.98] disabled:opacity-50">
                        {isSubmitting ? 'Updating Node...' : 'Commit Changes'}
                    </button>
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="bg-card border border-border hover:bg-background text-text/60 font-black py-7 px-14 rounded-[1.5rem] transition text-xl uppercase tracking-widest shadow-sm italic">Abort</button>
                </div>
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
        .dark .ql-editor *, .dark .ql-editor span { background-color: transparent !important; color: var(--color-text) !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-accent); border-radius: 10px; opacity: 0.2; }
      `}</style>
    </div>
  );
};

export default BlogDetail;
