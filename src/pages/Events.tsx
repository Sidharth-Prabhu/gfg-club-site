import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Plus, Edit, Trash2, X, Save, Users2, ChevronRight, Clock, Image as ImageIcon, AlignLeft, Info, ToggleRight, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const Events = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsEditModalOpen] = useState(false);
  const [isRegListOpen, setIsRegListOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '', description: '', poster: '', date: '', location: '', organizer: '', is_open: true
  });

  const canManage = user?.role === 'Admin' || user?.role === 'Core';

  const modules = useMemo(() => ({
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image', 'code-block'],
      ['clean']
    ],
  }), []);

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
    navigate(`/events/${event.id}`);
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

  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black text-text tracking-tighter uppercase italic">Club <span className="text-accent">Events</span></h1>
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
        <div className="py-32 text-center text-accent font-black tracking-widest uppercase animate-pulse text-xl italic">Synchronizing Event Matrix...</div>
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
                  <h3 className="text-2xl font-black text-text group-hover:text-accent transition-colors leading-tight tracking-tight uppercase italic">{event.title}</h3>
                  {canManage && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button onClick={(e) => handleOpenEdit(e, event)} className="p-2 bg-background border border-border rounded-xl text-text/40 hover:text-accent shadow-sm"><Edit size={16} /></button>
                      <button onClick={(e) => handleDelete(e, event.id)} className="p-2 bg-background border border-border rounded-xl text-text/40 hover:text-red-500 shadow-sm"><Trash2 size={16} /></button>
                    </div>
                  )}
                </div>
                
                <p className="text-text/60 text-sm line-clamp-2 leading-relaxed font-medium">{stripHtml(event.description)}</p>
                
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
        </div>
      )}

      {/* Create/Edit Modal - RE-STYLED & ROBUST */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-xl overflow-y-auto">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                className="bg-card border border-border rounded-[2.5rem] w-full max-w-5xl my-auto shadow-[0_0_50px_rgba(47,141,70,0.15)] overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-border flex justify-between items-center bg-background/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent/10 rounded-xl text-accent">
                        {selectedEvent ? <Edit size={24} /> : <Plus size={24} />}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-text uppercase tracking-tight leading-none">{selectedEvent ? 'Modify Matrix Event' : 'Initialize New Event'}</h2>
                        <p className="text-[10px] font-black text-text/40 uppercase tracking-widest mt-1">Matrix Node Configuration</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsEditModalOpen(false)} 
                    className="p-3 bg-background border border-border hover:bg-card hover:text-red-500 rounded-full transition-all text-text/40 group active:scale-90"
                >
                    <X size={24} className="group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                  {/* Headline */}
                  <div className="md:col-span-2 space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-1">
                        <AlignLeft size={12} /> Event Headline
                    </label>
                    <input 
                        required 
                        type="text" 
                        className="w-full bg-background border-2 border-border rounded-2xl py-5 px-8 focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none text-xl font-bold text-text shadow-inner transition-all placeholder:text-text/10" 
                        placeholder="e.g. Master the Matrix Workshop"
                        value={formData.title} 
                        onChange={(e) => setFormData({...formData, title: e.target.value})} 
                    />
                  </div>

                  {/* Organizer & Venue */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-1">
                        <Users size={12} /> Authority Node / Organizer
                    </label>
                    <input required type="text" className="w-full bg-background border-2 border-border rounded-2xl py-4 px-6 focus:border-accent outline-none font-bold text-text shadow-inner transition-colors" placeholder="e.g. GFG Core Team" value={formData.organizer} onChange={(e) => setFormData({...formData, organizer: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-1">
                        <MapPin size={12} /> Spatial Node / Venue
                    </label>
                    <input required type="text" className="w-full bg-background border-2 border-border rounded-2xl py-4 px-6 focus:border-accent outline-none font-bold text-text shadow-inner transition-colors" placeholder="e.g. Virtual or Audi-1" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                  </div>

                  {/* Date & Poster */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-1">
                        <Clock size={12} /> Temporal Node / DateTime
                    </label>
                    <input required type="datetime-local" className="w-full bg-background border-2 border-border rounded-2xl py-4 px-6 focus:border-accent outline-none font-bold text-text shadow-inner transition-colors appearance-none" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-1">
                        <ImageIcon size={12} /> Visual Node URL
                    </label>
                    <input type="url" className="w-full bg-background border-2 border-border rounded-2xl py-4 px-6 focus:border-accent outline-none font-bold text-text shadow-inner transition-colors" placeholder="https://..." value={formData.poster} onChange={(e) => setFormData({...formData, poster: e.target.value})} />
                  </div>

                  {/* Description Editor */}
                  <div className="md:col-span-2 space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-1">
                        <Info size={12} /> Protocol Protocol / Description
                    </label>
                    <div className="bg-background rounded-3xl overflow-hidden border-2 border-border focus-within:border-accent transition-all shadow-inner">
                        <ReactQuill 
                            theme="snow" 
                            value={formData.description} 
                            onChange={(content) => setFormData({...formData, description: content})} 
                            modules={modules} 
                            placeholder="Input the event protocol data..." 
                        />
                    </div>
                  </div>

                  {/* Status Toggle */}
                  <div className="md:col-span-2 flex items-center justify-between p-6 md:p-8 bg-background border border-border rounded-[2rem] shadow-inner group/toggle hover:border-accent/30 transition-colors">
                    <div className="flex items-center gap-6">
                      <div className={`p-4 rounded-2xl shadow-sm transition-all duration-500 ${formData.is_open ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        {formData.is_open ? <ToggleRight size={32} /> : <Clock size={32} />}
                      </div>
                      <div>
                        <p className="font-black text-text uppercase tracking-widest leading-none mb-2">{formData.is_open ? 'Node: Active' : 'Node: Restricted'}</p>
                        <p className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Toggle registration access for this node</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, is_open: !formData.is_open})}
                      className={`relative inline-flex h-12 w-24 items-center rounded-full transition-all focus:outline-none shadow-xl border-2 ${formData.is_open ? 'bg-accent border-accent/20' : 'bg-text/10 border-border'}`}
                    >
                      <span className={`inline-block h-8 w-8 transform rounded-full bg-white transition-all shadow-lg ${formData.is_open ? 'translate-x-14' : 'translate-x-2'}`} />
                    </button>
                  </div>
                </div>

                {/* Submit Footer */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 sticky bottom-0">
                    <button 
                        type="submit" 
                        className="flex-grow bg-accent hover:bg-gfg-green-hover text-white font-black py-6 rounded-2xl transition-all shadow-[0_10px_30px_rgba(47,141,70,0.3)] uppercase tracking-widest text-sm active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                      <Save size={20} /> {selectedEvent ? 'Commit Deployment' : 'Deploy Node'}
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setIsEditModalOpen(false)} 
                        className="bg-card border border-border hover:bg-background text-text/60 font-black py-6 px-12 rounded-2xl transition uppercase tracking-widest text-xs shadow-sm hover:text-red-500 hover:border-red-500/30 active:scale-95"
                    >
                        Abort
                    </button>
                </div>
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
                <h2 className="text-3xl font-black text-text uppercase tracking-tighter">Event Participants</h2>
                <button onClick={() => setIsRegListOpen(false)} className="p-4 bg-background border border-border hover:bg-card hover:text-red-500 rounded-full transition-all text-text/40 group shadow-xl active:scale-90"><X size={28} className="group-hover:rotate-90 transition-transform" /></button>
              </div>
              <div className="flex-grow overflow-y-auto p-10 custom-scrollbar">
                {registrations.length > 0 ? (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-text/20 text-[10px] font-black uppercase tracking-[0.3em] border-b border-border pb-6">
                        <th className="pb-6 px-6"> Agent Identity</th>
                        <th className="pb-6 px-6">Communication Node</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {registrations.map((reg, i) => (
                        <tr key={i} className="hover:bg-accent/5 transition-colors">
                          <td className="py-6 px-6 font-black text-text uppercase tracking-widest text-sm">{reg.name}</td>
                          <td className="py-6 px-6 text-text/40 font-bold uppercase text-[10px] tracking-widest">{reg.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center py-20 text-text/30 font-black uppercase tracking-widest">No registrations detected.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .ql-container { border: none !important; font-family: 'Inter', sans-serif; font-size: 16px; background: transparent; }
        .ql-toolbar { border: none !important; border-bottom: 1px solid var(--color-border) !important; background: var(--color-card); padding: 15px !important; border-radius: 20px 20px 0 0; }
        .ql-editor { min-height: 250px; color: var(--color-text); padding: 25px !important; line-height: 1.8; }
        .ql-snow .ql-stroke { stroke: var(--color-text); opacity: 0.4; stroke-width: 2px; }
        .ql-snow .ql-fill { fill: var(--color-text); opacity: 0.4; }
        .ql-snow .ql-picker { color: var(--color-text); opacity: 0.6; font-weight: 800; }
        .ql-editor.ql-blank::before { color: var(--color-text) !important; opacity: 0.2; left: 25px !important; font-style: normal !important; font-weight: 700; }
        .ql-snow .ql-picker-options { background-color: var(--color-card); border: 2px solid var(--color-border); border-radius: 12px; padding: 10px; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-accent); border-radius: 10px; opacity: 0.2; }
      `}</style>
    </div>
  );
};

export default Events;
