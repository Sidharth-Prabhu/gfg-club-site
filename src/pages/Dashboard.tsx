import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatsCard from '../components/StatsCard';
import { 
  User, Code, Trophy, Star, Settings, ExternalLink, 
  Github, Link as LinkIcon, Zap, Terminal, RefreshCw, X, Save,
  ShieldAlert, Shield, BookOpen, FileText, Monitor, ChevronRight, MessageSquare, Plus, ArrowLeft, Hash, Sparkles, TrendingUp, UserPlus, Check, Trash2, Calendar, Edit3, Globe
} from 'lucide-react';
import { CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [myDiscussions, setMyDiscussions] = useState([]);
  const [pendingProjects, setPendingProjects] = useState([]);
  const [groupRequests, setGroupRequests] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [editFormData, setEditFormData] = useState({
    name: '', email: '', department: '', year: '', gfg_profile: '', leetcode_profile: '', codeforces_profile: '', github_profile: ''
  });

  const canModerate = user?.role === 'Admin' || user?.role === 'Core';

  const fetchData = async () => {
    setLoading(true);
    try {
      const safeGet = async (url) => {
        try {
          return await api.get(url);
        } catch (e) {
          console.error(`Failed to fetch ${url}:`, e);
          return null;
        }
      };

      const [profileRes, activityRes, projectsRes, discussionsRes, invRes, regRes, groupReqRes] = await Promise.all([
        safeGet('/users/profile'),
        safeGet('/stats/user-activity'),
        safeGet('/projects/my-projects'),
        safeGet('/discussions'),
        safeGet('/events/invitations'),
        safeGet('/events/my-registrations'),
        safeGet('/groups/pending-requests')
      ]);

      if (profileRes) setProfile(profileRes.data);
      if (activityRes) setActivityData(activityRes.data);
      if (projectsRes) setMyProjects(projectsRes.data);
      if (groupReqRes) setGroupRequests(groupReqRes.data);
      
      if (discussionsRes && Array.isArray(discussionsRes.data) && profileRes) {
        setMyDiscussions(discussionsRes.data.filter(d => d.author_id === profileRes.data.id));
      }
      
      if (invRes) setInvitations(invRes.data);
      if (regRes) setRegistrations(regRes.data);
      
      if (canModerate) {
          const pendingRes = await safeGet('/projects?status=Pending');
          if (pendingRes) setPendingProjects(pendingRes.data);
      }

      if (profileRes) {
        setEditFormData({
          name: profileRes.data.name || '',
          email: profileRes.data.email || '',
          department: profileRes.data.department || '',
          year: profileRes.data.year || '',
          gfg_profile: profileRes.data.gfg_profile || '',
          leetcode_profile: profileRes.data.leetcode_profile || '',
          codeforces_profile: profileRes.data.codeforces_profile || '',
          github_profile: profileRes.data.github_profile || ''
        });
      }
    } catch (error) {
      console.error('Fatal error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.role]);

  const handleRespondInv = async (regId, response) => {
      try {
          await api.post('/events/invitations/respond', { regId, response });
          fetchData();
      } catch (error) {
          alert('Action failed');
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

  const handleRespondGroupRequest = async (requestId, status) => {
    try {
        await api.post('/groups/respond-request', { requestId, status });
        fetchData();
    } catch (error) {
        alert('Action failed');
    }
  };

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

  const handleDeletePost = async (id) => {
      if (window.confirm('Delete this transmission from matrix history?')) {
          try {
              await api.delete(`/discussions/${id}`);
              fetchData();
          } catch (error) { alert('Termination failed'); }
      }
  };

  const handleDeleteProjectFromDashboard = async (id) => {
    if (window.confirm('Terminate this project build from registry?')) {
        try {
            await api.delete(`/projects/${id}`);
            fetchData();
        } catch (error) { alert('Termination failed'); }
    }
  };

  const getStatusStyle = (status) => {
      switch(status) {
          case 'Approved': return 'bg-green-500/10 text-green-500 border-green-500/20';
          case 'Declined': return 'bg-red-500/10 text-red-500 border-red-500/20';
          default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      }
  };

  if (loading) return <div className="text-center py-40 text-accent font-black tracking-[0.3em] uppercase animate-pulse text-xl italic">Synchronizing Terminal...</div>;

  return (
    <div className="container mx-auto px-4 py-8 space-y-12 max-w-7xl pb-20">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-border pb-10">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black text-text tracking-tighter uppercase italic">Terminal <span className="text-accent">Node</span>: {profile?.name}</h1>
          <p className="text-text/40 font-black text-xs tracking-[0.3em] uppercase flex items-center gap-2"><Sparkles size={14} className="text-accent" /> Control Center & Core Identity</p>
        </div>
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <Link to="/community?new=true" className="flex-1 lg:flex-none bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition shadow-xl shadow-blue-500/20 text-xs uppercase tracking-widest active:scale-95">
            <Plus size={20} /> New Discussion
          </Link>
          <button onClick={() => handleSync(false)} disabled={syncing} className="flex-1 lg:flex-none bg-accent hover:bg-gfg-green-hover text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition shadow-xl shadow-accent/20 text-xs uppercase tracking-widest active:scale-95 disabled:opacity-50">
            <RefreshCw size={20} className={syncing ? 'animate-spin' : ''} /> Sync Matrix
          </button>
          <button onClick={() => setIsEditModalOpen(true)} className="flex-1 lg:flex-none bg-card border border-border px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:border-accent transition text-text/60 hover:text-accent text-xs uppercase tracking-widest shadow-sm active:scale-95">
            <Settings size={20} /> Config
          </button>
        </div>
      </motion.div>

      {/* Invitations Queue */}
      <AnimatePresence>
          {invitations.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-blue-500/5 border border-blue-500/20 p-8 rounded-[2.5rem] shadow-xl space-y-6 overflow-hidden">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20"><UserPlus size={24} /></div>
                      <h2 className="text-2xl font-black text-text uppercase tracking-tight italic">Pending Transmissions</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {invitations.map(inv => (
                          <div key={inv.reg_id} className="bg-card border border-border p-6 rounded-2xl space-y-4 shadow-sm hover:border-blue-500/50 transition-colors">
                              <div>
                                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Team Invitation</p>
                                  <h4 className="font-black text-text uppercase italic">{inv.team_name}</h4>
                                  <p className="text-[9px] font-bold text-text/40 uppercase tracking-widest mt-1">For: {inv.event_title}</p>
                                  <p className="text-[9px] font-bold text-text/40 uppercase tracking-widest">By: {inv.inviter_name}</p>
                              </div>
                              <div className="flex gap-3">
                                  <button onClick={() => handleRespondInv(inv.reg_id, 'Accepted')} className="flex-1 bg-accent/10 hover:bg-accent text-accent hover:text-white border border-accent/20 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"><Check size={14} className="inline mr-1" /> Accept</button>
                                  <button onClick={() => handleRespondInv(inv.reg_id, 'Declined')} className="flex-1 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/10 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"><Trash2 size={14} className="inline mr-1" /> Decline</button>
                              </div>
                          </div>
                      ))}
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

      {/* Group Join Requests */}
      {groupRequests.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 bg-blue-500/5 border border-blue-500/20 p-10 rounded-[3rem] shadow-xl shadow-blue-500/5 mb-12">
              <div className="flex items-center gap-4">
                  <Shield size={28} className="text-blue-500" />
                  <h3 className="text-3xl font-black text-text uppercase italic tracking-tight">Group Ingress Requests</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {groupRequests.map((req) => (
                      <div key={req.id} className="bg-card border border-border p-8 rounded-[2rem] flex flex-col justify-between gap-8 shadow-lg hover:border-blue-500/30 transition-all">
                          <div className="flex items-center gap-5">
                              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-black border border-blue-500/20 text-xl shadow-inner">
                                  {req.user_name[0]}
                              </div>
                              <div className="space-y-1">
                                  <h4 className="text-xl font-black text-text uppercase italic tracking-tight">{req.user_name}</h4>
                                  <p className="text-[10px] text-text/40 font-black uppercase tracking-widest leading-loose">Requests access to <br/><span className="text-blue-400">{req.group_title}</span></p>
                              </div>
                          </div>
                          <div className="flex gap-4">
                              <button 
                                  onClick={() => handleRespondGroupRequest(req.id, 'Accepted')}
                                  className="flex-grow bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95"
                              >
                                  <Check size={16} /> Grant Entry
                              </button>
                              <button 
                                  onClick={() => handleRespondGroupRequest(req.id, 'Declined')}
                                  className="bg-card border border-border hover:bg-red-500 hover:text-white px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition active:scale-95"
                              >
                                  Deny
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatsCard title="Problems Solved" value={profile?.problems_solved || 0} icon={Code} color="bg-accent" />
        <StatsCard title="GFG Core Score" value={profile?.gfg_score || 0} icon={Star} color="bg-yellow-500" />
        <StatsCard title="Activity Streak" value={`${profile?.streak || 0} Days`} icon={Zap} color="bg-orange-500" />
        <StatsCard title="Campus Authority" value={`#${profile?.id || 0}`} icon={Trophy} color="bg-blue-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">
            
            {/* REGISTERED MISSIONS */}
            <div className="bg-card border border-border p-10 rounded-[3rem] shadow-sm">
                <div className="flex items-center gap-4 mb-10">
                    <Calendar size={28} className="text-accent" />
                    <h2 className="text-3xl font-black text-text uppercase tracking-tighter italic">Active Missions</h2>
                </div>
                {registrations.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {registrations.map(reg => (
                            <Link key={reg.reg_id} to={`/events/${reg.event_id}`} className="flex items-center justify-between p-8 bg-background/50 border border-border rounded-[2rem] hover:border-accent transition-all group shadow-inner">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-border group-hover:border-accent transition-colors">
                                        {reg.poster ? <img src={reg.poster} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-accent/5 flex items-center justify-center text-accent/20"><Calendar /></div>}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-text text-xl group-hover:text-accent transition-colors uppercase italic tracking-tight">{reg.title}</h4>
                                        <div className="flex gap-3 mt-2">
                                            <span className="text-[10px] font-black text-text/40 uppercase tracking-widest">{reg.team_name ? `Team: ${reg.team_name}` : 'Individual Entry'}</span>
                                            {reg.is_leader && <span className="bg-accent/10 text-accent text-[8px] font-black px-2 py-0.5 rounded border border-accent/20 uppercase tracking-widest">Leader</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-widest ${reg.status === 'Accepted' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>{reg.status}</span>
                                    <ChevronRight size={20} className="text-text/20 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-background/30 rounded-[2.5rem] border-2 border-dashed border-border">
                        <p className="text-text/30 font-black tracking-widest uppercase text-sm">No Missions Authorized.</p>
                        <Link to="/events" className="text-accent font-black text-xs uppercase tracking-widest mt-4 inline-block hover:underline">Browse Event Matrix</Link>
                    </div>
                )}
            </div>

            {/* PROJECT REGISTRY */}
            <div className="bg-card border border-border p-10 rounded-[3rem] shadow-sm">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <BookOpen size={28} className="text-accent" />
                        <h2 className="text-3xl font-black text-text uppercase tracking-tighter italic">Project Registry</h2>
                    </div>
                    <Link to="/projects" className="bg-accent/10 text-accent px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-accent/20 hover:bg-accent hover:text-white transition-all">Submit Build</Link>
                </div>
                {myProjects.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5">
                        {myProjects.map(proj => (
                            <div key={proj.id} className="flex items-center justify-between p-8 bg-background/50 border border-border rounded-[2rem] hover:border-accent transition-all group shadow-inner">
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-accent/5 rounded-2xl text-accent border border-accent/10 shadow-sm transition-all group-hover:bg-accent group-hover:text-white"><Monitor size={28} /></div>
                                    <div>
                                        <h4 className="font-black text-text text-xl group-hover:text-accent transition-colors uppercase italic tracking-tight">{proj.title}</h4>
                                        <p className="text-[10px] text-text/40 font-black uppercase tracking-widest mt-2">{proj.category} • {new Date(proj.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-2">
                                        <Link to={`/projects/${proj.id}?edit=true`} className="p-3 rounded-xl bg-blue-500/5 text-blue-400 border border-blue-500/10 opacity-0 group-hover:opacity-100 transition-all active:scale-90"><Edit3 size={18}/></Link>
                                        <button onClick={() => handleDeleteProjectFromDashboard(proj.id)} className="p-3 rounded-xl bg-red-500/5 text-red-500 border border-red-500/10 opacity-0 group-hover:opacity-100 transition-all active:scale-90"><Trash2 size={18}/></button>
                                    </div>
                                    <div className={`px-5 py-2 rounded-xl text-[10px] font-black border uppercase tracking-[0.2em] shadow-sm ${getStatusStyle(proj.status)}`}>{proj.status}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-background/30 rounded-[2.5rem] border-2 border-dashed border-border"><p className="text-text/30 font-black tracking-widest uppercase text-sm">No Build Data found.</p></div>
                )}
            </div>

            {/* COMMUNITY TRANSMISSIONS */}
            <div className="bg-card border border-border p-10 rounded-[3rem] shadow-sm">
                <div className="flex items-center gap-4 mb-10">
                    <MessageSquare size={28} className="text-blue-500" />
                    <h2 className="text-3xl font-black text-text uppercase tracking-tighter italic">Transmissions</h2>
                </div>
                {myDiscussions.length > 0 ? (
                    <div className="space-y-5">
                        {myDiscussions.map(post => (
                            <div key={post.id} className="flex items-center justify-between p-8 bg-background/50 border border-border rounded-[2rem] hover:border-blue-500 transition-all group shadow-inner">
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-blue-500/5 rounded-2xl text-blue-400 border border-blue-500/10 shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-all"><MessageSquare size={28} /></div>
                                    <div>
                                        <h4 className="font-black text-text text-xl group-hover:text-blue-400 transition-colors uppercase italic tracking-tight">{post.title}</h4>
                                        <p className="text-[10px] text-text/40 font-black uppercase tracking-widest mt-2">{new Date(post.created_at).toLocaleDateString()} • {post.comment_count} Transmission Signals</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Link to={`/community/${post.id}?edit=true`} className="p-3 rounded-xl bg-blue-500/5 text-blue-400 border border-blue-500/10 opacity-0 group-hover:opacity-100 transition-all active:scale-90"><Edit3 size={18}/></Link>
                                    <button onClick={() => handleDeletePost(post.id)} className="p-3 rounded-xl bg-red-500/5 text-red-500 border border-red-500/10 opacity-0 group-hover:opacity-100 transition-all active:scale-90"><Trash2 size={18}/></button>
                                    <ChevronRight size={24} className="text-text/20 group-hover:text-blue-400 transition-all group-hover:translate-x-2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-background/30 rounded-[2.5rem] border-2 border-dashed border-border"><p className="text-text/30 font-black tracking-widest uppercase text-sm">No active transmissions.</p></div>
                )}
            </div>
        </div>

        {/* Sidebar Nodes */}
        <div className="space-y-10">
            <div className="bg-card border border-border p-10 rounded-[3rem] shadow-sm sticky top-24">
                <div className="flex items-center gap-4 mb-10">
                    <Zap size={28} className="text-yellow-500" />
                    <h2 className="text-3xl font-black text-text uppercase tracking-tighter italic">Interface Nodes</h2>
                </div>
                <div className="space-y-6">
                    {[
                    { name: 'GeeksforGeeks', icon: Code, link: profile?.gfg_profile, solved: profile?.gfg_solved, color: 'text-green-600', bg: 'bg-green-600/5' },
                    { name: 'LeetCode', icon: Terminal, link: profile?.leetcode_profile, solved: profile?.leetcode_solved, color: 'text-yellow-500', bg: 'bg-yellow-500/5' },
                    { name: 'GitHub', icon: Github, link: profile?.github_profile, solved: profile?.github_repos, label: 'Repos', color: 'text-text', bg: 'bg-text/5' }
                    ].map((p, i) => (
                    <div key={i} className={`p-6 ${p.bg} border border-border rounded-[2rem] shadow-sm group hover:border-accent transition-colors`}>
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-4">
                                <p.icon className={p.color} size={24} />
                                <span className="font-black text-text uppercase tracking-widest text-xs">{p.name}</span>
                            </div>
                            {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" className="p-2 bg-background border border-border rounded-lg text-text/30 hover:text-accent transition-all shadow-sm"><ExternalLink size={16} /></a>}
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black text-text/30 uppercase tracking-[0.2em]">{p.label || 'Solved'}</span>
                            <span className="text-3xl font-black text-accent tracking-tighter leading-none italic">{p.solved || 0}</span>
                        </div>
                    </div>
                    ))}
                </div>
                
                <div className="mt-10 p-8 bg-accent/5 border border-accent/20 rounded-[2.5rem] space-y-4">
                    <div className="flex items-center gap-3">
                        <TrendingUp size={20} className="text-accent" />
                        <h4 className="font-black text-text uppercase text-xs tracking-widest italic">Rank Milestone</h4>
                    </div>
                    <div className="w-full bg-background border border-border h-3 rounded-full overflow-hidden shadow-inner">
                        <div className="bg-accent h-full w-[65%] shadow-lg shadow-accent/20"></div>
                    </div>
                    <p className="text-[9px] font-black text-text/40 uppercase tracking-widest text-center italic">Level 4 Node Access at 100 Solved</p>
                </div>
            </div>
        </div>
      </div>

      {/* Config Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-xl overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-border rounded-[3.5rem] w-full max-w-3xl my-auto shadow-2xl overflow-hidden">
              <div className="p-10 border-b border-border flex justify-between items-center bg-background/50">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent/10 rounded-xl text-accent"><Settings size={24} /></div>
                    <div>
                        <h2 className="text-3xl font-black text-text uppercase tracking-tighter italic">Core Identity Config</h2>
                        <p className="text-[10px] font-black text-text/40 uppercase tracking-widest">Update your matrix credentials</p>
                    </div>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="text-text/40 hover:text-red-500 p-4 hover:bg-red-500/5 rounded-full transition-all active:scale-90"><X size={32} /></button>
              </div>
              <form onSubmit={handleUpdateProfile} className="p-10 md:p-14 space-y-10 custom-scrollbar overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.3em] ml-2">Agent Name</label>
                        <div className="relative">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20" size={18}/>
                            <input type="text" className="w-full bg-background border-2 border-border rounded-2xl py-5 pl-14 pr-8 focus:border-accent outline-none text-text font-black text-lg transition shadow-inner" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.3em] ml-2">Department Node</label>
                        <div className="relative">
                            <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20" size={18}/>
                            <input type="text" className="w-full bg-background border-2 border-border rounded-2xl py-5 pl-14 pr-8 focus:border-accent outline-none text-text font-black text-lg transition shadow-inner" value={editFormData.department} onChange={(e) => setEditFormData({...editFormData, department: e.target.value})} />
                        </div>
                    </div>
                </div>

                <div className="space-y-8 pt-10 border-t border-border/50">
                    <h3 className="font-black text-xl text-text uppercase tracking-widest italic flex items-center gap-3">
                        <LinkIcon size={20} className="text-accent" /> Data Node Interface
                    </h3>
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">GeeksforGeeks Profile Link</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-green-600"><Code size={20}/></div>
                                <input type="url" placeholder="https://www.geeksforgeeks.org/user/..." className="w-full bg-background border-2 border-border rounded-2xl py-5 pl-14 pr-8 focus:border-accent outline-none text-text font-bold text-sm transition shadow-inner" value={editFormData.gfg_profile} onChange={(e) => setEditFormData({...editFormData, gfg_profile: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">LeetCode Logic Node</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-yellow-500"><Terminal size={20}/></div>
                                <input type="url" placeholder="https://leetcode.com/..." className="w-full bg-background border-2 border-border rounded-2xl py-5 pl-14 pr-8 focus:border-accent outline-none text-text font-bold text-sm transition shadow-inner" value={editFormData.leetcode_profile} onChange={(e) => setEditFormData({...editFormData, leetcode_profile: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">GitHub Matrix Node</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text"><Github size={20}/></div>
                                <input type="url" placeholder="https://github.com/..." className="w-full bg-background border-2 border-border rounded-2xl py-5 pl-14 pr-8 focus:border-accent outline-none text-text font-bold text-sm transition shadow-inner" value={editFormData.github_profile} onChange={(e) => setEditFormData({...editFormData, github_profile: e.target.value})} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-6 pt-6 sticky bottom-0 bg-card/80 backdrop-blur-md">
                    <button type="submit" className="flex-grow bg-accent hover:bg-gfg-green-hover text-white font-black py-6 rounded-[1.5rem] flex items-center justify-center gap-4 transition shadow-2xl shadow-accent/20 uppercase tracking-widest text-sm active:scale-[0.98]">
                        <Save size={24} /> Commit Changes
                    </button>
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-grow bg-card border border-border hover:bg-background text-text/60 font-black py-6 rounded-[1.5rem] transition uppercase tracking-widest text-xs shadow-sm">Abort</button>
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
      `}</style>
    </div>
  );
};

export default Dashboard;
