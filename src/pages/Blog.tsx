import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Edit3, Trash2, X, Save, Clock, 
  Tag, ArrowLeft, Share2, BookOpen, User, Hash,
  ChevronRight, Calendar, Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const Blog = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState(null);
  
  const [formData, setFormData] = useState({ title: '', content: '', tags: '' });

  const canPost = user?.role === 'Admin' || user?.role === 'Core';

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['code-block', 'link', 'image'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  }), []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/blogs');
      setBlogs(data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingBlogId(null);
    setFormData({ title: '', content: '', tags: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e, blog) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditingBlogId(blog.id);
    setFormData({
      title: blog.title,
      content: blog.content,
      tags: blog.tags || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && editingBlogId) {
        await api.put(`/blogs/${editingBlogId}`, formData);
      } else {
        await api.post('/blogs', formData);
      }
      setFormData({ title: '', content: '', tags: '' });
      setIsModalOpen(false);
      fetchBlogs();
    } catch (error) {
      alert('Failed to save blog');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Permanently delete this blog post?')) {
      try {
        await api.delete(`/blogs/${id}`);
        fetchBlogs();
      } catch (error) {
        alert('Action failed');
      }
    }
  };

  const stripHtml = (html) => {
      const tmp = document.createElement("DIV");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl space-y-8 pb-16">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border pb-6"
      >
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black text-text tracking-tighter uppercase italic">Club <span className="text-accent">Insights</span></h1>
          <p className="text-text/60 text-sm font-medium italic">Deep dives into tech and campus activities.</p>
        </div>
        {canPost && (
          <button 
            onClick={handleOpenCreate}
            className="bg-accent hover:bg-gfg-green-hover text-white px-6 py-2.5 rounded-xl font-black flex items-center gap-2 transition shadow-lg shadow-accent/10 text-[10px] uppercase tracking-widest active:scale-95"
          >
            <Plus size={16} /> Write Entry
          </button>
        )}
      </motion.div>

      {loading ? (
        <div className="py-24 text-center text-accent font-black tracking-widest uppercase animate-pulse text-xs italic">Accessing Archives...</div>
      ) : blogs.length > 0 ? (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {blogs.map(blog => (
            <motion.div 
              variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ y: -4, borderColor: 'var(--color-accent)' }}
              key={blog.id} 
              onClick={() => navigate(`/blog/${blog.id}`)}
              className="bg-card border border-border rounded-3xl p-6 flex flex-col transition-all cursor-pointer group shadow-sm hover:shadow-xl"
            >
              <div className="space-y-6 flex-grow">
                <div className="flex justify-between items-start">
                    <div className="flex flex-wrap gap-1.5">
                        {blog.tags?.split(',').map((tag, i) => (
                            <span key={i} className="text-[8px] font-black text-accent bg-accent/5 px-2 py-0.5 rounded-lg border border-accent/10 uppercase tracking-widest italic">#{tag.trim()}</span>
                        ))}
                    </div>
                    {canPost && (
                        <div className="flex gap-1.5">
                            {(user?.id === blog.author_id || user?.role === 'Admin') && (
                                <button onClick={(e) => handleOpenEdit(e, blog)} className="p-1.5 bg-background border border-border rounded-lg text-text/40 hover:text-accent opacity-0 group-hover:opacity-100 transition-all shadow-sm active:scale-90">
                                    <Edit size={14} />
                                </button>
                            )}
                            <button onClick={(e) => handleDelete(e, blog.id)} className="p-1.5 bg-background border border-border rounded-lg text-text/40 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm active:scale-90">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    )}
                </div>
                <div className="space-y-3">
                    <h2 className="text-xl md:text-2xl font-black text-text group-hover:text-accent transition-colors leading-tight tracking-tight uppercase italic">{blog.title}</h2>
                    <p className="text-text/60 text-xs line-clamp-2 leading-relaxed font-medium italic">
                        {stripHtml(blog.content)}
                    </p>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link to={`/profile/${blog.author_id}`} onClick={(e) => e.stopPropagation()} className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-sm font-black text-accent border border-accent/20 shadow-inner overflow-hidden hover:bg-accent hover:text-white transition-all">
                        {blog.author_pic ? <img src={blog.author_pic} className="w-full h-full object-cover" /> : blog.author_name[0]}
                    </Link>
                    <div>
                        <Link to={`/profile/${blog.author_id}`} onClick={(e) => e.stopPropagation()} className="font-black text-text uppercase tracking-widest text-[10px] hover:text-accent transition-colors">{blog.author_name}</Link>
                        <p className="text-[8px] text-text/30 font-bold uppercase tracking-widest mt-0.5">{new Date(blog.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="text-accent font-black text-[8px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 flex items-center gap-1.5">
                    Read <ChevronRight size={12} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="py-32 text-center text-text/30 bg-card rounded-3xl border border-border border-dashed shadow-inner flex flex-col items-center justify-center space-y-4">
          <BookOpen size={64} className="opacity-10" />
          <p className="text-xl font-black uppercase tracking-widest italic">No entries.</p>
        </div>
      )}

      {/* Editor Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-xl overflow-y-auto">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="bg-card border border-border rounded-[3.5rem] w-full max-w-5xl my-auto shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-10 border-b border-border flex justify-between items-center bg-background/50">
                <h2 className="text-3xl font-black text-text uppercase tracking-tighter italic">{isEditing ? 'Modify Insight' : 'Draft New Insight'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-text/40 hover:text-red-500 p-4 hover:bg-red-500/5 rounded-full transition-all group active:scale-90"><X size={32} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-10 md:p-14 space-y-10 overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Headline</label>
                    <input required type="text" className="w-full bg-background border-2 border-border rounded-[1.5rem] py-6 px-10 focus:border-accent outline-none text-2xl font-black text-text shadow-inner transition-colors italic" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Content Matrix</label>
                    <div className="bg-background rounded-[2rem] overflow-hidden border-2 border-border focus-within:border-accent transition shadow-inner">
                        <ReactQuill theme="snow" value={formData.content} onChange={(content) => setFormData({...formData, content})} modules={modules} />
                    </div>
                </div>
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Metadata Tags (CSV)</label>
                    <input type="text" className="w-full bg-background border-2 border-border rounded-[1.5rem] py-6 px-10 focus:border-accent outline-none font-bold text-text shadow-inner transition-colors italic" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} />
                </div>
                <div className="flex gap-6 pt-4 sticky bottom-0 bg-card/80 backdrop-blur-md">
                    <button type="submit" className="flex-grow bg-accent hover:bg-gfg-green-hover text-white font-black py-7 rounded-[1.5rem] transition text-xl shadow-2xl shadow-accent/20 uppercase tracking-widest active:scale-[0.98]">
                        {isEditing ? 'Commit Update' : 'Deploy Publication'}
                    </button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="bg-card border border-border hover:bg-background text-text/60 font-black py-7 px-14 rounded-[1.5rem] transition text-xl uppercase tracking-widest shadow-sm italic">Abort</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .ql-container { border: none !important; font-family: inherit; font-size: 18px; background: transparent; }
        .ql-toolbar { border: none !important; border-bottom: 2px solid var(--color-border) !important; background: var(--color-card); padding: 20px !important; }
        .ql-editor { min-height: 400px; color: var(--color-text); padding: 40px !important; line-height: 1.8; }
        .ql-snow .ql-stroke { stroke: var(--color-text); opacity: 0.4; stroke-width: 2px; }
        .ql-snow .ql-fill { fill: var(--color-text); opacity: 0.4; }
        .ql-snow .ql-picker { color: var(--color-text); opacity: 0.6; font-weight: 800; }
        .ql-snow .ql-picker-options { background-color: var(--color-card); border: 2px solid var(--color-border); border-radius: 16px; padding: 10px; }
        .ql-snow .ql-editor pre.ql-syntax { background-color: var(--color-background); color: var(--color-accent); padding: 30px; border-radius: 24px; border: 1px solid var(--color-border); font-family: 'JetBrains Mono', monospace; font-size: 15px; }
        .dark .ql-editor *, .dark .ql-editor span { background-color: transparent !important; color: var(--color-text) !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-accent); border-radius: 10px; opacity: 0.2; }
      `}</style>
    </div>
  );
};

export default Blog;
