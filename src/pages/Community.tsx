import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMessage, faSearch, faPlus, faTimes, faSave, faHashtag, faTrashAlt, faUsers, faShieldAlt, faLock, faGlobe, faArrowRight, faUserPlus, faCheckCircle, faClock 
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import MarkdownEditor from '../components/MarkdownEditor';
import MarkdownRenderer from '../components/MarkdownRenderer';

const Community = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' or 'groups'
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  
  // Create Post State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' });
  
  // Create Group State
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({ title: '', description: '', logo: '', max_members: 100, allow_guests: false });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCreateGroup = user?.role === 'Admin' || user?.role === 'Core';

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

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/groups');
      setGroups(data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'feed') fetchPosts();
    else fetchGroups();
  }, [activeTab, selectedTag]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('new') === 'true' && user) {
      setIsCreateModalOpen(true);
      window.history.replaceState({}, '', '/community');
    }
  }, [location.search, user]);

  const handleOpenPost = (post) => {
    navigate(`/community/${post.id}`);
  };

  const handleDeletePost = async (e, postId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/discussions/${postId}`);
      fetchPosts();
    } catch (error) {
      alert('Deletion failed');
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    
    if (user?.role === 'Guest' && activeTab === 'groups') {
      alert('Guest users are restricted to posting in the main feed only.');
      return;
    }

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

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroup.title.trim()) return;
    setIsSubmitting(true);
    try {
      await api.post('/groups', newGroup);
      setIsGroupModalOpen(false);
      setNewGroup({ title: '', description: '', logo: '', max_members: 100, allow_guests: false });
      fetchGroups();
    } catch (error) {
      alert('Group creation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinGroup = async (e, groupId) => {
    e.stopPropagation();
    if (!user) return navigate('/login');
    try {
      await api.post('/groups/join', { groupId });
      alert('Join request sent to the group organizer');
      fetchGroups();
    } catch (error) {
      alert(error.response?.data?.message || 'Join request failed');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl space-y-8 pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <h1 className="text-3xl md:text-4xl font-black text-text tracking-tighter uppercase italic">
            Community <span className="text-accent">Hub</span>
          </h1>
          <p className="text-text/60 text-sm max-w-2xl font-medium italic">Share your thoughts or join interest groups.</p>
        </motion.div>
        
        <div className="flex gap-3">
            {canCreateGroup && user?.role !== 'Guest' && (
                <button 
                    onClick={() => setIsGroupModalOpen(true)}
                    className="bg-card border border-border hover:border-accent text-text/60 hover:text-accent px-5 py-2.5 rounded-xl font-black flex items-center gap-2 transition shadow-sm text-[10px] uppercase tracking-widest active:scale-95"
                >
                    <FontAwesomeIcon icon={faShieldAlt} /> Create Group
                </button>
            )}
            {user && (
            <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-accent hover:bg-gfg-green-hover text-white px-5 py-2.5 rounded-xl font-black flex items-center gap-2 transition shadow-lg shadow-accent/10 text-[10px] uppercase tracking-widest active:scale-95"
            >
                <FontAwesomeIcon icon={faPlus} /> {activeTab === 'groups' ? 'Join Group' : 'Post'}
            </button>
            )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-6">
        <button 
            onClick={() => setActiveTab('feed')}
            className={`pb-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'feed' ? 'text-accent' : 'text-text/30 hover:text-text/60'}`}
        >
            Feed
            {activeTab === 'feed' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-0.5 bg-accent rounded-full" />}
        </button>
        <button 
            onClick={() => setActiveTab('groups')}
            className={`pb-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'groups' ? 'text-accent' : 'text-text/30 hover:text-text/60'}`}
        >
            Groups
            {activeTab === 'groups' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-0.5 bg-accent rounded-full" />}
        </button>
      </div>

      {activeTab === 'feed' ? (
        <>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow group">
                <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-text/30 group-focus-within:text-accent transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search posts..." 
                    className="w-full bg-card border border-border rounded-xl py-3 pl-11 pr-4 focus:border-accent outline-none transition shadow-sm text-text font-medium text-sm italic"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchPosts()}
                />
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {['All', 'DSA', 'Development', 'Jobs', 'Resources'].map(tag => (
                    <button key={tag} onClick={() => setSelectedTag(tag === 'All' ? null : tag)} className={`px-4 py-1.5 rounded-lg text-[9px] font-black border transition uppercase tracking-widest whitespace-nowrap ${selectedTag === tag || (tag === 'All' && !selectedTag) ? 'bg-accent border-accent text-white shadow-md' : 'bg-card border-border text-text/40 hover:border-accent/40 hover:text-accent'}`}>
                    {tag}
                    </button>
                ))}
                </div>
            </div>

            {loading ? (
                <div className="py-24 text-center text-accent font-black tracking-widest uppercase animate-pulse text-xs italic">Loading...</div>
            ) : posts.length > 0 ? (
                <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }} className="grid grid-cols-1 gap-4">
                {posts.map(post => (
                    <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -2, borderColor: 'var(--color-accent)' }} key={post.id} onClick={() => handleOpenPost(post)} className="bg-card border border-border rounded-3xl p-6 hover:shadow-lg transition-all group cursor-pointer flex flex-col md:flex-row gap-6 shadow-sm italic">
                    <div className="hidden md:flex flex-col items-center gap-3 text-text/30 min-w-[80px] border-r border-border/50 pr-6">
                        <Link to={`/profile/${post.author_id}`} onClick={(e) => e.stopPropagation()} className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform mb-1 italic">
                            {post.author_pic ? (
                                <img src={post.author_pic} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <span className="text-xl font-black text-accent">{post.author_name[0]}</span>
                            )}
                        </Link>
                        <div className="text-center">
                            <p className="text-xl font-black text-text group-hover:text-accent transition-colors">{post.reaction_count || 0}</p>
                            <p className="text-[8px] font-black uppercase tracking-widest">votes</p>
                        </div>
                        <div className={`text-center p-2 rounded-xl border w-full transition-all ${post.comment_count > 0 ? 'border-accent/30 bg-accent/5 text-accent' : 'border-border'}`}>
                            <p className="text-base font-black">{post.comment_count || 0}</p>
                            <p className="text-[7px] font-black uppercase tracking-widest">replies</p>
                        </div>
                    </div>
                    <div className="flex-grow min-w-0 space-y-3">
                        <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-text/40 italic">
                            <Link to={`/profile/${post.author_id}`} onClick={(e) => e.stopPropagation()} className="text-accent hover:underline">{post.author_name}</Link>
                            <span className="w-1 h-1 bg-text/20 rounded-full"></span>
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                        {(user?.id === post.author_id || user?.role === 'Admin' || user?.role === 'Core') && (
                            <button onClick={(e) => handleDeletePost(e, post.id)} className="text-text/20 hover:text-red-500 transition-colors p-1.5 active:scale-90"><FontAwesomeIcon icon={faTrashAlt} /></button>
                        )}
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-text group-hover:text-accent transition-colors leading-tight tracking-tight uppercase break-words italic">{post.title}</h2>
                        <div className="text-text/60 text-xs line-clamp-3 leading-relaxed font-medium break-words overflow-hidden italic">
                            <MarkdownRenderer content={post.content} />
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {post.tags?.split(',').map((tag, i) => (
                            <span key={i} className="text-[8px] font-black uppercase text-accent bg-accent/5 px-2 py-0.5 rounded-md border border-accent/10 tracking-widest italic">#{tag.trim()}</span>
                            ))}
                        </div>
                    </div>
                    </motion.div>
                ))}
                </motion.div>
            ) : (
                <div className="py-32 text-center text-text/30 bg-card rounded-3xl border border-border border-dashed shadow-inner">
                <FontAwesomeIcon icon={faMessage} size="4x" className="mx-auto mb-4 opacity-5" />
                <p className="text-xl font-black uppercase tracking-widest italic">No posts found</p>
                </div>
            )}
        </>
      ) : (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.filter(g => user?.role !== 'Guest' || g.allow_guests).map(group => (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -4 }}
                        key={group.id}
                        onClick={() => group.user_status === 'Accepted' && navigate(`/groups/${group.id}`)}
                        className={`bg-card border p-6 rounded-3xl flex flex-col space-y-4 transition-all duration-500 shadow-sm hover:shadow-xl group ${group.user_status === 'Accepted' ? 'border-accent/30 cursor-pointer' : 'border-border'}`}
                    >
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform italic">
                                {group.logo ? <img src={group.logo} className="w-8 h-8 object-contain" alt="" /> : <FontAwesomeIcon icon={faUsers} className="text-accent" />}
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                                <span className="text-[8px] font-black text-text/40 uppercase tracking-widest flex items-center gap-1 bg-background px-2 py-0.5 rounded-full border border-border italic">
                                    <FontAwesomeIcon icon={faUsers} className="text-accent text-[7px]" /> {group.member_count}/{group.max_members}
                                </span>
                                {group.allow_guests ? (
                                    <span className="text-[7px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1 bg-blue-500/5 px-2 py-0.5 rounded-full border border-blue-500/10 italic"><FontAwesomeIcon icon={faGlobe} /> Open</span>
                                ) : (
                                    <span className="text-[7px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1 bg-red-500/5 px-2 py-0.5 rounded-full border border-red-500/10 italic"><FontAwesomeIcon icon={faLock} /> Closed</span>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2 flex-grow">
                            <h3 className="text-lg font-black text-text uppercase tracking-tight group-hover:text-accent transition-colors italic">{group.title}</h3>
                            <p className="text-text/50 text-xs line-clamp-2 font-medium leading-relaxed italic">{group.description}</p>
                        </div>
                        <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[7px] font-black text-text/20 uppercase tracking-widest">Leader</span>
                                <span className="text-[9px] font-black text-text/60 uppercase italic">{group.creator_name}</span>
                            </div>
                            
                            {group.user_status === 'Accepted' ? (
                                <button className="bg-accent/10 text-accent text-[8px] font-black px-3 py-1.5 rounded-lg border border-accent/20 uppercase tracking-widest flex items-center gap-1.5 group-hover:bg-accent group-hover:text-white transition-all">
                                    Enter <FontAwesomeIcon icon={faArrowRight} />
                                </button>
                            ) : group.user_status === 'Pending' ? (
                                <span className="text-yellow-500 text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 bg-yellow-500/5 px-3 py-1.5 rounded-lg border border-yellow-500/10 italic">
                                    Pending...
                                </span>
                            ) : (
                                <button 
                                    onClick={(e) => handleJoinGroup(e, group.id)}
                                    className="bg-card border border-border hover:border-accent text-text/40 hover:text-accent text-[8px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest flex items-center gap-1.5 transition-all active:scale-95 italic"
                                >
                                    Join
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
            {groups.length === 0 && (
                <div className="py-32 text-center text-text/30 bg-card rounded-3xl border border-border border-dashed shadow-inner">
                    <FontAwesomeIcon icon={faShieldAlt} size="4x" className="mx-auto mb-4 opacity-5" />
                    <p className="text-xl font-black uppercase tracking-widest italic">No groups active</p>
                </div>
            )}
        </div>
      )}

      {/* Group Modal */}
      <AnimatePresence>
        {isGroupModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-xl overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-border rounded-3xl w-full max-w-4xl my-auto shadow-2xl overflow-hidden">
              <div className="p-6 md:p-8 border-b border-border flex justify-between items-center bg-background/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg text-accent"><FontAwesomeIcon icon={faShieldAlt} /></div>
                    <h2 className="text-xl font-black text-text uppercase tracking-tighter italic">Create Group</h2>
                </div>
                <button onClick={() => setIsGroupModalOpen(false)} className="text-text/40 hover:text-red-500 p-1.5 rounded-full transition-all active:scale-90"><FontAwesomeIcon icon={faTimes} size="lg" /></button>
              </div>
              <form onSubmit={handleCreateGroup} className="p-6 md:p-10 space-y-6 overflow-y-auto max-h-[75vh] custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-2">
                        <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-2">Group Title</label>
                        <input required type="text" className="w-full bg-background border-2 border-border rounded-xl py-3 px-5 focus:border-accent outline-none text-text font-black text-lg transition shadow-inner italic" placeholder="e.g. Development Team" value={newGroup.title} onChange={(e) => setNewGroup({...newGroup, title: e.target.value})} />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <MarkdownEditor 
                            label="Description"
                            value={newGroup.description}
                            onChange={(val) => setNewGroup({...newGroup, description: val})}
                            placeholder="Group mission, rules, and focus..."
                            minHeight="200px"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-2">Capacity</label>
                        <input type="number" className="w-full bg-background border-2 border-border rounded-xl py-3 px-5 focus:border-accent outline-none text-text font-black text-lg transition shadow-inner italic" value={newGroup.max_members} onChange={(e) => setNewGroup({...newGroup, max_members: parseInt(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-2">Logo URL</label>
                        <input type="url" className="w-full bg-background border-2 border-border rounded-xl py-3 px-5 focus:border-accent outline-none text-text font-bold transition shadow-inner text-xs" placeholder="https://..." value={newGroup.logo} onChange={(e) => setNewGroup({...newGroup, logo: e.target.value})} />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-3 bg-background/50 p-4 rounded-xl border border-border">
                        <input type="checkbox" id="allow_guests" checked={newGroup.allow_guests} onChange={(e) => setNewGroup({...newGroup, allow_guests: e.target.checked})} className="w-5 h-5 rounded bg-background border-2 border-border text-accent focus:ring-accent italic" />
                        <label htmlFor="allow_guests" className="text-[10px] font-black text-text/60 uppercase tracking-widest cursor-pointer select-none italic">Allow Guest Members</label>
                    </div>
                </div>

                <div className="flex gap-4 pt-2">
                    <button type="submit" disabled={isSubmitting} className="flex-grow bg-accent hover:bg-gfg-green-hover text-white font-black py-4 rounded-xl transition shadow-xl uppercase tracking-widest text-[10px] active:scale-[0.98] disabled:opacity-50">
                        <FontAwesomeIcon icon={faSave} /> Create
                    </button>
                    <button type="button" onClick={() => setIsGroupModalOpen(false)} className="bg-card border border-border hover:bg-background text-text/60 font-black py-4 px-8 rounded-xl transition uppercase tracking-widest text-[10px] shadow-sm italic">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Post Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-xl overflow-y-auto">
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
                  <input required type="text" className="w-full bg-background border-2 border-border rounded-xl py-3 px-5 focus:border-accent outline-none text-text font-black text-lg transition shadow-inner italic" placeholder="Post title..." value={newPost.title} onChange={(e) => setNewPost({...newPost, title: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <MarkdownEditor 
                    label="Content"
                    value={newPost.content}
                    onChange={(content) => setNewPost({...newPost, content})}
                    placeholder="Share your thoughts, ask a question, or post a resource..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-2">Tags</label>
                  <div className="relative">
                      <FontAwesomeIcon icon={faHashtag} className="absolute left-4 top-1/2 -translate-y-1/2 text-text/20 text-xs"/>
                      <input type="text" className="w-full bg-background border-2 border-border rounded-xl py-3 px-10 focus:border-accent outline-none text-text font-black text-sm transition shadow-inner italic" placeholder="logic, development" value={newPost.tags} onChange={(e) => setNewPost({...newPost, tags: e.target.value})} />
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                    <button type="submit" disabled={isSubmitting} className="flex-grow bg-accent hover:bg-gfg-green-hover text-white font-black py-4 rounded-xl transition shadow-xl uppercase tracking-widest text-[10px] active:scale-[0.98] disabled:opacity-50">
                        <FontAwesomeIcon icon={faSave} /> Publish Post
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
        .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid var(--color-border) !important; background: var(--color-background); }
        .ql-container.ql-snow { border: none !important; }
        .ql-editor { font-family: inherit; font-size: 1rem; min-height: 150px; }
        .dark .ql-editor *, .dark .ql-editor span { background-color: transparent !important; color: var(--color-text) !important; }
      `}</style>
    </div>
  );
};

export default Community;
