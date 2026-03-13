import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Users, ArrowLeft, CheckCircle, Info, Sparkles, X, Users2, Trash2, ScrollText, BookOpen, UserPlus, ShieldCheck } from 'lucide-react';
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

  if (loading) return <div className="py-40 text-center text-accent font-black tracking-widest uppercase animate-pulse text-xl italic">Accessing Event Node...</div>;
  if (!event) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Full Screen Hero Section */}
      <section className="relative h-[60vh] md:h-[75vh] w-full overflow-hidden">
        {event.poster ? (
          <img src={event.poster} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-accent/10 flex items-center justify-center">
            <Calendar size={120} className="text-accent/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
        <div className="absolute top-8 left-8 z-20">
            <button onClick={() => navigate('/events')} className="flex items-center gap-2 text-white bg-black/40 hover:bg-black/60 backdrop-blur-md px-6 py-3 rounded-full transition-all group font-black uppercase text-xs tracking-widest border border-white/10">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Matrix
            </button>
        </div>
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-20 z-10">
            <div className="max-w-7xl mx-auto space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-4">
                    <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${event.is_open ? 'bg-accent/80 text-white border-accent/20 shadow-xl' : 'bg-red-500/80 text-white border-red-500/20'}`}>
                        {event.is_open ? 'NODE ACTIVE' : 'NODE CLOSED'}
                    </span>
                    <span className="bg-blue-500/80 backdrop-blur-md text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                        {event.participation_type} Paradigm
                    </span>
                </motion.div>
                <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-8xl font-black text-text leading-tight tracking-tighter uppercase">{event.title}</motion.h1>
            </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="max-w-7xl mx-auto px-8 md:px-20 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2 space-y-12">
                {/* Description */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border p-10 md:p-16 rounded-[3rem] shadow-2xl space-y-10">
                    <div className="space-y-8">
                        <h3 className="text-3xl font-black text-text uppercase tracking-tight italic flex items-center gap-4">
                            <Info size={32} className="text-accent" /> Event Protocol
                        </h3>
                        <div className="text-text/80 leading-relaxed text-lg ql-editor !p-0 formatted-content font-medium" dangerouslySetInnerHTML={{ __html: event.description }} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-border/50">
                        <div className="space-y-3">
                            <p className="text-text/20 text-[10px] font-black uppercase tracking-[0.2em]">Temporal Node</p>
                            <div className="flex items-center gap-4 text-text/80 font-black uppercase tracking-widest text-xs bg-background border border-border p-5 rounded-2xl shadow-inner">
                                <Calendar size={20} className="text-accent" />
                                {new Date(event.date).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <p className="text-text/20 text-[10px] font-black uppercase tracking-[0.2em]">Spatial Node</p>
                            <div className="flex items-center gap-4 text-text/80 font-black uppercase tracking-widest text-xs bg-background border border-border p-5 rounded-2xl shadow-inner">
                                <MapPin size={20} className="text-accent" />
                                {event.location}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Rules & Requirements */}
                {(event.rules || event.requirements) && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {event.rules && (
                            <div className="bg-card border border-border p-10 rounded-[3rem] shadow-xl space-y-6">
                                <h4 className="text-xl font-black text-text uppercase tracking-widest flex items-center gap-3 italic">
                                    <ScrollText size={24} className="text-accent" /> Engagement Rules
                                </h4>
                                <div className="text-text/60 text-sm ql-editor !p-0 formatted-content font-medium" dangerouslySetInnerHTML={{ __html: event.rules }} />
                            </div>
                        )}
                        {event.requirements && (
                            <div className="bg-card border border-border p-10 rounded-[3rem] shadow-xl space-y-6">
                                <h4 className="text-xl font-black text-text uppercase tracking-widest flex items-center gap-3 italic">
                                    <BookOpen size={24} className="text-accent" /> Technical Req.
                                </h4>
                                <div className="text-text/60 text-sm ql-editor !p-0 formatted-content font-medium" dangerouslySetInnerHTML={{ __html: event.requirements }} />
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Sidebar Actions */}
            <div className="space-y-8">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-card border border-border p-10 rounded-[3rem] shadow-xl sticky top-8">
                    <div className="space-y-8">
                        <div className="text-center space-y-2">
                            <ShieldCheck size={48} className="text-accent mx-auto" />
                            <h4 className="text-xl font-black text-text uppercase tracking-widest">Authority Node</h4>
                            <p className="text-text/40 font-bold uppercase text-[10px] tracking-[0.2em]">{event.organizer || 'GFG Club'}</p>
                        </div>

                        {teamStatus?.isLeader ? (
                            <div className="bg-accent/5 border border-accent/20 p-6 rounded-2xl space-y-4 shadow-inner">
                                <p className="text-[10px] font-black text-accent uppercase tracking-widest text-center">Team Leadership Active</p>
                                <h5 className="text-center font-black text-text uppercase">{teamStatus.teamName}</h5>
                                <div className="space-y-2">
                                    {teamStatus.members.map((m, i) => (
                                        <div key={i} className="flex justify-between items-center text-[10px] font-bold uppercase">
                                            <span className="text-text/60">{m.name}</span>
                                            <span className={m.status === 'Accepted' ? 'text-accent' : 'text-yellow-500'}>{m.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {canRegister && (
                                    <button onClick={() => setIsRegistering(true)} disabled={!event.is_open} className={`w-full py-6 rounded-2xl font-black text-xl uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 ${event.is_open ? 'bg-accent hover:bg-gfg-green-hover text-white shadow-accent/20' : 'bg-background border border-border text-text/20 cursor-not-allowed'}`}>
                                        {event.is_open ? <><CheckCircle size={28} /> Join Matrix</> : 'Node Restricted'}
                                    </button>
                                )}
                            </div>
                        )}

                        {canManage && (
                            <div className="space-y-3 pt-4 border-t border-border/50">
                                <button onClick={handleViewRegistrations} className="w-full py-4 rounded-xl bg-background border border-border text-text/60 hover:border-accent hover:text-accent font-black uppercase tracking-widest text-[10px] transition flex items-center justify-center gap-3 shadow-sm active:scale-95">
                                    <Users2 size={18} /> View Matrix Agent Log
                                </button>
                                <button onClick={handleDelete} className="w-full py-4 rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 border border-red-500/10 active:scale-95">
                                    <Trash2 size={16} /> Terminate Node
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
      </section>

      {/* Registration Multi-Step Modal */}
      <AnimatePresence>
        {isRegistering && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-xl overflow-y-auto">
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="bg-card border border-border rounded-[3.5rem] w-full max-w-2xl my-auto shadow-2xl overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-border flex justify-between items-center bg-background/50">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-accent/10 rounded-xl text-accent"><UserPlus size={24} /></div>
                            <h2 className="text-2xl font-black text-text uppercase tracking-tight">Agent Registration</h2>
                        </div>
                        <button onClick={() => setIsRegistering(false)} className="text-text/40 hover:text-red-500 p-2 rounded-full transition-all group active:scale-90"><X size={24} /></button>
                    </div>
                    <form onSubmit={handleRegister} className="p-8 md:p-12 space-y-8">
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-1">Registration Protocol</label>
                            <div className="grid grid-cols-2 gap-4">
                                {event.participation_type !== 'team' && (
                                    <button type="button" onClick={() => setRegType('individual')} className={`p-4 rounded-2xl border-2 transition-all font-black uppercase text-xs tracking-widest ${regType === 'individual' ? 'bg-accent/10 border-accent text-accent' : 'bg-background border-border text-text/40'}`}>Individual</button>
                                )}
                                {event.participation_type !== 'individual' && (
                                    <button type="button" onClick={() => setRegType('team')} className={`p-4 rounded-2xl border-2 transition-all font-black uppercase text-xs tracking-widest ${regType === 'team' ? 'bg-accent/10 border-accent text-accent' : 'bg-background border-border text-text/40'}`}>Team</button>
                                )}
                            </div>
                        </div>

                        {regType === 'team' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6 overflow-hidden">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-1">Matrix Team Name</label>
                                    <input required type="text" className="w-full bg-background border-2 border-border rounded-xl py-4 px-6 focus:border-accent outline-none font-bold text-text" placeholder="e.g. Code Commanders" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-1">Agent Invitations (Emails)</label>
                                        <span className="text-[9px] font-black text-accent uppercase tracking-widest">Limit: {event.max_team_size - 1} Members</span>
                                    </div>
                                    <div className="space-y-3">
                                        {memberEmails.map((email, i) => (
                                            <div key={i} className="relative group">
                                                <input required type="email" className="w-full bg-background border-2 border-border rounded-xl py-3 px-5 focus:border-accent outline-none font-bold text-sm text-text" placeholder={`Member ${i+1} email...`} value={email} onChange={(e) => updateMemberEmail(i, e.target.value)} />
                                            </div>
                                        ))}
                                        {memberEmails.length < (event.max_team_size - 1) && (
                                            <button type="button" onClick={addMemberField} className="w-full py-3 border-2 border-dashed border-border rounded-xl text-text/30 hover:border-accent/50 hover:text-accent transition-all font-black text-[10px] uppercase tracking-widest">Add Agent Slot</button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <button type="submit" className="w-full bg-accent hover:bg-gfg-green-hover text-white font-black py-6 rounded-2xl transition shadow-xl uppercase tracking-widest text-sm active:scale-95">Commit Registration</button>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Participant List Modal */}
      <AnimatePresence>
        {isRegListOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-xl">
            <motion.div initial={{ opacity: 0, scale: 0.98, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 20 }} className="bg-card border border-border rounded-[3.5rem] w-full max-w-5xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden my-auto">
              <div className="p-10 border-b border-border bg-background/50 flex justify-between items-center">
                <h2 className="text-3xl font-black text-text uppercase tracking-tighter">Matrix Agent Log</h2>
                <button onClick={() => setIsRegListOpen(false)} className="p-4 bg-background border border-border hover:bg-card rounded-full text-text/40 group shadow-xl active:scale-90"><X size={28} /></button>
              </div>
              <div className="flex-grow overflow-y-auto p-10 custom-scrollbar">
                {registrations.length > 0 ? (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-text/20 text-[10px] font-black uppercase tracking-[0.3em] border-b border-border pb-6">
                        <th className="pb-6 px-6">Agent Identity</th>
                        <th className="pb-6 px-6">Team</th>
                        <th className="pb-6 px-6 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {registrations.map((reg, i) => (
                        <tr key={i} className="hover:bg-accent/5 transition-colors">
                          <td className="py-6 px-6">
                              <p className="font-black text-text uppercase tracking-widest text-sm">{reg.name}</p>
                              <p className="text-[10px] text-text/40 font-bold">{reg.email}</p>
                          </td>
                          <td className="py-6 px-6 font-black text-text/60 uppercase text-xs">{reg.team_name || 'Individual'}</td>
                          <td className="py-6 px-6 text-center">
                              <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${reg.status === 'Accepted' ? 'bg-accent/10 text-accent' : 'bg-yellow-500/10 text-yellow-500'}`}>{reg.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center py-20 text-text/30 font-black uppercase tracking-widest">Log Empty.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .formatted-content a { color: var(--color-accent); font-weight: 800; text-decoration: underline; }
        .formatted-content h1, .formatted-content h2, .formatted-content h3 { color: var(--color-text); font-weight: 900; margin-top: 1.5em; margin-bottom: 0.5em; text-transform: uppercase; }
        .formatted-content ul, .formatted-content ol { padding-left: 1.5em; margin-bottom: 1em; list-style: disc; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-accent); border-radius: 10px; opacity: 0.2; }
      `}</style>
    </div>
  );
};

export default EventDetail;
