import React, { useEffect, useState } from 'react';
import api from '../services/api';
import EventCard from '../components/EventCard';
import { Calendar, Search } from 'lucide-react';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await api.get('/events');
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold">Club Events</h1>
          <p className="text-gray-400 mt-2">Workshops, contests, and seminars for campus coders.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder="Search events..." 
            className="w-full bg-card border border-gray-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-accent transition"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-accent font-bold">Loading events...</div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="bg-card p-20 rounded-2xl border border-gray-800 text-center text-gray-500">
          <Calendar size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-xl">No events found.</p>
        </div>
      )}
    </div>
  );
};

export default Events;
