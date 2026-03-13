import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Users, Plus, Edit, Trash2, X, Save, Users2, CheckCircle, Clock, Info, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Linkify from 'linkify-react';

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsEditModalOpen] = useState(false);
  const [isRegListOpen, setIsRegListOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '', description: '', poster: '', date: '', location: '', organizer: '', is_open: true
  });

  const canManage = user?.role === 'Admin' || user?.role === 'Core';
  const canRegister = user?.role !== 'Admin';

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/events');
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpenCreate = () => {
    setSelectedEvent(null);
    setFormData({ title: '', description: '', poster: '', date: '', location: '', organizer: '', is_open: true });
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (e, event) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      poster: event.poster || '',
      date: new Date(event.date).toISOString().slice(0, 16),
      location: event.location,
      organizer: event.organizer || '',
      is_open: !!event.is_open
    });
    setIsEditModalOpen(true);
  };

  const handleViewRegistrations = async (e, event) => {
    e.stopPropagation();
    setSelectedEvent(event);
    try {
      const { data } = await api.get(`/events/${event.id}/registrations`);
      setRegistrations(data);
      setIsRegListOpen(true);
    } catch (error) {
      alert('Failed to fetch registrations');
    }
  };

  const handleShowDetails = (event) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedEvent && isModalOpen) {
        await api.put(`/events/${selectedEvent.id}`, formData);
      } else {
        await api.post('/events', formData);
      }
      fetchEvents();
      setIsEditModalOpen(false);
    } catch (error) {
      alert('Failed to save event');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.delete(`/events/${id}`);
        fetchEvents();
      } catch (error) {
        alert('Failed to delete event');
      }
    }
  };

  const handleRegister = async (e, id) => {
    e.stopPropagation();
    try {
      await api.post('/events/register', { eventId: id });
      alert('Registered successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black text-text tracking-tighter uppercase">Club <span className="text-accent">Events</span></h1>
          <p className="text-text/60 text-lg font-medium">Workshops, contests, and seminars for the campus coding community.</p>
        </div>
        {canManage && (
          <button 
            onClick={handleOpenCreate}
            className="bg-accent hover:bg-gfg-green-hover text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition shadow-xl shadow-accent/20 text-lg uppercase tracking-widest active:scale-95"
          >
            <Plus size={24} /> Create Event
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-32 text-center text-accent font-black tracking-widest uppercase animate-pulse text-xl">Synchronizing Event Matrix...</div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {events.map(event => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={event.id} 
              onClick={() => handleShowDetails(event)}
              className="bg-card rounded-[2.5rem] overflow-hidden border border-border hover:border-accent transition-all group flex flex-col cursor-pointer hover:shadow-2xl shadow-sm"
            >
              <div className="h-56 bg-background relative overflow-hidden">
                {event.poster ? (
                  <img src={event.poster} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text/10 bg-accent/5"><Calendar size={64} /></div>
                )}
                {!event.is_open && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-red-500 text-white px-6 py-2 rounded-xl text-xs font-black border border-red-400/50 shadow-xl uppercase tracking-widest">REGISTRATIONS CLOSED</span>
                  </div>
                )}
                <div className="absolute top-5 left-5">
                   <span className="bg-accent/90 backdrop-blur-md text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg">Upcoming</span>
                </div>
              </div>
              <div className="p-8 flex-grow flex flex-col space-y-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-2xl font-black text-text group-hover:text-accent transition-colors leading-tight tracking-tight uppercase">{event.title}</h3>
                  {canManage && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button onClick={(e) => handleOpenEdit(e, event)} className="p-2 bg-background border border-border rounded-xl text-text/40 hover:text-accent shadow-sm"><Edit size={16} /></button>
                      <button onClick={(e) => handleDelete(e, event.id)} className="p-2 bg-background border border-border rounded-xl text-text/40 hover:text-red-500 shadow-sm"><Trash2 size={16} /></button>
                    </div>
                  )}
                </div>
                
                <p className="text-text/60 text-sm line-clamp-2 leading-relaxed font-medium">{event.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-text/40 bg-background/50 border border-border px-3 py-2 rounded-xl">
                    <Calendar size={16} className="text-accent" />
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-text/40 bg-background/50 border border-border px-3 py-2 rounded-xl">
                    <MapPin size={16} className="text-accent" />
                    {event.location}
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-border/50 flex items-center justify-between group-hover:text-accent transition-colors font-black uppercase tracking-[0.2em] text-[10px]">
                  <span>Explore Details</span>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-40 text-center text-text/30 bg-card rounded-[3rem] border border-border border-dashed shadow-inner">
          <Calendar size={80} className="mx-auto mb-6 opacity-5" />
          <p className="text-2xl font-black uppercase tracking-widest">No Events Scheduled</p>
          <p className="text-sm font-medium mt-2">Check back soon for workshops and contests!</p>
        </div>
      )}

      {/* Event Details Expanded View */}
      <AnimatePresence>
        {isDetailsOpen && selectedEvent && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-xl overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 20 }}
              className="bg-card border border-border rounded-[3.5rem] w-full max-w-5xl shadow-2xl relative overflow-hidden my-auto min-h-[90vh] flex flex-col"
            >
              <button 
                onClick={() => setIsDetailsOpen(false)}
                className="absolute top-10 right-10 z-20 p-4 bg-background border border-border hover:bg-card hover:text-accent rounded-full text-text/60 transition-all shadow-xl group"
              >
                <X size={24} className="group-hover:rotate-90 transition-transform" />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-2 flex-grow">
                <div className="h-72 lg:h-auto bg-background relative overflow-hidden group">
                  {selectedEvent.poster ? (
                    <img src={selectedEvent.poster} alt={selectedEvent.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-accent/10 bg-accent/5"><Calendar size={120} /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent lg:hidden"></div>
                </div>
                
                <div className="p-10 lg:p-16 space-y-12 flex flex-col">
                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${selectedEvent.is_open ? 'bg-accent/10 text-accent border-accent/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        {selectedEvent.is_open ? 'OPEN FOR REGISTRATION' : 'REGISTRATIONS CLOSED'}
                      </span>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black text-text leading-tight tracking-tighter uppercase">{selectedEvent.title}</h2>
                    
                    <div className="text-text/60 leading-relaxed text-xl font-medium">
                      <Linkify 
                        options={{
                          className: 'text-accent hover:underline font-black',
                          target: '_blank'
                        }}
                      >
                        {selectedEvent.description}
                      </Linkify>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-10 border-t border-border">
                    <div className="space-y-3">
                      <p className="text-text/20 text-[10px] font-black uppercase tracking-[0.2em]">Temporal Node</p>
                      <div className="flex items-center gap-4 text-text/80 font-black uppercase tracking-widest text-xs bg-background border border-border p-4 rounded-2xl shadow-inner">
                        <Calendar size={20} className="text-accent" />
                        {new Date(selectedEvent.date).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-text/20 text-[10px] font-black uppercase tracking-[0.2em]">Spatial Node</p>
                      <div className="flex items-center gap-4 text-text/80 font-black uppercase tracking-widest text-xs bg-background border border-border p-4 rounded-2xl shadow-inner">
                        <MapPin size={20} className="text-accent" />
                        {selectedEvent.location}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-text/20 text-[10px] font-black uppercase tracking-[0.2em]">Authority</p>
                      <div className="flex items-center gap-4 text-text/80 font-black uppercase tracking-widest text-xs bg-background border border-border p-4 rounded-2xl shadow-inner">
                        <Users size={20} className="text-accent" />
                        {selectedEvent.organizer || 'GFG Club'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-12 mt-auto flex flex-col sm:flex-row gap-6">
                    {canRegister && (
                      <button 
                        onClick={(e) => handleRegister(e, selectedEvent.id)}
                        disabled={!selectedEvent.is_open}
                        className={`flex-1 py-6 rounded-2xl font-black text-xl uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98] ${selectedEvent.is_open ? 'bg-accent hover:bg-gfg-green-hover text-white shadow-accent/20' : 'bg-card border border-border text-text/20 cursor-not-allowed'}`}
                      >
                        {selectedEvent.is_open ? <><CheckCircle size={28} /> Register Now</> : 'Registrations Closed'}
                      </button>
                    )}
                    {canManage && (
                      <button 
                        onClick={(e) => handleViewRegistrations(e, selectedEvent)}
                        className="flex-1 py-6 rounded-2xl bg-card border border-border text-text/60 hover:border-accent hover:text-accent font-black uppercase tracking-widest text-xs transition flex items-center justify-center gap-3 shadow-sm active:scale-[0.98]"
                      >
                        <Users2 size={24} /> Registrations
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-xl overflow-y-auto">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="bg-card border border-border rounded-[3.5rem] w-full max-w-4xl my-auto shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-10 border-b border-border flex justify-between items-center bg-background/50">
                <h2 className="text-3xl font-black text-text uppercase tracking-tighter">{selectedEvent ? 'Modify Matrix Event' : 'Initialize New Event'}</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-text/40 hover:text-red-500 p-4 hover:bg-red-500/5 rounded-full transition-all group"><X size={32} className="group-hover:rotate-90 transition-transform" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-10 md:p-14 space-y-10 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="md:col-span-2 space-y-4">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Event Headline</label>
                    <input required type="text" className="w-full bg-background border-2 border-border rounded-[1.5rem] py-6 px-10 focus:border-accent outline-none text-2xl font-black text-text shadow-inner transition-colors" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Authority / Organizer</label>
                    <input required type="text" className="w-full bg-background border-2 border-border rounded-[1.5rem] py-6 px-10 focus:border-accent outline-none font-bold text-text shadow-inner transition-colors" value={formData.organizer} onChange={(e) => setFormData({...formData, organizer: e.target.value})} />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Spatial Node / Venue</label>
                    <input required type="text" className="w-full bg-background border-2 border-border rounded-[1.5rem] py-6 px-10 focus:border-accent outline-none font-bold text-text shadow-inner transition-colors" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Temporal Node / DateTime</label>
                    <input required type="datetime-local" className="w-full bg-background border-2 border-border rounded-[1.5rem] py-6 px-10 focus:border-accent outline-none font-bold text-text shadow-inner transition-colors" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Visual Poster URL</label>
                    <input type="url" className="w-full bg-background border-2 border-border rounded-[1.5rem] py-6 px-10 focus:border-accent outline-none font-bold text-text shadow-inner transition-colors" value={formData.poster} onChange={(e) => setFormData({...formData, poster: e.target.value})} />
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Event Protocol / Description</label>
                    <textarea required rows={5} className="w-full bg-background border-2 border-border rounded-[2rem] py-8 px-10 focus:border-accent outline-none resize-none text-text text-xl leading-relaxed shadow-inner transition-colors" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <div className="md:col-span-2 flex items-center justify-between p-8 bg-background border-2 border-border rounded-[2rem] shadow-inner">
                    <div className="flex items-center gap-6">
                      <div className={`p-4 rounded-2xl shadow-sm ${formData.is_open ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        {formData.is_open ? <CheckCircle size={28} /> : <Clock size={28} />}
                      </div>
                      <div>
                        <p className="font-black text-text uppercase tracking-widest leading-none mb-2">{formData.is_open ? 'Node Open' : 'Node Restricted'}</p>
                        <p className="text-xs font-medium text-text/40">Authorize whether participants can join this matrix event.</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, is_open: !formData.is_open})}
                      className={`relative inline-flex h-10 w-20 items-center rounded-full transition-all focus:outline-none shadow-inner ${formData.is_open ? 'bg-accent' : 'bg-text/10'}`}
                    >
                      <span className={`inline-block h-7 w-7 transform rounded-full bg-white transition-transform shadow-xl ${formData.is_open ? 'translate-x-11' : 'translate-x-2'}`} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-6 pt-4">
                    <button type="submit" className="bg-accent hover:bg-gfg-green-hover text-white font-black py-7 px-14 rounded-[1.5rem] transition text-xl flex-grow shadow-2xl shadow-accent/20 uppercase tracking-widest active:scale-[0.98]">
                      <Save size={28} /> {selectedEvent ? 'Commit Updates' : 'Deploy Event'}
                    </button>
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="bg-card border border-border hover:bg-background text-text/60 font-black py-7 px-14 rounded-[1.5rem] transition text-xl uppercase tracking-widest shadow-sm">Discard Changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Registration List Modal */}
      <AnimatePresence>
        {isRegListOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-xl">
            <motion.div initial={{ opacity: 0, scale: 0.98, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 20 }} className="bg-card border border-border rounded-[3.5rem] w-full max-w-5xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden my-auto">
              <div className="p-10 border-b border-border bg-background/50 flex justify-between items-center">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-text uppercase tracking-tighter">Event Participants</h2>
                  <p className="text-accent text-[10px] font-black uppercase tracking-[0.2em]">{selectedEvent?.title}</p>
                </div>
                <button onClick={() => setIsRegListOpen(false)} className="p-4 bg-background border border-border hover:bg-card hover:text-red-500 rounded-full transition-all text-text/40 group shadow-xl"><X size={28} className="group-hover:rotate-90 transition-transform" /></button>
              </div>
              
              <div className="flex-grow overflow-y-auto p-10">
                {registrations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-text/20 text-[10px] font-black uppercase tracking-[0.3em] border-b border-border pb-6">
                          <th className="pb-6 px-6">Innovation Agent</th>
                          <th className="pb-6 px-6">Matrix Email</th>
                          <th className="pb-6 px-6 text-center">GfG Score</th>
                          <th className="pb-6 px-6 text-center">GfG Solved</th>
                          <th className="pb-6 px-6 text-right">Node ID</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {registrations.map((reg, i) => (
                          <tr key={i} className="hover:bg-accent/5 transition-colors group">
                            <td className="py-6 px-6 font-black text-text uppercase tracking-tight text-lg group-hover:text-accent transition-colors">{reg.name}</td>
                            <td className="py-6 px-6 text-text/40 text-sm font-medium">{reg.email}</td>
                            <td className="py-6 px-6 text-center text-accent font-black text-xl">{reg.gfg_score}</td>
                            <td className="py-6 px-6 text-center text-text/80 font-black">{reg.gfg_solved}</td>
                            <td className="py-6 px-6 text-right text-text/20 font-mono text-xs">#{reg.user_id}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-32 text-center text-text/20 space-y-6">
                    <Info size={80} className="mx-auto opacity-10" />
                    <p className="text-2xl font-black uppercase tracking-widest">No Registered Agents</p>
                  </div>
                )}
              </div>
              <div className="p-10 border-t border-border bg-background/30 flex justify-between items-center">
                <div className="flex items-center gap-3 text-accent font-black uppercase tracking-widest text-[10px]">
                  <Sparkles size={20} className="animate-pulse" />
                  Total Participant Count
                </div>
                <p className="text-4xl font-black text-text leading-none">{registrations.length}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Events;
