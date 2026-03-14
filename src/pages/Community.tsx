import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, Search, Plus, X, Save, Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const Community = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  
  // Create Post State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/discussions?search=${search}&tag=${selectedTag || ''}`);
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedTag]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('new') === 'true' && user) {
      setIsCreateModalOpen(true);
      // Clean up URL without reload
      window.history.replaceState({}, '', '/community');
    }
  }, [location.search, user]);

  const handleOpenPost = (post) => {
    navigate(`/community/${post.id}`);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    
    setIsSubmitting(true);
    try {
      const tagsArray = newPost.tags.split(',').map(t => t.trim()).filter(t => t !== '');
      await api.post('/discussions', {
        title: newPost.title,
        content: newPost.content,
        tags: tagsArray
      });
      setIsCreateModalOpen(false);
      setNewPost({ title: '', content: '', tags: '' });
      fetchPosts();
    } catch (error) {
      alert('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-4xl md:text-5xl font-black text-text tracking-tighter uppercase">Community <span className="text-accent">Forum</span></h1>
          <p className="text-text/60 text-lg max-w-2xl font-medium">Discuss algorithms, share projects, and collaborate with your peers.</p>
        </motion.div>
        
        {user && (
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-accent hover:bg-gfg-green-hover text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition shadow-xl shadow-accent/20 text-xs uppercase tracking-widest active:scale-95"
          >
            <Plus size={20} /> Start Discussion
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-grow group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text/30 group-focus-within:text-accent transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search forum topics..." 
            className="w-full bg-card border border-border rounded-2xl py-4 pl-12 pr-4 focus:border-accent outline-none transition shadow-sm text-text font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchPosts()}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['All', 'DSA', 'Development', 'Jobs', 'Resources'].map(tag => (
            <button key={tag} onClick={() => setSelectedTag(tag === 'All' ? null : tag)} className={`px-6 py-2 rounded-xl text-xs font-black border transition uppercase tracking-widest whitespace-nowrap ${selectedTag === tag || (tag === 'All' && !selectedTag) ? 'bg-accent border-accent text-white shadow-lg' : 'bg-card border-border text-text/40 hover:border-accent/40 hover:text-accent'}`}>
              {tag}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-32 text-center text-accent font-black tracking-widest uppercase animate-pulse">Loading Matrix Data...</div>
      ) : posts.length > 0 ? (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
            }}
            className="grid grid-cols-1 gap-6"
        >
          {posts.map(post => (
            <motion.div 
                variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ y: -4, borderColor: 'var(--color-accent)' }}
                key={post.id} 
                onClick={() => handleOpenPost(post)} 
                className="bg-card border border-border rounded-[2.5rem] p-8 hover:shadow-xl transition-all group cursor-pointer flex flex-col md:flex-row gap-8 shadow-sm"
            >
              <div className="hidden md:flex flex-col items-center gap-4 text-text/30 min-w-[100px] border-r border-border/50 pr-8">
                <div className="text-center">
                    <p className="text-3xl font-black text-text group-hover:text-accent transition-colors">{post.reaction_count || 0}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">votes</p>
                </div>
                <div className={`text-center p-3 rounded-2xl border w-full transition-all ${post.comment_count > 0 ? 'border-accent/30 bg-accent/5 text-accent' : 'border-border'}`}>
                    <p className="text-xl font-black">{post.comment_count || 0}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest">replies</p>
                </div>
              </div>
              <div className="flex-grow min-w-0 space-y-4">
                <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-text/40">
                    <span className="text-accent">{post.author_name}</span>
                    <span className="w-1 h-1 bg-text/20 rounded-full"></span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-text group-hover:text-accent transition-colors leading-tight tracking-tight uppercase break-words">{post.title}</h2>
                <div className="text-text/60 text-sm line-clamp-3 leading-relaxed font-medium break-words overflow-hidden" dangerouslySetInnerHTML={{ __html: post.content }} />
                <div className="flex flex-wrap gap-2 pt-2">                    {post.tags?.split(',').map((tag, i) => (
                      <span key={i} className="text-[10px] font-black uppercase text-accent bg-accent/5 px-3 py-1 rounded-lg border border-accent/10 tracking-widest">#{tag.trim()}</span>
                    ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="py-40 text-center text-text/30 bg-card rounded-[3rem] border border-border border-dashed shadow-inner">
          <MessageSquare size={80} className="mx-auto mb-6 opacity-5" />
          <p className="text-2xl font-black uppercase tracking-widest">Feed is Empty</p>
        </div>
      )}

      {/* Create Post Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-xl overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-border rounded-[3.5rem] w-full max-w-4xl my-auto shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-border flex justify-between items-center bg-background/50">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent/10 rounded-xl text-accent"><MessageSquare size={24} /></div>
                    <div>
                        <h2 className="text-3xl font-black text-text uppercase tracking-tighter italic">New Discussion</h2>
                        <p className="text-[10px] font-black text-text/40 uppercase tracking-widest">Broadcast your transmission to the matrix</p>
                    </div>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-text/40 hover:text-red-500 p-2 rounded-full transition-all active:scale-90"><X size={32} /></button>
              </div>
              <form onSubmit={handleCreatePost} className="p-8 md:p-12 space-y-8 overflow-y-auto max-h-[75vh] custom-scrollbar">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.3em] ml-2">Topic Heading</label>
                  <input required type="text" className="w-full bg-background border-2 border-border rounded-2xl py-5 px-8 focus:border-accent outline-none text-text font-black text-xl transition shadow-inner" placeholder="Enter a compelling title..." value={newPost.title} onChange={(e) => setNewPost({...newPost, title: e.target.value})} />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.3em] ml-2">Transmission Data</label>
                  <div className="bg-background rounded-2xl border-2 border-border overflow-hidden focus-within:border-accent transition-colors shadow-inner">
                    <ReactQuill theme="snow" value={newPost.content} onChange={(content) => setNewPost({...newPost, content})} className="h-64 mb-12" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.3em] ml-2">Identification Tags (comma separated)</label>
                  <div className="relative">
                      <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20" size={18}/>
                      <input type="text" className="w-full bg-background border-2 border-border rounded-2xl py-5 pl-14 pr-8 focus:border-accent outline-none text-text font-black text-lg transition shadow-inner" placeholder="dsa, project, help, resource" value={newPost.tags} onChange={(e) => setNewPost({...newPost, tags: e.target.value})} />
                  </div>
                </div>

                <div className="flex gap-6 pt-6 sticky bottom-0 bg-card/80 backdrop-blur-md">
                    <button type="submit" disabled={isSubmitting} className="flex-grow bg-accent hover:bg-gfg-green-hover text-white font-black py-6 rounded-[1.5rem] flex items-center justify-center gap-4 transition shadow-2xl shadow-accent/20 uppercase tracking-widest text-sm active:scale-[0.98] disabled:opacity-50">
                        {isSubmitting ? 'Transmitting...' : <><Save size={24} /> Post Discussion</>}
                    </button>
                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-grow bg-card border border-border hover:bg-background text-text/60 font-black py-6 rounded-[1.5rem] transition uppercase tracking-widest text-xs shadow-sm">Abort</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-accent); border-radius: 10px; opacity: 0.2; }
        .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid var(--color-border) !important; background: var(--color-background); }
        .ql-container.ql-snow { border: none !important; }
        .ql-editor { font-family: inherit; font-size: 1.1rem; }
      `}</style>
    </div>
  );
};

export default Community;
