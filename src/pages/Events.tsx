import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Users, Plus, Edit, Trash2, X, Save, Users2, CheckCircle, Clock, Info, ChevronRight } from 'lucide-react';
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
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold">Club Events</h1>
          <p className="text-gray-400 mt-2">Workshops, contests, and seminars for campus coders.</p>
        </div>
        {canManage && (
          <button 
            onClick={handleOpenCreate}
            className="bg-accent hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition shadow-lg shadow-accent/20"
          >
            <Plus size={20} /> Create Event
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-accent font-bold animate-pulse">Loading amazing events...</div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
          {events.map(event => (
            <motion.div 
              key={event.id} 
              onClick={() => handleShowDetails(event)}
              className="bg-card rounded-2xl overflow-hidden border border-gray-800 hover:border-accent/50 transition-all group flex flex-col cursor-pointer hover:shadow-2xl hover:shadow-accent/5"
            >
              <div className="h-48 bg-gray-800 relative overflow-hidden">
                {event.poster ? (
                  <img src={event.poster} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600"><Calendar size={48} /></div>
                )}
                {!event.is_open && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-bold border border-red-400/50">CLOSED</span>
                  </div>
                )}
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold group-hover:text-accent transition-colors">{event.title}</h3>
                  {canManage && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => handleOpenEdit(e, event)} className="p-1.5 bg-background border border-gray-700 rounded-lg hover:text-accent"><Edit size={16} /></button>
                      <button onClick={(e) => handleDelete(e, event.id)} className="p-1.5 bg-background border border-gray-700 rounded-lg hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-400 text-sm mb-6 line-clamp-2">{event.description}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar size={14} className="text-accent" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <MapPin size={14} className="text-accent" />
                    {event.location}
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-800 flex items-center justify-between group-hover:text-accent transition-colors">
                  <span className="text-sm font-bold">Explore Details</span>
                  <ChevronRight size={18} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-40 text-center text-gray-500 bg-card rounded-3xl border border-gray-800 border-dashed">
          <Calendar size={64} className="mx-auto mb-4 opacity-10" />
          <p className="text-xl">No events scheduled at the moment.</p>
        </div>
      )}

      {/* Event Details Expanded View */}
      <AnimatePresence>
        {isDetailsOpen && selectedEvent && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card border border-gray-800 rounded-3xl w-full max-w-4xl shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setIsDetailsOpen(false)}
                className="absolute top-6 right-6 z-20 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition"
              >
                <X size={24} />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="h-64 lg:min-h-[500px] bg-gray-800">
                  {selectedEvent.poster ? (
                    <img src={selectedEvent.poster} alt={selectedEvent.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600"><Calendar size={80} /></div>
                  )}
                </div>
                
                <div className="p-8 lg:p-12 space-y-8 flex flex-col">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedEvent.is_open ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-red-500/10 text-red-500'}`}>
                        {selectedEvent.is_open ? 'OPEN FOR REGISTRATION' : 'REGISTRATIONS CLOSED'}
                      </span>
                    </div>
                    <h2 className="text-4xl font-extrabold mb-4">{selectedEvent.title}</h2>
                    
                    <div className="text-gray-400 leading-relaxed text-lg whitespace-pre-wrap">
                      <Linkify 
                        options={{
                          className: 'text-accent hover:underline font-bold',
                          target: '_blank'
                        }}
                      >
                        {selectedEvent.description}
                      </Linkify>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-800">
                    <div className="space-y-1">
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Date & Time</p>
                      <div className="flex items-center gap-2 text-gray-200">
                        <Calendar size={18} className="text-accent" />
                        {new Date(selectedEvent.date).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Location</p>
                      <div className="flex items-center gap-2 text-gray-200">
                        <MapPin size={18} className="text-accent" />
                        {selectedEvent.location}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Organizer</p>
                      <div className="flex items-center gap-2 text-gray-200">
                        <Users size={18} className="text-accent" />
                        {selectedEvent.organizer || 'GFG Club'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 mt-auto flex flex-col sm:flex-row gap-4">
                    {canRegister && (
                      <button 
                        onClick={(e) => handleRegister(e, selectedEvent.id)}
                        disabled={!selectedEvent.is_open}
                        className={`flex-1 py-4 rounded-2xl font-extrabold text-lg transition flex items-center justify-center gap-2 shadow-xl ${selectedEvent.is_open ? 'bg-accent hover:bg-green-700 text-white shadow-accent/20' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                      >
                        {selectedEvent.is_open ? <><CheckCircle size={24} /> Register Now</> : 'Registrations Closed'}
                      </button>
                    )}
                    {canManage && (
                      <button 
                        onClick={(e) => handleViewRegistrations(e, selectedEvent)}
                        className="flex-1 py-4 rounded-2xl bg-background border border-gray-700 text-gray-300 hover:border-accent hover:text-accent font-bold transition flex items-center justify-center gap-2"
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
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-gray-800 rounded-3xl w-full max-w-2xl my-auto shadow-2xl">
              <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <h2 className="text-2xl font-bold">{selectedEvent ? 'Edit Event' : 'Create New Event'}</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Event Title</label>
                    <input required type="text" className="w-full bg-background border border-gray-700 rounded-xl py-3 px-4 focus:border-accent outline-none" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Organizer</label>
                    <input required type="text" className="w-full bg-background border border-gray-700 rounded-xl py-3 px-4 focus:border-accent outline-none" value={formData.organizer} onChange={(e) => setFormData({...formData, organizer: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Venue / Location</label>
                    <input required type="text" className="w-full bg-background border border-gray-700 rounded-xl py-3 px-4 focus:border-accent outline-none" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Date & Time</label>
                    <input required type="datetime-local" className="w-full bg-background border border-gray-700 rounded-xl py-3 px-4 focus:border-accent outline-none" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Cover Image URL</label>
                    <input type="url" className="w-full bg-background border border-gray-700 rounded-xl py-3 px-4 focus:border-accent outline-none" value={formData.poster} onChange={(e) => setFormData({...formData, poster: e.target.value})} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Description (URLs will be clickable)</label>
                    <textarea required rows={4} className="w-full bg-background border border-gray-700 rounded-xl py-3 px-4 focus:border-accent outline-none resize-none text-white" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <div className="md:col-span-2 flex items-center justify-between p-4 bg-background border border-gray-700 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${formData.is_open ? 'bg-accent/10 text-accent' : 'bg-red-500/10 text-red-500'}`}>
                        {formData.is_open ? <CheckCircle size={20} /> : <Clock size={20} />}
                      </div>
                      <div>
                        <p className="font-bold">{formData.is_open ? 'Accepting Registrations' : 'Registrations Restricted'}</p>
                        <p className="text-xs text-gray-500">Toggle whether users can sign up for this event.</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, is_open: !formData.is_open})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.is_open ? 'bg-accent' : 'bg-gray-700'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_open ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
                <button type="submit" className="w-full bg-accent hover:bg-green-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition text-lg shadow-xl shadow-accent/20">
                  <Save size={24} /> {selectedEvent ? 'Update Event' : 'Publish Event'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Registration List Modal */}
      <AnimatePresence>
        {isRegListOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-card border border-gray-800 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-800 bg-background/50 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Event Registrations</h2>
                  <p className="text-accent text-sm font-medium">{selectedEvent?.title}</p>
                </div>
                <button onClick={() => setIsRegListOpen(false)} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition text-gray-400 hover:text-white"><X size={24} /></button>
              </div>
              
              <div className="flex-grow overflow-y-auto p-6">
                {registrations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-gray-500 text-sm border-b border-gray-800">
                          <th className="pb-4 font-medium px-4">Student Name</th>
                          <th className="pb-4 font-medium px-4">Email</th>
                          <th className="pb-4 font-medium px-4 text-center">GFG Score</th>
                          <th className="pb-4 font-medium px-4 text-center">GFG Solved</th>
                          <th className="pb-4 font-medium px-4 text-center">Rank (ID)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/50">
                        {registrations.map((reg, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="py-4 px-4 font-bold text-gray-200">{reg.name}</td>
                            <td className="py-4 px-4 text-gray-400 text-sm">{reg.email}</td>
                            <td className="py-4 px-4 text-center text-accent font-bold">{reg.gfg_score}</td>
                            <td className="py-4 px-4 text-center text-gray-300 font-medium">{reg.gfg_solved}</td>
                            <td className="py-4 px-4 text-center text-gray-500">#{reg.user_id}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-20 text-center text-gray-500">
                    <Info size={48} className="mx-auto mb-4 opacity-10" />
                    <p>No registrations yet for this event.</p>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-800 bg-background/30 text-right">
                <p className="text-gray-500 text-sm">Total Participants: <span className="text-accent font-bold">{registrations.length}</span></p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Events;
