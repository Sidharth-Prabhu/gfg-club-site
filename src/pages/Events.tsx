import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Plus, Edit, Trash2, X, Save, Users2, ChevronRight, Clock, Image as ImageIcon, AlignLeft, Info, ToggleRight, Users, BookOpen, ScrollText } from 'lucide-react';
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
    title: '', description: '', poster: '', date: '', location: '', organizer: '', is_open: true,
    participation_type: 'individual', max_team_size: 1, rules: '', requirements: ''
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
    setFormData({ 
        title: '', description: '', poster: '', date: '', location: '', organizer: '', is_open: true,
        participation_type: 'individual', max_team_size: 1, rules: '', requirements: ''
    });
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
      is_open: !!event.is_open,
      participation_type: event.participation_type || 'individual',
      max_team_size: event.max_team_size || 1,
      rules: event.rules || '',
      requirements: event.requirements || ''
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
    if (!html) return "";
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
                <div className="absolute top-5 left-5 flex gap-2">
                   <span className="bg-accent/90 backdrop-blur-md text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg">Upcoming</span>
                   <span className="bg-blue-500/90 backdrop-blur-md text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg capitalize">{event.participation_type}</span>
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

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-xl overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-card border border-border rounded-[3.5rem] w-full max-w-5xl my-auto shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-10 border-b border-border flex justify-between items-center bg-background/50">
                <h2 className="text-3xl font-black text-text uppercase tracking-tighter">{selectedEvent ? 'Modify Matrix Event' : 'Initialize New Event'}</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-text/40 hover:text-red-500 p-4 hover:bg-red-500/5 rounded-full transition-all group active:scale-90"><X size={32} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2 space-y-3">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Event Headline</label>
                    <input required type="text" className="w-full bg-background border-2 border-border rounded-[1.5rem] py-5 px-8 focus:border-accent outline-none text-2xl font-black text-text shadow-inner transition-colors" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">Authority / Organizer</label>
                    <input required type="text" className="w-full bg-background border-2 border-border rounded-2xl py-4 px-6 focus:border-accent outline-none font-bold text-text shadow-inner" value={formData.organizer} onChange={(e) => setFormData({...formData, organizer: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">Spatial Node / Venue</label>
                    <input required type="text" className="w-full bg-background border-2 border-border rounded-2xl py-4 px-6 focus:border-accent outline-none font-bold text-text shadow-inner" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">Participation Paradigm</label>
                    <select className="w-full bg-background border-2 border-border rounded-2xl py-4 px-6 focus:border-accent outline-none font-bold text-text shadow-inner appearance-none cursor-pointer" value={formData.participation_type} onChange={(e) => setFormData({...formData, participation_type: e.target.value})}>
                        <option value="individual">Individual Only</option>
                        <option value="team">Team Only</option>
                        <option value="both">Both (Team & Individual)</option>
                    </select>
                  </div>
                  {formData.participation_type !== 'individual' && (
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">Max Team Size</label>
                        <input type="number" min="2" max="10" className="w-full bg-background border-2 border-border rounded-2xl py-4 px-6 focus:border-accent outline-none font-bold text-text shadow-inner" value={formData.max_team_size} onChange={(e) => setFormData({...formData, max_team_size: parseInt(e.target.value)})} />
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">Temporal Node / DateTime</label>
                    <input required type="datetime-local" className="w-full bg-background border-2 border-border rounded-2xl py-4 px-6 focus:border-accent outline-none font-bold text-text shadow-inner" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">Visual Poster Node (URL)</label>
                    <input type="url" className="w-full bg-background border-2 border-border rounded-2xl py-4 px-6 focus:border-accent outline-none font-bold text-text shadow-inner" value={formData.poster} onChange={(e) => setFormData({...formData, poster: e.target.value})} />
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Protocol / Description</label>
                    <div className="bg-background rounded-2xl overflow-hidden border-2 border-border focus-within:border-accent shadow-inner">
                        <ReactQuill theme="snow" value={formData.description} onChange={(c) => setFormData({...formData, description: c})} modules={modules} />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-2"><ScrollText size={12}/> Rules of Engagement</label>
                    <div className="bg-background rounded-2xl overflow-hidden border-2 border-border focus-within:border-accent shadow-inner">
                        <ReactQuill theme="snow" value={formData.rules} onChange={(c) => setFormData({...formData, rules: c})} modules={modules} placeholder="Define the rules..." />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-2"><BookOpen size={12}/> Technical Requirements</label>
                    <div className="bg-background rounded-2xl overflow-hidden border-2 border-border focus-within:border-accent shadow-inner">
                        <ReactQuill theme="snow" value={formData.requirements} onChange={(c) => setFormData({...formData, requirements: c})} modules={modules} placeholder="List technical requirements..." />
                    </div>
                  </div>

                  <div className="md:col-span-2 flex items-center justify-between p-8 bg-background border-2 border-border rounded-[2rem] shadow-inner">
                    <div className="flex items-center gap-6">
                      <div className={`p-4 rounded-2xl shadow-sm ${formData.is_open ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        {formData.is_open ? <Plus size={28} /> : <Clock size={28} />}
                      </div>
                      <div>
                        <p className="font-black text-text uppercase tracking-widest leading-none mb-2">{formData.is_open ? 'Node Open' : 'Node Restricted'}</p>
                        <p className="text-xs font-medium text-text/40 uppercase">Registration Access Control</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setFormData({...formData, is_open: !formData.is_open})} className={`relative inline-flex h-10 w-20 items-center rounded-full transition-all focus:outline-none shadow-inner ${formData.is_open ? 'bg-accent' : 'bg-text/10'}`}>
                      <span className={`inline-block h-7 w-7 transform rounded-full bg-white transition-transform shadow-xl ${formData.is_open ? 'translate-x-11' : 'translate-x-2'}`} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-6 pt-4">
                    <button type="submit" className="bg-accent hover:bg-gfg-green-hover text-white font-black py-7 px-14 rounded-[1.5rem] transition text-xl flex-grow shadow-2xl shadow-accent/20 uppercase tracking-widest active:scale-95">
                      <Save size={28} /> {selectedEvent ? 'Commit Updates' : 'Deploy Event'}
                    </button>
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="bg-card border border-border hover:bg-background text-text/60 font-black py-7 px-14 rounded-[1.5rem] transition text-xl uppercase tracking-widest shadow-sm">Discard</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .ql-container { border: none !important; font-family: 'Inter', sans-serif; font-size: 16px; background: transparent; }
        .ql-toolbar { border: none !important; border-bottom: 1px solid var(--color-border) !important; background: var(--color-card); padding: 15px !important; }
        .ql-editor { min-height: 200px; color: var(--color-text); padding: 25px !important; line-height: 1.8; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-accent); border-radius: 10px; opacity: 0.2; }
      `}</style>
    </div>
  );
};

export default Events;
