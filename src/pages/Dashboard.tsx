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

const Dashboard = () => {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [myDiscussions, setMyDiscussions] = useState([]);
  const [pendingProjects, setPendingProjects] = useState([]);
  const [groupRequests, setGroupRequests] = useState([]);
  const [userApplicants, setUserApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [potd, setPotd] = useState(null);
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
      const safeGet = async (url) => {
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
              setUserApplicants({ error: 'REAUTH_REQUIRED' });
          } else if (applicantsRes?.data) {
              setUserApplicants(applicantsRes.data);
          } else {
              setUserApplicants([]);
          }
      } else {
          setUserApplicants([]);
      }
      
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

  const handleModerateApplicant = async (applicantId, action) => {
    try {
        await api.put(`/users/applicants/${applicantId}/${action}`);
        fetchData();
    } catch (error) {
        alert(`${action} failed`);
    }
  };

  const handleModerateProject = async (projectId, status) => {
    try {
        await api.put(`/projects/${projectId}/status`, { status });
        fetchData();
    } catch (error) {
        alert(`${status} failed`);
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

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFormData({ ...editFormData, profile_pic: reader.result });
      };
      reader.readAsDataURL(file);
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

  const contributionData = useMemo(() => {
    const days = 365;
    const data = [];
    const today = new Date();
    
    // Fill with empty days first
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

  const getColorLevel = (count) => {
    if (count === 0) return 'bg-border/30';
    if (count <= 2) return 'bg-accent/20';
    if (count <= 5) return 'bg-accent/40';
    if (count <= 10) return 'bg-accent/70';
    return 'bg-accent';
  };

  const isGuest = user?.role === 'Guest';

  if (loading) return <div className="text-center py-40 text-accent font-black tracking-[0.3em] uppercase animate-pulse text-xs italic">Synchronizing Terminal...</div>;

  if (isGuest) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-8 max-w-7xl pb-16">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-border pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-black text-text tracking-tighter uppercase italic">Guest <span className="text-accent">Console</span>: {profile?.name}</h1>
            <p className="text-text/40 font-black text-[9px] tracking-[0.2em] uppercase flex items-center gap-2"><FontAwesomeIcon icon={faGlobe} className="text-blue-500" /> Public Node Access - Event Participation Track</p>
          </div>
          <button onClick={() => setIsEditModalOpen(true)} className="bg-card border border-border px-5 py-2.5 rounded-xl font-black flex items-center gap-2 hover:border-accent transition text-text/60 hover:text-accent text-[10px] uppercase tracking-widest shadow-sm active:scale-95">
            <FontAwesomeIcon icon={faCog} /> Identity Config
          </button>
        </motion.div>

        {/* Invitations Queue - CRITICAL FOR GUESTS */}
        <AnimatePresence>
            {invitations.length > 0 ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-3xl shadow-xl space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20"><FontAwesomeIcon icon={faUserPlus} /></div>
                        <h2 className="text-2xl font-black text-text uppercase tracking-tight italic">Team Requests</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {invitations.map(inv => (
                            <div key={inv.reg_id} className="bg-card border border-border p-5 rounded-2xl space-y-4 shadow-sm hover:border-blue-500/50 transition-colors">
                                <div>
                                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Invitation Received</p>
                                    <h4 className="font-black text-text text-lg uppercase italic">{inv.team_name}</h4>
                                    <p className="text-[8px] font-bold text-text/40 uppercase tracking-widest mt-1">Event: {inv.event_title}</p>
                                    <p className="text-[8px] font-bold text-text/40 uppercase tracking-widest">Inviter: {inv.inviter_name}</p>
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
                    <p className="text-text/30 font-black tracking-widest uppercase text-xs italic">No pending team transmissions.</p>
                </div>
            )}
        </AnimatePresence>

        {/* Missions Section */}
        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-accent" />
                <h2 className="text-2xl font-black text-text uppercase tracking-tighter italic">Participating In</h2>
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
                    <p className="text-text/30 font-black tracking-widest uppercase text-xs italic">Join an event to start your journey.</p>
                </div>
            )}
        </div>

        {/* Config Modal Still Available */}
        <AnimatePresence>
            {isEditModalOpen && (
              /* Config Modal JSX handled at bottom - but wait, the logic needs it here too or moved down. */
              /* In React, it's better to have one instance. I'll make sure it's at the end of the return block. */
              null 
            )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-8 max-w-7xl pb-16">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-border pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-text tracking-tighter uppercase italic">Terminal <span className="text-accent">Node</span>: {profile?.name}</h1>
          <div className="flex items-center gap-3">
            <p className="text-text/40 font-black text-[9px] tracking-[0.2em] uppercase flex items-center gap-1.5"><FontAwesomeIcon icon={faStar} className="text-accent" /> Control Center & Core Identity</p>
            {profile && <span className="bg-accent/10 text-accent text-[7px] font-black px-1.5 py-0.5 rounded border border-accent/20 uppercase tracking-widest">{profile.role}</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <Link to="/community?new=true" className="flex-1 lg:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-black flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/10 text-[9px] uppercase tracking-widest active:scale-95">
            <FontAwesomeIcon icon={faComments} /> Discussion
          </Link>
          <button onClick={() => handleSync(false)} disabled={syncing} className="flex-1 lg:flex-none bg-accent hover:bg-gfg-green-hover text-white px-4 py-2 rounded-xl font-black flex items-center justify-center gap-2 transition shadow-lg shadow-accent/10 text-[9px] uppercase tracking-widest active:scale-95 disabled:opacity-50">
            <FontAwesomeIcon icon={faSync} className={syncing ? 'fa-spin' : ''} /> Sync
          </button>
          <button onClick={() => setIsEditModalOpen(true)} className="flex-1 lg:flex-none bg-card border border-border px-4 py-2 rounded-xl font-black flex items-center justify-center gap-2 hover:border-accent transition text-text/60 hover:text-accent text-[9px] uppercase tracking-widest shadow-sm active:scale-95">
            <FontAwesomeIcon icon={faCog} /> Identity Config
          </button>
        </div>
      </motion.div>

      {/* Invitations Queue - Transmissions for user */}
      <AnimatePresence>
          {invitations.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-3xl shadow-xl space-y-4 overflow-hidden">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20"><FontAwesomeIcon icon={faUserPlus} /></div>
                      <h2 className="text-xl font-black text-text uppercase tracking-tight italic">Pending Transmissions</h2>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {invitations.map(inv => (
                            <div key={inv.reg_id} className="bg-card border border-border p-4 rounded-xl space-y-3 shadow-sm hover:border-blue-500/50 transition-colors">
                                <div>
                                    <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-0.5">Team Invitation</p>
                                    <h4 className="text-sm font-black text-text uppercase italic">{inv.team_name}</h4>
                                    <p className="text-[8px] font-bold text-text/40 uppercase tracking-widest">For: {inv.event_title}</p>
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

      {/* Management Sector - Consolidated Moderation List for Admin/Core */}
      {canModerate && (groupRequests.length > 0 || pendingProjects.length > 0 || (user?.role === 'Admin' && userApplicants.length > 0)) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 bg-card border border-border p-6 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                      <FontAwesomeIcon icon={faShieldAlt} className="text-accent" />
                      <h3 className="text-xl font-black text-text uppercase italic tracking-tight">Management Sector</h3>
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
                                      <span className="text-[7px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-1.5 py-0.5 rounded">Access Request</span>
                                      <h4 className="text-sm font-black text-text uppercase italic">{req.user_name}</h4>
                                      <Link to={`/profile/${req.user_id}`} className="text-[7px] font-black text-blue-500 hover:underline flex items-center gap-1 uppercase tracking-widest ml-2">
                                          View Profile <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[8px]" />
                                      </Link>
                                  </div>
                                  <p className="text-[9px] text-text/40 font-bold uppercase tracking-widest">Sector: {req.group_title}</p>
                              </div>
                          </div>
                          <div className="flex gap-2">
                              <button onClick={() => handleRespondGroupRequest(req.id, 'Accepted')} className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-lg transition-all active:scale-95 shadow-lg shadow-blue-500/10"><FontAwesomeIcon icon={faCheck} /></button>
                              <button onClick={() => handleRespondGroupRequest(req.id, 'Declined')} className="bg-background border border-border hover:bg-red-500 hover:text-white p-1.5 rounded-lg transition-all active:scale-95 shadow-sm"><FontAwesomeIcon icon={faTimes} /></button>
                          </div>
                      </div>
                  ))}

                  {/* Project Build Requests */}
                  {pendingProjects.map((proj) => (
                      <div key={`proj-${proj.id}`} onClick={() => setSelectedProject(proj)} className="flex items-center justify-between p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl hover:border-purple-500/30 transition-all group cursor-pointer">
                          <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500"><FontAwesomeIcon icon={faDesktop} /></div>
                              <div>
                                  <div className="flex items-center gap-2">
                                      <span className="text-[7px] font-black text-purple-500 uppercase tracking-widest bg-purple-500/10 px-1.5 py-0.5 rounded">Build Request</span>
                                      <h4 className="text-sm font-black text-text uppercase italic group-hover:text-purple-500 transition-colors">{proj.title}</h4>
                                  </div>
                                  <p className="text-[9px] text-text/40 font-bold uppercase tracking-widest">Architect: {proj.creator_name}</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-3">
                              <span className="text-[8px] font-black text-purple-500/40 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Click to Review</span>
                              <FontAwesomeIcon icon={faChevronRight} className="text-text/20 group-hover:text-purple-500" />
                          </div>
                      </div>
                  ))}

                  {/* Core Ingress Applications */}
                  {user?.role === 'Admin' && Array.isArray(userApplicants) && userApplicants.map((app) => (
                      <div key={`app-${app.id}`} onClick={() => setSelectedApplicant(app)} className="flex items-center justify-between p-3 bg-accent/5 border border-accent/10 rounded-xl hover:border-accent/30 transition-all group cursor-pointer">
                          <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                                  {app.profile_pic ? <img src={app.profile_pic} className="w-full h-full object-cover rounded-lg" alt="" /> : <FontAwesomeIcon icon={faUser} />}
                              </div>
                              <div>
                                  <div className="flex items-center gap-2">
                                      <span className="text-[7px] font-black text-accent uppercase tracking-widest bg-accent/10 px-1.5 py-0.5 rounded">Ingress Request</span>
                                      <h4 className="text-sm font-black text-text uppercase italic group-hover:text-accent transition-colors">{app.name}</h4>
                                  </div>
                                  <p className="text-[9px] text-text/40 font-bold uppercase tracking-widest">{app.department} • Year {app.year}</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-3">
                              <span className="text-[8px] font-black text-accent/40 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Review Dossier</span>
                              <FontAwesomeIcon icon={faChevronRight} className="text-text/20 group-hover:text-accent" />
                          </div>
                      </div>
                  ))}
              </div>
          </motion.div>
      )}

      {/* Stats and main sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Problems Solved" value={profile?.problems_solved || 0} icon={faCode} color="bg-accent" />
        <StatsCard title="GFG Core Score" value={profile?.gfg_score || 0} icon={faStar} color="bg-yellow-500" />
        <StatsCard title="Activity Streak" value={`${profile?.streak || 0} Days`} icon={faChartLine} iconColor="text-orange-500" color="bg-orange-500" />
        <StatsCard title="Campus Authority" value={`#${profile?.id || 0}`} icon={faTrophy} color="bg-blue-500" />
      </div>

      {/* Contribution Graph */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border p-6 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-accent" />
                  <h3 className="text-xl font-black text-text uppercase italic tracking-tight">Active Contribution Graph</h3>
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
              <p className="text-[9px] font-bold text-text/40 uppercase tracking-widest italic">Signal consistency over the last 365 rotational cycles</p>
              <p className="text-[9px] font-black text-accent uppercase tracking-widest">{contributionData.filter(d => d.count > 0).length} Days of Activity</p>
          </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            
            {/* REGISTERED MISSIONS */}
            <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-accent" />
                    <h2 className="text-2xl font-black text-text uppercase tracking-tighter italic">Active Missions</h2>
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
                                            <div className="flex gap-2 mt-1">
                                                <span className="text-[9px] font-black text-text/40 uppercase tracking-widest">{reg.team_name ? `Team: ${reg.team_name}` : 'Individual'}</span>
                                                {reg.is_leader && <span className="bg-accent/10 text-accent text-[7px] font-black px-1.5 py-0.5 rounded border border-accent/20 uppercase tracking-widest">Leader</span>}
                                            </div>
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
                            <p className="text-text/30 font-black tracking-widest uppercase text-xs">No Missions Authorized.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* PROJECT REGISTRY */}
            <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <FontAwesomeIcon icon={faBookOpen} className="text-accent" />
                        <h2 className="text-2xl font-black text-text uppercase tracking-tighter italic">Project Registry</h2>
                    </div>
                    <Link to="/projects" className="bg-accent/10 text-accent px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-accent/20 hover:bg-accent hover:text-white transition-all">Submit Build</Link>
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
                        <div className="py-12 text-center bg-background/30 rounded-2xl border-2 border-dashed border-border"><p className="text-text/30 font-black tracking-widest uppercase text-xs">No Build Data found.</p></div>
                    )}
                </div>
            </div>

            {/* COMMUNITY TRANSMISSIONS */}
            <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <FontAwesomeIcon icon={faMessage} className="text-blue-500" />
                    <h2 className="text-2xl font-black text-text uppercase tracking-tighter italic">Transmissions</h2>
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
                        <div className="py-12 text-center bg-background/30 rounded-2xl border-2 border-dashed border-border"><p className="text-text/30 font-black tracking-widest uppercase text-xs">No transmissions.</p></div>
                    )}
                </div>
            </div>
        </div>

        {/* Sidebar Nodes */}
        <div className="space-y-8">
            {!isGuest && (
              <POTDCard potd={potd} loading={potdLoading} />
            )}
            <div className="bg-card border border-border p-6 rounded-3xl shadow-sm sticky top-20">
                <div className="flex items-center gap-3 mb-6">
                    <FontAwesomeIcon icon={faZap} className="text-yellow-500" />
                    <h2 className="text-2xl font-black text-text uppercase tracking-tighter italic">Interface Nodes</h2>
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
                        <h4 className="font-black text-text uppercase text-[10px] tracking-widest italic">Rank Milestone</h4>
                    </div>
                    <div className="w-full bg-background border border-border h-2 rounded-full overflow-hidden shadow-inner">
                        <div className="bg-accent h-full w-[65%] shadow-lg shadow-accent/20"></div>
                    </div>
                    <p className="text-[8px] font-black text-text/40 uppercase tracking-widest text-center italic">Level 4 Node Access at 100 Solved</p>
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
                                <h2 className="text-3xl md:text-4xl font-black text-text uppercase tracking-tighter italic">Core Ingress <span className="text-accent">Dossier</span></h2>
                                <p className="text-[10px] font-black text-text/40 uppercase tracking-widest">Candidate ID: #{selectedApplicant.id} • Status: Pending Verification</p>
                            </div>
                        </div>
                        <button onClick={() => setSelectedApplicant(null)} className="text-text/40 hover:text-red-500 p-2 rounded-full transition-all active:scale-90"><FontAwesomeIcon icon={faTimes} size="2x" /></button>
                    </div>
                    
                    <div className="p-8 md:p-12 space-y-12 overflow-y-auto custom-scrollbar flex-grow">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.3em] flex items-center gap-2 italic">
                                        <FontAwesomeIcon icon={faUser} /> Identity Data
                                    </h4>
                                    <div className="bg-background/50 border border-border p-6 rounded-2xl space-y-4 shadow-inner">
                                        <div className="flex justify-between">
                                            <span className="text-[9px] font-bold text-text/30 uppercase tracking-widest">Real Name</span>
                                            <span className="text-xs font-black text-text uppercase italic">{selectedApplicant.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[9px] font-bold text-text/30 uppercase tracking-widest">Matrix Link</span>
                                            <span className="text-xs font-black text-text italic">{selectedApplicant.email}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-[9px] font-bold text-text/30 uppercase tracking-widest">Sector Node</span>
                                            <span className="text-xs font-black text-text uppercase italic">{selectedApplicant.department} • Year {selectedApplicant.year}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.3em] flex items-center gap-2 italic">
                                        <FontAwesomeIcon icon={faStar} /> Technical Persona
                                    </h4>
                                    <p className="text-sm text-text/60 font-medium leading-relaxed italic border-l-2 border-accent/20 pl-6">
                                        {selectedApplicant.about}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.3em] flex items-center gap-2 italic">
                                        <FontAwesomeIcon icon={faCode} /> Skill Matrix
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedApplicant.skills?.split(',').map((s, i) => (
                                            <span key={i} className="text-[9px] font-black text-accent bg-accent/5 px-4 py-2 rounded-xl border border-accent/10 uppercase tracking-widest italic">{s.trim()}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.3em] flex items-center gap-2 italic">
                                        <FontAwesomeIcon icon={faGlobe} /> External Nodes
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
                                                win.document.write(`<iframe src="${selectedApplicant.resume_url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-lg shadow-blue-500/5 italic"
                                        >
                                            <FontAwesomeIcon icon={faExternalLinkAlt} /> Open Dossier
                                        </button>
                                        <a 
                                            href={selectedApplicant.resume_url} 
                                            download={`${selectedApplicant.name}_Dossier.pdf`}
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
                            <FontAwesomeIcon icon={faCheck} /> Authorize Ingress
                        </button>
                        <button 
                            onClick={() => { handleModerateApplicant(selectedApplicant.id, 'reject'); setSelectedApplicant(null); }}
                            className="flex-grow bg-card border border-border hover:bg-red-500 hover:text-white py-6 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] transition active:scale-95"
                        >
                            Decline Application
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Project Detail Modal for Moderation */}
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
                                <h2 className="text-2xl font-black text-text uppercase tracking-tighter italic">Review <span className="text-purple-500">Build</span></h2>
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
                                    {selectedProject.tech_stack?.split(',').map((s, i) => (
                                        <span key={i} className="text-[8px] font-black text-purple-500 bg-purple-500/5 px-3 py-1 rounded-lg border border-purple-500/10 uppercase tracking-widest italic">{s.trim()}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-widest flex items-center gap-2 italic">
                                    <FontAwesomeIcon icon={faAlignLeft} /> Architecture & Process
                                </h4>
                                <div className="text-sm text-text/60 leading-relaxed font-medium italic border-l-2 border-purple-500/20 pl-6 ql-editor !p-0" dangerouslySetInnerHTML={{ __html: selectedProject.description }} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                {selectedProject.github_link && (
                                    <a href={selectedProject.github_link} target="_blank" className="flex items-center justify-center gap-2 p-4 bg-background border border-border rounded-xl hover:border-text transition-all group/node italic">
                                        <FontAwesomeIcon icon={faGithub} className="text-text/40 group-hover/node:text-text" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Source Repository</span>
                                    </a>
                                )}
                                {selectedProject.demo_link && (
                                    <a href={selectedProject.demo_link} target="_blank" className="flex items-center justify-center gap-2 p-4 bg-background border border-border rounded-xl hover:border-purple-500 transition-all group/node italic">
                                        <FontAwesomeIcon icon={faGlobe} className="text-text/40 group-hover/node:text-purple-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Live Deployment</span>
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
                            <FontAwesomeIcon icon={faCheck} /> Authorize Build
                        </button>
                        <button 
                            onClick={() => { handleModerateProject(selectedProject.id, 'Rejected'); setSelectedProject(null); }}
                            className="flex-grow bg-card border border-border hover:bg-red-500 hover:text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest transition active:scale-95"
                        >
                            Decline
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
                        <h2 className="text-3xl font-black text-text uppercase tracking-tighter italic">Core Identity Config</h2>
                        <p className="text-[10px] font-black text-text/40 uppercase tracking-widest">Update your matrix credentials</p>
                    </div>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="text-text/40 hover:text-red-500 p-4 hover:bg-red-500/5 rounded-full transition-all active:scale-90"><FontAwesomeIcon icon={faTimes} size="32" /></button>
              </div>
              <form onSubmit={handleUpdateProfile} className="p-10 md:p-14 space-y-10 custom-scrollbar overflow-y-auto max-h-[70vh]">
                <div className="flex flex-col items-center gap-6 pb-10 border-b border-border/50 italic">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-accent/10 border-2 border-dashed border-accent/30 flex items-center justify-center overflow-hidden relative">
                            {editFormData.profile_pic && user?.role !== 'Guest' ? (
                                <img src={editFormData.profile_pic} className="w-full h-full object-cover" alt="Profile" />
                            ) : (
                                <span className="text-4xl font-black text-accent/40">{editFormData.name[0]}</span>
                            )}
                            {user?.role !== 'Guest' && (
                              <>
                                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleProfilePicChange} />
                                <div className="absolute inset-0 bg-accent/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <FontAwesomeIcon icon={faPlus} size="2x" className="text-white" />
                                </div>
                              </>
                            )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-accent text-white p-2 rounded-xl shadow-lg border border-white/20">
                            <FontAwesomeIcon icon={faUser} />
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-black text-text uppercase tracking-widest">{user?.role === 'Guest' ? 'Guest Entity ID' : 'Identify Node Avatar'}</p>
                        <p className="text-[9px] font-bold text-text/30 uppercase tracking-[0.2em] mt-1">
                          {user?.role === 'Guest' ? 'Avatar customization restricted for guests' : 'Click to upload new visual ID'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 italic">
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.3em] ml-2">Agent Name</label>
                        <div className="relative">
                            <FontAwesomeIcon icon={faUser} className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20" />
                            <input type="text" className="w-full bg-background border-2 border-border rounded-2xl py-5 pl-14 pr-8 focus:border-accent outline-none text-text font-black text-lg transition shadow-inner" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.3em] ml-2">Department Node</label>
                        <div className="relative">
                            <FontAwesomeIcon icon={faGlobe} className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20" />
                            <input type="text" className="w-full bg-background border-2 border-border rounded-2xl py-5 pl-14 pr-8 focus:border-accent outline-none text-text font-black text-lg transition shadow-inner" value={editFormData.department} onChange={(e) => setEditFormData({...editFormData, department: e.target.value})} />
                        </div>
                    </div>
                    {user?.role !== 'Guest' ? (
                      <>
                        <div className="space-y-3 md:col-span-2">
                            <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.3em] ml-2">Technological Skills (CSV)</label>
                            <div className="relative">
                                <FontAwesomeIcon icon={faHashtag} className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20" />
                                <input type="text" className="w-full bg-background border-2 border-border rounded-2xl py-5 pl-14 pr-8 focus:border-accent outline-none text-text font-black text-lg transition shadow-inner" placeholder="React, Node.js, Python, C++" value={editFormData.skills} onChange={(e) => setEditFormData({ ...editFormData, skills: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-3 md:col-span-2">
                            <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.3em] ml-2">Persona Narrative</label>
                            <textarea required rows={4} className="w-full bg-background border-2 border-border rounded-2xl py-5 px-8 focus:border-accent outline-none text-text font-medium text-lg transition shadow-inner resize-none" placeholder="Briefly define your technical focus and goals..." value={editFormData.about} onChange={(e) => setEditFormData({ ...editFormData, about: e.target.value })} />
                        </div>
                      </>
                    ) : (
                      <div className="md:col-span-2 p-6 bg-accent/5 rounded-2xl border border-accent/20 text-center space-y-2">
                        <p className="text-[10px] font-black text-accent uppercase tracking-widest">Guest Profile Restricted</p>
                        <p className="text-[9px] font-bold text-text/40 uppercase tracking-widest">Technical profiles (Skills/About) are exclusive to RIT Core Agents.</p>
                      </div>
                    )}
                </div>

                <div className="space-y-8 pt-10 border-t border-border/50 italic">
                    <h3 className="font-black text-xl text-text uppercase tracking-widest flex items-center gap-3">
                        <FontAwesomeIcon icon={faLink} className="text-accent" /> Data Node Interface
                    </h3>
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">GeeksforGeeks Profile Link</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-green-600"><FontAwesomeIcon icon={faCode} /></div>
                                <input type="url" placeholder="https://www.geeksforgeeks.org/user/..." className="w-full bg-background border-2 border-border rounded-2xl py-5 pl-14 pr-8 focus:border-accent outline-none text-text font-bold text-sm transition shadow-inner" value={editFormData.gfg_profile} onChange={(e) => setEditFormData({...editFormData, gfg_profile: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">LeetCode Logic Node</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-yellow-500"><FontAwesomeIcon icon={faTerminal} /></div>
                                <input type="url" placeholder="https://leetcode.com/..." className="w-full bg-background border-2 border-border rounded-2xl py-5 pl-14 pr-8 focus:border-accent outline-none text-text font-bold text-sm transition shadow-inner" value={editFormData.leetcode_profile} onChange={(e) => setEditFormData({...editFormData, leetcode_profile: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">GitHub Matrix Node</label>
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text"><FontAwesomeIcon icon={faGithub} /></div>
                                <input type="url" placeholder="https://github.com/..." className="w-full bg-background border-2 border-border rounded-2xl py-5 pl-14 pr-8 focus:border-accent outline-none text-text font-bold text-sm transition shadow-inner" value={editFormData.github_profile} onChange={(e) => setEditFormData({...editFormData, github_profile: e.target.value})} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-6 pt-6 sticky bottom-0 bg-card/80 backdrop-blur-md italic">
                    <button type="submit" className="flex-grow bg-accent hover:bg-gfg-green-hover text-white font-black py-6 rounded-[1.5rem] flex items-center justify-center gap-4 transition shadow-2xl shadow-accent/20 uppercase tracking-widest text-sm active:scale-[0.98]">
                        <FontAwesomeIcon icon={faSave} /> Commit Changes
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
