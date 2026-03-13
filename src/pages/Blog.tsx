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
        // Update expanded blog locally to reflect changes immediately
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
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-800 pb-10">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">Club <span className="text-accent">Insights</span></h1>
          <p className="text-gray-400 mt-2 text-lg font-medium">Deep dives into tech, algorithms, and club activities.</p>
        </div>
        {canPost && (
          <button 
            onClick={handleOpenCreate}
            className="bg-accent hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition shadow-2xl shadow-accent/20 text-lg uppercase tracking-widest"
          >
            <Plus size={24} /> Write Technical Blog
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-32 text-center text-accent font-black tracking-widest uppercase animate-pulse">Accessing Data Nodes...</div>
      ) : blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogs.map(blog => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              key={blog.id} 
              onClick={() => setExpandedBlog(blog)}
              className="bg-card border border-gray-800 rounded-[2.5rem] p-8 flex flex-col hover:border-accent/50 transition-all cursor-pointer group shadow-sm hover:shadow-2xl"
            >
              <div className="space-y-6 flex-grow">
                <div className="flex justify-between items-start">
                    <div className="flex flex-wrap gap-2">
                        {blog.tags?.split(',').map((tag, i) => (
                            <span key={i} className="text-[9px] font-black text-accent bg-accent/5 px-2 py-1 rounded border border-accent/10 uppercase tracking-tighter">#{tag.trim()}</span>
                        ))}
                    </div>
                    {canPost && (
                        <div className="flex gap-2">
                            {(user?.id === blog.author_id || user?.role === 'Admin') && (
                                <button onClick={(e) => { e.stopPropagation(); setExpandedBlog(blog); handleOpenEdit(blog); }} className="p-2 bg-background border border-gray-800 rounded-xl text-gray-600 hover:text-accent opacity-0 group-hover:opacity-100 transition-all">
                                    <Edit size={16} />
                                </button>
                            )}
                            <button onClick={(e) => handleDelete(e, blog.id)} className="p-2 bg-background border border-gray-800 rounded-xl text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="space-y-3">
                    <h2 className="text-3xl font-black text-white group-hover:text-accent transition-colors leading-tight">{blog.title}</h2>
                    <p className="text-gray-400 line-clamp-3 leading-relaxed text-sm">
                        {stripHtml(blog.content)}
                    </p>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-sm font-black text-accent border border-accent/20">
                        {blog.author_name[0]}
                    </div>
                    <div>
                        <p className="font-bold text-gray-200 text-sm">{blog.author_name}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Posted on {new Date(blog.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="text-accent font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 flex items-center gap-1">
                    Read Entry <ChevronRight size={14} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-40 text-center text-gray-500 bg-card rounded-[3rem] border border-gray-800 border-dashed">
          <BookOpen size={64} className="mx-auto mb-4 opacity-10" />
          <p className="text-xl font-bold uppercase tracking-widest">The archives are empty.</p>
        </div>
      )}

      {/* Expanded Blog Modal */}
      <AnimatePresence>
        {expandedBlog && !isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-gray-800 rounded-[3rem] w-full max-w-5xl shadow-2xl relative overflow-hidden my-auto">
              <button onClick={() => setExpandedBlog(null)} className="absolute top-8 right-8 z-20 p-3 bg-black/50 hover:bg-black/80 rounded-full text-white transition-all"><X size={28} /></button>
              
              <div className="p-10 md:p-20 space-y-12">
                    <div className="space-y-6 text-center max-w-3xl mx-auto relative">
                        {user?.id === expandedBlog.author_id && (
                            <button onClick={() => handleOpenEdit(expandedBlog)} className="absolute -top-10 right-0 p-3 bg-accent/10 border border-accent/20 rounded-2xl text-accent hover:bg-accent hover:text-white transition-all flex items-center gap-2 font-black text-xs uppercase tracking-widest">
                                <Edit3 size={18} /> Edit Entry
                            </button>
                        )}
                        <div className="flex justify-center gap-2">
                            {expandedBlog.tags?.split(',').map((tag, i) => (
                                <span key={i} className="text-[10px] font-black text-accent border border-accent/30 px-3 py-1 rounded-full uppercase tracking-widest">#{tag.trim()}</span>
                            ))}
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight uppercase tracking-tighter">{expandedBlog.title}</h1>
                        <div className="flex items-center justify-center gap-10 text-gray-500 pt-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-lg font-black text-accent border border-accent/20 shadow-inner">{expandedBlog.author_name[0]}</div>
                                <div className="text-left">
                                    <p className="font-bold text-xl text-gray-200">{expandedBlog.author_name}</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">Technical Writer</p>
                                </div>
                            </div>
                            <div className="h-10 w-[1px] bg-gray-800 hidden sm:block"></div>
                            <div className="text-left hidden sm:block">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-1">Published</p>
                                <p className="font-bold text-gray-300">{new Date(expandedBlog.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <div className="prose prose-invert prose-accent max-w-none text-gray-300 text-xl leading-[2] ql-editor !p-0" dangerouslySetInnerHTML={{ __html: expandedBlog.content }} />
                    </div>

                    <div className="pt-20 border-t border-gray-800 text-center space-y-6">
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">End of Insight</p>
                        <div className="flex justify-center gap-4">
                            <button className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 transition-all uppercase tracking-widest text-xs"><Share2 size={18} /> Share Insight</button>
                            <button onClick={() => setExpandedBlog(null)} className="bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-white px-8 py-3 rounded-2xl font-black transition-all uppercase tracking-widest text-xs">Back to Archives</button>
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
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="bg-card border border-gray-800 rounded-[2.5rem] w-full max-w-5xl my-auto shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-background/50">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{isEditing ? 'Modify Technical Insight' : 'Draft New Technical Insight'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-3 hover:bg-gray-800 rounded-full transition-all"><X size={28} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-10 space-y-8">
                <div className="space-y-3">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Blog Title</label>
                    <input required type="text" className="w-full bg-background border-2 border-gray-800 rounded-2xl py-5 px-8 focus:border-accent outline-none text-2xl font-bold text-white shadow-inner" placeholder="Headline for your technical entry..." value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                </div>
                
                <div className="space-y-3">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Content Body</label>
                    <div className="bg-background rounded-[2rem] overflow-hidden border-2 border-gray-800 focus-within:border-accent transition shadow-inner">
                        <ReactQuill theme="snow" value={formData.content} onChange={(content) => setFormData({...formData, content})} modules={modules} placeholder="Start writing your technical masterpiece..." />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Topic Tags (CSV)</label>
                    <div className="relative">
                        <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={24} />
                        <input type="text" className="w-full bg-background border-2 border-gray-800 rounded-2xl py-5 pl-14 pr-8 focus:border-accent outline-none text-lg font-bold text-white shadow-inner" placeholder="react, webdev, dsa, workshop" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} />
                    </div>
                </div>

                <div className="flex gap-6 pt-4">
                    <button type="submit" className="bg-accent hover:bg-green-700 text-white font-black py-6 px-12 rounded-[1.5rem] transition text-xl flex-grow shadow-2xl shadow-accent/30 uppercase tracking-widest">{isEditing ? 'Deploy Changes' : 'Publish to Archives'}</button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-800 hover:bg-gray-700 text-white font-black py-6 px-12 rounded-[1.5rem] transition text-xl uppercase tracking-widest">Discard Draft</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .ql-container { border: none !important; font-family: 'Inter', sans-serif; font-size: 18px; }
        .ql-toolbar { border: none !important; border-bottom: 2px solid #1e293b !important; background: #1e293b; padding: 15px !important; }
        .ql-editor { min-height: 400px; color: #f1f5f9; padding: 30px !important; line-height: 1.8; }
        .ql-snow .ql-stroke { stroke: #94a3b8; stroke-width: 2px; }
        .ql-snow .ql-fill { fill: #94a3b8; }
        .ql-snow .ql-picker { color: #94a3b8; font-weight: 800; }
        .ql-editor.ql-blank::before { color: #334155 !important; left: 30px !important; font-style: normal; font-weight: 700; }
        .ql-snow .ql-picker-options { background-color: #1e293b; border: 2px solid #334155; border-radius: 12px; }
        .ql-snow .ql-editor pre.ql-syntax { background-color: #020617; color: #10b981; padding: 25px; border-radius: 20px; border: 1px solid #1e293b; font-family: 'JetBrains Mono', monospace; font-size: 14px; }
      `}</style>
    </div>
  );
};

export default Blog;
