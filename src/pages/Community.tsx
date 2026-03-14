import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, Search, Plus, X, Save, Hash, Trash2, Users, Shield, Lock, Globe, ArrowRight, UserPlus, CheckCircle2, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

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
    if (!window.confirm('Terminate this transmission?')) return;
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
      alert('Guest entities are restricted to public broadcasting in the main feed only.');
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
      alert('Join request sent to the architect');
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
          <p className="text-text/60 text-sm max-w-2xl font-medium italic">Broadcast your signal or join exclusive sectors.</p>
        </motion.div>
        
        <div className="flex gap-3">
            {canCreateGroup && user?.role !== 'Guest' && (
                <button 
                    onClick={() => setIsGroupModalOpen(true)}
                    className="bg-card border border-border hover:border-accent text-text/60 hover:text-accent px-5 py-2.5 rounded-xl font-black flex items-center gap-2 transition shadow-sm text-[10px] uppercase tracking-widest active:scale-95"
                >
                    <Plus size={16} /> Create Community
                </button>
            )}
            {user && (
            <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-accent hover:bg-gfg-green-hover text-white px-5 py-2.5 rounded-xl font-black flex items-center gap-2 transition shadow-lg shadow-accent/10 text-[10px] uppercase tracking-widest active:scale-95"
            >
                <Plus size={16} /> {activeTab === 'groups' ? 'Request Ingress' : 'Start Discussion'}
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
            Broadcast Feed
            {activeTab === 'feed' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-0.5 bg-accent rounded-full" />}
        </button>
        <button 
            onClick={() => setActiveTab('groups')}
            className={`pb-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'groups' ? 'text-accent' : 'text-text/30 hover:text-text/60'}`}
        >
            Matrix Sectors
            {activeTab === 'groups' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-0.5 bg-accent rounded-full" />}
        </button>
      </div>

      {activeTab === 'feed' ? (
        <>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text/30 group-focus-within:text-accent transition-colors" size={18} />
                <input 
                    type="text" 
                    placeholder="Search transmissions..." 
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
                <div className="py-24 text-center text-accent font-black tracking-widest uppercase animate-pulse text-xs">Scanning Frequencies...</div>
            ) : posts.length > 0 ? (
                <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }} className="grid grid-cols-1 gap-4">
                {posts.map(post => (
                    <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -2, borderColor: 'var(--color-accent)' }} key={post.id} onClick={() => handleOpenPost(post)} className="bg-card border border-border rounded-3xl p-6 hover:shadow-lg transition-all group cursor-pointer flex flex-col md:flex-row gap-6 shadow-sm">
                    <div className="hidden md:flex flex-col items-center gap-3 text-text/30 min-w-[80px] border-r border-border/50 pr-6">
                        <Link to={`/profile/${post.author_id}`} className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform mb-1">
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
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-text/40">
                            <Link to={`/profile/${post.author_id}`} onClick={(e) => e.stopPropagation()} className="text-accent hover:underline">{post.author_name}</Link>
                            <span className="w-1 h-1 bg-text/20 rounded-full"></span>
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                        {(user?.id === post.author_id || user?.role === 'Admin' || user?.role === 'Core') && (
                            <button onClick={(e) => handleDeletePost(e, post.id)} className="text-text/20 hover:text-red-500 transition-colors p-1.5"><Trash2 size={14} /></button>
                        )}
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-text group-hover:text-accent transition-colors leading-tight tracking-tight uppercase break-words italic">{post.title}</h2>
                        <div className="text-text/60 text-xs line-clamp-2 leading-relaxed font-medium break-words overflow-hidden" dangerouslySetInnerHTML={{ __html: post.content }} />
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {post.tags?.split(',').map((tag, i) => (
                            <span key={i} className="text-[8px] font-black uppercase text-accent bg-accent/5 px-2 py-0.5 rounded-md border border-accent/10 tracking-widest">#{tag.trim()}</span>
                            ))}
                        </div>
                    </div>
                    </motion.div>
                ))}
                </motion.div>
            ) : (
                <div className="py-32 text-center text-text/30 bg-card rounded-3xl border border-border border-dashed shadow-inner">
                <MessageSquare size={64} className="mx-auto mb-4 opacity-5" />
                <p className="text-xl font-black uppercase tracking-widest italic">Feed Static</p>
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
                            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                {group.logo ? <img src={group.logo} className="w-8 h-8 object-contain" alt="" /> : <Users size={24} className="text-accent" />}
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                                <span className="text-[8px] font-black text-text/40 uppercase tracking-widest flex items-center gap-1 bg-background px-2 py-0.5 rounded-full border border-border">
                                    <Users size={10} className="text-accent" /> {group.member_count}/{group.max_members}
                                </span>
                                {group.allow_guests ? (
                                    <span className="text-[7px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1 bg-blue-500/5 px-2 py-0.5 rounded-full border border-blue-500/10"><Globe size={8} /> Open Node</span>
                                ) : (
                                    <span className="text-[7px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1 bg-red-500/5 px-2 py-0.5 rounded-full border border-red-500/10"><Lock size={8} /> Restricted</span>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2 flex-grow">
                            <h3 className="text-lg font-black text-text uppercase tracking-tight group-hover:text-accent transition-colors italic">{group.title}</h3>
                            <p className="text-text/50 text-xs line-clamp-2 font-medium leading-relaxed italic">{group.description}</p>
                        </div>
                        <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[7px] font-black text-text/20 uppercase tracking-widest">Architect</span>
                                <span className="text-[9px] font-black text-text/60 uppercase">{group.creator_name}</span>
                            </div>
                            
                            {group.user_status === 'Accepted' ? (
                                <button className="bg-accent/10 text-accent text-[8px] font-black px-3 py-1.5 rounded-lg border border-accent/20 uppercase tracking-widest flex items-center gap-1.5 group-hover:bg-accent group-hover:text-white transition-all">
                                    Enter <ArrowRight size={12} />
                                </button>
                            ) : group.user_status === 'Pending' ? (
                                <span className="text-yellow-500 text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 bg-yellow-500/5 px-3 py-1.5 rounded-lg border border-yellow-500/10 italic">
                                    Syncing...
                                </span>
                            ) : (
                                <button 
                                    onClick={(e) => handleJoinGroup(e, group.id)}
                                    className="bg-card border border-border hover:border-accent text-text/40 hover:text-accent text-[8px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest flex items-center gap-1.5 transition-all active:scale-95"
                                >
                                    Access
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
            {groups.length === 0 && (
                <div className="py-32 text-center text-text/30 bg-card rounded-3xl border border-border border-dashed shadow-inner">
                    <Shield size={64} className="mx-auto mb-4 opacity-5" />
                    <p className="text-xl font-black uppercase tracking-widest italic">No Sectors</p>
                </div>
            )}
        </div>
      )}

      {/* Create Group Modal */}
      <AnimatePresence>
        {isGroupModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-xl overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-border rounded-[3.5rem] w-full max-w-4xl my-auto shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-border flex justify-between items-center bg-background/50">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent/10 rounded-xl text-accent"><Shield size={24} /></div>
                    <div>
                        <h2 className="text-3xl font-black text-text uppercase tracking-tighter italic">Establish Sector</h2>
                        <p className="text-[10px] font-black text-text/40 uppercase tracking-widest">Configure a new protected community node</p>
                    </div>
                </div>
                <button onClick={() => setIsGroupModalOpen(false)} className="text-text/40 hover:text-red-500 p-2 rounded-full transition-all active:scale-90"><X size={32} /></button>
              </div>
              <form onSubmit={handleCreateGroup} className="p-8 md:p-12 space-y-8 overflow-y-auto max-h-[75vh] custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2 space-y-3">
                        <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.3em] ml-2">Sector Title</label>
                        <input required type="text" className="w-full bg-background border-2 border-border rounded-2xl py-5 px-8 focus:border-accent outline-none text-text font-black text-xl transition shadow-inner italic" placeholder="e.g. SYSTEMS ARCHITECTURE" value={newGroup.title} onChange={(e) => setNewGroup({...newGroup, title: e.target.value})} />
                    </div>
                    <div className="md:col-span-2 space-y-3">
                        <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.3em] ml-2">Node Description</label>
                        <textarea required rows={4} className="w-full bg-background border-2 border-border rounded-2xl py-5 px-8 focus:border-accent outline-none text-text font-medium text-lg transition shadow-inner resize-none italic" placeholder="Define the operational scope of this community..." value={newGroup.description} onChange={(e) => setNewGroup({...newGroup, description: e.target.value})} />
                    </div>
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.3em] ml-2">Capacity Limit</label>
                        <input type="number" className="w-full bg-background border-2 border-border rounded-2xl py-5 px-8 focus:border-accent outline-none text-text font-black text-xl transition shadow-inner" value={newGroup.max_members} onChange={(e) => setNewGroup({...newGroup, max_members: parseInt(e.target.value)})} />
                    </div>
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.3em] ml-2">Logo Node URL</label>
                        <input type="url" className="w-full bg-background border-2 border-border rounded-2xl py-5 px-8 focus:border-accent outline-none text-text font-bold transition shadow-inner" placeholder="https://..." value={newGroup.logo} onChange={(e) => setNewGroup({...newGroup, logo: e.target.value})} />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-4 bg-background/50 p-6 rounded-2xl border border-border">
                        <input type="checkbox" id="allow_guests" checked={newGroup.allow_guests} onChange={(e) => setNewGroup({...newGroup, allow_guests: e.target.checked})} className="w-6 h-6 rounded bg-background border-2 border-border text-accent focus:ring-accent" />
                        <label htmlFor="allow_guests" className="text-xs font-black text-text/60 uppercase tracking-widest cursor-pointer select-none italic">Allow Public View (Guest Sync)</label>
                    </div>
                </div>

                <div className="flex gap-6 pt-6 sticky bottom-0 bg-card/80 backdrop-blur-md">
                    <button type="submit" disabled={isSubmitting} className="flex-grow bg-accent hover:bg-gfg-green-hover text-white font-black py-6 rounded-[1.5rem] flex items-center justify-center gap-4 transition shadow-2xl shadow-accent/20 uppercase tracking-widest text-sm active:scale-[0.98] disabled:opacity-50">
                        {isSubmitting ? 'Establishing...' : <><Save size={24} /> Initialize Sector</>}
                    </button>
                    <button type="button" onClick={() => setIsGroupModalOpen(false)} className="flex-grow bg-card border border-border hover:bg-background text-text/60 font-black py-6 rounded-[1.5rem] transition uppercase tracking-widest text-xs shadow-sm">Abort</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                  <input required type="text" className="w-full bg-background border-2 border-border rounded-2xl py-5 px-8 focus:border-accent outline-none text-text font-black text-xl transition shadow-inner italic" placeholder="Enter a compelling title..." value={newPost.title} onChange={(e) => setNewPost({...newPost, title: e.target.value})} />
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
        .dark .ql-editor *, .dark .ql-editor span { background-color: transparent !important; color: var(--color-text) !important; }
      `}</style>
    </div>
  );
};

export default Community;
