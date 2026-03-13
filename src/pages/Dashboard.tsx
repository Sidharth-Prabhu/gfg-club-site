import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatsCard from '../components/StatsCard';
import { 
  User, Code, Trophy, Star, Settings, ExternalLink, 
  Github, Link as LinkIcon, Zap, Terminal, RefreshCw, X, Save,
  ShieldAlert, BookOpen, FileText, Monitor, ChevronRight, MessageSquare, Plus, ArrowLeft, Hash, Sparkles, TrendingUp, UserPlus, Check, Trash2, Calendar
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
  const [invitations, setInvitations] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [editFormData, setEditFormData] = useState({
    name: '', department: '', gfg_profile: '', leetcode_profile: '', github_profile: ''
  });

  const canModerate = user?.role === 'Admin' || user?.role === 'Core';

  const fetchData = async () => {
    try {
      const [profileRes, activityRes, projectsRes, discussionsRes, invRes, regRes] = await Promise.all([
        api.get('/users/profile'),
        api.get('/stats/user-activity'),
        api.get('/projects/my-projects'),
        api.get('/discussions'),
        api.get('/events/invitations'),
        api.get('/events/my-registrations')
      ]);
      setProfile(profileRes.data);
      setActivityData(activityRes.data);
      setMyProjects(projectsRes.data);
      setMyDiscussions(discussionsRes.data.filter(d => d.author_id === profileRes.data.id));
      setInvitations(invRes.data);
      setRegistrations(regRes.data);
      
      if (canModerate) {
          const { data: pending } = await api.get('/projects?status=Pending');
          setPendingProjects(pending);
      }

      setEditFormData({
        name: profileRes.data.name || '',
        department: profileRes.data.department || '',
        gfg_profile: profileRes.data.gfg_profile || '',
        leetcode_profile: profileRes.data.leetcode_profile || '',
        github_profile: profileRes.data.github_profile || ''
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-blue-500/5 border border-blue-500/20 p-8 rounded-[2.5rem] shadow-xl space-y-6">
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
                                            {reg.is_leader && <span className="bg-accent/10 text-accent text-[8px] font-black px-2 py-0.5 rounded border border-accent/20 uppercase tracking-widest">Team Leader</span>}
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

            {/* MODERATION QUEUE (Admin/Core Only) */}
            {canModerate && pendingProjects.length > 0 && (
                <div className="bg-yellow-500/5 border border-yellow-500/20 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                    <div className="flex items-center gap-5 mb-10 relative z-10">
                        <div className="p-4 bg-yellow-500/10 rounded-2xl text-yellow-500 border border-yellow-500/20 shadow-inner"><ShieldAlert size={32} /></div>
                        <div>
                            <h2 className="text-3xl font-black text-text uppercase tracking-tighter italic">Review Queue</h2>
                            <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mt-1">Awaiting Core Verification</p>
                        </div>
                    </div>
                    <div className="space-y-5 relative z-10">
                        {pendingProjects.map(proj => (
                            <div key={proj.id} className="flex items-center justify-between p-8 bg-card border border-border rounded-[2rem] hover:border-yellow-500 transition-all group shadow-sm">
                                <div><h4 className="font-black text-text text-xl uppercase italic group-hover:text-yellow-500 transition-colors">{proj.title}</h4><p className="text-[10px] text-text/40 font-black uppercase tracking-widest mt-2">{proj.creator_name} • {proj.category}</p></div>
                                <ChevronRight size={24} className="text-yellow-500" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ACTIVITY GRAPH */}
            <div className="bg-card border border-border p-10 rounded-[3rem] shadow-sm">
                <div className="flex items-center gap-4 mb-10">
                    <TrendingUp size={28} className="text-accent" />
                    <h2 className="text-3xl font-black text-text uppercase tracking-tighter italic">Coding Velocity</h2>
                </div>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityData}>
                        <defs><linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2f8d46" stopOpacity={0.1}/><stop offset="95%" stopColor="#2f8d46" stopOpacity={0}/></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} opacity={0.5} />
                        <XAxis dataKey="name" stroke="var(--color-text)" opacity={0.3} fontSize={10} fontWeight="bold" />
                        <YAxis stroke="var(--color-text)" opacity={0.3} fontSize={10} fontWeight="bold" allowDecimals={false} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '20px' }} itemStyle={{ color: 'var(--color-accent)', fontWeight: 'bold' }} />
                        <Area type="monotone" dataKey="solved" stroke="var(--color-accent)" fillOpacity={1} fill="url(#colorSolved)" strokeWidth={5} />
                    </AreaChart>
                    </ResponsiveContainer>
                </div>
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
            </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-xl overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-border rounded-[3.5rem] w-full max-w-2xl my-auto shadow-2xl overflow-hidden">
              <div className="p-10 border-b border-border flex justify-between items-center bg-background/50">
                <h2 className="text-3xl font-black text-text uppercase tracking-tighter">Core Identity Config</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-text/40 hover:text-red-500 p-4 hover:bg-red-500/5 rounded-full transition-all active:scale-90"><X size={32} /></button>
              </div>
              <form onSubmit={handleUpdateProfile} className="p-10 md:p-14 space-y-10">
                <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.3em] ml-2">Full Agent Name</label>
                        <input type="text" className="w-full bg-background border-2 border-border rounded-2xl py-5 px-8 focus:border-accent outline-none text-text font-black text-lg transition shadow-inner" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} />
                    </div>
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.3em] ml-2">Core Department</label>
                        <input type="text" className="w-full bg-background border-2 border-border rounded-2xl py-5 px-8 focus:border-accent outline-none text-text font-black text-lg transition shadow-inner" value={editFormData.department} onChange={(e) => setEditFormData({...editFormData, department: e.target.value})} />
                    </div>
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">GfG Profile Node</label>
                        <input type="url" className="w-full bg-background border-2 border-border rounded-2xl py-5 px-8 focus:border-accent outline-none text-text font-bold text-sm transition shadow-inner" value={editFormData.gfg_profile} onChange={(e) => setEditFormData({...editFormData, gfg_profile: e.target.value})} />
                    </div>
                </div>
                <div className="flex gap-6 pt-6">
                    <button type="submit" className="flex-grow bg-accent hover:bg-gfg-green-hover text-white font-black py-6 rounded-[1.5rem] flex items-center justify-center gap-4 transition shadow-2xl shadow-accent/20 uppercase tracking-widest text-sm active:scale-[0.98]">
                        <Save size={24} /> Commit Changes
                    </button>
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-grow bg-card border border-border hover:bg-background text-text/60 font-black py-6 rounded-[1.5rem] transition uppercase tracking-widest text-xs shadow-sm">Abort Config</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
