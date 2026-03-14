import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Heart, ArrowLeft, Clock, Reply, MessageSquare, User, Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainComment, setMainComment] = useState('');

  const fetchPost = async () => {
    try {
      const { data } = await api.get(`/discussions/${postId}`);
      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
      navigate('/community');
    }
  };

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/discussions/${postId}/comments`);
      setComments(data);
    } catch (error) {
      console.error('Failed to fetch comments');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchPost(), fetchComments()]);
      setLoading(false);
    };
    init();
  }, [postId]);

  const handleReactPost = async () => {
    try {
      await api.post('/discussions/react', { postId: post.id });
      fetchPost();
    } catch (error) { console.error('React failed'); }
  };

  const handleReactComment = async (commentId) => {
    try {
      await api.post('/discussions/react-comment', { commentId });
      fetchComments();
    } catch (error) { console.error('Comment react failed'); }
  };

  const handleAddMainComment = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (!mainComment.trim()) return;
    try {
      await api.post('/discussions/comments', { 
        postId: post.id, 
        content: mainComment,
        parentId: null
      });
      setMainComment('');
      fetchComments();
    } catch (error) { alert('Failed to add comment'); }
  };

  const handleAddReply = async (content, parentId) => {
    if (!user) return navigate('/login');
    try {
      await api.post('/discussions/comments', { 
        postId: post.id, 
        content: content,
        parentId: parentId
      });
      fetchComments();
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
        <div className={`space-y-4 ${depth > 0 ? 'ml-6 md:ml-12 border-l-2 border-border/50 pl-4 md:pl-8' : ''}`}>
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card border border-border p-6 rounded-[2rem] space-y-4 shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-sm font-bold border border-accent/20 text-accent">
                    {comment.author_name[0]}
                </div>
                <div>
                    <span className="font-black text-sm text-text uppercase tracking-widest">{comment.author_name}</span>
                    <p className="text-[10px] text-text/40 font-bold uppercase tracking-widest">{new Date(comment.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <button onClick={() => handleReactComment(comment.id)} className="flex items-center gap-2 text-xs text-text/40 hover:text-red-500 transition-colors font-black uppercase tracking-widest bg-background px-4 py-2 rounded-xl border border-border">
                <Heart size={14} className={comment.reaction_count > 0 ? 'fill-red-500 text-red-500' : ''} />
                <span>{comment.reaction_count || 0}</span>
              </button>
            </div>
            <p className="text-base text-text/80 leading-relaxed font-medium">{comment.content}</p>
            <div className="flex gap-4 pt-1">
                <button onClick={() => setIsReplying(!isReplying)} className="text-[10px] font-black text-text/40 hover:text-accent flex items-center gap-2 transition-colors uppercase tracking-widest">
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
                        <textarea autoFocus className="w-full bg-background border border-border rounded-2xl p-6 text-sm focus:border-accent outline-none resize-none text-text shadow-inner font-medium" placeholder={`Reply to ${comment.author_name}...`} value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setIsReplying(false)} className="text-xs text-text/40 px-6 py-3 hover:text-text transition-colors font-black uppercase tracking-widest">Cancel</button>
                            <button type="submit" className="bg-accent hover:bg-gfg-green-hover text-white text-xs font-black px-8 py-3 rounded-xl transition shadow-md uppercase tracking-widest">Post Reply</button>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-accent font-black tracking-[0.3em] uppercase animate-pulse text-xl italic">
          Fetching Transmission Node...
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section - Full Screen Width */}
      <section className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden bg-card border-b border-border">
        {/* Abstract Background Design */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] -mr-64 -mt-64"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -ml-48 -mb-48"></div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        
        <div className="absolute top-8 left-8 z-20">
          <button 
            onClick={() => navigate('/community')} 
            className="flex items-center gap-2 text-text/60 bg-card/40 hover:bg-card backdrop-blur-md px-6 py-3 rounded-full border border-border transition-all group font-black uppercase text-xs tracking-widest active:scale-95"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Matrix
          </button>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-8 md:p-20 z-10">
          <div className="max-w-7xl mx-auto space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="flex flex-wrap items-center gap-4"
            >
              <span className="bg-accent/10 text-accent text-[10px] font-black px-5 py-2 rounded-full border border-accent/20 tracking-widest uppercase backdrop-blur-md">
                COMMUNITY TRANSMISSION
              </span>
              <div className="flex gap-2">
                {post.tags?.split(',').map((tag, i) => (
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
              className="text-4xl md:text-7xl font-black text-text leading-tight tracking-tighter uppercase max-w-5xl break-words"
            >
              {post.title}
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-8 text-sm pt-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-lg font-black text-accent border border-accent/20 shadow-inner">
                  {post.author_name[0]}
                </div>
                <div>
                  <p className="font-black text-text uppercase tracking-widest text-xs">{post.author_name}</p>
                  <p className="text-[9px] font-bold text-accent uppercase tracking-[0.2em]">Author Node</p>
                </div>
              </div>
              <div className="h-8 w-[1px] bg-border/50 hidden sm:block"></div>
              <span className="flex items-center gap-2 font-black uppercase text-[11px] tracking-widest text-text/40">
                <Clock size={18} className="text-accent" /> {new Date(post.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-2 font-black uppercase text-[11px] tracking-widest text-text/40">
                <MessageSquare size={18} className="text-accent" /> {comments.length} Signals
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="max-w-7xl mx-auto px-8 md:px-20 mt-12 md:mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-20">
            {/* Post Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="prose prose-accent dark:prose-invert max-w-none text-text/80 text-xl leading-[1.8] font-medium ql-editor !p-0" dangerouslySetInnerHTML={{ __html: post.content }} />
            </motion.div>

            {/* Comments Section */}
            <div className="space-y-12">
              <div className="flex items-center gap-6">
                <h3 className="text-3xl font-black text-text uppercase tracking-tight italic">Transmission Feed</h3>
                <div className="h-[2px] flex-grow bg-gradient-to-r from-border to-transparent"></div>
              </div>
              
              <div className="space-y-10">
                {threadedComments.length > 0 ? (
                  threadedComments.map(comment => (
                    <CommentItem key={comment.id} comment={comment} onReply={handleAddReply} />
                  ))
                ) : (
                  <div className="py-24 text-center bg-card border-2 border-dashed border-border rounded-[3rem] shadow-inner">
                    <p className="text-xl text-text/30 font-black uppercase tracking-widest">No active signals detected in this sector.</p>
                  </div>
                )}
              </div>
              
              {/* Main Reply Form */}
              <div className="bg-card border border-border rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:bg-accent/10"></div>
                <form onSubmit={handleAddMainComment} className="space-y-8 relative z-10">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.3em] ml-2">Broadcast Signal</label>
                    <textarea 
                      required 
                      rows={5} 
                      className="w-full bg-background border border-border rounded-[2rem] py-8 px-10 focus:border-accent outline-none resize-none text-text text-xl leading-relaxed shadow-inner transition-colors font-medium" 
                      placeholder="Input your transmission sequence..." 
                      value={mainComment} 
                      onChange={(e) => setMainComment(e.target.value)} 
                    />
                  </div>
                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      className="bg-accent hover:bg-gfg-green-hover text-white font-black px-14 py-6 rounded-[1.5rem] transition shadow-xl text-xl uppercase tracking-widest active:scale-95"
                    >
                      Post Signal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.3 }}
              className="bg-card border border-border p-10 rounded-[3rem] shadow-xl sticky top-24"
            >
              <div className="space-y-10">
                <div className="text-center space-y-4">
                  <div className="p-6 bg-accent/5 rounded-[2rem] border border-accent/10 inline-block">
                    <Heart size={48} className={post.reaction_count > 0 ? 'text-accent fill-accent' : 'text-text/20'} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-text uppercase tracking-widest italic">{post.reaction_count || 0}</h4>
                    <p className="text-text/40 font-black uppercase text-[10px] tracking-[0.3em]">Recognition Score</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={handleReactPost} 
                    className={`w-full py-6 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg ${post.reaction_count > 0 ? 'bg-accent text-white shadow-accent/20' : 'bg-background border border-border text-text hover:border-accent hover:text-accent'}`}
                  >
                    <Heart size={20} className={post.reaction_count > 0 ? 'fill-white' : ''} />
                    {post.reaction_count > 0 ? 'Acknowledged' : 'Give Recognition'}
                  </button>
                  
                  <button 
                    onClick={() => {
                      const el = document.querySelector('textarea');
                      el?.focus();
                      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className="w-full py-6 rounded-2xl bg-card border border-border text-text/60 hover:text-accent hover:border-accent transition-all font-black uppercase text-sm tracking-widest flex items-center justify-center gap-3 active:scale-95"
                  >
                    <Reply size={20} /> Deploy Signal
                  </button>
                </div>

                <div className="pt-8 border-t border-border/50">
                   <div className="flex items-center gap-4 text-text/40 mb-6">
                      <Tag size={18} className="text-accent" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Metadata Tags</span>
                   </div>
                   <div className="flex flex-wrap gap-2">
                      {post.tags?.split(',').map((tag, i) => (
                        <span key={i} className="text-[10px] font-black text-text bg-background border border-border px-4 py-2 rounded-xl uppercase tracking-widest shadow-sm">
                          {tag.trim()}
                        </span>
                      ))}
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <style>{`
        .ql-editor a { color: var(--color-accent); font-weight: 800; text-decoration: underline; }
        .ql-editor h1, .ql-editor h2, .ql-editor h3 { color: var(--color-text); font-weight: 900; margin-top: 1.5em; margin-bottom: 0.5em; text-transform: uppercase; }
        .ql-editor ul, .ql-editor ol { padding-left: 1.5em; margin-bottom: 1em; list-style: disc; }
        .ql-editor p { margin-bottom: 1.5em; }
      `}</style>
    </div>
  );
};

export default PostDetail;
