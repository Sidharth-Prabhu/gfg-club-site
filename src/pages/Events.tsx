import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, faMapPin, faPlus, faEdit, faTrashAlt, faTimes, faSave, 
  faUsers, faChevronRight, faClock, faImage, faAlignLeft, faInfoCircle, 
  faToggleOn, faToggleOff, faBookOpen, faScroll 
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import MarkdownEditor from '../components/MarkdownEditor';
import MarkdownRenderer from '../components/MarkdownRenderer';

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
    <div className="container mx-auto px-4 py-6 space-y-8 pb-16 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black text-text tracking-tighter uppercase italic">Club <span className="text-accent">Events</span></h1>
          <p className="text-text/60 text-sm font-medium">Workshops and seminars for the community.</p>
        </div>
        {canManage && (
          <button 
            onClick={handleOpenCreate}
            className="bg-accent hover:bg-gfg-green-hover text-white px-5 py-2.5 rounded-xl font-black flex items-center gap-2 transition shadow-lg shadow-accent/10 text-[10px] uppercase tracking-widest active:scale-95"
          >
            <FontAwesomeIcon icon={faPlus} /> Create Event
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-24 text-center text-accent font-black tracking-widest uppercase animate-pulse text-xs italic">Loading Events...</div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={event.id} 
              onClick={() => handleShowDetails(event)}
              className="bg-card rounded-3xl overflow-hidden border border-border hover:border-accent transition-all group flex flex-col cursor-pointer hover:shadow-xl shadow-sm"
            >
              <div className="h-44 bg-background relative overflow-hidden">
                {event.poster ? (
                  <img src={event.poster} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text/10 bg-accent/5">
                    <FontAwesomeIcon icon={faCalendarAlt} size="3x" />
                  </div>
                )}
                {!event.is_open && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-red-500 text-white px-4 py-1 rounded-lg text-[8px] font-black border border-red-400/50 shadow-xl uppercase tracking-widest">REGISTRATIONS CLOSED</span>
                  </div>
                )}
                <div className="absolute top-4 left-4 flex gap-1.5">
                   <span className="bg-accent/90 backdrop-blur-md text-white px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest shadow-lg">Upcoming</span>
                   <span className="bg-blue-500/90 backdrop-blur-md text-white px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest shadow-lg capitalize">{event.participation_type}</span>
                </div>
              </div>
              <div className="p-6 flex-grow flex flex-col space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-black text-text group-hover:text-accent transition-colors leading-tight tracking-tight uppercase italic">{event.title}</h3>
                  {canManage && (
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button onClick={(e) => handleOpenEdit(e, event)} className="p-1.5 bg-background border border-border rounded-lg text-text/40 hover:text-accent shadow-sm"><FontAwesomeIcon icon={faEdit} className="text-[10px]" /></button>
                      <button onClick={(e) => handleDelete(e, event.id)} className="p-1.5 bg-background border border-border rounded-lg text-text/40 hover:text-red-500 shadow-sm"><FontAwesomeIcon icon={faTrashAlt} className="text-[10px]" /></button>
                    </div>
                  )}
                </div>
                
                <div className="text-text/60 text-xs line-clamp-2 leading-relaxed font-medium italic overflow-hidden">
                    <MarkdownRenderer content={event.description} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-text/40 bg-background/50 border border-border px-2 py-1.5 rounded-lg">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-accent" />
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-text/40 bg-background/50 border border-border px-2 py-1.5 rounded-lg">
                    <FontAwesomeIcon icon={faMapPin} className="text-accent" />
                    {event.location}
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between group-hover:text-accent transition-colors font-black uppercase tracking-[0.2em] text-[8px]">
                  <span>Explore Details</span>
                  <FontAwesomeIcon icon={faChevronRight} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-32 text-center text-text/30 bg-card rounded-3xl border border-border border-dashed shadow-inner">
          <FontAwesomeIcon icon={faCalendarAlt} size="4x" className="mx-auto mb-4 opacity-5" />
          <p className="text-xl font-black uppercase tracking-widest">No Events Scheduled</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-xl overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-card border border-border rounded-3xl w-full max-w-4xl my-auto shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 md:p-8 border-b border-border flex justify-between items-center bg-background/50">
                <h2 className="text-2xl font-black text-text uppercase tracking-tighter italic">{selectedEvent ? 'Edit Event' : 'Create New Event'}</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-text/40 hover:text-red-500 p-2 rounded-full transition-all group active:scale-90"><FontAwesomeIcon icon={faTimes} size="lg" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-[8px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Event Title</label>
                    <input required type="text" className="w-full bg-background border-2 border-border rounded-xl py-3 px-5 focus:border-accent outline-none text-lg font-black text-text shadow-inner transition-colors italic" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-2">Organizer</label>
                    <input required type="text" className="w-full bg-background border-2 border-border rounded-xl py-3 px-5 focus:border-accent outline-none text-sm font-bold text-text shadow-inner italic" value={formData.organizer} onChange={(e) => setFormData({...formData, organizer: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-2">Venue</label>
                    <input required type="text" className="w-full bg-background border-2 border-border rounded-xl py-3 px-5 focus:border-accent outline-none text-sm font-bold text-text shadow-inner italic" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-2">Participation Type</label>
                    <select className="w-full bg-background border-2 border-border rounded-xl py-3 px-5 focus:border-accent outline-none text-sm font-bold text-text shadow-inner appearance-none cursor-pointer italic" value={formData.participation_type} onChange={(e) => setFormData({...formData, participation_type: e.target.value})}>
                        <option value="individual">Individual Only</option>
                        <option value="team">Team Only</option>
                        <option value="both">Both</option>
                    </select>
                  </div>
                  {formData.participation_type !== 'individual' && (
                    <div className="space-y-2">
                        <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-2">Max Team Size</label>
                        <input type="number" min="2" max="10" className="w-full bg-background border-2 border-border rounded-xl py-3 px-5 focus:border-accent outline-none text-sm font-bold text-text shadow-inner" value={formData.max_team_size} onChange={(e) => setFormData({...formData, max_team_size: parseInt(e.target.value)})} />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-2">Date & Time</label>
                    <input required type="datetime-local" className="w-full bg-background border-2 border-border rounded-xl py-3 px-5 focus:border-accent outline-none text-sm font-bold text-text shadow-inner" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-2">Poster URL</label>
                    <input type="url" className="w-full bg-background border-2 border-border rounded-xl py-3 px-5 focus:border-accent outline-none text-sm font-bold text-text shadow-inner" value={formData.poster} onChange={(e) => setFormData({...formData, poster: e.target.value})} />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <MarkdownEditor 
                        label="Description"
                        value={formData.description}
                        onChange={(c) => setFormData({...formData, description: c})}
                        placeholder="Core event details..."
                        minHeight="200px"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <MarkdownEditor 
                        label="Rules"
                        value={formData.rules}
                        onChange={(c) => setFormData({...formData, rules: c})}
                        placeholder="Define the rules..."
                        minHeight="200px"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <MarkdownEditor 
                        label="Requirements"
                        value={formData.requirements}
                        onChange={(c) => setFormData({...formData, requirements: c})}
                        placeholder="List technical requirements..."
                        minHeight="200px"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center justify-between p-5 bg-background border-2 border-border rounded-2xl shadow-inner">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl shadow-sm ${formData.is_open ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        <FontAwesomeIcon icon={formData.is_open ? faPlus : faClock} className="text-lg" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-text uppercase tracking-widest leading-none mb-1">{formData.is_open ? 'Registration Open' : 'Registration Closed'}</p>
                        <p className="text-[8px] font-medium text-text/40 uppercase">Status</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setFormData({...formData, is_open: !formData.is_open})} className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all focus:outline-none shadow-inner ${formData.is_open ? 'bg-accent' : 'bg-text/10'}`}>
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-xl ${formData.is_open ? 'translate-x-9' : 'translate-x-2'}`} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <button type="submit" className="bg-accent hover:bg-gfg-green-hover text-white font-black py-4 px-8 rounded-xl transition text-sm flex-grow shadow-lg shadow-accent/10 uppercase tracking-widest active:scale-95">
                      <FontAwesomeIcon icon={faSave} /> {selectedEvent ? 'Save Changes' : 'Create Event'}
                    </button>
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="bg-card border border-border hover:bg-background text-text/60 font-black py-4 px-8 rounded-xl transition text-sm uppercase tracking-widest shadow-sm italic">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .ql-container { border: none !important; font-family: 'Inter', sans-serif; font-size: 14px; background: transparent; }
        .ql-toolbar { border: none !important; border-bottom: 1px solid var(--color-border) !important; background: var(--color-card); padding: 8px !important; }
        .ql-editor { min-height: 150px; color: var(--color-text); padding: 15px !important; line-height: 1.6; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-accent); border-radius: 10px; opacity: 0.2; }
      `}</style>
    </div>
  );
};

export default Events;
