import React, { useEffect, useState, useMemo } from 'react';
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
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedBlog, setExpandedBlog] = useState(null);
  
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
    setFormData({ title: '', content: '', tags: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (blog) => {
    setIsEditing(true);
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
      if (isEditing && expandedBlog) {
        await api.put(`/blogs/${expandedBlog.id}`, formData);
        setExpandedBlog({ ...expandedBlog, ...formData });
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
        if (expandedBlog?.id === id) setExpandedBlog(null);
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
    <div className="max-w-6xl mx-auto space-y-12 pb-20 px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border pb-12">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-text tracking-tighter uppercase">Club <span className="text-accent">Insights</span></h1>
          <p className="text-text/60 text-lg font-medium">Deep dives into tech, algorithms, and campus activities.</p>
        </div>
        {canPost && (
          <button 
            onClick={handleOpenCreate}
            className="bg-accent hover:bg-gfg-green-hover text-white px-10 py-5 rounded-2xl font-black flex items-center gap-3 transition shadow-xl shadow-accent/20 text-lg uppercase tracking-widest active:scale-95"
          >
            <Plus size={24} /> Write Entry
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-32 text-center text-accent font-black tracking-widest uppercase animate-pulse text-xl">Accessing Knowledge Archives...</div>
      ) : blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {blogs.map(blog => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8 }}
              key={blog.id} 
              onClick={() => setExpandedBlog(blog)}
              className="bg-card border border-border rounded-[2.5rem] p-10 flex flex-col hover:border-accent transition-all cursor-pointer group shadow-sm hover:shadow-2xl"
            >
              <div className="space-y-8 flex-grow">
                <div className="flex justify-between items-start">
                    <div className="flex flex-wrap gap-2">
                        {blog.tags?.split(',').map((tag, i) => (
                            <span key={i} className="text-[10px] font-black text-accent bg-accent/5 px-3 py-1 rounded-lg border border-accent/10 uppercase tracking-widest">#{tag.trim()}</span>
                        ))}
                    </div>
                    {canPost && (
                        <div className="flex gap-2">
                            {(user?.id === blog.author_id || user?.role === 'Admin') && (
                                <button onClick={(e) => { e.stopPropagation(); setExpandedBlog(blog); handleOpenEdit(blog); }} className="p-2.5 bg-background border border-border rounded-xl text-text/40 hover:text-accent opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                                    <Edit size={16} />
                                </button>
                            )}
                            <button onClick={(e) => handleDelete(e, blog.id)} className="p-2.5 bg-background border border-border rounded-xl text-text/40 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="space-y-4">
                    <h2 className="text-3xl font-black text-text group-hover:text-accent transition-colors leading-tight tracking-tight">{blog.title}</h2>
                    <p className="text-text/60 line-clamp-3 leading-relaxed font-medium">
                        {stripHtml(blog.content)}
                    </p>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-base font-black text-accent border border-accent/20 shadow-inner">
                        {blog.author_name[0]}
                    </div>
                    <div>
                        <p className="font-black text-text uppercase tracking-widest text-xs">{blog.author_name}</p>
                        <p className="text-[10px] text-text/30 font-bold uppercase tracking-widest mt-0.5">{new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                </div>
                <div className="text-accent font-black text-[10px] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 flex items-center gap-2">
                    Read Insight <ChevronRight size={14} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-40 text-center text-text/30 bg-card rounded-[3rem] border border-border border-dashed shadow-inner">
          <BookOpen size={80} className="mx-auto mb-6 opacity-5" />
          <p className="text-2xl font-black uppercase tracking-widest">No entries found.</p>
        </div>
      )}

      {/* Expanded Blog Modal */}
      <AnimatePresence>
        {expandedBlog && !isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-xl overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.98, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 20 }} className="bg-card border border-border rounded-[3.5rem] w-full max-w-5xl shadow-2xl relative overflow-hidden my-auto min-h-[90vh] flex flex-col">
              <button onClick={() => setExpandedBlog(null)} className="absolute top-10 right-10 z-20 p-4 bg-background border border-border hover:bg-card hover:text-accent rounded-full text-text/60 transition-all shadow-xl group"><X size={24} className="group-hover:rotate-90 transition-transform" /></button>
              
              <div className="p-10 md:p-24 space-y-16 flex-grow">
                    <div className="space-y-10 text-center max-w-4xl mx-auto relative">
                        {user?.id === expandedBlog.author_id && (
                            <button onClick={() => handleOpenEdit(expandedBlog)} className="absolute -top-12 right-0 p-4 bg-accent/5 border border-accent/20 rounded-2xl text-accent hover:bg-accent hover:text-white transition-all flex items-center gap-3 font-black text-xs uppercase tracking-widest shadow-sm">
                                <Edit3 size={18} /> Edit Entry
                            </button>
                        )}
                        <div className="flex justify-center gap-3">
                            {expandedBlog.tags?.split(',').map((tag, i) => (
                                <span key={i} className="text-[10px] font-black text-accent bg-accent/5 border border-accent/20 px-4 py-1.5 rounded-full uppercase tracking-widest">#{tag.trim()}</span>
                            ))}
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-text leading-tight tracking-tighter uppercase">{expandedBlog.title}</h1>
                        <div className="flex items-center justify-center gap-12 text-text/40 pt-10 border-t border-border/50 max-w-2xl mx-auto">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-accent/10 flex items-center justify-center text-2xl font-black text-accent border border-accent/20 shadow-inner">{expandedBlog.author_name[0]}</div>
                                <div className="text-left">
                                    <p className="font-black text-2xl text-text uppercase tracking-widest">{expandedBlog.author_name}</p>
                                    <p className="text-[10px] text-accent font-black uppercase tracking-[0.3em] mt-1">Technical Authority</p>
                                </div>
                            </div>
                            <div className="h-12 w-[1px] bg-border"></div>
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase tracking-widest text-text/30 mb-2">Released</p>
                                <p className="font-black text-text/80 text-xl tracking-tight">{new Date(expandedBlog.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <div className="prose dark:prose-invert prose-accent max-w-none text-text/80 text-xl md:text-2xl leading-[1.8] font-medium ql-editor !p-0" dangerouslySetInnerHTML={{ __html: expandedBlog.content }} />
                    </div>

                    <div className="pt-24 border-t border-border text-center space-y-10 max-w-4xl mx-auto">
                        <p className="text-text/20 font-black uppercase tracking-[0.4em] text-[10px]">End of Publication</p>
                        <div className="flex flex-wrap justify-center gap-6">
                            <button className="bg-card border border-border hover:bg-background text-text/80 px-10 py-5 rounded-2xl font-black flex items-center gap-3 transition-all uppercase tracking-widest text-xs shadow-sm"><Share2 size={20} className="text-accent" /> Share Insight</button>
                            <button onClick={() => setExpandedBlog(null)} className="bg-accent hover:bg-gfg-green-hover text-white px-10 py-5 rounded-2xl font-black transition-all uppercase tracking-widest text-xs shadow-xl shadow-accent/20">Return to Archives</button>
                        </div>
                    </div>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Write/Edit Blog Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-xl overflow-y-auto">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="bg-card border border-border rounded-[3.5rem] w-full max-w-5xl my-auto shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-10 border-b border-border flex justify-between items-center bg-background/50">
                <h2 className="text-3xl font-black text-text uppercase tracking-tighter">{isEditing ? 'Modify Insight' : 'Draft New Insight'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-text/40 hover:text-red-500 p-4 hover:bg-red-500/5 rounded-full transition-all group"><X size={32} className="group-hover:rotate-90 transition-transform" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-10 md:p-14 space-y-10 overflow-y-auto">
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Publication Headline</label>
                    <input required type="text" className="w-full bg-background border-2 border-border rounded-[1.5rem] py-6 px-10 focus:border-accent outline-none text-2xl md:text-3xl font-black text-text shadow-inner transition-colors" placeholder="Headline for your entry..." value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                </div>
                
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Content Matrix</label>
                    <div className="bg-background rounded-[2rem] overflow-hidden border-2 border-border focus-within:border-accent transition shadow-inner">
                        <ReactQuill theme="snow" value={formData.content} onChange={(content) => setFormData({...formData, content})} modules={modules} placeholder="Start writing your technical masterpiece..." />
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Indexing Tags (CSV)</label>
                    <div className="relative">
                        <Hash className="absolute left-6 top-1/2 -translate-y-1/2 text-text/20" size={24} />
                        <input type="text" className="w-full bg-background border-2 border-border rounded-[1.5rem] py-6 pl-16 pr-8 focus:border-accent outline-none text-xl font-bold text-text shadow-inner transition-colors" placeholder="react, webdev, dsa, workshop" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 pt-6">
                    <button type="submit" className="bg-accent hover:bg-gfg-green-hover text-white font-black py-7 px-14 rounded-[1.5rem] transition text-xl flex-grow shadow-2xl shadow-accent/20 uppercase tracking-widest active:scale-[0.98]">{isEditing ? 'Commit Changes' : 'Deploy Publication'}</button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="bg-card border border-border hover:bg-background text-text/60 font-black py-7 px-14 rounded-[1.5rem] transition text-xl uppercase tracking-widest shadow-sm">Discard Draft</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .ql-container { border: none !important; font-family: 'Inter', sans-serif; font-size: 18px; background: transparent; }
        .ql-toolbar { border: none !important; border-bottom: 2px solid var(--color-border) !important; background: var(--color-card); padding: 20px !important; }
        .ql-editor { min-height: 400px; color: var(--color-text); padding: 40px !important; line-height: 1.8; }
        .ql-snow .ql-stroke { stroke: var(--color-text); opacity: 0.4; stroke-width: 2px; }
        .ql-snow .ql-fill { fill: var(--color-text); opacity: 0.4; }
        .ql-snow .ql-picker { color: var(--color-text); opacity: 0.6; font-weight: 800; }
        .ql-editor.ql-blank::before { color: var(--color-text) !important; opacity: 0.2; left: 40px !important; font-style: normal; font-weight: 700; }
        .ql-snow .ql-picker-options { background-color: var(--color-card); border: 2px solid var(--color-border); border-radius: 16px; padding: 10px; }
        .ql-snow .ql-editor pre.ql-syntax { background-color: var(--color-background); color: var(--color-accent); padding: 30px; border-radius: 24px; border: 1px solid var(--color-border); font-family: 'JetBrains Mono', monospace; font-size: 15px; box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05); }
      `}</style>
    </div>
  );
};

export default Blog;
