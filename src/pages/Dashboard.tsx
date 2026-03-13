import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatsCard from '../components/StatsCard';
import { 
  User, Code, Trophy, Star, Settings, ExternalLink, 
  Github, Link as LinkIcon, Zap, Terminal, RefreshCw, X, Save,
  CheckCircle, XCircle, Clock, BookOpen
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [editFormData, setEditFormData] = useState({
    name: '', email: '', department: '', year: '',
    gfg_profile: '', leetcode_profile: '', github_profile: '', codeforces_profile: ''
  });

  const fetchData = async () => {
    try {
      const [profileRes, activityRes, projectsRes] = await Promise.all([
        api.get('/users/profile'),
        api.get('/stats/user-activity'),
        api.get('/projects/my-projects')
      ]);
      setProfile(profileRes.data);
      setActivityData(activityRes.data);
      setMyProjects(projectsRes.data);
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
  }, []);

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

  if (loading) return <div className="text-center py-32 text-accent font-bold">Initializing Dashboard...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-0 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold flex items-center gap-4 text-white">
            Welcome, {profile?.name}!
            {syncing && <RefreshCw size={24} className="text-accent animate-spin" />}
          </h1>
          <p className="text-gray-400 mt-1 text-lg">Manage your coding identity and project submissions.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => handleSync(false)} disabled={syncing} className="bg-accent hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition shadow-xl shadow-accent/20 disabled:opacity-50">
            <RefreshCw size={20} className={syncing ? 'animate-spin' : ''} /> {syncing ? 'Syncing...' : 'Sync Profiles'}
          </button>
          <button onClick={() => setIsEditModalOpen(true)} className="bg-card border border-gray-800 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:border-accent transition text-white">
            <Settings size={20} /> Edit Profile
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Problems Solved" value={profile?.problems_solved || 0} icon={Code} color="bg-accent" />
        <StatsCard title="GFG Score" value={profile?.gfg_score || 0} icon={Star} color="bg-yellow-500" />
        <StatsCard title="Current Streak" value={`${profile?.streak || 0} Days`} icon={Zap} color="bg-orange-500" />
        <StatsCard title="Campus Rank" value={`#${profile?.id || 0}`} icon={Trophy} color="bg-blue-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            {/* Activity Chart */}
            <div className="bg-card border border-gray-800 p-8 rounded-[2.5rem] shadow-sm">
                <h2 className="text-2xl font-black mb-8 text-white">Coding Activity</h2>
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

            {/* My Project Submissions */}
            <div className="bg-card border border-gray-800 p-8 rounded-[2.5rem] shadow-sm">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-white">Project Submissions</h2>
                    <span className="bg-background border border-gray-800 px-4 py-1 rounded-full text-xs font-bold text-gray-500 uppercase tracking-widest">{myProjects.length} Total</span>
                </div>
                {myProjects.length > 0 ? (
                    <div className="space-y-4">
                        {myProjects.map(proj => (
                            <div key={proj.id} className="flex items-center justify-between p-5 bg-background/50 border border-gray-800 rounded-2xl hover:border-gray-700 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-accent/10 rounded-xl text-accent"><BookOpen size={20} /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-200">{proj.title}</h4>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">{proj.category} • {new Date(proj.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${getStatusStyle(proj.status)}`}>
                                        {proj.status}
                                    </div>
                                    <div className="text-right min-w-[60px]">
                                        <p className="text-lg font-black text-white leading-none">{proj.vote_score || 0}</p>
                                        <p className="text-[8px] font-bold text-gray-500 uppercase">votes</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center bg-background/30 rounded-3xl border border-gray-800 border-dashed">
                        <p className="text-gray-500 font-bold">You haven't submitted any projects yet.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Sidebar: Profiles & Achievements */}
        <div className="space-y-8">
            <div className="bg-card border border-gray-800 p-8 rounded-[2.5rem] space-y-8">
                <h2 className="text-2xl font-black text-white">Coding Connect</h2>
                <div className="space-y-4">
                    {[
                    { name: 'GeeksforGeeks', icon: Code, link: profile?.gfg_profile, solved: profile?.gfg_solved, score: profile?.gfg_score, color: 'text-green-600' },
                    { name: 'LeetCode', icon: Terminal, link: profile?.leetcode_profile, solved: profile?.leetcode_solved, color: 'text-yellow-500' },
                    { name: 'GitHub', icon: Github, link: profile?.github_profile, solved: profile?.github_repos, label: 'Repos', color: 'text-white' }
                    ].map((p, i) => (
                    <div key={i} className="p-4 bg-background border border-gray-800 rounded-2xl shadow-inner group">
                        <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3"><p.icon className={`${p.color} group-hover:scale-110 transition-transform`} size={20} /><span className="font-bold text-gray-200">{p.name}</span></div>
                        {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-accent"><ExternalLink size={18} /></a>}
                        </div>
                        <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{p.label || 'Solved'}</span>
                            <span className="text-xl font-black text-accent">{p.solved || 0}</span>
                        </div>
                        {p.score !== undefined && (
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Score</span>
                                <span className="text-xl font-black text-yellow-500">{p.score}</span>
                            </div>
                        )}
                        </div>
                    </div>
                    ))}
                </div>
                
                <div className="pt-8 border-t border-gray-800">
                    <h3 className="font-black text-white mb-6 uppercase text-sm tracking-widest">Hall of Fame</h3>
                    <div className="flex flex-wrap gap-2">
                    <span className="px-4 py-1.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm">Problem Solver</span>
                    <span className="px-4 py-1.5 bg-accent/10 text-accent border border-accent/20 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm">{profile?.streak} Day Streak</span>
                    <span className="px-4 py-1.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm">Innovator</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-gray-800 rounded-[2.5rem] w-full max-w-2xl my-auto shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-background/50">
                <h2 className="text-3xl font-black text-white">Edit Your Identity</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white p-3 hover:bg-gray-800 rounded-full transition-all"><X size={28} /></button>
              </div>
              <form onSubmit={handleUpdateProfile} className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="block text-sm font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                        <input type="text" className="w-full bg-background border-2 border-gray-800 rounded-2xl py-4 px-6 focus:border-accent outline-none text-white font-bold transition shadow-inner" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-black text-gray-500 uppercase tracking-widest ml-1">Department</label>
                        <input type="text" className="w-full bg-background border-2 border-gray-800 rounded-2xl py-4 px-6 focus:border-accent outline-none text-white font-bold transition shadow-inner" value={editFormData.department} onChange={(e) => setEditFormData({...editFormData, department: e.target.value})} />
                    </div>
                </div>
                <div className="space-y-6 pt-4 border-t border-gray-800">
                  <h3 className="font-black text-xl text-white uppercase tracking-tighter">Coding Profiles</h3>
                  <div className="space-y-4">
                    <div className="relative group">
                        <label className="block text-[10px] font-black text-gray-600 uppercase mb-1 ml-1">GfG URL</label>
                        <input type="url" placeholder="https://www.geeksforgeeks.org/profile/username" className="w-full bg-background border-2 border-gray-800 rounded-2xl py-4 px-6 focus:border-accent outline-none text-white font-medium transition shadow-inner" value={editFormData.gfg_profile} onChange={(e) => setFormData({...editFormData, gfg_profile: e.target.value})} />
                    </div>
                    <div className="relative group">
                        <label className="block text-[10px] font-black text-gray-600 uppercase mb-1 ml-1">GitHub URL</label>
                        <input type="url" placeholder="https://github.com/username" className="w-full bg-background border-2 border-gray-800 rounded-2xl py-4 px-6 focus:border-accent outline-none text-white font-medium transition shadow-inner" value={editFormData.github_profile} onChange={(e) => setFormData({...editFormData, github_profile: e.target.value})} />
                    </div>
                    <div className="relative group">
                        <label className="block text-[10px] font-black text-gray-600 uppercase mb-1 ml-1">LeetCode URL</label>
                        <input type="url" placeholder="https://leetcode.com/u/username/" className="w-full bg-background border-2 border-gray-800 rounded-2xl py-4 px-6 focus:border-accent outline-none text-white font-medium transition shadow-inner" value={editFormData.leetcode_profile} onChange={(e) => setFormData({...editFormData, leetcode_profile: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="flex gap-6 pt-4">
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-black py-5 rounded-2xl transition uppercase tracking-widest text-sm">Cancel</button>
                    <button type="submit" className="flex-1 bg-accent hover:bg-green-700 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition shadow-2xl shadow-accent/30 uppercase tracking-widest text-sm"><Save size={20} /> Save Changes</button>
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
