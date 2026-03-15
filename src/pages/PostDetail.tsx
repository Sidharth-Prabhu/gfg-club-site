import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeart, faArrowLeft, faClock, faReply, faMessage, faUser, faTag, faEdit, faTrashAlt, faSave, faTimes, faHashtag 
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import MarkdownRenderer from '../components/MarkdownRenderer';
import MarkdownEditor from '../components/MarkdownEditor';
import NeuralBackground from '../components/NeuralBackground';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [group, setGroup] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainComment, setMainComment] = useState('');

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ title: '', content: '', tags: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPost = async () => {
    try {
      const { data } = await api.get(`/discussions/${postId}`);
      setPost(data);
      if (data.group_id) {
        try {
          const { data: groupData } = await api.get(`/groups/${data.group_id}`);
          setGroup(groupData);
        } catch (e) { console.error('Failed to fetch group info'); }
      }
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

  useEffect(() => {
    if (post && new URLSearchParams(window.location.search).get('edit') === 'true' && user?.id === post.author_id) {
      handleOpenEditModal();
      window.history.replaceState({}, '', `/community/${postId}`);
    }
  }, [post, user]);

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

  const handleDeletePost = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/discussions/${postId}`);
      navigate('/community');
    } catch (error) {
      alert('Deletion failed');
    }
  };

  const handleEditPost = async (e) => {
    e.preventDefault();
    if (!editFormData.title.trim() || !editFormData.content.trim()) return;
    
    setIsSubmitting(true);
    try {
      const tagsArray = editFormData.tags.split(',').map(t => t.trim()).filter(t => t !== '');
      await api.put(`/discussions/${postId}`, {
        title: editFormData.title,
        content: editFormData.content,
        tags: tagsArray
      });
      setIsEditModalOpen(false);
      fetchPost();
    } catch (error) {
      alert('Failed to update post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = () => {
    setEditFormData({
      title: post.title,
      content: post.content,
      tags: post.tags || ''
    });
    setIsEditModalOpen(true);
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
        <div className={`space-y-3 ${depth > 0 ? 'ml-4 md:ml-10 border-l border-border/50 pl-4 md:pl-6' : ''}`}>
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border p-4 rounded-2xl space-y-3 shadow-sm italic"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <Link to={`/profile/${comment.user_id}`} className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-[10px] font-bold border border-accent/20 text-accent hover:bg-accent hover:text-white transition-all overflow-hidden italic">
                    {comment.author_pic ? (
                        <img src={comment.author_pic} className="w-full h-full object-cover" alt="" />
                    ) : (
                        comment.author_name[0]
                    )}
                </Link>
                <div>
                    <Link to={`/profile/${comment.user_id}`} className="font-black text-xs text-text uppercase tracking-widest hover:text-accent transition-colors italic">{comment.author_name}</Link>
                    <p className="text-[7px] text-text/40 font-bold uppercase tracking-widest">{new Date(comment.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <button onClick={() => handleReactComment(comment.id)} className="flex items-center gap-1.5 text-[8px] text-text/40 hover:text-red-500 transition-colors font-black uppercase tracking-widest bg-background px-2.5 py-1 rounded-lg border border-border italic">
                <FontAwesomeIcon icon={faHeart} className={comment.reaction_count > 0 ? 'text-red-500' : ''} />
                <span>{comment.reaction_count || 0}</span>
              </button>
            </div>
            <div className="text-sm text-text/80 leading-relaxed font-medium overflow-hidden">
                <MarkdownRenderer content={comment.content} />
            </div>
            <div className="flex gap-3 pt-0.5">
                <button onClick={() => setIsReplying(!isReplying)} className="text-[8px] font-black text-text/40 hover:text-accent flex items-center gap-1.5 transition-colors uppercase tracking-widest italic">
                    <FontAwesomeIcon icon={faReply} /> Reply
                </button>
            </div>
            <AnimatePresence>
                {isReplying && (
                    <motion.form 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={(e) => { e.preventDefault(); if(!replyText.trim()) return; onReply(replyText, comment.id); setReplyText(''); setIsReplying(false); }} 
                        className="pt-1.5 space-y-2 overflow-hidden"
                    >
                        <textarea autoFocus className="w-full bg-background border border-border rounded-xl p-4 text-[10px] focus:border-accent outline-none resize-none text-text shadow-inner font-medium italic" placeholder={`Reply...`} value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setIsReplying(false)} className="text-[8px] text-text/40 px-3 py-1.5 hover:text-text transition-colors font-black uppercase tracking-widest">Cancel</button>
                            <button type="submit" className="bg-accent hover:bg-gfg-green-hover text-white text-[8px] font-black px-4 py-1.5 rounded-lg transition shadow-md uppercase tracking-widest">Reply</button>
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
        <div className="text-center text-accent font-black tracking-[0.2em] uppercase animate-pulse text-xs italic">
          Loading...
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden bg-card border-b border-border flex flex-col justify-end">
        <div className="absolute inset-0 pointer-events-none">
          <NeuralBackground />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        
        <div className="absolute top-6 left-6 z-20">
          <button 
            onClick={() => navigate(group ? `/groups/${group.id}` : '/community')} 
            className="flex items-center gap-1.5 text-text/60 bg-card/40 hover:bg-card backdrop-blur-md px-4 py-2 rounded-full border border-border transition-all group font-black uppercase text-[10px] tracking-widest active:scale-95 shadow-sm"
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Back
          </button>
        </div>

        <div className="relative w-full p-6 md:p-12 z-10 pt-24 md:pt-32">
          <div className="max-w-7xl mx-auto space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="flex flex-wrap items-center gap-3"
            >
              <span className="bg-accent/10 text-accent text-[8px] font-black px-3 py-1 rounded-full border border-accent/20 tracking-widest uppercase backdrop-blur-md italic">
                {group ? `GROUP: ${group.title}` : 'COMMUNITY'}
              </span>
              <div className="flex gap-1.5">
                {post.tags?.split(',').map((tag, i) => (
                  <span key={i} className="text-[8px] font-black text-text/40 bg-card/60 border border-border px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm italic">
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }} 
              className="text-3xl md:text-6xl font-black text-text leading-tight tracking-tighter uppercase max-w-5xl italic break-words"
            >
              {post.title}
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-8 text-[10px] pt-2"
            >
              <div className="flex items-center gap-3">
                <Link to={`/profile/${post.author_id}`} className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-base font-black text-accent border border-accent/20 shadow-inner hover:bg-accent hover:text-white transition-all italic">
                  {post.author_pic ? (
                      <img src={post.author_pic} className="w-full h-full object-cover" alt="" />
                  ) : (
                      post.author_name[0]
                  )}
                </Link>
                <div>
                  <Link to={`/profile/${post.author_id}`} className="font-black text-text uppercase tracking-widest text-[10px] hover:text-accent transition-colors italic">{post.author_name}</Link>
                  <p className="text-[7px] font-bold text-accent uppercase tracking-[0.2em] italic">Author</p>
                </div>
              </div>
              <div className="h-6 w-[1px] bg-border/50 hidden sm:block"></div>
              <span className="flex items-center gap-2 font-black uppercase tracking-widest text-text/40 italic">
                <FontAwesomeIcon icon={faClock} className="text-accent" /> {new Date(post.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-2 font-black uppercase tracking-widest text-text/40 italic">
                <FontAwesomeIcon icon={faMessage} className="text-accent" /> {comments.length} Replies
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mt-10 md:mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {/* Post Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border p-8 md:p-12 rounded-3xl shadow-xl italic"
            >
              <MarkdownRenderer content={post.content} />
            </motion.div>

            {/* Comments Section */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-black text-text uppercase tracking-tight italic">Comments</h3>
                <div className="h-[1px] flex-grow bg-gradient-to-r from-border to-transparent"></div>
              </div>
              
              <div className="space-y-6">
                {threadedComments.length > 0 ? (
                  threadedComments.map(comment => (
                    <CommentItem key={comment.id} comment={comment} onReply={handleAddReply} />
                  ))
                ) : (
                  <div className="py-16 text-center bg-card border border-dashed border-border rounded-3xl shadow-inner italic">
                    <p className="text-sm text-text/30 font-black uppercase tracking-widest">No comments yet.</p>
                  </div>
                )}
              </div>
              
              {/* Main Reply Form */}
              <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full -mr-24 -mt-24 blur-2xl transition-all group-hover:bg-accent/10"></div>
                <form onSubmit={handleAddMainComment} className="space-y-6 relative z-10">
                  <div className="space-y-2">
                    <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-2">Post a Comment</label>
                    <textarea 
                      required 
                      rows={4} 
                      className="w-full bg-background border border-border rounded-2xl py-5 px-6 focus:border-accent outline-none resize-none text-text text-sm leading-relaxed shadow-inner transition-colors font-medium italic" 
                      placeholder="Write your thoughts..." 
                      value={mainComment} 
                      onChange={(e) => setMainComment(e.target.value)} 
                    />
                  </div>
                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      className="bg-accent hover:bg-gfg-green-hover text-white font-black px-10 py-4 rounded-xl transition shadow-lg text-[10px] uppercase tracking-widest active:scale-95"
                    >
                      Add Comment
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
              className="bg-card border border-border p-8 rounded-3xl shadow-xl sticky top-20"
            >
              <div className="space-y-8">
                <div className="text-center space-y-3">
                  <div className="p-4 bg-accent/5 rounded-2xl border border-accent/10 inline-block italic">
                    <FontAwesomeIcon icon={faHeart} size="2x" className={post?.reaction_count > 0 ? 'text-accent' : 'text-text/20'} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-text uppercase tracking-widest italic">{post?.reaction_count || 0}</h4>
                    <p className="text-text/40 font-black uppercase text-[8px] tracking-widest">Likes</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={handleReactPost} 
                    className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md italic ${post?.reaction_count > 0 ? 'bg-accent text-white shadow-accent/20' : 'bg-background border border-border text-text hover:border-accent hover:text-accent'}`}
                  >
                    <FontAwesomeIcon icon={faHeart} />
                    {post?.reaction_count > 0 ? 'Liked' : 'Like'}
                  </button>
                  
                  <button 
                    onClick={() => {
                      const el = document.querySelector('textarea');
                      el?.focus();
                      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className="w-full py-4 rounded-xl bg-card border border-border text-text/60 hover:text-accent hover:border-accent transition-all font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 active:scale-95 italic shadow-sm"
                  >
                    <FontAwesomeIcon icon={faReply} /> Comment
                  </button>

                  {/* Author Actions */}
                  {(user?.id === post?.author_id) && (
                    <button 
                      onClick={handleOpenEditModal}
                      className="w-full py-3 rounded-lg bg-blue-500/5 text-blue-500 border border-border/50 hover:bg-blue-500 hover:text-white transition-all font-black uppercase text-[8px] tracking-widest flex items-center justify-center gap-2 active:scale-95 italic"
                    >
                      <FontAwesomeIcon icon={faEdit} /> Edit
                    </button>
                  )}
                  
                  {(user?.id === post?.author_id || user?.role === 'Admin' || user?.role === 'Core') && (
                    <button 
                      onClick={handleDeletePost}
                      className="w-full py-3 rounded-lg bg-red-500/5 text-red-500 border border-border/50 hover:bg-red-500 hover:text-white transition-all font-black uppercase text-[8px] tracking-widest flex items-center justify-center gap-2 active:scale-95 italic"
                    >
                      <FontAwesomeIcon icon={faTrashAlt} /> Delete
                    </button>
                  )}
                </div>

                <div className="pt-6 border-t border-border/50">
                   <div className="flex items-center gap-3 text-text/40 mb-4">
                      <FontAwesomeIcon icon={faTag} className="text-accent text-xs" />
                      <span className="text-[8px] font-black uppercase tracking-widest italic">Tags</span>
                   </div>
                   <div className="flex flex-wrap gap-1.5">
                      {post?.tags?.split(',').map((tag, i) => (
                        <span key={i} className="text-[8px] font-black text-text bg-background border border-border px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-sm italic">
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

      {/* Edit Post Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-xl overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-border rounded-3xl w-full max-w-4xl my-auto shadow-2xl overflow-hidden">
              <div className="p-6 md:p-8 border-b border-border flex justify-between items-center bg-background/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg text-accent"><FontAwesomeIcon icon={faEdit} /></div>
                    <h2 className="text-xl font-black text-text uppercase tracking-tighter italic">Edit Post</h2>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="text-text/40 hover:text-red-500 p-1.5 rounded-full transition-all active:scale-90"><FontAwesomeIcon icon={faTimes} size="lg" /></button>
              </div>
              <form onSubmit={handleEditPost} className="p-6 md:p-10 space-y-6 overflow-y-auto max-h-[75vh] custom-scrollbar">
                <div className="space-y-2">
                  <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-2">Title</label>
                  <input required type="text" className="w-full bg-background border-2 border-border rounded-xl py-3 px-5 focus:border-accent outline-none text-lg font-black text-text shadow-inner transition-colors italic" value={editFormData.title} onChange={(e) => setEditFormData({...editFormData, title: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <MarkdownEditor 
                    label="Content"
                    value={editFormData.content}
                    onChange={(content) => setEditFormData({...editFormData, content})}
                    placeholder="Share your thoughts, ask a question, or post a resource..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-2">Tags</label>
                  <div className="relative">
                      <FontAwesomeIcon icon={faHashtag} className="absolute left-4 top-1/2 -translate-y-1/2 text-text/20 text-xs"/>
                      <input type="text" className="w-full bg-background border-2 border-border rounded-xl py-3 px-10 focus:border-accent outline-none text-text font-black text-sm transition shadow-inner italic" value={editFormData.tags} onChange={(e) => setEditFormData({...editFormData, tags: e.target.value})} />
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                    <button type="submit" disabled={isSubmitting} className="flex-grow bg-accent hover:bg-gfg-green-hover text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-xl shadow-accent/10 uppercase tracking-widest text-[10px] active:scale-[0.98] disabled:opacity-50">
                        <FontAwesomeIcon icon={faSave} /> {isSubmitting ? 'Updating...' : 'Save Changes'}
                    </button>
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="bg-card border border-border hover:bg-background text-text/60 font-black py-4 px-8 rounded-xl transition text-[10px] uppercase tracking-widest shadow-sm italic">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid var(--color-border) !important; background: var(--color-background); padding: 8px !important; }
        .ql-container.ql-snow { border: none !important; }
        .ql-editor { font-family: inherit; font-size: 1rem; padding: 15px !important; min-height: 150px; }
        .ql-editor a { color: var(--color-accent); font-weight: 800; text-decoration: underline; }
        .ql-editor h1, .ql-editor h2, .ql-editor h3 { color: var(--color-text); font-weight: 900; margin-top: 1.2em; margin-bottom: 0.4em; text-transform: uppercase; }
        .ql-editor ul, .ql-editor ol { padding-left: 1.2em; margin-bottom: 0.8em; list-style: disc; }
        .dark .ql-editor *, .dark .ql-editor span { background-color: transparent !important; color: var(--color-text) !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-accent); border-radius: 10px; opacity: 0.2; }
      `}</style>
    </div>
  );
};

export default PostDetail;
