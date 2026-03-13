import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatsCard from '../components/StatsCard';
import { 
  User, Code, Trophy, Star, Settings, ExternalLink, 
  Github, Link as LinkIcon, Zap, Terminal, RefreshCw, X, Save,
  CheckCircle, XCircle, Clock, BookOpen, ShieldAlert,
  FileText, Monitor, Share2, ChevronUp, ChevronDown, Code2,
  Edit3, Trash2, Plus, ArrowLeft, MessageSquare, Reply, ChevronRight, Heart, Send, Hash
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [myDiscussions, setMyDiscussions] = useState([]);
  const [pendingProjects, setPendingProjects] = useState([]);
  const [expandedProject, setExpandedProject] = useState(null);
  const [expandedPost, setExpandedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  
  const [editFormData, setEditFormData] = useState({
    name: '', email: '', department: '', year: '',
    gfg_profile: '', leetcode_profile: '', github_profile: '', codeforces_profile: ''
  });

  const [projectFormData, setProjectFormData] = useState({
    title: '', description: '', github_link: '', demo_link: '', tech_stack: '', category: 'Web'
  });

  const [postFormData, setPostFormData] = useState({ title: '', content: '', tags: '' });
  const [newComment, setNewComment] = useState('');

  const canModerate = user?.role === 'Admin' || user?.role === 'Core';

  const modules = useMemo(() => ({
    toolbar: [['bold', 'italic', 'underline'], [{'list': 'ordered'}, {'list': 'bullet'}], ['code-block', 'link', 'image'], ['clean']],
  }), []);

  const fetchData = async () => {
    try {
      const [profileRes, activityRes, projectsRes, discussionsRes] = await Promise.all([
        api.get('/users/profile'),
        api.get('/stats/user-activity'),
        api.get('/projects/my-projects'),
        api.get('/discussions')
      ]);
      setProfile(profileRes.data);
      setActivityData(activityRes.data);
      setMyProjects(projectsRes.data);
      setMyDiscussions(discussionsRes.data.filter(d => d.author_id === profileRes.data.id));
      
      if (canModerate) {
          const { data: pending } = await api.get('/projects?status=Pending');
          setPendingProjects(pending);
      }

      setEditFormData({
        name: profileRes.data.name || '',
        email: profileRes.data.email || '',
        department: profileRes.data.department || '',
        year: profileRes.data.year || '',
        gfg_profile: profileRes.data.gfg_profile || '',
        leetcode_profile: profileRes.data.leetcode_profile || '',
        github_profile: profileRes.data.github_profile || '',
        codeforces_profile: profileRes.data.codeforces_profile || ''
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (silent = false) => {
    if (!silent) setSyncing(true);
    try {
      await api.post('/users/sync-profiles');
      await fetchData();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      if (!silent) setSyncing(false);
    }
  };

  useEffect(() => {
    const init = async () => {
        await fetchData();
        handleSync(true);
    };
    init();
  }, [user?.role]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/profile', editFormData);
      await fetchData();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleProjectStatus = async (id, status) => {
      try {
          await api.put(`/projects/${id}/status`, { status });
          if (expandedProject?.id === id) setExpandedProject(null);
          fetchData();
      } catch (error) { alert('Action failed'); }
  };

  const handleEditProject = (project) => {
      setProjectFormData({ title: project.title, description: project.description, github_link: project.github_link || '', demo_link: project.demo_link || '', tech_stack: project.tech_stack || '', category: project.category || 'Web' });
      setIsEditProjectOpen(true);
  };

  const handleUpdateProject = async (e) => {
      e.preventDefault();
      try {
          await api.put(`/projects/${expandedProject.id}`, projectFormData);
          setIsEditProjectOpen(false);
          setExpandedProject(null);
          fetchData();
      } catch (error) { alert('Update failed'); }
  };

  const handleCreatePost = async (e) => {
      e.preventDefault();
      try {
          const tagsArray = postFormData.tags.split(',').map(t => t.trim()).filter(Boolean);
          await api.post('/discussions', { ...postFormData, tags: tagsArray });
          setPostFormData({ title: '', content: '', tags: '' });
          setIsCreatePostOpen(false);
          fetchData();
      } catch (error) { alert('Failed to create post'); }
  };

  const handleOpenPost = async (post) => {
      setExpandedPost(post);
      try {
          const { data } = await api.get(`/discussions/${post.id}/comments`);
          setComments(data);
      } catch (error) { console.error('Failed to fetch comments'); }
  };

  const handleAddComment = async (e, parentId = null) => {
      e.preventDefault();
      if (!newComment.trim()) return;
      try {
          await api.post('/discussions/comments', { postId: expandedPost.id, content: newComment, parentId });
          setNewComment('');
          const { data } = await api.get(`/discussions/${expandedPost.id}/comments`);
          setComments(data);
          fetchData();
      } catch (error) { alert('Comment failed'); }
  };

  const handleDeletePost = async (id) => {
      if (window.confirm('Delete discussion?')) {
          try {
              await api.delete(`/discussions/${id}`);
              setExpandedPost(null);
              fetchData();
          } catch (error) { alert('Delete failed'); }
      }
  };

  const handleReactPost = async (postId) => {
      try {
          await api.post('/discussions/react', { postId });
          fetchData();
          const { data: updatedDiscussions } = await api.get('/discussions');
          const updated = updatedDiscussions.find(d => d.author_id === profile.id && d.id === postId);
          if (updated) setExpandedPost(prev => ({...prev, reaction_count: updated.reaction_count}));
      } catch (error) { console.error('React failed'); }
  };

  const getStatusStyle = (status) => {
      switch(status) {
          case 'Approved': return 'bg-green-500/10 text-green-500 border-green-500/20';
          case 'Declined': return 'bg-red-500/10 text-red-500 border-red-500/20';
          default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      }
  };

  if (loading) return <div className="text-center py-32 text-accent font-bold animate-pulse tracking-widest uppercase">Initializing Hub...</div>;

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 md:px-0 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black flex items-center gap-4 text-white uppercase tracking-tighter">
            Terminal: {profile?.name}
            {syncing && <RefreshCw size={24} className="text-accent animate-spin" />}
          </h1>
          <p className="text-gray-500 mt-1 font-bold text-sm tracking-[0.2em] uppercase">Control Center & Identity</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setIsCreatePostOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition shadow-xl shadow-blue-500/20 text-xs uppercase tracking-widest">
            <Plus size={18} /> New Thread
          </button>
          <button onClick={() => handleSync(false)} disabled={syncing} className="bg-accent hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition shadow-xl shadow-accent/20 disabled:opacity-50 text-xs uppercase tracking-widest text-white">
            <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} /> Sync
          </button>
          <button onClick={() => setIsEditModalOpen(true)} className="bg-card border border-gray-800 px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:border-accent transition text-white text-xs uppercase tracking-widest">
            <Settings size={18} /> Settings
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Problems Solved" value={profile?.problems_solved || 0} icon={Code} color="bg-accent" />
        <StatsCard title="GFG Score" value={profile?.gfg_score || 0} icon={Star} color="bg-yellow-500" />
        <StatsCard title="Daily Streak" value={`${profile?.streak || 0} Days`} icon={Zap} color="bg-orange-500" />
        <StatsCard title="Campus Rank" value={`#${profile?.id || 0}`} icon={Trophy} color="bg-blue-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
            
            {/* MODERATION QUEUE */}
            {canModerate && pendingProjects.length > 0 && (
                <div className="bg-yellow-500/5 border-2 border-yellow-500/20 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3.5 bg-yellow-500/10 rounded-2xl text-yellow-500 border border-yellow-500/20"><ShieldAlert size={28} /></div>
                            <div><h2 className="text-2xl font-black text-white uppercase tracking-tighter">Review Queue</h2><p className="text-[10px] font-black text-yellow-500/60 uppercase tracking-widest">Awaiting Verification</p></div>
                        </div>
                        <span className="bg-yellow-500 text-black px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">{pendingProjects.length} PENDING</span>
                    </div>
                    <div className="space-y-4 relative z-10">
                        {pendingProjects.map(proj => (
                            <div key={proj.id} onClick={() => setExpandedProject(proj)} className="flex items-center justify-between p-6 bg-card/60 border border-gray-800 rounded-3xl cursor-pointer hover:border-yellow-500/50 transition-all group">
                                <div><h4 className="font-bold text-gray-100 text-lg group-hover:text-yellow-500 transition-colors">{proj.title}</h4><p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">By {proj.creator_name} • {proj.category}</p></div>
                                <ExternalLink size={18} className="text-yellow-500 opacity-0 group-hover:opacity-100 transition-all" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ACTIVITY GRAPH */}
            <div className="bg-card border border-gray-800 p-8 rounded-[2.5rem] shadow-sm">
                <h2 className="text-2xl font-black mb-8 text-white uppercase tracking-tighter">Coding Velocity</h2>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityData}>
                        <defs><linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2f8d46" stopOpacity={0.3}/><stop offset="95%" stopColor="#2f8d46" stopOpacity={0}/></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" allowDecimals={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px' }} itemStyle={{ color: '#2f8d46' }} />
                        <Area type="monotone" dataKey="solved" stroke="#2f8d46" fillOpacity={1} fill="url(#colorSolved)" strokeWidth={4} />
                    </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* My Submissions */}
            <div className="bg-card border border-gray-800 p-8 rounded-[2.5rem] shadow-sm">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Project Submissions</h2>
                    <span className="bg-background border border-gray-800 px-4 py-1 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{myProjects.length} Records</span>
                </div>
                {myProjects.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {myProjects.map(proj => (
                            <div key={proj.id} onClick={() => setExpandedProject(proj)} className="flex items-center justify-between p-6 bg-background/50 border border-gray-800 rounded-3xl hover:border-accent transition-all group cursor-pointer">
                                <div className="flex items-center gap-5">
                                    <div className="p-3.5 bg-accent/5 rounded-2xl text-accent border border-accent/10"><BookOpen size={24} /></div>
                                    <div><h4 className="font-bold text-gray-200 text-lg group-hover:text-accent transition-colors">{proj.title}</h4><p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">{proj.category} • {new Date(proj.created_at).toLocaleDateString()}</p></div>
                                </div>
                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest ${getStatusStyle(proj.status)}`}>{proj.status}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center bg-background/30 rounded-[2rem] border border-gray-800 border-dashed"><p className="text-gray-500 font-bold tracking-widest uppercase text-xs">No submissions found.</p></div>
                )}
            </div>

            {/* My Discussions */}
            <div className="bg-card border border-gray-800 p-8 rounded-[2.5rem] shadow-sm">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">My Discussions</h2>
                    <span className="bg-background border border-gray-800 px-4 py-1 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{myDiscussions.length} Threads</span>
                </div>
                {myDiscussions.length > 0 ? (
                    <div className="space-y-4">
                        {myDiscussions.map(post => (
                            <div key={post.id} onClick={() => handleOpenPost(post)} className="flex items-center justify-between p-6 bg-background/50 border border-gray-800 rounded-3xl hover:border-blue-500 transition-all group cursor-pointer">
                                <div className="flex items-center gap-5">
                                    <div className="p-3.5 bg-blue-500/5 rounded-2xl text-blue-400 border border-blue-500/10"><MessageSquare size={24} /></div>
                                    <div><h4 className="font-bold text-gray-200 text-lg group-hover:text-blue-400 transition-colors">{post.title}</h4><p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">{new Date(post.created_at).toLocaleDateString()} • {post.comment_count} Replies</p></div>
                                </div>
                                <ChevronRight size={20} className="text-gray-700 group-hover:text-blue-400 transition-colors" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center bg-background/30 rounded-[2rem] border border-gray-800 border-dashed"><p className="text-gray-500 font-bold tracking-widest uppercase text-xs">No active discussions found.</p></div>
                )}
            </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
            <div className="bg-card border border-gray-800 p-8 rounded-[2.5rem] shadow-sm">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8">Coding Node</h2>
                <div className="space-y-5">
                    {[
                    { name: 'GeeksforGeeks', icon: Code, link: profile?.gfg_profile, solved: profile?.gfg_solved, score: profile?.gfg_score, color: 'text-green-600' },
                    { name: 'LeetCode', icon: Terminal, link: profile?.leetcode_profile, solved: profile?.leetcode_solved, color: 'text-yellow-500' },
                    { name: 'GitHub', icon: Github, link: profile?.github_profile, solved: profile?.github_repos, label: 'Repos', color: 'text-white' }
                    ].map((p, i) => (
                    <div key={i} className="p-5 bg-background border border-gray-800 rounded-[1.5rem] shadow-inner">
                        <div className="flex justify-between items-center mb-4"><div className="flex items-center gap-3"><p.icon className={p.color} size={22} /><span className="font-black text-gray-200 uppercase tracking-tighter text-sm">{p.name}</span></div>{p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-accent transition-colors"><ExternalLink size={18} /></a>}</div>
                        <div className="flex justify-between items-end">
                        <div className="flex flex-col"><span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{p.label || 'Solved'}</span><span className="text-2xl font-black text-accent tracking-tighter">{p.solved || 0}</span></div>
                        {p.score !== undefined && (<div className="flex flex-col items-end"><span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Score</span><span className="text-2xl font-black text-yellow-500 tracking-tighter">{p.score}</span></div>)}
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {expandedPost && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-gray-800 rounded-[3rem] w-full max-w-5xl shadow-2xl relative overflow-hidden my-auto">
              <button onClick={() => setExpandedPost(null)} className="absolute top-8 right-8 z-20 p-3 bg-black/50 hover:bg-black/80 rounded-full text-white transition-all"><X size={28} /></button>
              <div className="p-10 md:p-16 space-y-10">
                    <div className="space-y-6">
                        <h2 className="text-5xl md:text-6xl font-black text-white leading-tight tracking-tighter uppercase">{expandedPost.title}</h2>
                        <div className="flex items-center gap-8 text-gray-500 border-b border-gray-800 pb-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-accent shadow-inner">{expandedPost.author_name?.[0]}</div>
                                <span className="font-bold text-lg text-gray-200">{expandedPost.author_name}</span>
                            </div>
                            <span className="flex items-center gap-2 font-bold"><Clock size={18} /> {new Date(expandedPost.created_at).toLocaleDateString()}</span>
                            <span className="flex items-center gap-2 text-accent font-bold"><Heart size={18} /> {expandedPost.reaction_count || 0} Votes</span>
                        </div>
                    </div>
                    <div className="prose prose-invert prose-accent max-w-none text-gray-300 text-lg leading-relaxed ql-editor !p-0" dangerouslySetInnerHTML={{ __html: expandedPost.content }} />
                    
                    <div className="space-y-8 pt-10 border-t border-gray-800">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Discussion Thread ({comments.length})</h3>
                        <div className="space-y-4">
                            {comments.map(c => (
                                <div key={c.id} className="p-5 bg-background border border-gray-800 rounded-3xl space-y-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-black text-xs text-accent uppercase tracking-tighter">{c.author_name}</span>
                                        <span className="text-[10px] text-gray-600">{new Date(c.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-400">{c.content}</p>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleAddComment} className="flex gap-4">
                            <input className="flex-grow bg-background border border-gray-700 rounded-2xl px-6 py-4 focus:border-accent outline-none text-white font-bold" placeholder="Add to the conversation..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                            <button type="submit" className="bg-accent hover:bg-green-700 text-white px-8 rounded-2xl font-black transition"><Send size={24} /></button>
                        </form>
                    </div>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCreatePostOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="bg-card border border-gray-800 rounded-[2.5rem] w-full max-w-4xl my-auto shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-background/50">
                <h2 className="text-3xl font-black text-white">Start Community Thread</h2>
                <button onClick={() => setIsCreatePostOpen(false)} className="text-gray-400 hover:text-white p-3 hover:bg-gray-800 rounded-full transition-all"><X size={28} /></button>
              </div>
              <form onSubmit={handleCreatePost} className="p-10 space-y-8">
                  <div className="space-y-3">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Thread Topic</label>
                    <input required type="text" className="w-full bg-background border-2 border-gray-800 rounded-2xl py-5 px-8 focus:border-accent outline-none text-xl font-bold text-white shadow-inner" placeholder="What's on your mind?" value={postFormData.title} onChange={(e) => setPostFormData({...postFormData, title: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Content</label>
                    <div className="bg-background rounded-3xl overflow-hidden border-2 border-gray-800 focus-within:border-accent transition"><ReactQuill theme="snow" value={postFormData.content} onChange={(content) => setPostFormData({...postFormData, content})} modules={modules} placeholder="Share the details..." /></div>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Tags (CSV)</label>
                    <div className="relative"><Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={24} /><input type="text" className="w-full bg-background border-2 border-gray-800 rounded-2xl py-5 pl-14 pr-8 focus:border-accent outline-none text-lg font-bold text-white shadow-inner" placeholder="dsa, development, etc" value={postFormData.tags} onChange={(e) => setPostFormData({...postFormData, tags: e.target.value})} /></div>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 px-12 rounded-[1.5rem] transition text-xl shadow-2xl shadow-blue-500/30 uppercase tracking-widest">Publish Discussion</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {expandedProject && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-gray-800 rounded-[3rem] w-full max-w-5xl shadow-2xl relative overflow-hidden my-auto">
              <button onClick={() => setExpandedProject(null)} className="absolute top-8 right-8 z-20 p-3 bg-black/50 hover:bg-black/80 rounded-full text-white transition-all"><X size={28} /></button>
              <div className="p-10 md:p-16 space-y-10">
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex gap-2">
                                <span className="bg-accent/10 text-accent text-xs font-black px-4 py-1.5 rounded-full border border-accent/20 tracking-widest uppercase">{expandedProject.category}</span>
                                <span className={`px-4 py-1.5 rounded-full text-xs font-black border tracking-widest uppercase ${getStatusStyle(expandedProject.status)}`}>{expandedProject.status}</span>
                            </div>
                            {user?.id === expandedProject.created_by && (
                                <button onClick={() => handleEditProject(expandedProject)} className="p-3 bg-background border border-gray-800 rounded-2xl hover:text-accent transition-colors flex items-center gap-2 font-black text-xs uppercase tracking-widest text-gray-400">
                                    <Edit3 size={18} /> Edit Build
                                </button>
                            )}
                        </div>
                        <h2 className="text-5xl md:text-6xl font-black text-white leading-tight uppercase tracking-tighter">{expandedProject.title}</h2>
                        <div className="flex items-center gap-8 text-gray-500 border-b border-gray-800 pb-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-accent shadow-inner">{expandedProject.creator_name?.[0]}</div>
                                <span className="font-bold text-lg text-gray-200">{expandedProject.creator_name}</span>
                            </div>
                            <span className="flex items-center gap-2"><Clock size={18} /> {new Date(expandedProject.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="flex flex-col lg:flex-row gap-16">
                        <div className="flex-grow space-y-12">
                            <div className="space-y-6">
                                <h4 className="text-2xl font-black text-white flex items-center gap-3"><FileText size={24} className="text-accent" /> Project Story</h4>
                                <div className="prose prose-invert prose-accent max-w-none text-gray-300 text-lg leading-relaxed ql-editor !p-0" dangerouslySetInnerHTML={{ __html: expandedProject.description }} />
                            </div>
                            <div className="space-y-6">
                                <h4 className="text-2xl font-black text-white flex items-center gap-3"><Code2 size={24} className="text-accent" /> Built With</h4>
                                <div className="flex flex-wrap gap-3">{expandedProject.tech_stack?.split(',').map((tech, i) => (<span key={i} className="px-6 py-2.5 bg-background border-2 border-gray-800 rounded-2xl text-sm font-black text-gray-400 uppercase tracking-wider">{tech.trim()}</span>))}</div>
                            </div>
                        </div>
                        <div className="lg:w-80 space-y-8 flex-shrink-0">
                            <div className="bg-background/50 border border-gray-800 p-8 rounded-[2.5rem] space-y-6 shadow-inner">
                                <h5 className="font-black text-white uppercase tracking-widest text-[10px]">Reference Links</h5>
                                <div className="space-y-4">
                                    {expandedProject.github_link && (<a href={expandedProject.github_link} target="_blank" className="w-full flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 rounded-2xl border border-gray-700 transition-all text-gray-300 font-bold group"><div className="flex items-center gap-3"><Github size={20} /> Code</div><ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" /></a>)}
                                    {expandedProject.demo_link && (<a href={expandedProject.demo_link} target="_blank" className="w-full flex items-center justify-between p-4 bg-accent/10 hover:bg-accent text-accent hover:text-white rounded-2xl border border-accent/20 transition-all font-bold group"><div className="flex items-center gap-3"><Monitor size={20} /> Live Demo</div><ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" /></a>)}
                                </div>
                            </div>
                            {canModerate && expandedProject.status === 'Pending' && (
                                <div className="space-y-4">
                                    <button onClick={() => handleProjectStatus(expandedProject.id, 'Approved')} className="w-full py-5 bg-accent hover:bg-green-700 text-white rounded-2xl font-black shadow-xl shadow-accent/20 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm">Approve Build</button>
                                    <button onClick={() => handleProjectStatus(expandedProject.id, 'Declined')} className="w-full py-5 bg-red-500/10 border-2 border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl font-black transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm">Decline Submission</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditProjectOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="bg-card border border-gray-800 rounded-[2.5rem] w-full max-w-4xl my-auto shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-background/50">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Edit Project</h2>
                <button onClick={() => setIsEditProjectOpen(false)} className="text-gray-400 hover:text-white p-3 hover:bg-gray-800 rounded-full transition-all"><X size={28} /></button>
              </div>
              <form onSubmit={handleUpdateProject} className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2"><label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Project Title</label><input required type="text" className="w-full bg-background border-2 border-gray-800 rounded-2xl py-5 px-8 focus:border-accent outline-none text-xl font-bold text-white shadow-inner" value={projectFormData.title} onChange={(e) => setProjectFormData({...projectFormData, title: e.target.value})} /></div>
                  <div className="md:col-span-2"><label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Narrative</label><div className="bg-background rounded-3xl overflow-hidden border-2 border-gray-800 focus-within:border-accent transition shadow-inner"><ReactQuill theme="snow" value={projectFormData.description} onChange={(content) => setProjectFormData({...projectFormData, description: content})} modules={modules} /></div></div>
                  <div><label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Stack (CSV)</label><input required type="text" className="w-full bg-background border-2 border-gray-800 rounded-2xl py-5 px-8 focus:border-accent outline-none font-bold text-white" value={projectFormData.tech_stack} onChange={(e) => setProjectFormData({...projectFormData, tech_stack: e.target.value})} /></div>
                  <div><label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Domain</label><select className="w-full bg-background border-2 border-gray-800 rounded-2xl py-5 px-8 focus:border-accent outline-none cursor-pointer font-bold text-white" value={projectFormData.category} onChange={(e) => setProjectFormData({...projectFormData, category: e.target.value})}><option value="Web">Web</option><option value="AI">AI</option><option value="Mobile">Mobile</option><option value="Systems">Systems</option></select></div>
                </div>
                <div className="flex gap-6 pt-4">
                    <button type="submit" className="bg-accent hover:bg-green-700 text-white font-black py-6 px-12 rounded-[1.5rem] transition text-xl flex-grow shadow-2xl shadow-accent/30 uppercase tracking-widest">Update & Resubmit</button>
                    <button type="button" onClick={() => setIsEditProjectOpen(false)} className="bg-gray-800 hover:bg-gray-700 text-white font-black py-6 px-12 rounded-[1.5rem] transition text-xl uppercase tracking-widest">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-gray-800 rounded-[2.5rem] w-full max-w-2xl my-auto shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-background/50">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Identity Matrix</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white p-3 hover:bg-gray-800 rounded-full transition-all"><X size={28} /></button>
              </div>
              <form onSubmit={handleUpdateProfile} className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2"><label className="block text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-1">Full Name</label><input type="text" className="w-full bg-background border-2 border-gray-800 rounded-2xl py-4 px-6 focus:border-accent outline-none text-white font-bold transition shadow-inner" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} /></div>
                    <div className="space-y-2"><label className="block text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] ml-1">Department</label><input type="text" className="w-full bg-background border-2 border-gray-800 rounded-2xl py-4 px-6 focus:border-accent outline-none text-white font-bold transition shadow-inner" value={editFormData.department} onChange={(e) => setEditFormData({...editFormData, department: e.target.value})} /></div>
                </div>
                <div className="space-y-6 pt-4 border-t border-gray-800">
                  <h3 className="font-black text-xl text-white uppercase tracking-tighter">Profile Nodes</h3>
                  <div className="space-y-4">
                    <div><label className="block text-[10px] font-black text-gray-600 uppercase mb-1 ml-1">GfG Profile</label><input type="url" placeholder="https://www.geeksforgeeks.org/profile/username" className="w-full bg-background border-2 border-gray-800 rounded-2xl py-4 px-6 focus:border-accent outline-none text-white font-medium transition shadow-inner" value={editFormData.gfg_profile} onChange={(e) => setEditFormData({...editFormData, gfg_profile: e.target.value})} /></div>
                    <div><label className="block text-[10px] font-black text-gray-600 uppercase mb-1 ml-1">GitHub Profile</label><input type="url" placeholder="https://github.com/username" className="w-full bg-background border-2 border-gray-800 rounded-2xl py-4 px-6 focus:border-accent outline-none text-white font-medium transition shadow-inner" value={editFormData.github_profile} onChange={(e) => setEditFormData({...editFormData, github_profile: e.target.value})} /></div>
                    <div><label className="block text-[10px] font-black text-gray-600 uppercase mb-1 ml-1">LeetCode Profile</label><input type="url" placeholder="https://leetcode.com/u/username/" className="w-full bg-background border-2 border-gray-800 rounded-2xl py-4 px-6 focus:border-accent outline-none text-white font-medium transition shadow-inner" value={editFormData.leetcode_profile} onChange={(e) => setEditFormData({...editFormData, leetcode_profile: e.target.value})} /></div>
                  </div>
                </div>
                <div className="flex gap-6 pt-4">
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-black py-5 rounded-2xl transition uppercase tracking-widest text-xs">Abort</button>
                    <button type="submit" className="flex-1 bg-accent hover:bg-green-700 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition shadow-2xl shadow-accent/30 uppercase tracking-widest text-xs text-white"><Save size={20} /> Deploy Changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .ql-container { border: none !important; font-family: inherit; font-size: 18px; }
        .ql-toolbar { border: none !important; border-bottom: 2px solid #1e293b !important; background: #1e293b; padding: 15px !important; }
        .ql-editor { min-height: 250px; color: #f1f5f9; padding: 30px !important; line-height: 1.8; }
        .ql-snow .ql-stroke { stroke: #94a3b8; stroke-width: 2px; }
        .ql-snow .ql-fill { fill: #94a3b8; }
        .ql-snow .ql-picker { color: #94a3b8; font-weight: 800; }
        .ql-editor.ql-blank::before { color: #334155 !important; left: 30px !important; font-style: normal; font-weight: 700; }
        .ql-snow .ql-picker-options { background-color: #1e293b; border: 2px solid #334155; border-radius: 12px; }
      `}</style>
    </div>
  );
};

export default Dashboard;
