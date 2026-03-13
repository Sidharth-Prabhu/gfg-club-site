import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, Heart, Search, Plus, X, 
  Trash2, ArrowLeft, Clock, Reply
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Community = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [expandedPost, setExpandedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [mainComment, setMainComment] = useState('');

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

  const CommentItem = ({ comment, depth = 0, onReply }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');

    return (
        <div className={`space-y-4 ${depth > 0 ? 'ml-10 border-l-2 border-border/50 pl-6' : ''}`}>
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card border border-border p-6 rounded-2xl space-y-4 shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-xs font-bold border border-accent/20 text-accent">
                    {comment.author_name[0]}
                </div>
                <div>
                    <span className="font-bold text-sm text-accent uppercase tracking-widest">{comment.author_name}</span>
                    <p className="text-[10px] text-text/40">{new Date(comment.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <button onClick={() => handleReactComment(comment.id)} className="flex items-center gap-1.5 text-xs text-text/40 hover:text-red-500 transition-colors font-bold uppercase tracking-widest bg-background px-3 py-1 rounded-lg border border-border">
                <Heart size={14} className={comment.reaction_count > 0 ? 'fill-red-500 text-red-500' : ''} />
                <span>{comment.reaction_count || 0}</span>
              </button>
            </div>
            <p className="text-sm text-text/80 leading-relaxed font-medium">{comment.content}</p>
            <div className="flex gap-4 pt-1">
                <button onClick={() => setIsReplying(!isReplying)} className="text-[10px] font-black text-text/40 hover:text-accent flex items-center gap-1.5 transition-colors uppercase tracking-widest">
                    <Reply size={14} /> Reply
                </button>
            </div>
            <AnimatePresence>
                {isReplying && (
                    <motion.form 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={(e) => { e.preventDefault(); if(!replyText.trim()) return; onReply(replyText, comment.id); setReplyText(''); setIsReplying(false); }} 
                        className="pt-2 space-y-3 overflow-hidden"
                    >
                        <textarea autoFocus className="w-full bg-background border border-border rounded-xl p-4 text-sm focus:border-accent outline-none resize-none text-text shadow-inner font-medium" placeholder={`Reply to ${comment.author_name}...`} value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setIsReplying(false)} className="text-xs text-text/40 px-4 py-2 hover:text-text transition-colors font-bold uppercase tracking-widest">Cancel</button>
                            <button type="submit" className="bg-accent hover:bg-gfg-green-hover text-white text-xs font-bold px-6 py-2 rounded-lg transition shadow-md uppercase tracking-widest">Post Reply</button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>
          </motion.div>
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} onReply={onReply} />
          ))}
        </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {!expandedPost ? (
        <>
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h1 className="text-4xl md:text-5xl font-black text-text tracking-tighter uppercase">Community <span className="text-accent">Forum</span></h1>
            <p className="text-text/60 text-lg max-w-2xl font-medium">Discuss algorithms, share projects, and collaborate with your peers.</p>
          </motion.div>

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
                  <div className="flex-grow space-y-4">
                    <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-text/40">
                        <span className="text-accent">{post.author_name}</span>
                        <span className="w-1 h-1 bg-text/20 rounded-full"></span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-text group-hover:text-accent transition-colors leading-tight tracking-tight uppercase">{post.title}</h2>
                    <div className="text-text/60 text-sm line-clamp-2 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: post.content }} />
                    <div className="flex flex-wrap gap-2 pt-2">
                        {post.tags?.split(',').map((tag, i) => (
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
        </>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10 max-w-5xl mx-auto">
          <button onClick={() => setExpandedPost(null)} className="flex items-center gap-2 text-text/60 hover:text-accent transition-colors group font-black uppercase text-xs tracking-widest bg-card px-6 py-3 rounded-2xl border border-border shadow-sm active:scale-95 transition-all">
            <ArrowLeft size={18} /> Back to Feed
          </button>

          <div className="space-y-12">
            <div className="bg-card border border-border rounded-[3rem] overflow-hidden shadow-2xl">
                <div className="p-8 md:p-16 space-y-12">
                    <div className="space-y-8">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="bg-accent/10 text-accent text-[10px] font-black px-4 py-1.5 rounded-full border border-accent/20 tracking-widest uppercase">DISCUSSION</span>
                            {expandedPost.tags?.split(',').map((tag, i) => (
                                <span key={i} className="text-[10px] font-black text-text/40 bg-background border border-border px-3 py-1.5 rounded-xl uppercase tracking-widest">#{tag.trim()}</span>
                            ))}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-text leading-tight tracking-tighter uppercase">{expandedPost.title}</h1>
                        <div className="flex flex-wrap items-center gap-8 text-sm text-text/40 pt-4 border-b border-border/50 pb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-lg font-black text-accent border border-accent/20 shadow-inner">{expandedPost.author_name[0]}</div>
                                <div>
                                    <p className="font-black text-text uppercase tracking-widest text-xs">{expandedPost.author_name}</p>
                                    <p className="text-[9px] font-bold text-accent uppercase tracking-[0.2em]">Author Node</p>
                                </div>
                            </div>
                            <div className="h-8 w-[1px] bg-border/50 hidden sm:block"></div>
                            <span className="flex items-center gap-2 font-bold uppercase text-[11px] tracking-widest"><Clock size={18} className="text-accent" /> {new Date(expandedPost.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-12">
                        <div className="flex-grow min-w-0">
                            <div className="prose prose-accent dark:prose-invert max-w-none text-text/80 text-xl leading-[1.8] font-medium ql-editor !p-0" dangerouslySetInnerHTML={{ __html: expandedPost.content }} />
                        </div>
                        <div className="md:w-32 flex flex-row md:flex-col items-center gap-5">
                            <button onClick={() => handleReactPost(expandedPost.id)} className={`p-6 rounded-[2rem] transition-all border-2 flex flex-col items-center gap-2 shadow-sm w-full ${expandedPost.reaction_count > 0 ? 'bg-accent/10 border-accent/30 text-accent' : 'bg-background border-border text-text/30 hover:border-accent/50'}`}>
                                <Heart size={36} className={expandedPost.reaction_count > 0 ? 'fill-accent' : ''} />
                                <span className="text-2xl font-black">{expandedPost.reaction_count || 0}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-12">
                <div className="flex items-center gap-6"><h3 className="text-3xl font-black text-text uppercase tracking-tight">Transmission Feed</h3><div className="h-[2px] flex-grow bg-gradient-to-r from-border to-transparent"></div></div>
                <div className="space-y-8">
                    {threadedComments.length > 0 ? threadedComments.map(comment => (<CommentItem key={comment.id} comment={comment} onReply={handleAddReply} />)) : (
                    <div className="py-24 text-center bg-card/20 rounded-[3rem] border-2 border-dashed border-border shadow-inner"><p className="text-xl text-text/30 font-black uppercase tracking-widest">No signals received.</p></div>
                    )}
                </div>
                <div className="bg-card border border-border rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <form onSubmit={handleAddMainComment} className="space-y-8 relative z-10">
                        <textarea required rows={5} className="w-full bg-background border border-border rounded-[2rem] py-8 px-10 focus:border-accent outline-none resize-none text-text text-xl leading-relaxed shadow-inner transition-colors font-medium" placeholder="Input your transmission..." value={mainComment} onChange={(e) => setMainComment(e.target.value)} />
                        <div className="flex justify-end"><button type="submit" className="bg-accent hover:bg-gfg-green-hover text-white font-black px-14 py-6 rounded-[1.5rem] transition shadow-xl text-xl uppercase tracking-widest active:scale-95">Post Signal</button></div>
                    </form>
                </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Community;
