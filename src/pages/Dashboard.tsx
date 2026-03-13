import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatsCard from '../components/StatsCard';
import { User, Code, Trophy, Star, Settings, ExternalLink, Github, Link as LinkIcon, Zap, Terminal, RefreshCw, X, Save } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [editFormData, setEditFormData] = useState({
    name: '', email: '', department: '', year: '',
    gfg_profile: '', leetcode_profile: '', github_profile: '', codeforces_profile: ''
  });

  const fetchData = async () => {
    try {
      const [profileRes, activityRes] = await Promise.all([
        api.get('/users/profile'),
        api.get('/stats/user-activity')
      ]);
      setProfile(profileRes.data);
      setActivityData(activityRes.data);
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
      // Refresh data after sync
      await fetchData();
    } catch (error) {
      console.error('Sync failed:', error);
      if (!silent) alert('Failed to sync profiles.');
    } finally {
      if (!silent) setSyncing(false);
    }
  };

  useEffect(() => {
    const initDashboard = async () => {
      // 1. Fetch existing data immediately for fast load
      await fetchData();
      // 2. Trigger automatic sync in background
      handleSync(true); 
    };
    initDashboard();
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

  if (loading) return <div className="text-center py-20 text-accent font-bold">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Welcome, {profile?.name}!
            {syncing && <RefreshCw size={18} className="text-accent animate-spin" />}
          </h1>
          <p className="text-gray-400">Track your progress and manage your coding journey.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleSync(false)} disabled={syncing} className="bg-accent hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50">
            <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} /> {syncing ? 'Syncing...' : 'Sync Profiles'}
          </button>
          <button onClick={() => setIsEditModalOpen(true)} className="bg-card border border-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 hover:border-accent transition">
            <Settings size={18} /> Edit Profile
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
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-card p-6 rounded-2xl border border-gray-800">
          <h2 className="text-xl font-bold mb-6">Coding Activity (Last 7 Days)</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs><linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2f8d46" stopOpacity={0.3}/><stop offset="95%" stopColor="#2f8d46" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} itemStyle={{ color: '#2f8d46' }} />
                <Area type="monotone" dataKey="solved" stroke="#2f8d46" fillOpacity={1} fill="url(#colorSolved)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profiles */}
        <div className="bg-card p-6 rounded-2xl border border-gray-800 space-y-6">
          <h2 className="text-xl font-bold">Coding Profiles</h2>
          <div className="space-y-4">
            {[
              { name: 'GeeksforGeeks', icon: Code, link: profile?.gfg_profile, solved: profile?.gfg_solved, score: profile?.gfg_score, color: 'text-green-600' },
              { name: 'LeetCode', icon: Terminal, link: profile?.leetcode_profile, solved: profile?.leetcode_solved, color: 'text-yellow-500' },
              { name: 'GitHub', icon: Github, link: profile?.github_profile, solved: profile?.github_repos, label: 'Repos', color: 'text-white' }
            ].map((p, i) => (
              <div key={i} className="p-3 bg-background rounded-xl border border-gray-800">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3"><p.icon className={p.color} size={20} /><span className="font-medium">{p.name}</span></div>
                  {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-accent"><ExternalLink size={18} /></a>}
                </div>
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">{p.label || 'Solved'}</span>
                    <span className="text-lg font-bold text-accent">{p.solved || 0}</span>
                  </div>
                  {p.score !== undefined && (
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-500">Score</span>
                        <span className="text-lg font-bold text-yellow-500">{p.score}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-card border-b border-gray-800 p-6 flex justify-between items-center z-10">
                <h2 className="text-2xl font-bold">Edit Profile</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white transition"><X size={24} /></button>
              </div>
              <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label><input type="text" className="w-full bg-background border border-gray-700 rounded-lg py-2.5 px-4 focus:outline-none focus:border-accent" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} /></div>
                    <div><label className="block text-sm font-medium text-gray-400 mb-2">Department</label><input type="text" className="w-full bg-background border border-gray-700 rounded-lg py-2.5 px-4 focus:outline-none focus:border-accent" value={editFormData.department} onChange={(e) => setEditFormData({...editFormData, department: e.target.value})} /></div>
                </div>
                <div className="space-y-4 pt-4 border-t border-gray-800">
                  <h3 className="font-bold text-lg">Coding Profiles</h3>
                  <div><label className="block text-sm font-medium text-gray-400 mb-2">GfG Profile URL</label><input type="url" placeholder="https://www.geeksforgeeks.org/profile/username" className="w-full bg-background border border-gray-700 rounded-lg py-2.5 px-4 focus:outline-none focus:border-accent" value={editFormData.gfg_profile} onChange={(e) => setEditFormData({...editFormData, gfg_profile: e.target.value})} /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-2">GitHub Profile URL</label><input type="url" placeholder="https://github.com/username" className="w-full bg-background border border-gray-700 rounded-lg py-2.5 px-4 focus:outline-none focus:border-accent" value={editFormData.github_profile} onChange={(e) => setEditFormData({...editFormData, github_profile: e.target.value})} /></div>
                  <div><label className="block text-sm font-medium text-gray-400 mb-2">LeetCode Profile URL</label><input type="url" placeholder="https://leetcode.com/u/username/" className="w-full bg-background border border-gray-700 rounded-lg py-2.5 px-4 focus:outline-none focus:border-accent" value={editFormData.leetcode_profile} onChange={(e) => setEditFormData({...editFormData, leetcode_profile: e.target.value})} /></div>
                </div>
                <div className="flex gap-4"><button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-background border border-gray-700 py-3 rounded-xl text-white">Cancel</button><button type="submit" className="flex-1 bg-accent text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"><Save size={20} /> Save Changes</button></div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
