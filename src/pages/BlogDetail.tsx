import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, faClock, faUser, faTag, faEdit, faTrashAlt, 
  faShareAlt, faBookOpen, faCalendarAlt, faHashtag, faSave, faTimes 
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import MarkdownRenderer from '../components/MarkdownRenderer';
import MarkdownEditor from '../components/MarkdownEditor';
import NeuralBackground from '../components/NeuralBackground';

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
    if (!window.confirm('Delete this post?')) return;
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
      alert('Failed to update post');
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
        <div className="text-center text-accent font-black tracking-[0.2em] uppercase animate-pulse text-xs italic">
          Loading...
        </div>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Hero Section */}
      <section className="relative min-h-[40vh] md:min-h-[50vh] w-full overflow-hidden bg-card border-b border-border flex flex-col justify-end">
        <div className="absolute inset-0 pointer-events-none">
          <NeuralBackground />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        
        <div className="absolute top-6 left-6 z-20">
          <button 
            onClick={() => navigate('/blog')} 
            className="flex items-center gap-1.5 text-text/60 bg-card/40 hover:bg-card backdrop-blur-md px-4 py-2 rounded-full border border-border transition-all group font-black uppercase text-[10px] tracking-widest active:scale-95"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" /> Back
          </button>
        </div>

        <div className="relative w-full p-6 md:p-12 z-10 pt-24 md:pt-32">
          <div className="max-w-7xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-3">
                <span className="bg-accent/10 text-accent text-[8px] font-black px-3 py-1 rounded-full border border-accent/20 tracking-widest uppercase backdrop-blur-md">
                    OFFICIAL POST
                </span>
                <div className="flex gap-1.5">
                    {blog.tags?.split(',').map((tag, i) => (
                        <span key={i} className="text-[8px] font-black text-text/40 bg-card/60 border border-border px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm">
                            #{tag.trim()}
                        </span>
                    ))}
                </div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }} 
              className="text-3xl md:text-6xl font-black text-text leading-[1.1] tracking-tighter uppercase max-w-5xl italic"
            >
              {blog.title}
            </motion.h1>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-8 text-text/40 pt-2"
            >
              <div className="flex items-center gap-4">
                <Link to={`/profile/${blog.author_id}`} className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-lg font-black text-accent border border-accent/20 shadow-inner hover:bg-accent hover:text-white transition-all overflow-hidden italic">
                  {blog.author_pic ? <img src={blog.author_pic} className="w-full h-full object-cover" /> : blog.author_name[0]}
                </Link>
                <div>
                  <Link to={`/profile/${blog.author_id}`} className="font-black text-lg text-text uppercase tracking-widest hover:text-accent transition-colors italic">{blog.author_name}</Link>
                  <p className="text-[8px] text-accent font-black uppercase tracking-[0.2em] mt-0.5 italic">Author</p>
                </div>
              </div>
              <div className="h-8 w-[1px] bg-border hidden sm:block"></div>
              <span className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest text-text/40 italic">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-accent" /> {new Date(blog.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest text-text/40 italic">
                <FontAwesomeIcon icon={faClock} className="text-accent" /> {Math.ceil(blog.content.length / 1000)} MIN
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mt-10 md:mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            {/* Article Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border p-8 md:p-12 rounded-3xl shadow-xl italic"
            >
              <MarkdownRenderer content={blog.content} />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border p-8 rounded-3xl shadow-xl sticky top-20 space-y-8">
              <div className="space-y-6 text-center">
                <div className="p-4 bg-accent/5 rounded-2xl border border-accent/10 inline-block">
                    <FontAwesomeIcon icon={faBookOpen} size="2x" className="text-accent" />
                </div>
                <div>
                    <h4 className="text-lg font-black text-text uppercase tracking-widest italic">Blog Post</h4>
                    <p className="text-text/40 font-black uppercase text-[8px] tracking-[0.2em] mt-1">Verified Content</p>
                </div>
              </div>

              {/* Author/Mod Actions */}
              <div className="space-y-3 pt-6 border-t border-border/50">
                {(user?.id === blog.author_id || user?.role === 'Admin') && (
                  <button onClick={handleOpenEditModal} className="w-full py-3.5 rounded-xl bg-blue-500/5 text-blue-500 border border-border hover:bg-blue-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 active:scale-95">
                    <FontAwesomeIcon icon={faEdit} /> Edit
                  </button>
                )}
                {(user?.id === blog.author_id || user?.role === 'Admin' || user?.role === 'Core') && (
                  <button onClick={handleDelete} className="w-full py-3.5 rounded-xl bg-red-500/5 text-red-500 border border-border hover:bg-red-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 active:scale-95">
                    <FontAwesomeIcon icon={faTrashAlt} /> Delete
                  </button>
                )}
                <button className="w-full py-3.5 bg-background border border-border text-text/40 hover:text-accent hover:border-accent rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all active:scale-95"><FontAwesomeIcon icon={faShareAlt} /> Share</button>
              </div>

              <div className="pt-6 border-t border-border/50">
                   <div className="flex items-center gap-3 text-text/40 mb-4">
                      <FontAwesomeIcon icon={faTag} className="text-accent text-xs" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Information</span>
                   </div>
                   <div className="flex flex-wrap gap-1.5">
                      {blog.tags?.split(',').map((tag, i) => (
                        <span key={i} className="text-[8px] font-black text-text bg-background border border-border px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-sm italic">
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
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="bg-card border border-border rounded-3xl w-full max-w-4xl my-auto shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 md:p-8 border-b border-border flex justify-between items-center bg-background/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg text-accent"><FontAwesomeIcon icon={faEdit} /></div>
                  <h2 className="text-xl font-black text-text uppercase tracking-tighter italic">Edit Post</h2>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="text-text/40 hover:text-red-500 p-2 rounded-full transition-all group active:scale-90"><FontAwesomeIcon icon={faTimes} size="lg" className="group-hover:rotate-90 transition-transform" /></button>
              </div>
              <form onSubmit={handleEdit} className="p-6 md:p-10 space-y-8 overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                    <label className="block text-[8px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Title</label>
                    <input required type="text" className="w-full bg-background border-2 border-border rounded-xl py-3 px-5 focus:border-accent outline-none text-lg font-black text-text shadow-inner transition-colors italic" value={editFormData.title} onChange={(e) => setEditFormData({...editFormData, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <MarkdownEditor 
                        label="Content"
                        value={editFormData.content}
                        onChange={(content) => setEditFormData({...editFormData, content})}
                        placeholder="Share your technical insights with the community..."
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-[8px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Tags</label>
                    <input type="text" className="w-full bg-background border-2 border-border rounded-xl py-3 px-5 focus:border-accent outline-none font-bold text-sm text-text shadow-inner transition-colors italic" value={editFormData.tags} onChange={(e) => setEditFormData({...editFormData, tags: e.target.value})} />
                </div>
                <div className="flex gap-4 pt-2">
                    <button type="submit" disabled={isSubmitting} className="flex-grow bg-accent hover:bg-gfg-green-hover text-white font-black py-4 px-8 rounded-xl transition text-sm shadow-xl shadow-accent/10 uppercase tracking-widest active:scale-[0.98] disabled:opacity-50">
                        <FontAwesomeIcon icon={faSave} /> {isSubmitting ? 'Updating...' : 'Save Changes'}
                    </button>
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="bg-card border border-border hover:bg-background text-text/60 font-black py-4 px-8 rounded-xl transition text-sm flex-grow uppercase tracking-widest shadow-sm italic">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .ql-editor a { color: var(--color-accent); font-weight: 800; text-decoration: underline; }
        .ql-editor h1, .ql-editor h2, .ql-editor h3 { color: var(--color-text); font-weight: 900; margin-top: 1.2em; margin-bottom: 0.4em; text-transform: uppercase; }
        .ql-editor ul, .ql-editor ol { padding-left: 1.2em; margin-bottom: 0.8em; list-style: disc; }
        .ql-editor p { margin-bottom: 1em; }
        .dark .ql-editor *, .dark .ql-editor span { background-color: transparent !important; color: var(--color-text) !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-accent); border-radius: 10px; opacity: 0.2; }
      `}</style>
    </div>
  );
};

export default BlogDetail;
