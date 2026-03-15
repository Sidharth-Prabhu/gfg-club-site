import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatsCard from '../components/StatsCard';
import POTDCard from '../components/POTDCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, faCode, faTrophy, faStar, faCog, faExternalLinkAlt, 
  faSync, faTimes, faSave, faShieldAlt, faBookOpen, faFileAlt, 
  faDesktop, faChevronRight, faComments, faPlus, faArrowLeft, 
  faHashtag, faChartLine, faUserPlus, faCheck, faTrashAlt, 
  faCalendarAlt, faEdit, faGlobe, faEnvelope, faCodeBranch, faAlignLeft, faUsers,
  faTerminal, faLink, faMessage, faSignOutAlt, faZap
} from '@fortawesome/free-solid-svg-icons';
import { 
  faGithub 
} from '@fortawesome/free-brands-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Link } from 'react-router-dom';
import { REWARD_LEVELS, calculateLevel, getRewardMetrics } from '../utils/rewards';
import MarkdownEditor from '../components/MarkdownEditor';

const Dashboard = () => {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [myDiscussions, setMyDiscussions] = useState<any[]>([]);
  const [pendingProjects, setPendingProjects] = useState<any[]>([]);
  const [groupRequests, setGroupRequests] = useState<any[]>([]);
  const [userApplicants, setUserApplicants] = useState<any[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [potd, setPotd] = useState<any>(null);
  const [potdLoading, setPotdLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [editFormData, setEditFormData] = useState({
    name: '', email: '', department: '', year: '', gfg_profile: '', leetcode_profile: '', codeforces_profile: '', github_profile: '', skills: '', about: '', profile_pic: ''
  });

  const canModerate = user?.role === 'Admin' || user?.role === 'Core';

  const fetchData = async () => {
    setLoading(true);
    setPotdLoading(true);
    try {
      const safeGet = async (url: string) => {
        try {
          return await api.get(url);
        } catch (e) {
          console.error(`Failed to fetch ${url}:`, e);
          return null;
        }
      };

      const [profileRes, activityRes, projectsRes, discussionsRes, invRes, regRes, groupReqRes, applicantsRes, potdRes] = await Promise.all([
        safeGet('/users/profile'),
        safeGet('/stats/user-activity'),
        safeGet('/projects/my-projects'),
        safeGet('/discussions'),
        safeGet('/events/invitations'),
        safeGet('/events/my-registrations'),
        safeGet('/groups/pending-requests'),
        api.get('/users/applicants').catch(e => e.response?.status === 403 ? { is403: true } : null),
        safeGet('/problems/potd')
      ]);

      if (profileRes) {
        setProfile(profileRes.data);
        if (user && (user.role !== profileRes.data.role || user.status !== profileRes.data.status)) {
            login({ role: profileRes.data.role, status: profileRes.data.status });
        }
      }
      if (activityRes) setActivityData(activityRes.data);
      if (projectsRes) setMyProjects(projectsRes.data);
      if (groupReqRes) setGroupRequests(groupReqRes.data);
      if (potdRes) setPotd(potdRes.data);
      
      if (user?.role === 'Admin') {
          if (applicantsRes?.is403) {
              setUserApplicants([]);
          } else if (applicantsRes?.data) {
              setUserApplicants(applicantsRes.data);
          } else {
              setUserApplicants([]);
          }
      } else {
          setUserApplicants([]);
      }
      
      if (discussionsRes && Array.isArray(discussionsRes.data) && profileRes) {
        setMyDiscussions(discussionsRes.data.filter((d: any) => d.author_id === profileRes.data.id));
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
          github_profile: profileRes.data.github_profile || '',
          skills: profileRes.data.skills || '',
          about: profileRes.data.about || '',
          profile_pic: profileRes.data.profile_pic || ''
        });
      }
    } catch (error) {
      console.error('Fatal error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setPotdLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleRespondInv = async (regId: number, response: string) => {
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

  const handleRespondGroupRequest = async (requestId: number, status: string) => {
    try {
        await api.post('/groups/respond-request', { requestId, status });
        fetchData();
    } catch (error) {
        alert('Action failed');
    }
  };

  const handleModerateApplicant = async (applicantId: number, action: string) => {
    try {
        await api.put(`/users/applicants/${applicantId}/${action}`);
        fetchData();
    } catch (error) {
        alert(`${action} failed`);
    }
  };

  const handleModerateProject = async (projectId: number, status: string) => {
    try {
        await api.put(`/projects/${projectId}/status`, { status });
        fetchData();
    } catch (error) {
        alert(`${status} failed`);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/users/profile', editFormData);
      await fetchData();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFormData({ ...editFormData, profile_pic: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePost = async (id: number) => {
      if (window.confirm('Delete this post?')) {
          try {
              await api.delete(`/discussions/${id}`);
              fetchData();
          } catch (error) { alert('Deletion failed'); }
      }
  };

  const handleDeleteProjectFromDashboard = async (id: number) => {
    if (window.confirm('Delete this project?')) {
        try {
            await api.delete(`/projects/${id}`);
            fetchData();
        } catch (error) { alert('Deletion failed'); }
    }
  };

  const getStatusStyle = (status: string) => {
      switch(status) {
          case 'Approved': return 'bg-green-500/10 text-green-500 border-green-500/20';
          case 'Declined': return 'bg-red-500/10 text-red-500 border-red-500/20';
          default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      }
  };

  const contributionData = useMemo(() => {
    const days = 365;
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const activity = activityData.find(a => a.date === dateStr);
      data.push({
        date: dateStr,
        count: activity ? activity.count : 0
      });
    }
    return data;
  }, [activityData]);

  const getColorLevel = (count: number) => {
    if (count === 0) return 'bg-border/30';
    if (count <= 2) return 'bg-accent/20';
    if (count <= 5) return 'bg-accent/40';
    if (count <= 10) return 'bg-accent/70';
    return 'bg-accent';
  };

  const currentLevel = useMemo(() => calculateLevel(profile), [profile]);
  const nextLevel = REWARD_LEVELS.find(l => l.level === currentLevel + 1) || REWARD_LEVELS[REWARD_LEVELS.length - 1];
  const getMetricProgress = (current: number, target: number) => Math.min(100, (current / target) * 100);

  const isGuest = user?.role === 'Guest';

  if (loading) return <div className="text-center py-40 text-accent font-black tracking-[0.3em] uppercase animate-pulse text-xs italic">Loading Dashboard...</div>;

  if (isGuest) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-8 max-w-7xl pb-16">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-border pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-black text-text tracking-tighter uppercase italic">Guest <span className="text-accent">Dashboard</span>: {profile?.name}</h1>
            <p className="text-text/40 font-black text-[9px] tracking-[0.2em] uppercase flex items-center gap-2"><FontAwesomeIcon icon={faGlobe} className="text-blue-500" /> Public Access - Event Participation</p>
          </div>
          <button onClick={() => setIsEditModalOpen(true)} className="bg-card border border-border px-5 py-2.5 rounded-xl font-black flex items-center gap-2 hover:border-accent transition text-text/60 hover:text-accent text-[10px] uppercase tracking-widest shadow-sm active:scale-95">
            <FontAwesomeIcon icon={faCog} /> Profile Settings
          </button>
        </motion.div>

        <AnimatePresence>
            {invitations.length > 0 ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-3xl shadow-xl space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20"><FontAwesomeIcon icon={faUserPlus} /></div>
                        <h2 className="text-2xl font-black text-text uppercase tracking-tight italic">Team Invitations</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {invitations.map(inv => (
                            <div key={inv.reg_id} className="bg-card border border-border p-5 rounded-2xl space-y-4 shadow-sm hover:border-blue-500/50 transition-colors">
                                <div>
                                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Invitation Received</p>
                                    <h4 className="font-black text-text text-lg uppercase italic">{inv.team_name}</h4>
                                    <p className="text-[8px] font-bold text-text/40 uppercase tracking-widest mt-1">Event: {inv.event_title}</p>
                                    <p className="text-[8px] font-bold text-text/40 uppercase tracking-widest">From: {inv.inviter_name}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleRespondInv(inv.reg_id, 'Accepted')} className="flex-1 bg-accent/10 hover:bg-accent text-accent hover:text-white border border-accent/20 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all">Accept</button>
                                    <button onClick={() => handleRespondInv(inv.reg_id, 'Declined')} className="flex-1 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/10 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all">Decline</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            ) : (
                <div className="py-12 text-center bg-card rounded-3xl border border-border border-dashed">
                    <FontAwesomeIcon icon={faUserPlus} size="2x" className="mx-auto mb-3 opacity-10" />
                    <p className="text-text/30 font-black tracking-widest uppercase text-xs italic">No pending team invitations.</p>
                </div>
            )}
        </AnimatePresence>

        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-accent" />
                <h2 className="text-2xl font-black text-text uppercase tracking-tighter italic">Participating Events</h2>
            </div>
            {registrations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {registrations.map(reg => (
                        <Link key={reg.reg_id} to={`/events/${reg.event_id}`} className="flex items-center justify-between p-5 bg-background/50 border border-border rounded-2xl hover:border-accent transition-all group shadow-inner">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl overflow-hidden border border-border group-hover:border-accent transition-colors">
                                    {reg.poster ? <img src={reg.poster} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-accent/5 flex items-center justify-center text-accent/20"><FontAwesomeIcon icon={faCalendarAlt} /></div>}
                                </div>
                                <div>
                                    <h4 className="font-black text-text text-lg group-hover:text-accent transition-colors uppercase italic tracking-tight">{reg.title}</h4>
                                    <p className="text-[9px] font-black text-text/40 uppercase tracking-widest mt-1">{reg.team_name ? `Team: ${reg.team_name}` : 'Individual'}</p>
                                </div>
                            </div>
                            <FontAwesomeIcon icon={faChevronRight} className="text-text/20 group-hover:text-accent transition-all" />
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="py-12 text-center bg-background/30 rounded-2xl border-2 border-dashed border-border">
                    <p className="text-text/30 font-black tracking-widest uppercase text-xs italic">Join an event to start participating.</p>
                </div>
            )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-8 max-w-7xl pb-16">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-border pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-text tracking-tighter uppercase italic">User <span className="text-accent">Dashboard</span>: {profile?.name}</h1>
          <div className="flex items-center gap-3">
            <p className="text-text/40 font-black text-[9px] tracking-[0.2em] uppercase flex items-center gap-1.5"><FontAwesomeIcon icon={faStar} className="text-accent" /> Control Panel & Personal Profile</p>
            {profile && <span className="bg-accent/10 text-accent text-[7px] font-black px-1.5 py-0.5 rounded border border-accent/20 uppercase tracking-widest">{profile.role}</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <Link to="/community?new=true" className="flex-1 lg:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-black flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/10 text-[9px] uppercase tracking-widest active:scale-95">
            <FontAwesomeIcon icon={faComments} /> New Post
          </Link>
          <button onClick={() => handleSync(false)} disabled={syncing} className="flex-1 lg:flex-none bg-accent hover:bg-gfg-green-hover text-white px-4 py-2 rounded-xl font-black flex items-center justify-center gap-2 transition shadow-lg shadow-accent/10 text-[9px] uppercase tracking-widest active:scale-95 disabled:opacity-50">
            <FontAwesomeIcon icon={faSync} className={syncing ? 'fa-spin' : ''} /> Sync Profiles
          </button>
          <button onClick={() => setIsEditModalOpen(true)} className="flex-1 lg:flex-none bg-card border border-border px-4 py-2 rounded-xl font-black flex items-center justify-center gap-2 hover:border-accent transition text-text/60 hover:text-accent text-[9px] uppercase tracking-widest shadow-sm active:scale-95">
            <FontAwesomeIcon icon={faCog} /> Profile Settings
          </button>
          {profile?.id && (
            <Link to={`/profile/${profile.id}`} className="flex-1 lg:flex-none bg-card border border-border px-4 py-2 rounded-xl font-black flex items-center justify-center gap-2 hover:border-accent transition text-text/60 hover:text-accent text-[9px] uppercase tracking-widest shadow-sm active:scale-95">
              <FontAwesomeIcon icon={faUser} /> My Profile
            </Link>
          )}
        </div>
      </motion.div>

      {/* Notifications Queue */}
      <AnimatePresence>
          {invitations.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-3xl shadow-xl space-y-4 overflow-hidden">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20"><FontAwesomeIcon icon={faUserPlus} /></div>
                      <h2 className="text-xl font-black text-text uppercase tracking-tight italic">Pending Invitations</h2>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {invitations.map(inv => (
                            <div key={inv.reg_id} className="bg-card border border-border p-4 rounded-xl space-y-3 shadow-sm hover:border-blue-500/50 transition-colors">
                                <div>
                                    <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-0.5">Team Invitation</p>
                                    <h4 className="text-sm font-black text-text uppercase italic">{inv.team_name}</h4>
                                    <p className="text-[8px] font-bold text-text/40 uppercase tracking-widest">Event: {inv.event_title}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleRespondInv(inv.reg_id, 'Accepted')} className="flex-1 bg-accent/10 hover:bg-accent text-accent hover:text-white border border-accent/20 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all">Accept</button>
                                    <button onClick={() => handleRespondInv(inv.reg_id, 'Declined')} className="flex-1 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/10 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all">Decline</button>
                                </div>
                            </div>
                        ))}
                    </div>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

      {/* Moderation Sector */}
      {canModerate && (groupRequests.length > 0 || pendingProjects.length > 0 || (user?.role === 'Admin' && userApplicants.length > 0)) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 bg-card border border-border p-6 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                      <FontAwesomeIcon icon={faShieldAlt} className="text-accent" />
                      <h3 className="text-xl font-black text-text uppercase italic tracking-tight">Admin Moderation</h3>
                  </div>
                  <span className="text-[8px] font-black text-text/30 uppercase tracking-widest bg-background px-2 py-1 rounded-md border border-border">
                    Pending Actions: {groupRequests.length + pendingProjects.length + (user?.role === 'Admin' ? userApplicants.length : 0)}
                  </span>
              </div>

              <div className="space-y-2">
                  {/* Group Access Requests */}
                  {groupRequests.map((req) => (
                      <div key={`group-${req.id}`} className="flex items-center justify-between p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl hover:border-blue-500/30 transition-all group">
                          <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500"><FontAwesomeIcon icon={faUsers} /></div>
                              <div>
                                  <div className="flex items-center gap-2">
                                      <span className="text-[7px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-1.5 py-0.5 rounded">Join Request</span>
                                      <h4 className="text-sm font-black text-text uppercase italic">{req.user_name}</h4>
                                      <Link to={`/profile/${req.user_id}`} className="text-[7px] font-black text-blue-500 hover:underline flex items-center gap-1 uppercase tracking-widest ml-2">
                                          View Profile <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[8px]" />
                                      </Link>
                                  </div>
                                  <p className="text-[9px] text-text/40 font-bold uppercase tracking-widest">Group: {req.group_title}</p>
                              </div>
                          </div>
                          <div className="flex gap-2">
                              <button onClick={() => handleRespondGroupRequest(req.id, 'Accepted')} className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-lg transition-all active:scale-95 shadow-lg shadow-blue-500/10"><FontAwesomeIcon icon={faCheck} /></button>
                              <button onClick={() => handleRespondGroupRequest(req.id, 'Declined')} className="bg-background border border-border hover:bg-red-500 hover:text-white p-1.5 rounded-lg transition-all active:scale-95 shadow-sm"><FontAwesomeIcon icon={faTimes} /></button>
                          </div>
                      </div>
                  ))}

                  {/* Project Approval Requests */}
                  {pendingProjects.map((proj) => (
                      <div key={`proj-${proj.id}`} onClick={() => setSelectedProject(proj)} className="flex items-center justify-between p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl hover:border-purple-500/30 transition-all group cursor-pointer">
                          <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500"><FontAwesomeIcon icon={faDesktop} /></div>
                              <div>
                                  <div className="flex items-center gap-2">
                                      <span className="text-[7px] font-black text-purple-500 uppercase tracking-widest bg-purple-500/10 px-1.5 py-0.5 rounded">Project Submission</span>
                                      <h4 className="text-sm font-black text-text uppercase italic group-hover:text-purple-500 transition-colors">{proj.title}</h4>
                                  </div>
                                  <p className="text-[9px] text-text/40 font-bold uppercase tracking-widest">Author: {proj.creator_name}</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-3">
                              <span className="text-[8px] font-black text-purple-500/40 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Review Project</span>
                              <FontAwesomeIcon icon={faChevronRight} className="text-text/20 group-hover:text-purple-500" />
                          </div>
                      </div>
                  ))}

                  {/* Membership Applications */}
                  {user?.role === 'Admin' && Array.isArray(userApplicants) && userApplicants.map((app) => (
                      <div key={`app-${app.id}`} onClick={() => setSelectedApplicant(app)} className="flex items-center justify-between p-3 bg-accent/5 border border-accent/10 rounded-xl hover:border-accent/30 transition-all group cursor-pointer">
                          <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                                  {app.profile_pic ? <img src={app.profile_pic} className="w-full h-full object-cover rounded-lg" alt="" /> : <FontAwesomeIcon icon={faUser} />}
                              </div>
                              <div>
                                  <div className="flex items-center gap-2">
                                      <span className="text-[7px] font-black text-accent uppercase tracking-widest bg-accent/10 px-1.5 py-0.5 rounded">Membership Application</span>
                                      <h4 className="text-sm font-black text-text uppercase italic group-hover:text-accent transition-colors">{app.name}</h4>
                                  </div>
                                  <p className="text-[9px] text-text/40 font-bold uppercase tracking-widest">{app.department} • Year {app.year}</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-3">
                              <span className="text-[8px] font-black text-accent/40 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Review Details</span>
                              <FontAwesomeIcon icon={faChevronRight} className="text-text/20 group-hover:text-accent" />
                          </div>
                      </div>
                  ))}
              </div>
          </motion.div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Problems Solved" value={profile?.problems_solved || 0} icon={faCode} color="bg-accent" />
        <StatsCard title="Platform Score" value={profile?.gfg_score || 0} icon={faStar} color="bg-yellow-500" />
        <StatsCard title="Daily Streak" value={`${profile?.streak || 0} Days`} icon={faChartLine} iconColor="text-orange-500" color="bg-orange-500" />
        <StatsCard title="Club Ranking" value={`#${profile?.id || 0}`} icon={faTrophy} color="bg-blue-500" />
      </div>

      {/* Activity Graph */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border p-6 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-accent" />
                  <h3 className="text-xl font-black text-text uppercase italic tracking-tight">Activity Graph</h3>
              </div>
              <div className="flex items-center gap-2">
                  <span className="text-[8px] font-black text-text/30 uppercase tracking-widest">Less</span>
                  <div className="flex gap-1">
                      <div className="w-2.5 h-2.5 rounded-sm bg-border/30"></div>
                      <div className="w-2.5 h-2.5 rounded-sm bg-accent/20"></div>
                      <div className="w-2.5 h-2.5 rounded-sm bg-accent/40"></div>
                      <div className="w-2.5 h-2.5 rounded-sm bg-accent/70"></div>
                      <div className="w-2.5 h-2.5 rounded-sm bg-accent"></div>
                  </div>
                  <span className="text-[8px] font-black text-text/30 uppercase tracking-widest">More</span>
              </div>
          </div>
          
          <div className="overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex flex-col flex-wrap h-[100px] gap-1 content-start min-w-[800px]">
                  {contributionData.map((day, i) => (
                      <div 
                          key={i}
                          title={`${day.date}: ${day.count} problems solved`}
                          className={`w-[11px] h-[11px] rounded-[2px] transition-colors hover:ring-1 hover:ring-accent/50 cursor-pointer ${getColorLevel(day.count)}`}
                      ></div>
                  ))}
              </div>
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t border-border/50">
              <p className="text-[9px] font-bold text-text/40 uppercase tracking-widest italic">Problem solving activity over the last year</p>
              <p className="text-[9px] font-black text-accent uppercase tracking-widest">{contributionData.filter(d => d.count > 0).length} Active Days</p>
          </div>
      </motion.div>

      {/* Reward System */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border p-8 rounded-3xl shadow-sm space-y-10 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div className="space-y-1">
                  <h3 className="text-2xl font-black text-text uppercase italic tracking-tight flex items-center gap-3">
                      <div className="p-2 bg-accent/10 rounded-lg text-accent text-sm"><FontAwesomeIcon icon={faTrophy} /></div>
                      Reward <span className="text-accent">System</span>
                  </h3>
                  <p className="text-[10px] font-black text-text/40 uppercase tracking-widest italic ml-12">Level up your contribution & earn prestige</p>
              </div>
              <div className="flex items-center gap-4 bg-background/50 border border-border p-3 rounded-2xl shadow-inner">
                  <div className="text-right">
                      <p className="text-[8px] font-black text-text/30 uppercase tracking-widest">Current Rank</p>
                      <p className="text-lg font-black text-accent uppercase italic leading-none">{REWARD_LEVELS[currentLevel-1]?.name || 'Unranked'}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-white text-xl font-black italic shadow-lg shadow-accent/20">
                      {currentLevel}
                  </div>
              </div>
          </div>

          <div className="relative pt-12 pb-20 overflow-x-auto scrollbar-hide">
              <div className="min-w-[1000px] relative px-4">
                <div className="absolute top-1/2 left-4 right-4 h-1 bg-border/50 -translate-y-1/2 rounded-full">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentLevel - 1) / (REWARD_LEVELS.length - 1)) * 100}%` }}
                        className="h-full bg-accent shadow-[0_0_15px_rgba(var(--color-accent-rgb),0.5)] rounded-full relative"
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-accent rounded-full shadow-[0_0_10px_white]"></div>
                    </motion.div>
                </div>

                <div className="flex justify-between relative z-10">
                    {REWARD_LEVELS.map((lvl, i) => {
                        const isUnlocked = currentLevel >= lvl.level;
                        const isCurrent = currentLevel === lvl.level;
                        const isNext = currentLevel + 1 === lvl.level;

                        return (
                            <div key={i} className="flex flex-col items-center group">
                                <motion.div 
                                    whileHover={{ scale: 1.2 }}
                                    className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all duration-500 relative cursor-help
                                        ${isUnlocked ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20' : 'bg-card border-border text-text/20 hover:border-accent/50'}
                                        ${isCurrent ? 'ring-4 ring-accent/20 scale-110' : ''}
                                        ${isNext ? 'border-accent/40 text-accent/40 animate-pulse' : ''}
                                    `}
                                >
                                    <span className="text-xs font-black italic">{lvl.level}</span>
                                    
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-card border border-border p-4 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 z-50 pointer-events-auto">
                                        <div className="absolute -bottom-4 left-0 right-0 h-4 bg-transparent"></div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center border-b border-border pb-2">
                                                <span className="text-[10px] font-black text-accent uppercase">{lvl.name}</span>
                                                <span className="text-[8px] font-black text-text/30 uppercase">Lvl {lvl.level}</span>
                                            </div>
                                            <div className="space-y-1.5">
                                                {[
                                                    { label: 'Solved', val: lvl.problems, current: profile?.problems_solved || 0 },
                                                    { label: 'Score', val: lvl.score, current: profile?.gfg_score || 0 },
                                                    { label: 'Streak', val: lvl.streak, current: profile?.streak || 0 },
                                                    { label: 'Comments', val: lvl.comments, current: profile?.comment_count || 0 },
                                                    { label: 'Posts', val: lvl.posts, current: profile?.discussion_count || 0 }
                                                ].map((m, j) => (
                                                    <div key={j} className="flex justify-between items-center">
                                                        <span className="text-[8px] font-bold text-text/40 uppercase">{m.label}</span>
                                                        <span className={`text-[9px] font-black ${m.current >= m.val ? 'text-green-500' : 'text-text/60'}`}>{m.val}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-card border-r border-b border-border rotate-45"></div>
                                    </div>
                                </motion.div>
                                <div className={`mt-4 text-center space-y-1 ${isUnlocked ? 'opacity-100' : 'opacity-30'}`}>
                                    <p className="text-[8px] font-black text-text uppercase tracking-tighter whitespace-nowrap">{lvl.name}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
              </div>
          </div>

          {currentLevel < REWARD_LEVELS.length && (
              <div className="bg-background/50 border border-border p-6 rounded-2xl relative z-10">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="space-y-3 w-full md:w-auto">
                          <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] italic">Road to {nextLevel.name}</p>
                          <div className="flex flex-wrap gap-4">
                              {getRewardMetrics(profile, nextLevel).map((m, i) => {
                                  const prog = getMetricProgress(m.current, m.target);
                                  return (
                                      <div key={i} className="bg-card border border-border px-4 py-2.5 rounded-xl shadow-sm space-y-2 min-w-[120px]">
                                          <div className="flex justify-between items-center gap-3">
                                              <FontAwesomeIcon icon={m.icon} className="text-[10px] text-text/30" />
                                              <span className="text-[10px] font-black text-text italic">{m.current}/{m.target}</span>
                                          </div>
                                          <div className="w-full bg-background h-1 rounded-full overflow-hidden">
                                              <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${prog}%` }}
                                                className={`h-full ${prog === 100 ? 'bg-green-500' : 'bg-accent'}`} 
                                              />
                                          </div>
                                          <p className="text-[7px] font-black text-text/30 uppercase tracking-widest">{m.label}</p>
                                      </div>
                                  );
                              })}
                          </div>
                      </div>
                      <div className="flex-shrink-0 text-center space-y-2 px-8 border-l border-border/50 hidden md:block">
                          <p className="text-[8px] font-black text-text/30 uppercase tracking-widest">Estimated Progress</p>
                          <p className="text-4xl font-black text-accent italic">
                              {Math.round(
                                  getRewardMetrics(profile, nextLevel).reduce((acc, m) => acc + getMetricProgress(m.current, m.target), 0) / 5
                              )}%
                          </p>
                      </div>
                  </div>
              </div>
          )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            {/* Events */}
            <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-accent" />
                    <h2 className="text-2xl font-black text-text uppercase tracking-tighter italic">My Events</h2>
                </div>
                <div className="max-h-[400px] overflow-y-auto pr-3 custom-scrollbar">
                    {registrations.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {registrations.map(reg => (
                                <Link key={reg.reg_id} to={`/events/${reg.event_id}`} className="flex items-center justify-between p-5 bg-background/50 border border-border rounded-2xl hover:border-accent transition-all group shadow-inner">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-border group-hover:border-accent transition-colors">
                                            {reg.poster ? <img src={reg.poster} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-accent/5 flex items-center justify-center text-accent/20"><FontAwesomeIcon icon={faCalendarAlt} /></div>}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-text text-lg group-hover:text-accent transition-colors uppercase italic tracking-tight">{reg.title}</h4>
                                            <p className="text-[9px] font-black text-text/40 uppercase tracking-widest mt-1">{reg.team_name ? `Team: ${reg.team_name}` : 'Individual'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black border uppercase tracking-widest ${reg.status === 'Accepted' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>{reg.status}</span>
                                        <FontAwesomeIcon icon={faChevronRight} className="text-text/20 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center bg-background/30 rounded-2xl border-2 border-dashed border-border">
                            <p className="text-text/30 font-black tracking-widest uppercase text-xs italic">No registered events.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Projects */}
            <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <FontAwesomeIcon icon={faBookOpen} className="text-accent" />
                        <h2 className="text-2xl font-black text-text uppercase tracking-tighter italic">My Projects</h2>
                    </div>
                    <Link to="/projects" className="bg-accent/10 text-accent px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-accent/20 hover:bg-accent hover:text-white transition-all">New Project</Link>
                </div>
                <div className="max-h-[400px] overflow-y-auto pr-3 custom-scrollbar">
                    {myProjects.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {myProjects.map(proj => (
                                <div key={proj.id} className="flex items-center justify-between p-5 bg-background/50 border border-border rounded-2xl hover:border-accent transition-all group shadow-inner">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-accent/5 rounded-xl text-accent border border-accent/10 shadow-sm transition-all group-hover:bg-accent group-hover:text-white"><FontAwesomeIcon icon={faDesktop} /></div>
                                        <div>
                                            <h4 className="font-black text-text text-lg group-hover:text-accent transition-colors uppercase italic tracking-tight">{proj.title}</h4>
                                            <p className="text-[9px] text-text/40 font-black uppercase tracking-widest mt-1">{proj.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-1.5">
                                            <Link to={`/projects/${proj.id}?edit=true`} className="p-2 rounded-lg bg-blue-500/5 text-blue-400 border border-blue-500/10 opacity-0 group-hover:opacity-100 transition-all active:scale-90"><FontAwesomeIcon icon={faEdit}/></Link>
                                            <button onClick={() => handleDeleteProjectFromDashboard(proj.id)} className="p-2 rounded-lg bg-red-500/5 text-red-500 border border-red-500/10 opacity-0 group-hover:opacity-100 transition-all active:scale-90"><FontAwesomeIcon icon={faTrashAlt}/></button>
                                        </div>
                                        <div className={`px-4 py-1.5 rounded-lg text-[9px] font-black border uppercase tracking-widest shadow-sm ${getStatusStyle(proj.status)}`}>{proj.status}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center bg-background/30 rounded-2xl border-2 border-dashed border-border"><p className="text-text/30 font-black tracking-widest uppercase text-xs">No projects found.</p></div>
                    )}
                </div>
            </div>

            {/* Posts */}
            <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <FontAwesomeIcon icon={faMessage} className="text-blue-500" />
                    <h2 className="text-2xl font-black text-text uppercase tracking-tighter italic">My Posts</h2>
                </div>
                <div className="max-h-[400px] overflow-y-auto pr-3 custom-scrollbar">
                    {myDiscussions.length > 0 ? (
                        <div className="space-y-4">
                            {myDiscussions.map(post => (
                                <div key={post.id} className="flex items-center justify-between p-5 bg-background/50 border border-border rounded-2xl hover:border-blue-500 transition-all group shadow-inner">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-500/5 rounded-xl text-blue-400 border border-blue-500/10 shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-all"><FontAwesomeIcon icon={faMessage} /></div>
                                        <div>
                                            <h4 className="font-black text-text text-lg group-hover:text-blue-400 transition-colors uppercase italic tracking-tight">{post.title}</h4>
                                            <p className="text-[9px] text-text/40 font-black uppercase tracking-widest mt-1">{new Date(post.created_at).toLocaleDateString()} • {post.comment_count} Replies</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5 items-center">
                                        <Link to={`/community/${post.id}?edit=true`} className="p-2 rounded-lg bg-blue-500/5 text-blue-400 border border-blue-500/10 opacity-0 group-hover:opacity-100 transition-all active:scale-90"><FontAwesomeIcon icon={faEdit}/></Link>
                                        <button onClick={() => handleDeletePost(post.id)} className="p-2 rounded-lg bg-red-500/5 text-red-500 border border-red-500/10 opacity-0 group-hover:opacity-100 transition-all active:scale-90"><FontAwesomeIcon icon={faTrashAlt}/></button>
                                        <FontAwesomeIcon icon={faChevronRight} size="20" className="text-text/20 group-hover:text-blue-400 transition-all group-hover:translate-x-1" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center bg-background/30 rounded-2xl border-2 border-dashed border-border"><p className="text-text/30 font-black tracking-widest uppercase text-xs">No posts yet.</p></div>
                    )}
                </div>
            </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
            {!isGuest && (
              <POTDCard potd={potd} loading={potdLoading} />
            )}
            <div className="bg-card border border-border p-6 rounded-3xl shadow-sm sticky top-20">
                <div className="flex items-center gap-3 mb-6">
                    <FontAwesomeIcon icon={faZap} className="text-yellow-500" />
                    <h2 className="text-2xl font-black text-text uppercase tracking-tighter italic">Coding Profiles</h2>
                </div>
                <div className="space-y-4">
                    {[
                    { name: 'GeeksforGeeks', icon: faCode, link: profile?.gfg_profile, solved: profile?.gfg_solved, color: 'text-green-600', bg: 'bg-green-600/5' },
                    { name: 'LeetCode', icon: faTerminal, link: profile?.leetcode_profile, solved: profile?.leetcode_solved, color: 'text-yellow-500', bg: 'bg-yellow-500/5' },
                    { name: 'GitHub', icon: faGithub, link: profile?.github_profile, solved: profile?.github_repos, label: 'Repos', color: 'text-text', bg: 'bg-text/5' }
                    ].map((p, i) => (
                    <div key={i} className={`p-4 ${p.bg} border border-border rounded-2xl shadow-sm group hover:border-accent transition-colors`}>
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <FontAwesomeIcon icon={p.icon} className={p.color} />
                                <span className="font-black text-text uppercase tracking-widest text-[10px]">{p.name}</span>
                            </div>
                            {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-background border border-border rounded-lg text-text/30 hover:text-accent transition-all shadow-sm"><FontAwesomeIcon icon={faExternalLinkAlt} /></a>}
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-[8px] font-black text-text/30 uppercase tracking-[0.2em]">{p.label || 'Solved'}</span>
                            <span className="text-2xl font-black text-accent tracking-tighter leading-none italic">{p.solved || 0}</span>
                        </div>
                    </div>
                    ))}
                </div>
                
                <div className="mt-8 p-6 bg-accent/5 border border-accent/20 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faChartLine} className="text-accent" />
                        <h4 className="font-black text-text uppercase text-[10px] tracking-widest italic">Rank Progress</h4>
                    </div>
                    <div className="w-full bg-background border border-border h-2 rounded-full overflow-hidden shadow-inner">
                        <div className="bg-accent h-full shadow-lg shadow-accent/20 transition-all duration-1000" style={{ width: `${Math.round(((currentLevel) / REWARD_LEVELS.length) * 100)}%` }}></div>
                    </div>
                    <p className="text-[8px] font-black text-text/40 uppercase tracking-widest text-center italic">Level {currentLevel} • {REWARD_LEVELS[currentLevel-1]?.name || 'Novice'}</p>
                </div>
            </div>
        </div>
      </div>

      {/* Applicant Detail Modal */}
      <AnimatePresence>
        {selectedApplicant && (
            <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-xl overflow-y-auto">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-border rounded-3xl w-full max-w-4xl my-auto shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="p-6 md:p-8 border-b border-border flex justify-between items-center bg-background/50">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-[2rem] bg-accent/10 flex items-center justify-center text-accent font-black border border-accent/20 text-3xl shadow-inner overflow-hidden italic">
                                {selectedApplicant.profile_pic ? <img src={selectedApplicant.profile_pic} className="w-full h-full object-cover" alt="" /> : selectedApplicant.name[0]}
                            </div>
                            <div>
                                <h2 className="text-3xl md:text-4xl font-black text-text uppercase tracking-tighter italic">Membership <span className="text-accent">Application</span></h2>
                                <p className="text-[10px] font-black text-text/40 uppercase tracking-widest">Applicant ID: #{selectedApplicant.id} • Status: Pending Review</p>
                            </div>
                        </div>
                        <button onClick={() => setSelectedApplicant(null)} className="text-text/40 hover:text-red-500 p-2 rounded-full transition-all active:scale-90"><FontAwesomeIcon icon={faTimes} size="2x" /></button>
                    </div>
                    
                    <div className="p-8 md:p-12 space-y-12 overflow-y-auto custom-scrollbar flex-grow">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.3em] flex items-center gap-2 italic">
                                        <FontAwesomeIcon icon={faUser} /> Personal Information
                                    </h4>
                                    <div className="bg-background/50 border border-border p-6 rounded-2xl space-y-4 shadow-inner">
                                        <div className="flex justify-between">
                                            <span className="text-[9px] font-bold text-text/30 uppercase tracking-widest">Full Name</span>
                                            <span className="text-xs font-black text-text uppercase italic">{selectedApplicant.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[9px] font-bold text-text/30 uppercase tracking-widest">Email Address</span>
                                            <span className="text-xs font-black text-text italic">{selectedApplicant.email}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[9px] font-bold text-text/30 uppercase tracking-widest">Department</span>
                                            <span className="text-xs font-black text-text uppercase italic">{selectedApplicant.department} • Year {selectedApplicant.year}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.3em] flex items-center gap-2 italic">
                                        <FontAwesomeIcon icon={faStar} /> Professional Summary
                                    </h4>
                                    <p className="text-sm text-text/60 font-medium leading-relaxed italic border-l-2 border-accent/20 pl-6">
                                        {selectedApplicant.about}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.3em] flex items-center gap-2 italic">
                                        <FontAwesomeIcon icon={faCode} /> Skills
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedApplicant.skills?.split(',').map((s: string, i: number) => (
                                            <span key={i} className="text-[9px] font-black text-accent bg-accent/5 px-4 py-2 rounded-xl border border-accent/10 uppercase tracking-widest italic">{s.trim()}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.3em] flex items-center gap-2 italic">
                                        <FontAwesomeIcon icon={faGlobe} /> External Profiles
                                    </h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        {selectedApplicant.github_profile && (
                                            <a href={selectedApplicant.github_profile} target="_blank" className="flex flex-col items-center gap-2 p-4 bg-background border border-border rounded-2xl hover:border-text transition-all group/node italic">
                                                <FontAwesomeIcon icon={faGithub} className="text-xl text-text/40 group-hover/node:text-text" />
                                                <span className="text-[8px] font-black uppercase tracking-widest">GitHub</span>
                                            </a>
                                        )}
                                        {selectedApplicant.leetcode_profile && (
                                            <a href={selectedApplicant.leetcode_profile} target="_blank" className="flex flex-col items-center gap-2 p-4 bg-background border border-border rounded-2xl hover:border-orange-500 transition-all group/node italic">
                                                <FontAwesomeIcon icon={faTerminal} className="text-xl text-text/40 group-hover/node:text-orange-500" />
                                                <span className="text-[8px] font-black uppercase tracking-widest">LeetCode</span>
                                            </a>
                                        )}
                                        {selectedApplicant.gfg_profile && (
                                            <a href={selectedApplicant.gfg_profile} target="_blank" className="flex flex-col items-center gap-2 p-4 bg-background border border-border rounded-2xl hover:border-accent transition-all group/node italic">
                                                <FontAwesomeIcon icon={faGlobe} className="text-xl text-text/40 group-hover/node:text-accent" />
                                                <span className="text-[8px] font-black uppercase tracking-widest">GfG</span>
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {selectedApplicant.resume_url && (
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => {
                                                const win = window.open();
                                                win?.document.write(`<iframe src="${selectedApplicant.resume_url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-lg shadow-blue-500/5 italic"
                                        >
                                            <FontAwesomeIcon icon={faExternalLinkAlt} /> View Resume
                                        </button>
                                        <a 
                                            href={selectedApplicant.resume_url} 
                                            download={`${selectedApplicant.name}_Resume.pdf`}
                                            className="flex-1 flex items-center justify-center gap-2 bg-card border border-border py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-accent hover:text-accent transition-all shadow-sm italic"
                                        >
                                            <FontAwesomeIcon icon={faFileAlt} /> Download
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12 bg-background/50 border-t border-border flex gap-6 sticky bottom-0">
                        <button 
                            onClick={() => { handleModerateApplicant(selectedApplicant.id, 'approve'); setSelectedApplicant(null); }}
                            className="flex-grow bg-accent hover:bg-gfg-green-hover text-white py-6 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] transition shadow-2xl shadow-accent/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            <FontAwesomeIcon icon={faCheck} /> Approve Member
                        </button>
                        <button 
                            onClick={() => { handleModerateApplicant(selectedApplicant.id, 'reject'); setSelectedApplicant(null); }}
                            className="flex-grow bg-card border border-border hover:bg-red-500 hover:text-white py-6 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] transition active:scale-95"
                        >
                            Reject Application
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
            <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-xl overflow-y-auto">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-border rounded-3xl w-full max-w-4xl my-auto shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="p-6 md:p-8 border-b border-border flex justify-between items-center bg-background/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 font-black border border-purple-500/20 text-xl shadow-inner">
                                <FontAwesomeIcon icon={faCode} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-text uppercase tracking-tighter italic">Review <span className="text-purple-500">Project</span></h2>
                                <div className="flex items-center gap-2">
                                    <p className="text-[8px] font-black text-text/40 uppercase tracking-widest">Project ID: #{selectedProject.id} • Submitted by {selectedProject.creator_name}</p>
                                    <Link to={`/profile/${selectedProject.created_by}`} target="_blank" className="text-[8px] font-black text-purple-500 hover:underline uppercase tracking-widest flex items-center gap-1 italic">
                                        View Profile <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[8px]" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setSelectedProject(null)} className="text-text/40 hover:text-red-500 p-2 rounded-full transition-all active:scale-90"><FontAwesomeIcon icon={faTimes} size="lg" /></button>
                    </div>
                    
                    <div className="p-6 md:p-10 space-y-8 overflow-y-auto custom-scrollbar flex-grow">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-text uppercase italic tracking-tight">{selectedProject.title}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProject.tech_stack?.split(',').map((s: string, i: number) => (
                                        <span key={i} className="text-[8px] font-black text-purple-500 bg-purple-500/5 px-3 py-1 rounded-lg border border-purple-500/10 uppercase tracking-widest italic">{s.trim()}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-widest flex items-center gap-2 italic">
                                    <FontAwesomeIcon icon={faAlignLeft} /> Description
                                </h4>
                                <div className="text-sm text-text/60 leading-relaxed font-medium italic border-l-2 border-purple-500/20 pl-6 ql-editor !p-0" dangerouslySetInnerHTML={{ __html: selectedProject.description }} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                {selectedProject.github_link && (
                                    <a href={selectedProject.github_link} target="_blank" className="flex items-center justify-center gap-2 p-4 bg-background border border-border rounded-xl hover:border-text transition-all group/node italic">
                                        <FontAwesomeIcon icon={faGithub} className="text-text/40 group-hover/node:text-text" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Source Code</span>
                                    </a>
                                )}
                                {selectedProject.demo_link && (
                                    <a href={selectedProject.demo_link} target="_blank" className="flex items-center justify-center gap-2 p-4 bg-background border border-border rounded-xl hover:border-purple-500 transition-all group/node italic">
                                        <FontAwesomeIcon icon={faGlobe} className="text-text/40 group-hover/node:text-purple-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Live Demo</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 md:p-8 bg-background/50 border-t border-border flex gap-4 sticky bottom-0">
                        <button 
                            onClick={() => { handleModerateProject(selectedProject.id, 'Approved'); setSelectedProject(null); }}
                            className="flex-grow bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest transition shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            <FontAwesomeIcon icon={faCheck} /> Authorize Project
                        </button>
                        <button 
                            onClick={() => { handleModerateProject(selectedProject.id, 'Rejected'); setSelectedProject(null); }}
                            className="flex-grow bg-card border border-border hover:bg-red-500 hover:text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest transition active:scale-95"
                        >
                            Reject
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Config Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-xl overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-border rounded-[3.5rem] w-full max-w-4xl my-auto shadow-2xl overflow-hidden">
              <div className="p-10 border-b border-border flex justify-between items-center bg-background/50">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent/10 rounded-xl text-accent"><FontAwesomeIcon icon={faCog} /></div>
                    <div>
                        <h2 className="text-3xl font-black text-text uppercase tracking-tighter italic">Profile Settings</h2>
                        <p className="text-[10px] font-black text-text/40 uppercase tracking-widest">Update your personal information</p>
                    </div>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="text-text/40 hover:text-red-500 p-4 hover:bg-red-500/5 rounded-full transition-all active:scale-90"><FontAwesomeIcon icon={faTimes} size="32" /></button>
              </div>
              <form onSubmit={handleUpdateProfile} className="p-10 md:p-14 space-y-10 custom-scrollbar overflow-y-auto max-h-[70vh]">
                {isGuest && (
                    <div className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-3xl space-y-2">
                        <p className="text-blue-500 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                            <FontAwesomeIcon icon={faShieldAlt} /> Neural Verification Required
                        </p>
                        <p className="text-text/40 text-[9px] leading-relaxed italic uppercase font-bold">
                            As a guest, you can only update your core identity. Verified RIT membership is required to modify skills, bio, and social nodes.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 italic">
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.3em] ml-2">Full Name</label>
                        <input type="text" className="w-full bg-background border-2 border-border rounded-2xl py-5 px-8 focus:border-accent outline-none text-text font-black text-lg transition shadow-inner" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} />
                    </div>
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.3em] ml-2">Department</label>
                        <input type="text" className="w-full bg-background border-2 border-border rounded-2xl py-5 px-8 focus:border-accent outline-none text-text font-black text-lg transition shadow-inner" value={editFormData.department} onChange={(e) => setEditFormData({...editFormData, department: e.target.value})} />
                    </div>
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.3em] ml-2">Academic Year</label>
                        <input type="number" min="1" max="4" className="w-full bg-background border-2 border-border rounded-2xl py-5 px-8 focus:border-accent outline-none text-text font-black text-lg transition shadow-inner" value={editFormData.year} onChange={(e) => setEditFormData({...editFormData, year: e.target.value})} />
                    </div>
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.3em] ml-2">Technical Skills (Comma Separated)</label>
                        <input disabled={isGuest} type="text" className="w-full bg-background border-2 border-border rounded-2xl py-5 px-8 focus:border-accent outline-none text-text font-black text-lg transition shadow-inner disabled:opacity-30" placeholder="React, Python, AWS..." value={editFormData.skills} onChange={(e) => setEditFormData({...editFormData, skills: e.target.value})} />
                    </div>
                </div>

                {!isGuest && (
                    <div className="space-y-3">
                        <MarkdownEditor 
                            label="About & Biography"
                            value={editFormData.about}
                            onChange={(val) => setEditFormData({...editFormData, about: val})}
                            placeholder="Introduce yourself to the community..."
                        />
                    </div>
                )}

                <div className="space-y-6 pt-6 border-t border-border/50">
                    <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.4em] italic ml-2">Neural Profile Nodes</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="block text-[8px] font-black text-text/30 uppercase tracking-[0.2em] ml-2">GitHub Profile</label>
                            <div className="relative group">
                                <FontAwesomeIcon icon={faGithub} className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors" />
                                <input disabled={isGuest} type="url" className="w-full bg-background border-2 border-border rounded-xl py-4 pl-12 pr-6 focus:border-accent outline-none text-text text-xs font-bold transition shadow-inner disabled:opacity-30" placeholder="https://github.com/..." value={editFormData.github_profile} onChange={(e) => setEditFormData({...editFormData, github_profile: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[8px] font-black text-text/30 uppercase tracking-[0.2em] ml-2">LeetCode Profile</label>
                            <div className="relative group">
                                <FontAwesomeIcon icon={faTerminal} className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-orange-500 transition-colors" />
                                <input disabled={isGuest} type="url" className="w-full bg-background border-2 border-border rounded-xl py-4 pl-12 pr-6 focus:border-accent outline-none text-text text-xs font-bold transition shadow-inner disabled:opacity-30" placeholder="https://leetcode.com/..." value={editFormData.leetcode_profile} onChange={(e) => setEditFormData({...editFormData, leetcode_profile: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[8px] font-black text-text/30 uppercase tracking-[0.2em] ml-2">GeeksforGeeks Profile</label>
                            <div className="relative group">
                                <FontAwesomeIcon icon={faCode} className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-green-500 transition-colors" />
                                <input disabled={isGuest} type="url" className="w-full bg-background border-2 border-border rounded-xl py-4 pl-12 pr-6 focus:border-accent outline-none text-text text-xs font-bold transition shadow-inner disabled:opacity-30" placeholder="https://geeksforgeeks.org/profile/..." value={editFormData.gfg_profile} onChange={(e) => setEditFormData({...editFormData, gfg_profile: e.target.value})} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-6 pt-6">
                    <button type="submit" className="flex-grow bg-accent hover:bg-gfg-green-hover text-white font-black py-6 rounded-[1.5rem] uppercase tracking-widest text-sm active:scale-[0.98]">Save Changes</button>
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-grow bg-card border border-border hover:bg-background text-text/60 font-black py-6 rounded-[1.5rem] transition uppercase tracking-widest text-xs shadow-sm">Cancel</button>
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
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Dashboard;
