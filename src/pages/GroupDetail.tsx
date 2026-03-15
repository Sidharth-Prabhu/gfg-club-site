import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMessage, faUsers, faShieldAlt, faPlus, faTimes, faArrowLeft, 
  faClock, faSave, faHashtag, faTrashAlt, faHeart, faLock, faGlobe 
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import MarkdownEditor from '../components/MarkdownEditor';
import MarkdownRenderer from '../components/MarkdownRenderer';

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGroupData = async () => {
    try {
      const [groupRes, postsRes, membersRes] = await Promise.all([
        api.get(`/groups/${id}`),
        api.get(`/discussions?groupId=${id}`),
        api.get(`/groups/${id}/members`)
      ]);
      setGroup(groupRes.data);
      setPosts(postsRes.data);
      setMembers(membersRes.data);
    } catch (error) {
      console.error('Error fetching group data:', error);
      navigate('/community');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchGroupData();
      setLoading(false);
    };
    init();
  }, [id]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    setIsSubmitting(true);
    try {
      const tagsArray = newPost.tags.split(',').map(t => t.trim()).filter(t => t !== '');
      await api.post('/discussions', {
        title: newPost.title,
        content: newPost.content,
        tags: tagsArray,
        groupId: id
      });
      setIsCreateModalOpen(false);
      setNewPost({ title: '', content: '', tags: '' });
      fetchGroupData();
    } catch (error) {
      alert('Post creation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="py-24 text-center text-accent font-black tracking-widest animate-pulse uppercase italic text-xs">Loading Group...</div>;
  if (!group) return null;

  const isMember = group.user_status === 'Accepted';

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl space-y-8 pb-16">
      <button 
        onClick={() => navigate('/community')} 
        className="flex items-center gap-1.5 text-text/60 hover:text-accent transition-all group font-black uppercase text-[10px] tracking-widest bg-card px-4 py-2 rounded-xl border border-border shadow-sm active:scale-95"
      >
        <FontAwesomeIcon icon={faArrowLeft} /> Back to Community
      </button>

      {/* Group Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-3xl p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden shadow-xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
        
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-3xl shadow-inner relative z-10">
            {group.logo ? <img src={group.logo} className="w-16 h-16 object-contain" alt="" /> : <FontAwesomeIcon icon={faShieldAlt} className="text-accent" />}
        </div>

        <div className="flex-grow space-y-4 text-center md:text-left relative z-10">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className="bg-accent/10 text-accent text-[8px] font-black px-3 py-1 rounded-full border border-accent/20 tracking-widest uppercase backdrop-blur-md italic">
                    ACTIVE GROUP
                </span>
                {group.allow_guests ? (
                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1.5 bg-blue-500/5 px-3 py-1 rounded-full border border-blue-500/10 italic"><FontAwesomeIcon icon={faGlobe} /> Public Group</span>
                ) : (
                    <span className="text-[8px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1.5 bg-red-500/5 px-3 py-1 rounded-full border border-red-500/10 italic"><FontAwesomeIcon icon={faLock} /> Restricted</span>
                )}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-text uppercase tracking-tighter italic">{group.title}</h1>
            <div className="text-text/60 text-sm md:text-base font-medium leading-relaxed italic max-w-2xl overflow-hidden">
                <MarkdownRenderer content={group.description} />
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-2">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-text/20 uppercase tracking-widest">Leader</span>
                    <Link to={`/profile/${group.created_by}`} className="text-[10px] font-black text-text/60 uppercase hover:text-accent transition-colors italic">{group.creator_name}</Link>
                </div>
                <div className="flex flex-col border-l border-border/50 pl-6">
                    <span className="text-[8px] font-black text-text/20 uppercase tracking-widest">Members</span>
                    <span className="text-[10px] font-black text-text/60 uppercase italic">{group.member_count} / {group.max_members}</span>
                </div>
            </div>
        </div>

        {isMember && (
            <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-accent hover:bg-gfg-green-hover text-white px-6 py-3.5 rounded-xl font-black flex items-center gap-2 transition shadow-lg shadow-accent/10 text-[10px] uppercase tracking-widest active:scale-95 whitespace-nowrap"
            >
                <FontAwesomeIcon icon={faPlus} /> New Post
            </button>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-8">
        <button 
            onClick={() => setActiveTab('feed')}
            className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'feed' ? 'text-accent' : 'text-text/30 hover:text-text/60'}`}
        >
            Group Feed
            {activeTab === 'feed' && <motion.div layoutId="tab-underline-group" className="absolute bottom-0 left-0 w-full h-0.5 bg-accent rounded-full" />}
        </button>
        <button 
            onClick={() => setActiveTab('members')}
            className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'members' ? 'text-accent' : 'text-text/30 hover:text-text/60'}`}
        >
            Member List
            {activeTab === 'members' && <motion.div layoutId="tab-underline-group" className="absolute bottom-0 left-0 w-full h-0.5 bg-accent rounded-full" />}
        </button>
      </div>

      {activeTab === 'feed' ? (
        <div className="space-y-6">
            {posts.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {posts.map(post => (
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={post.id} 
                            onClick={() => navigate(`/community/${post.id}`)}
                            className="bg-card border border-border rounded-3xl p-6 md:p-8 hover:shadow-xl transition-all group cursor-pointer flex flex-col md:flex-row gap-8 shadow-sm"
                        >
                            <div className="hidden md:flex flex-col items-center gap-3 text-text/30 min-w-[100px] border-r border-border/50 pr-8">
                                <div className="text-center">
                                    <p className="text-2xl font-black text-text group-hover:text-accent transition-colors">{post.reaction_count || 0}</p>
                                    <p className="text-[8px] font-black uppercase tracking-widest">Votes</p>
                                </div>
                                <div className={`text-center p-3 rounded-xl border w-full transition-all ${post.comment_count > 0 ? 'border-accent/30 bg-accent/5 text-accent' : 'border-border'}`}>
                                    <p className="text-lg font-black">{post.comment_count || 0}</p>
                                    <p className="text-[7px] font-black uppercase tracking-widest text-text/40">Replies</p>
                                </div>
                            </div>
                            <div className="flex-grow min-w-0 space-y-4">
                                <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-text/40 italic">
                                    <span className="text-accent">{post.author_name}</span>
                                    <span className="w-1 h-1 bg-text/20 rounded-full"></span>
                                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                </div>
                                <h2 className="text-xl md:text-2xl font-black text-text group-hover:text-accent transition-colors leading-tight tracking-tight uppercase break-words italic">{post.title}</h2>
                                <div className="text-text/60 text-sm line-clamp-3 leading-relaxed font-medium break-words overflow-hidden italic">
                                    <MarkdownRenderer content={post.content} />
                                </div>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {post.tags?.split(',').map((tag, i) => (
                                    <span key={i} className="text-[8px] font-black uppercase text-accent bg-accent/5 px-2 py-1 rounded-lg border border-accent/10 tracking-widest italic">#{tag.trim()}</span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="py-24 text-center bg-card rounded-3xl border border-border border-dashed shadow-inner">
                    <FontAwesomeIcon icon={faMessage} size="3x" className="mx-auto mb-4 opacity-5" />
                    <p className="text-xl font-black uppercase tracking-widest text-text/20 italic">No posts found.</p>
                </div>
            )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map(member => (
                <div key={member.id} className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4 shadow-sm group">
                    <Link to={`/profile/${member.user_id}`} className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-lg font-black text-accent border border-accent/20 group-hover:bg-accent group-hover:text-white transition-all cursor-pointer overflow-hidden italic">
                        {member.user_pic ? (
                            <img src={member.user_pic} className="w-full h-full object-cover" alt="" />
                        ) : (
                            member.user_name[0]
                        )}
                    </Link>
                    <div>
                        <Link to={`/profile/${member.user_id}`} className="text-sm font-black text-text uppercase italic hover:text-accent transition-colors cursor-pointer">{member.user_name}</Link>
                        <p className="text-[8px] font-black text-accent uppercase tracking-widest mt-0.5">{member.role}</p>
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* Create Post Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-xl overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-border rounded-3xl w-full max-w-4xl my-auto shadow-2xl overflow-hidden">
              <div className="p-6 md:p-8 border-b border-border flex justify-between items-center bg-background/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg text-accent"><FontAwesomeIcon icon={faMessage} /></div>
                    <h2 className="text-xl font-black text-text uppercase tracking-tighter italic">New Post</h2>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-text/40 hover:text-red-500 p-1.5 rounded-full transition-all active:scale-90"><FontAwesomeIcon icon={faTimes} size="lg" /></button>
              </div>
              <form onSubmit={handleCreatePost} className="p-6 md:p-10 space-y-6 overflow-y-auto max-h-[75vh] custom-scrollbar">
                <div className="space-y-2">
                  <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-2">Title</label>
                  <input required type="text" className="w-full bg-background border-2 border-border rounded-xl py-3 px-5 focus:border-accent outline-none text-text font-black text-lg transition shadow-inner italic" placeholder="Enter title..." value={newPost.title} onChange={(e) => setNewPost({...newPost, title: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <MarkdownEditor 
                    label="Content"
                    value={newPost.content}
                    onChange={(content) => setNewPost({...newPost, content})}
                    placeholder="Share something with the group..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-2">Tags</label>
                  <div className="relative">
                      <FontAwesomeIcon icon={faHashtag} className="absolute left-4 top-1/2 -translate-y-1/2 text-text/20 text-xs"/>
                      <input type="text" className="w-full bg-background border-2 border-border rounded-xl py-3 pl-10 pr-5 focus:border-accent outline-none text-text font-black text-sm transition shadow-inner italic" placeholder="e.g. React, Node.js" value={newPost.tags} onChange={(e) => setNewPost({...newPost, tags: e.target.value})} />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button type="submit" disabled={isSubmitting} className="flex-grow bg-accent hover:bg-gfg-green-hover text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-xl shadow-accent/10 uppercase tracking-widest text-[10px] active:scale-[0.98] disabled:opacity-50">
                        <FontAwesomeIcon icon={faSave} /> {isSubmitting ? 'Posting...' : 'Post'}
                    </button>
                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="bg-card border border-border hover:bg-background text-text/60 font-black py-4 px-8 rounded-xl transition uppercase tracking-widest text-[10px] shadow-sm italic">Cancel</button>
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
        .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid var(--color-border) !important; background: var(--color-background); padding: 8px !important; }
        .ql-container.ql-snow { border: none !important; }
        .ql-editor { font-family: inherit; font-size: 1rem; padding: 15px !important; min-height: 150px; }
        .dark .ql-editor *, .dark .ql-editor span { background-color: transparent !important; color: var(--color-text) !important; }
      `}</style>
    </div>
  );
};

export default GroupDetail;
