import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, faMapPin, faUsers, faArrowLeft, faCheckCircle, faInfoCircle, faTimes, 
  faTrashAlt, faScroll, faBookOpen, faUserPlus, faShieldAlt, faSignOutAlt, faEdit, faEnvelope, faUserMinus, faCheck 
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-quill-new/dist/quill.snow.css';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegListOpen, setIsRegListOpen] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [teamStatus, setTeamStatus] = useState(null);
  
  // Registration Form State
  const [isRegistering, setIsRegistering] = useState(false);
  const [regType, setRegType] = useState('individual');
  const [teamName, setTeamName] = useState('');
  const [memberEmails, setMemberEmails] = useState(['']);

  // Team Management State
  const [isEditingTeamName, setIsEditingTeamName] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  const canManage = user?.role === 'Admin' || user?.role === 'Core';
  const canRegister = user?.role !== 'Admin';

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/events/${id}`);
      setEvent(data);
      
      if (user) {
          const { data: status } = await api.get(`/events/${id}/team-status`);
          setTeamStatus(status);
          if (status?.isLeader) setNewTeamName(status.teamName);
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, user]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/events/register', { 
          eventId: id, 
          type: regType, 
          teamName: regType === 'team' ? teamName : null,
          memberEmails: regType === 'team' ? memberEmails.filter(email => email.trim() !== '') : []
      });
      alert('Registration successful!');
      setIsRegistering(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  const handleUnregister = async () => {
      const msg = teamStatus?.isLeader ? "Dissolve team and opt out?" : "Opt out of event?";
      if (window.confirm(msg)) {
          try {
              await api.delete(`/events/${id}/unregister`);
              alert('Opted out successfully');
              fetchData();
          } catch (error) {
              alert('Failed to opt out');
          }
      }
  };

  const handleUpdateTeamName = async () => {
      try {
          await api.put('/events/team/update-name', { teamId: teamStatus.teamId, newName: newTeamName });
          setIsEditingTeamName(false);
          fetchData();
      } catch (error) {
          alert('Failed to update team name');
      }
  };

  const handleInviteMember = async (e) => {
      e.preventDefault();
      try {
          await api.post('/events/team/invite', { teamId: teamStatus.teamId, email: inviteEmail });
          setInviteEmail('');
          alert('Invitation sent');
          fetchData();
      } catch (error) {
          alert(error.response?.data?.message || 'Invitation failed');
      }
  };

  const handleRemoveMember = async (memberId) => {
      if (window.confirm("Remove this agent from your team?")) {
          try {
              await api.post('/events/team/remove-member', { teamId: teamStatus.teamId, memberId });
              fetchData();
          } catch (error) {
              alert('Failed to remove member');
          }
      }
  };

  const handleViewRegistrations = async () => {
    try {
      const { data } = await api.get(`/events/${id}/registrations`);
      setRegistrations(data);
      setIsRegListOpen(true);
    } catch (error) {
      alert('Failed to fetch registrations');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Terminate this event node?')) {
      try {
        await api.delete(`/events/${id}`);
        navigate('/events');
      } catch (error) {
        alert('Failed to delete event');
      }
    }
  };

  const addMemberField = () => {
      if (memberEmails.length < (event.max_team_size - 1)) {
          setMemberEmails([...memberEmails, '']);
      }
  };

  const updateMemberEmail = (index, value) => {
      const newEmails = [...memberEmails];
      newEmails[index] = value;
      setMemberEmails(newEmails);
  };

  if (loading) return <div className="py-24 text-center text-accent font-black tracking-widest uppercase animate-pulse text-xs italic">Accessing Node...</div>;
  if (!event) return null;

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
        {event.poster ? (
          <img src={event.poster} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-accent/10 flex items-center justify-center">
            <FontAwesomeIcon icon={faCalendarAlt} size="5x" className="text-accent/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
        <div className="absolute top-6 left-6 z-20">
            <button onClick={() => navigate('/events')} className="flex items-center gap-1.5 text-white bg-black/40 hover:bg-black/60 backdrop-blur-md px-4 py-2 rounded-full transition-all group font-black uppercase text-[10px] tracking-widest border border-white/10">
                <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" /> Back
            </button>
        </div>
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10">
            <div className="max-w-7xl mx-auto space-y-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border backdrop-blur-md ${event.is_open ? 'bg-accent/80 text-white border-accent/20 shadow-lg' : 'bg-red-500/80 text-white border-red-500/20'}`}>
                        {event.is_open ? 'NODE ACTIVE' : 'NODE CLOSED'}
                    </span>
                    <span className="bg-blue-500/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10">
                        {event.participation_type}
                    </span>
                </motion.div>
                <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl md:text-5xl font-black text-text leading-tight tracking-tighter uppercase italic">{event.title}</motion.h1>
            </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border p-6 md:p-10 rounded-3xl shadow-xl space-y-8">
                    <div className="space-y-6">
                        <h3 className="text-xl font-black text-text uppercase tracking-tight italic flex items-center gap-3">
                            <FontAwesomeIcon icon={faInfoCircle} className="text-accent" /> Protocol
                        </h3>
                        <div className="text-text/80 leading-relaxed text-base ql-editor !p-0 formatted-content font-medium italic" dangerouslySetInnerHTML={{ __html: event.description }} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-border/50">
                        <div className="space-y-2">
                            <p className="text-text/20 text-[8px] font-black uppercase tracking-widest">Temporal Node</p>
                            <div className="flex items-center gap-3 text-text/80 font-black uppercase tracking-widest text-[10px] bg-background border border-border p-4 rounded-xl shadow-inner">
                                <FontAwesomeIcon icon={faCalendarAlt} className="text-accent" />
                                {new Date(event.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-text/20 text-[8px] font-black uppercase tracking-widest">Spatial Node</p>
                            <div className="flex items-center gap-3 text-text/80 font-black uppercase tracking-widest text-[10px] bg-background border border-border p-4 rounded-xl shadow-inner">
                                <FontAwesomeIcon icon={faMapPin} className="text-accent" />
                                {event.location}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Rules & Requirements */}
                {(event.rules || event.requirements) && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {event.rules && (
                            <div className="bg-card border border-border p-6 rounded-3xl shadow-lg space-y-4">
                                <h4 className="text-lg font-black text-text uppercase tracking-widest flex items-center gap-2 italic">
                                    <FontAwesomeIcon icon={faScroll} className="text-accent" /> Rules
                                </h4>
                                <div className="text-text/60 text-xs ql-editor !p-0 formatted-content font-medium italic" dangerouslySetInnerHTML={{ __html: event.rules }} />
                            </div>
                        )}
                        {event.requirements && (
                            <div className="bg-card border border-border p-6 rounded-3xl shadow-lg space-y-4">
                                <h4 className="text-lg font-black text-text uppercase tracking-widest flex items-center gap-2 italic">
                                    <FontAwesomeIcon icon={faBookOpen} className="text-accent" /> Req.
                                </h4>
                                <div className="text-text/60 text-xs ql-editor !p-0 formatted-content font-medium italic" dangerouslySetInnerHTML={{ __html: event.requirements }} />
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Sidebar Actions */}
            <div className="space-y-6">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-card border border-border p-8 rounded-3xl shadow-xl sticky top-20">
                    <div className="space-y-6">
                        <div className="text-center space-y-3">
                            <img src="/src/assets/gfg-rit.png" alt="GFG RIT" className="h-10 w-auto mx-auto" />
                            <h4 className="text-lg font-black text-text uppercase tracking-widest">Authority Node</h4>
                            <p className="text-text/40 font-bold uppercase text-[8px] tracking-widest">{event.organizer || 'Campus Body'}</p>
                        </div>

                        {teamStatus?.registered ? (
                            <div className="space-y-6">
                                {teamStatus.isTeam ? (
                                    <div className="bg-accent/5 border border-accent/20 p-6 rounded-2xl space-y-4 shadow-inner">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-0.5">
                                                <p className="text-[8px] font-black text-accent uppercase tracking-widest">Matrix Team</p>
                                                {isEditingTeamName ? (
                                                    <div className="flex gap-1.5">
                                                        <input className="bg-background border border-border rounded-lg px-2 py-1 text-[10px] font-bold text-text outline-none focus:border-accent w-full" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} />
                                                        <button onClick={handleUpdateTeamName} className="p-1 bg-accent text-white rounded"><FontAwesomeIcon icon={faCheck} size="xs" /></button>
                                                    </div>
                                                ) : (
                                                    <h5 className="text-sm font-black text-text uppercase flex items-center gap-1.5">
                                                        {teamStatus.teamName}
                                                        {teamStatus.isLeader && <FontAwesomeIcon icon={faEdit} className="text-text/20 cursor-pointer hover:text-accent text-[10px]" onClick={() => setIsEditingTeamName(true)} />}
                                                    </h5>
                                                )}
                                            </div>
                                            {teamStatus.isLeader && <span className="bg-accent/10 text-accent text-[7px] font-black px-1.5 py-0.5 rounded border border-accent/20 uppercase tracking-widest">Leader</span>}
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <p className="text-[8px] font-black text-text/30 uppercase tracking-widest">Agents ({teamStatus.members.length}/{event.max_team_size})</p>
                                            {teamStatus.members.map((m, i) => (
                                                <div key={i} className="flex justify-between items-center bg-background border border-border/50 px-3 py-2 rounded-xl">
                                                    <div>
                                                        <p className="text-[10px] font-black text-text uppercase">{m.name}</p>
                                                        <span className={`text-[7px] font-bold uppercase tracking-widest ${m.status === 'Accepted' ? 'text-accent' : 'text-yellow-500'}`}>{m.status}</span>
                                                    </div>
                                                    {teamStatus.isLeader && !m.is_leader && (
                                                        <button onClick={() => handleRemoveMember(m.user_id)} className="text-text/20 hover:text-red-500 transition-colors"><FontAwesomeIcon icon={faUserMinus} size="xs" /></button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {teamStatus.isLeader && teamStatus.members.length < event.max_team_size && (
                                            <form onSubmit={handleInviteMember} className="space-y-2 pt-3 border-t border-border/30">
                                                <p className="text-[8px] font-black text-text/30 uppercase tracking-widest">Deploy Agent</p>
                                                <div className="flex gap-1.5">
                                                    <input required type="email" placeholder="agent@email.com" className="flex-grow bg-background border border-border rounded-lg px-2 py-1.5 text-[10px] font-bold text-text outline-none focus:border-accent" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                                                    <button type="submit" className="p-1.5 bg-accent text-white rounded-lg hover:bg-gfg-green-hover transition-colors shadow-lg shadow-accent/10"><FontAwesomeIcon icon={faUserPlus} size="sm" /></button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-accent/5 border border-accent/20 p-5 rounded-2xl text-center space-y-1.5 shadow-inner">
                                        <FontAwesomeIcon icon={faCheckCircle} size="2x" className="text-accent mx-auto" />
                                        <p className="text-[10px] font-black text-text uppercase tracking-widest">Node Active</p>
                                        <p className="text-[8px] text-text/40 font-bold uppercase">Clearance: Registered</p>
                                    </div>
                                )}

                                <button onClick={handleUnregister} className="w-full py-3.5 rounded-xl bg-red-500/5 text-red-500 border border-red-500/10 hover:bg-red-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 active:scale-95">
                                    <FontAwesomeIcon icon={faSignOutAlt} /> Opt Out
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {canRegister && (
                                    <button onClick={() => setIsRegistering(true)} disabled={!event.is_open} className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 ${event.is_open ? 'bg-accent hover:bg-gfg-green-hover text-white shadow-accent/20' : 'bg-background border border-border text-text/20 cursor-not-allowed'}`}>
                                        {event.is_open ? <><FontAwesomeIcon icon={faCheckCircle} /> Join Matrix</> : 'Node Restricted'}
                                    </button>
                                )}
                            </div>
                        )}

                        {canManage && (
                            <div className="space-y-2 pt-3 border-t border-border/50">
                                <button onClick={handleViewRegistrations} className="w-full py-3 rounded-lg bg-background border border-border text-text/60 hover:border-accent hover:text-accent font-black uppercase tracking-widest text-[8px] transition flex items-center justify-center gap-2 shadow-sm active:scale-95">
                                    <FontAwesomeIcon icon={faUsers} /> Agent Log
                                </button>
                                <button onClick={handleDelete} className="w-full py-3 rounded-lg bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all font-black uppercase text-[8px] tracking-widest flex items-center justify-center gap-2 border border-red-500/10 active:scale-95">
                                    <FontAwesomeIcon icon={faTrashAlt} /> Terminate
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
      </section>

      {/* Registration Modal */}
      <AnimatePresence>
        {isRegistering && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-xl overflow-y-auto">
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="bg-card border border-border rounded-3xl w-full max-w-xl my-auto shadow-2xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-border flex justify-between items-center bg-background/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-accent/10 rounded-lg text-accent"><FontAwesomeIcon icon={faUserPlus} /></div>
                            <h2 className="text-xl font-black text-text uppercase tracking-tight italic">Registration</h2>
                        </div>
                        <button onClick={() => setIsRegistering(false)} className="text-text/40 hover:text-red-500 p-1.5 rounded-full transition-all active:scale-90"><FontAwesomeIcon icon={faTimes} size="lg" /></button>
                    </div>
                    <form onSubmit={handleRegister} className="p-6 md:p-8 space-y-6">
                        <div className="space-y-3">
                            <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-1">Protocol</label>
                            <div className="grid grid-cols-2 gap-3">
                                {event.participation_type !== 'team' && (
                                    <button type="button" onClick={() => setRegType('individual')} className={`p-3 rounded-xl border-2 transition-all font-black uppercase text-[10px] tracking-widest ${regType === 'individual' ? 'bg-accent/10 border-accent text-accent' : 'bg-background border-border text-text/40'}`}>Individual</button>
                                )}
                                {event.participation_type !== 'individual' && (
                                    <button type="button" onClick={() => setRegType('team')} className={`p-3 rounded-xl border-2 transition-all font-black uppercase text-[10px] tracking-widest ${regType === 'team' ? 'bg-accent/10 border-accent text-accent' : 'bg-background border-border text-text/40'}`}>Team</button>
                                )}
                            </div>
                        </div>

                        {regType === 'team' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 overflow-hidden">
                                <div className="space-y-1.5">
                                    <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-1">Team Name</label>
                                    <input required type="text" className="w-full bg-background border-2 border-border rounded-xl py-3 px-4 focus:border-accent outline-none font-bold text-sm text-text shadow-inner italic" placeholder="Code Commanders" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-1">Agent Invitations</label>
                                        <span className="text-[7px] font-black text-accent uppercase tracking-widest">Limit: {event.max_team_size - 1}</span>
                                    </div>
                                    <div className="space-y-2">
                                        {memberEmails.map((email, i) => (
                                            <div key={i} className="relative">
                                                <FontAwesomeIcon icon={faEnvelope} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text/20 text-xs" />
                                                <input required type="email" className="w-full bg-background border-2 border-border rounded-xl py-2.5 pl-9 pr-4 focus:border-accent outline-none font-bold text-xs text-text shadow-inner" placeholder={`Email ${i+1}`} value={email} onChange={(e) => updateMemberEmail(i, e.target.value)} />
                                            </div>
                                        ))}
                                        {memberEmails.length < (event.max_team_size - 1) && (
                                            <button type="button" onClick={addMemberField} className="w-full py-2 border-2 border-dashed border-border rounded-xl text-text/30 hover:border-accent/50 hover:text-accent transition-all font-black text-[8px] uppercase tracking-widest">Add Slot</button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <button type="submit" className="w-full bg-accent hover:bg-gfg-green-hover text-white font-black py-4 rounded-xl transition shadow-lg uppercase tracking-widest text-[10px] active:scale-95">Commit Registration</button>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Agent Log Modal */}
      <AnimatePresence>
        {isRegListOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-xl">
            <motion.div initial={{ opacity: 0, scale: 0.98, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 20 }} className="bg-card border border-border rounded-3xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden my-auto">
              <div className="p-6 md:p-8 border-b border-border bg-background/50 flex justify-between items-center">
                <h2 className="text-xl font-black text-text uppercase tracking-tighter italic">Agent Log</h2>
                <button onClick={() => setIsRegListOpen(false)} className="p-2.5 bg-background border border-border hover:bg-card rounded-full text-text/40 group shadow-lg active:scale-90"><FontAwesomeIcon icon={faTimes} size="lg" /></button>
              </div>
              <div className="flex-grow overflow-y-auto p-6 md:p-8 custom-scrollbar">
                {registrations.length > 0 ? (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-text/20 text-[8px] font-black uppercase tracking-widest border-b border-border pb-4">
                        <th className="pb-4 px-4">Agent</th>
                        <th className="pb-4 px-4">Team</th>
                        <th className="pb-4 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {registrations.map((reg, i) => (
                        <tr key={i} className="hover:bg-accent/5 transition-colors group">
                          <td className="py-4 px-4">
                              <p className="font-black text-text uppercase tracking-widest text-xs italic">{reg.name}</p>
                              <p className="text-[8px] text-text/40 font-bold">{reg.email}</p>
                          </td>
                          <td className="py-4 px-4 font-black text-text/60 uppercase text-[10px]">{reg.team_name || 'Individual'}</td>
                          <td className="py-4 px-4 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ${reg.status === 'Accepted' ? 'bg-accent/10 text-accent' : 'bg-yellow-500/10 text-yellow-500'}`}>{reg.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center py-16 text-text/30 font-black uppercase tracking-widest text-sm">Log Empty.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .formatted-content a { color: var(--color-accent); font-weight: 800; text-decoration: underline; }
        .formatted-content h1, .formatted-content h2, .formatted-content h3 { color: var(--color-text); font-weight: 900; margin-top: 1.2em; margin-bottom: 0.4em; text-transform: uppercase; }
        .formatted-content ul, .formatted-content ol { padding-left: 1.2em; margin-bottom: 0.8em; list-style: disc; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-accent); border-radius: 10px; opacity: 0.2; }
      `}</style>
    </div>
  );
};

export default EventDetail;
