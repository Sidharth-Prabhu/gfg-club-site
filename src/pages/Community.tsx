import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, Heart, Share2, Search, Plus, X, 
  Trash2, Tag, ShieldCheck, Star, Send, Filter,
  Hash, Image as ImageIcon, Code2, Info, ArrowLeft,
  ChevronRight, Eye, Clock, Reply, CornerDownRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const Community = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [mainComment, setMainComment] = useState('');
  
  const [formData, setFormData] = useState({ title: '', content: '', tags: '' });

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['code-block', 'link', 'image'],
      ['clean']
    ],
  }), []);

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

  const fetchComments = async (postId) => {
    try {
      const { data } = await api.get(`/discussions/${postId}/comments`);
      setComments(data);
    } catch (error) {
      console.error('Failed to fetch comments');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedTag]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;
    try {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      await api.post('/discussions', { ...formData, tags: tagsArray });
      setFormData({ title: '', content: '', tags: '' });
      setIsModalOpen(false);
      fetchPosts();
    } catch (error) {
      alert('Failed to create post');
    }
  };

  const handleDeletePost = async (id) => {
    if (window.confirm('Delete this post?')) {
      try {
        await api.delete(`/discussions/${id}`);
        if (expandedPost?.id === id) setExpandedPost(null);
        fetchPosts();
      } catch (error) {
        alert('Action failed');
      }
    }
  };

  const handleReactPost = async (postId) => {
    try {
      await api.post('/discussions/react', { postId });
      fetchPosts();
      if (expandedPost?.id === postId) {
          const { data: updatedPosts } = await api.get(`/discussions?search=${search}&tag=${selectedTag || ''}`);
          const updated = updatedPosts.find(p => p.id === postId);
          if (updated) setExpandedPost(prev => ({...prev, reaction_count: updated.reaction_count}));
      }
    } catch (error) { console.error('React failed'); }
  };

  const handleReactComment = async (commentId) => {
    try {
      await api.post('/discussions/react-comment', { commentId });
      fetchComments(expandedPost.id);
    } catch (error) { console.error('Comment react failed'); }
  };

  const handleOpenPost = (post) => {
    setExpandedPost(post);
    fetchComments(post.id);
  };

  const handleAddMainComment = async (e) => {
    e.preventDefault();
    if (!mainComment.trim()) return;
    try {
      await api.post('/discussions/comments', { 
        postId: expandedPost.id, 
        content: mainComment,
        parentId: null
      });
      setMainComment('');
      fetchComments(expandedPost.id);
      fetchPosts();
    } catch (error) { alert('Failed to add comment'); }
  };

  const handleAddReply = async (content, parentId) => {
    try {
      await api.post('/discussions/comments', { 
        postId: expandedPost.id, 
        content: content,
        parentId: parentId
      });
      fetchComments(expandedPost.id);
      fetchPosts();
    } catch (error) { alert('Failed to add reply'); }
  };

  // Helper to build threaded comments structure
  const threadedComments = useMemo(() => {
    const map = {};
    const roots = [];
    comments.forEach(c => {
      map[c.id] = { ...c, replies: [] };
    });
    comments.forEach(c => {
      if (c.parent_id) {
        map[c.parent_id]?.replies.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });
    return roots;
  }, [comments]);

  // Dedicated Comment Component to prevent re-render glitching
  const CommentItem = ({ comment, depth = 0, onReply }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');

    const onSubmit = (e) => {
        e.preventDefault();
        if(!replyText.trim()) return;
        onReply(replyText, comment.id);
        setReplyText('');
        setIsReplying(false);
    };

    return (
        <div className={`space-y-4 ${depth > 0 ? 'ml-4 md:ml-10 border-l border-gray-800 pl-4 md:pl-6' : ''}`}>
          <div className="bg-card/40 border border-gray-800 p-4 md:p-5 rounded-2xl space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center text-[10px] font-bold border border-gray-700">
                    {comment.author_name[0]}
                </div>
                <span className="font-bold text-sm text-accent">{comment.author_name}</span>
                {comment.author_role !== 'User' && (
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${comment.author_role === 'Admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                        {comment.author_role.toUpperCase()}
                    </span>
                )}
                <span className="text-[10px] text-gray-600 hidden sm:inline">{new Date(comment.created_at).toLocaleDateString()}</span>
              </div>
              <button onClick={() => handleReactComment(comment.id)} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors">
                <Heart size={14} className={comment.reaction_count > 0 ? 'fill-red-500 text-red-500' : ''} />
                <span className="font-bold">{comment.reaction_count || 0}</span>
              </button>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{comment.content}</p>
            <div className="flex gap-4 pt-1">
                <button 
                    onClick={() => setIsReplying(!isReplying)}
                    className="text-[11px] font-bold text-gray-500 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                    <Reply size={12} /> Reply
                </button>
            </div>
            
            <AnimatePresence>
                {isReplying && (
                    <motion.form 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onSubmit={onSubmit} 
                        className="pt-2 space-y-3"
                    >
                        <textarea 
                            autoFocus
                            className="w-full bg-background/50 border border-gray-700 rounded-xl p-3 text-sm focus:border-accent outline-none resize-none text-white shadow-inner"
                            placeholder={`Reply to ${comment.author_name}...`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                        />
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setIsReplying(false)} className="text-xs text-gray-500 px-3 py-1 hover:text-white transition-colors">Cancel</button>
                            <button type="submit" className="bg-accent hover:bg-green-700 text-white text-xs font-bold px-5 py-2 rounded-lg transition shadow-lg shadow-accent/10">Post Reply</button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>
          </div>
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} onReply={onReply} />
          ))}
        </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 md:px-0">
      {!expandedPost ? (
        <>
          {/* Forum Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-white">Community Forum</h1>
              <p className="text-gray-400 mt-2 text-lg">Share knowledge, ask doubts, and build the future together.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-accent hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition shadow-xl shadow-accent/20 text-lg"
            >
              <Plus size={24} /> New Discussion
            </button>
          </div>

          {/* Search & Filtering */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search by title, content or tags..." 
                className="w-full bg-card border border-gray-800 rounded-2xl py-4 pl-12 pr-4 focus:border-accent outline-none transition shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchPosts()}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['All', 'DSA', 'Development', 'Jobs', 'Resources'].map(tag => (
                <button 
                  key={tag}
                  onClick={() => setSelectedTag(tag === 'All' ? null : tag)}
                  className={`px-6 py-2 rounded-xl text-sm font-bold whitespace-nowrap border transition ${selectedTag === tag || (tag === 'All' && !selectedTag) ? 'bg-accent border-accent text-white shadow-lg shadow-accent/10' : 'bg-card border-gray-800 text-gray-400 hover:border-gray-600'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Feed */}
          {loading ? (
            <div className="py-32 text-center">
                <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 font-bold">Synchronizing community data...</p>
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map(post => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={post.id} 
                  onClick={() => handleOpenPost(post)}
                  className="bg-card border border-gray-800 rounded-3xl p-6 md:p-8 hover:border-accent/40 transition-all group cursor-pointer flex flex-col md:flex-row gap-6 shadow-sm hover:shadow-2xl hover:shadow-accent/5"
                >
                  <div className="hidden md:flex flex-col items-center gap-4 text-gray-500 min-w-[80px] border-r border-gray-800 pr-6">
                    <div className="text-center">
                        <p className="text-xl font-extrabold text-gray-200">{post.reaction_count || 0}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">votes</p>
                    </div>
                    <div className={`text-center p-2 rounded-xl border w-full ${post.comment_count > 0 ? 'border-accent/50 bg-accent/5 text-accent' : 'border-gray-800'}`}>
                        <p className="text-lg font-extrabold">{post.comment_count || 0}</p>
                        <p className="text-[9px] font-bold uppercase tracking-tight">replies</p>
                    </div>
                  </div>

                  <div className="flex-grow space-y-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-bold text-gray-400">{post.author_name}</span>
                        <span>•</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white group-hover:text-accent transition-colors leading-tight">{post.title}</h2>
                    <div className="text-gray-400 text-sm line-clamp-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }} />
                    
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
                      <div className="flex gap-2">
                        {post.tags?.split(',').map((tag, i) => (
                          <span key={i} className="text-[10px] font-black uppercase tracking-wider text-accent bg-accent/5 px-2.5 py-1 rounded border border-accent/10">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="md:hidden flex gap-4 text-xs font-bold text-gray-500">
                        <span className="flex items-center gap-1"><Heart size={14} /> {post.reaction_count}</span>
                        <span className="flex items-center gap-1"><MessageSquare size={14} /> {post.comment_count}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-40 text-center text-gray-500 bg-card rounded-3xl border border-gray-800 border-dashed">
              <MessageSquare size={64} className="mx-auto mb-4 opacity-10" />
              <p className="text-xl">No discussions found. Start the first thread!</p>
            </div>
          )}
        </>
      ) : (
        /* ROBUST EXPANDED VIEW */
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-5xl mx-auto">
          <button 
            onClick={() => setExpandedPost(null)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group font-bold bg-card px-4 py-2 rounded-xl border border-gray-800"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Feed
          </button>

          <div className="space-y-10">
            {/* Post Header & Content */}
            <div className="bg-card border border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="p-8 md:p-12 space-y-10">
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="bg-accent/10 text-accent text-[10px] font-black px-3 py-1 rounded-full border border-accent/20 tracking-tighter">DISCUSSION</span>
                            {expandedPost.tags?.split(',').map((tag, i) => (
                                <span key={i} className="text-[10px] font-bold text-gray-500 bg-background border border-gray-800 px-2 py-1 rounded-md">#{tag}</span>
                            ))}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white leading-[1.1]">{expandedPost.title}</h1>
                        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 pt-2 border-b border-gray-800/50 pb-8">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent border border-accent/20">
                                    {expandedPost.author_name[0]}
                                </div>
                                <span className="font-bold text-gray-300">{expandedPost.author_name}</span>
                                <span className="bg-gray-800 text-[10px] px-2 py-0.5 rounded text-gray-400 font-bold uppercase">{expandedPost.author_role}</span>
                            </div>
                            <span className="flex items-center gap-1.5"><Clock size={16} /> {new Date(expandedPost.created_at).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1.5 text-accent"><MessageSquare size={16} /> {comments.length} replies</span>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-10">
                        {/* Action Sidebar */}
                        <div className="flex flex-row md:flex-col items-center gap-4 md:pt-4">
                            <button 
                                onClick={() => handleReactPost(expandedPost.id)}
                                className={`p-5 rounded-2xl transition-all border-2 flex flex-col items-center gap-1 ${expandedPost.reaction_count > 0 ? 'bg-accent/10 border-accent/30 text-accent' : 'bg-gray-800/30 border-gray-700 text-gray-500 hover:border-accent/50 hover:text-accent'}`}
                            >
                                <Heart size={32} className={expandedPost.reaction_count > 0 ? 'fill-accent' : ''} />
                                <span className="text-xl font-black">{expandedPost.reaction_count || 0}</span>
                            </button>
                            {(user?.role === 'Admin' || user?.role === 'Core' || user?.id === expandedPost.author_id) && (
                                <button onClick={() => handleDeletePost(expandedPost.id)} className="p-4 rounded-2xl bg-red-500/5 border-2 border-transparent hover:border-red-500/30 text-gray-600 hover:text-red-500 transition-all">
                                    <Trash2 size={24} />
                                </button>
                            )}
                        </div>

                        {/* Main Body */}
                        <div className="flex-grow min-w-0">
                            <div 
                                className="prose prose-invert prose-accent max-w-none text-gray-200 text-lg leading-[1.8] ql-editor !p-0"
                                dangerouslySetInnerHTML={{ __html: expandedPost.content }}
                            />
                            
                            <div className="mt-12 p-6 bg-background/50 rounded-3xl border border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                                    <Info size={16} /> Helpful discussion? Upvote to let the community know.
                                </div>
                                <button className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors text-sm uppercase tracking-wider">
                                    <Share2 size={18} /> Share Thread
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Threaded Discussion Area */}
            <div className="space-y-10">
                <div className="flex items-center gap-4">
                    <h3 className="text-3xl font-black text-white">Community Insights</h3>
                    <div className="h-[2px] flex-grow bg-gradient-to-r from-gray-800 to-transparent"></div>
                </div>

                <div className="space-y-8">
                    {threadedComments.length > 0 ? (
                    threadedComments.map(comment => (
                        <CommentItem key={comment.id} comment={comment} onReply={handleAddReply} />
                    ))
                    ) : (
                    <div className="py-24 text-center bg-card/20 rounded-[2.5rem] border-2 border-dashed border-gray-800">
                        <MessageSquare size={48} className="mx-auto mb-4 opacity-10" />
                        <p className="text-xl text-gray-500 font-bold">No contributions yet. Start the conversation!</p>
                    </div>
                    )}
                </div>

                {/* Main Reply Box */}
                <div className="bg-card border border-gray-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                            <Plus size={20} />
                        </div>
                        <h4 className="text-2xl font-black text-white">Your Contribution</h4>
                    </div>
                    <form onSubmit={handleAddMainComment} className="space-y-6">
                        <textarea 
                            required
                            rows={6}
                            className="w-full bg-background border border-gray-700 rounded-3xl py-6 px-8 focus:border-accent outline-none resize-none transition shadow-inner text-white text-lg leading-relaxed"
                            placeholder="Share your expertise or perspective..."
                            value={mainComment}
                            onChange={(e) => setMainComment(e.target.value)}
                        />
                        <div className="flex justify-end">
                            <button type="submit" className="bg-accent hover:bg-green-700 text-white font-black px-12 py-5 rounded-2xl flex items-center gap-3 transition shadow-2xl shadow-accent/20 text-xl group">
                                <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Post to Thread
                            </button>
                        </div>
                    </form>
                </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* CREATE POST MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, y: 50 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 50 }} 
              className="bg-card border border-gray-800 rounded-[2.5rem] w-full max-w-4xl my-auto shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-background/50">
                <h2 className="text-3xl font-black text-white tracking-tighter">New Community Thread</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-3 hover:bg-gray-800 rounded-full transition-all"><X size={28} /></button>
              </div>
              
              <div className="p-10 space-y-10">
                <div className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-3xl flex gap-5">
                    <div className="p-4 bg-blue-500/10 rounded-2xl h-fit text-blue-400 shadow-inner"><Info size={28} /></div>
                    <div className="space-y-1">
                        <h3 className="text-blue-400 font-black text-lg">Pro-tip for Engagement</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">Clearly define your topic in the title. Use the rich-text editor to format code or highlight key points for better readability.</p>
                    </div>
                </div>

                <form onSubmit={handleCreatePost} className="space-y-10">
                  <div className="space-y-3">
                    <label className="block text-xl font-black text-gray-200 tracking-tight">Thread Title</label>
                    <input 
                        required 
                        type="text" 
                        className="w-full bg-background border-2 border-gray-800 rounded-3xl py-5 px-8 focus:border-accent outline-none text-2xl font-bold transition shadow-inner placeholder:text-gray-700" 
                        placeholder="What's the core of this discussion?" 
                        value={formData.title} 
                        onChange={(e) => setFormData({...formData, title: e.target.value})} 
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xl font-black text-gray-200 tracking-tight">Elaboration</label>
                    <div className="bg-background rounded-3xl overflow-hidden border-2 border-gray-800 focus-within:border-accent transition shadow-inner">
                        <ReactQuill 
                            theme="snow"
                            value={formData.content}
                            onChange={(content) => setFormData({...formData, content})}
                            modules={modules}
                            placeholder="Share the full details here..."
                            className="min-h-[300px]"
                        />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xl font-black text-gray-200 tracking-tight">Categorization Tags</label>
                    <div className="relative">
                        <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={24} />
                        <input 
                            type="text" 
                            className="w-full bg-background border-2 border-gray-800 rounded-3xl py-5 pl-14 pr-8 focus:border-accent outline-none text-lg font-bold transition shadow-inner placeholder:text-gray-700" 
                            placeholder="e.g. dynamic-programming, career-advice, resources" 
                            value={formData.tags} 
                            onChange={(e) => setFormData({...formData, tags: e.target.value})} 
                        />
                    </div>
                  </div>

                  <div className="flex gap-6 pt-6">
                    <button 
                        type="submit" 
                        className="bg-accent hover:bg-green-700 text-white font-black py-6 px-12 rounded-[1.5rem] transition text-xl shadow-2xl shadow-accent/30 flex-grow"
                    >
                        Publish Thread
                    </button>
                    <button 
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="bg-gray-800 hover:bg-gray-700 text-white font-black py-6 px-12 rounded-[1.5rem] transition text-xl"
                    >
                        Discard
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .ql-container { border: none !important; font-family: inherit; font-size: 18px; }
        .ql-toolbar { border: none !important; border-bottom: 2px solid #1e293b !important; background: #1e293b; padding: 15px !important; }
        .ql-editor { min-height: 300px; color: #f1f5f9; padding: 30px !important; line-height: 1.8; }
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

export default Community;
