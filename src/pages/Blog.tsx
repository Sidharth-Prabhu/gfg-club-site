import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faEdit, faTrashAlt, faTimes, faSave, faClock, 
  faTag, faArrowLeft, faShareAlt, faBookOpen, faUser, faHashtag,
  faChevronRight, faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import MarkdownEditor from '../components/MarkdownEditor';
import MarkdownRenderer from '../components/MarkdownRenderer';

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
          <h1 className="text-3xl md:text-4xl font-black text-text tracking-tighter uppercase italic">Club <span className="text-accent">Blog</span></h1>
          <p className="text-text/60 text-sm font-medium italic">Latest updates and articles from the community.</p>
        </div>
        {canPost && (
          <button 
            onClick={handleOpenCreate}
            className="bg-accent hover:bg-gfg-green-hover text-white px-6 py-2.5 rounded-xl font-black flex items-center gap-2 transition shadow-lg shadow-accent/10 text-[10px] uppercase tracking-widest active:scale-95"
          >
            <FontAwesomeIcon icon={faPlus} /> New Post
          </button>
        )}
      </motion.div>

      {loading ? (
        <div className="py-24 text-center text-accent font-black tracking-widest uppercase animate-pulse text-xs italic">Loading Blog Posts...</div>
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
                                    <FontAwesomeIcon icon={faEdit} className="text-[10px]" />
                                </button>
                            )}
                            <button onClick={(e) => handleDelete(e, blog.id)} className="p-1.5 bg-background border border-border rounded-lg text-text/40 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm active:scale-90">
                                <FontAwesomeIcon icon={faTrashAlt} className="text-[10px]" />
                            </button>
                        </div>
                    )}
                </div>
                <div className="space-y-3">
                    <h2 className="text-xl md:text-2xl font-black text-text group-hover:text-accent transition-colors leading-tight tracking-tight uppercase italic">{blog.title}</h2>
                    <div className="text-text/60 text-xs line-clamp-3 leading-relaxed font-medium italic overflow-hidden">
                        <MarkdownRenderer content={blog.content} />
                    </div>
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
                    Read More <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="py-32 text-center text-text/30 bg-card rounded-3xl border border-border border-dashed shadow-inner flex flex-col items-center justify-center space-y-4">
          <FontAwesomeIcon icon={faBookOpen} size="4x" className="opacity-10" />
          <p className="text-xl font-black uppercase tracking-widest italic">No blog posts found.</p>
        </div>
      )}

      {/* Editor Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-xl overflow-y-auto">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="bg-card border border-border rounded-3xl w-full max-w-4xl my-auto shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 md:p-8 border-b border-border flex justify-between items-center bg-background/50">
                <h2 className="text-2xl font-black text-text uppercase tracking-tighter italic">{isEditing ? 'Edit Post' : 'Create New Post'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-text/40 hover:text-red-500 p-2 rounded-full transition-all group active:scale-90"><FontAwesomeIcon icon={faTimes} size="lg" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6 overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                    <label className="block text-[8px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Title</label>
                    <input required type="text" className="w-full bg-background border-2 border-border rounded-xl py-3 px-5 focus:border-accent outline-none text-lg font-black text-text shadow-inner transition-colors italic" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <MarkdownEditor 
                        label="Content"
                        value={formData.content}
                        onChange={(content) => setFormData({...formData, content})}
                        placeholder="Share your technical insights with the community..."
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-[8px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Tags (comma separated)</label>
                    <input type="text" className="w-full bg-background border-2 border-border rounded-xl py-3 px-5 focus:border-accent outline-none font-bold text-sm text-text shadow-inner transition-colors italic" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} />
                </div>
                <div className="flex gap-4 pt-2 sticky bottom-0 bg-card/80 backdrop-blur-md">
                    <button type="submit" className="flex-grow bg-accent hover:bg-gfg-green-hover text-white font-black py-4 rounded-xl transition text-sm shadow-xl shadow-accent/10 uppercase tracking-widest active:scale-[0.98]">
                        <FontAwesomeIcon icon={faSave} /> {isEditing ? 'Save Changes' : 'Publish'}
                    </button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="bg-card border border-border hover:bg-background text-text/60 font-black py-4 rounded-xl transition text-sm flex-grow uppercase tracking-widest shadow-sm italic">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .ql-container { border: none !important; font-family: 'Inter', sans-serif; font-size: 14px; background: transparent; }
        .ql-toolbar { border: none !important; border-bottom: 1px solid var(--color-border) !important; background: var(--color-card); padding: 8px !important; }
        .ql-editor { min-height: 150px; color: var(--color-text); padding: 15px !important; line-height: 1.6; }
        .ql-snow .ql-stroke { stroke: var(--color-text); opacity: 0.4; stroke-width: 2px; }
        .ql-snow .ql-fill { fill: var(--color-text); opacity: 0.4; }
        .ql-snow .ql-picker { color: var(--color-text); opacity: 0.6; font-weight: 800; }
        .ql-snow .ql-picker-options { background-color: var(--color-card); border: 2px solid var(--color-border); border-radius: 12px; padding: 5px; }
        .ql-snow .ql-editor pre.ql-syntax { background-color: var(--color-background); color: var(--color-accent); padding: 15px; border-radius: 16px; border: 1px solid var(--color-border); font-family: 'JetBrains Mono', monospace; font-size: 13px; }
        .dark .ql-editor *, .dark .ql-editor span { background-color: transparent !important; color: var(--color-text) !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-accent); border-radius: 10px; opacity: 0.2; }
      `}</style>
    </div>
  );
};

export default Blog;
