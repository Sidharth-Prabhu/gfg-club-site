import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Users, ArrowLeft, CheckCircle, Info, Sparkles, X, Users2, Trash2 } from 'lucide-react';
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

  const canManage = user?.role === 'Admin' || user?.role === 'Core';
  const canRegister = user?.role !== 'Admin';

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/events/${id}`);
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event details:', error);
      try {
          const { data: allEvents } = await api.get('/events');
          const found = allEvents.find(e => e.id === parseInt(id));
          if (found) setEvent(found);
          else navigate('/events');
      } catch (err) {
          navigate('/events');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    try {
      await api.post('/events/register', { eventId: id });
      alert('Registered successfully!');
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
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.delete(`/events/${id}`);
        navigate('/events');
      } catch (error) {
        alert('Failed to delete event');
      }
    }
  };

  if (loading) return <div className="py-40 text-center text-accent font-black tracking-widest uppercase animate-pulse text-xl italic">Accessing Event Node...</div>;
  if (!event) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
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
            <button 
                onClick={() => navigate('/events')} 
                className="flex items-center gap-2 text-white bg-black/40 hover:bg-black/60 backdrop-blur-md px-6 py-3 rounded-full transition-all group font-black uppercase text-xs tracking-widest border border-white/10"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Matrix
            </button>
        </div>
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-20 z-10">
            <div className="max-w-7xl mx-auto space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-4">
                    <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${event.is_open ? 'bg-accent/80 text-white border-accent/20 shadow-xl' : 'bg-red-500/80 text-white border-red-500/20'}`}>
                        {event.is_open ? 'NODE ACTIVE' : 'NODE CLOSED'}
                    </span>
                    <span className="bg-white/10 backdrop-blur-md text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">Event Node #{event.id}</span>
                </motion.div>
                <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-8xl font-black text-text leading-tight tracking-tighter uppercase">{event.title}</motion.h1>
            </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-8 md:px-20 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2 space-y-12">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border p-10 md:p-16 rounded-[3rem] shadow-2xl space-y-10">
                    <div className="space-y-8">
                        <h3 className="text-3xl font-black text-text uppercase tracking-tight italic flex items-center gap-4">
                            <Info size={32} className="text-accent" /> Protocol Description
                        </h3>
                        {/* THE FORMATTED CONTENT AREA */}
                        <div 
                            className="text-text/80 leading-relaxed text-lg ql-editor !p-0 formatted-content" 
                            dangerouslySetInnerHTML={{ __html: event.description }} 
                        />
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
            </div>

            <div className="space-y-8">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border p-10 rounded-[3rem] shadow-xl sticky top-8">
                    <div className="space-y-8">
                        <div className="text-center space-y-2">
                            <Users size={48} className="text-accent mx-auto" />
                            <h4 className="text-xl font-black text-text uppercase tracking-widest">Authority Node</h4>
                            <p className="text-text/40 font-bold uppercase text-[10px] tracking-[0.2em]">{event.organizer || 'GFG Club'}</p>
                        </div>
                        <div className="space-y-4">
                            {canRegister && (
                                <button onClick={handleRegister} disabled={!event.is_open} className={`w-full py-6 rounded-2xl font-black text-xl uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 ${event.is_open ? 'bg-accent hover:bg-gfg-green-hover text-white shadow-accent/20' : 'bg-background border border-border text-text/20 cursor-not-allowed'}`}>
                                    {event.is_open ? <><CheckCircle size={28} /> Join Matrix</> : 'Node Restricted'}
                                </button>
                            )}
                            {canManage && (
                                <button onClick={handleViewRegistrations} className="w-full py-6 rounded-2xl bg-background border border-border text-text/60 hover:border-accent hover:text-accent font-black uppercase tracking-widest text-xs transition flex items-center justify-center gap-3 shadow-sm active:scale-95">
                                    <Users2 size={24} /> Review Agents
                                </button>
                            )}
                            {canManage && (
                                <button onClick={handleDelete} className="w-full py-4 rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 border border-red-500/10 active:scale-95">
                                    <Trash2 size={16} /> Terminate Node
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
      </section>

      <AnimatePresence>
        {isRegListOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-xl">
            <motion.div initial={{ opacity: 0, scale: 0.98, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 20 }} className="bg-card border border-border rounded-[3.5rem] w-full max-w-5xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden my-auto">
              <div className="p-10 border-b border-border bg-background/50 flex justify-between items-center">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-text uppercase tracking-tighter">Registered Agents</h2>
                  <p className="text-accent text-[10px] font-black uppercase tracking-[0.2em]">{event.title}</p>
                </div>
                <button onClick={() => setIsRegListOpen(false)} className="p-4 bg-background border border-border hover:bg-card hover:text-red-500 rounded-full transition-all text-text/40 group shadow-xl"><X size={28} className="group-hover:rotate-90 transition-transform" /></button>
              </div>
              <div className="flex-grow overflow-y-auto p-10">
                {registrations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-text/20 text-[10px] font-black uppercase tracking-[0.3em] border-b border-border pb-6">
                          <th className="pb-6 px-6">Agent Identity</th>
                          <th className="pb-6 px-6 text-center">Solved</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {registrations.map((reg, i) => (
                          <tr key={i} className="hover:bg-accent/5 transition-colors group">
                            <td className="py-6 px-6 font-black text-text uppercase tracking-tight text-lg group-hover:text-accent transition-colors">{reg.name}</td>
                            <td className="py-6 px-6 text-center text-text/80 font-black">{reg.gfg_solved}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-32 text-center text-text/20 space-y-6">
                    <Info size={80} className="mx-auto opacity-10" />
                    <p className="text-2xl font-black uppercase tracking-widest">No agents deployed</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .formatted-content a { color: var(--color-accent); font-weight: 800; text-decoration: underline; transition: opacity 0.2s; }
        .formatted-content a:hover { opacity: 0.7; }
        .formatted-content h1, .formatted-content h2, .formatted-content h3 { color: var(--color-text); font-weight: 900; margin-top: 1.5em; margin-bottom: 0.5em; text-transform: uppercase; }
        .formatted-content ul, .formatted-content ol { padding-left: 1.5em; margin-bottom: 1em; }
        .formatted-content li { margin-bottom: 0.5em; }
        .formatted-content pre { background: var(--color-background); border: 1px solid var(--color-border); padding: 1.5rem; border-radius: 1rem; font-family: monospace; overflow-x: auto; color: var(--color-accent); }
      `}</style>
    </div>
  );
};

export default EventDetail;
