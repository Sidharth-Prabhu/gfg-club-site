import React from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  return (
    <div className="bg-card rounded-xl overflow-hidden border border-gray-800 hover:border-accent transition group">
      <div className="h-48 overflow-hidden bg-gray-700 relative">
        {event.poster ? (
          <img src={event.poster} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <Calendar size={48} />
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition">{event.title}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>
        
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Calendar size={16} className="text-accent" />
            {new Date(event.date).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <MapPin size={16} className="text-accent" />
            {event.location}
          </div>
        </div>

        <Link 
          to={`/events/${event.id}`} 
          className="block w-full text-center bg-accent hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
