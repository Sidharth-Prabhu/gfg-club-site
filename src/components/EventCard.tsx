import React from 'react';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const EventCard = ({ event }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="bg-card rounded-3xl overflow-hidden border border-border hover:border-accent transition-all duration-300 group shadow-sm hover:shadow-xl flex flex-col"
    >
      <div className="h-56 overflow-hidden bg-background relative">
        {event.poster ? (
          <img src={event.poster} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-accent/5">
            <Calendar size={64} className="text-accent/20" />
          </div>
        )}
        <div className="absolute top-4 right-4 bg-accent/90 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg uppercase tracking-widest">
          Upcoming
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-2xl font-bold mb-3 text-text group-hover:text-accent transition-colors line-clamp-1 uppercase">{event.title}</h3>
        <p className="text-text/60 text-sm mb-5 line-clamp-2 leading-relaxed font-medium">{event.description}</p>
        
        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-3 text-sm text-text/80 font-bold uppercase tracking-widest">
            <div className="bg-accent/10 p-1.5 rounded-lg">
              <Calendar size={18} className="text-accent" />
            </div>
            {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="flex items-center gap-3 text-sm text-text/80 font-bold uppercase tracking-widest">
            <div className="bg-accent/10 p-1.5 rounded-lg">
              <MapPin size={18} className="text-accent" />
            </div>
            {event.location}
          </div>
        </div>

        <Link 
          to={`/events/${event.id}`} 
          className="mt-auto flex items-center justify-center gap-2 w-full bg-accent hover:bg-gfg-green-hover text-white font-bold py-3.5 rounded-2xl transition-all shadow-md active:scale-95 group-hover:shadow-accent/20 group-hover:shadow-lg uppercase tracking-widest text-sm"
        >
          View Details <ArrowRight size={18} />
        </Link>
      </div>
    </motion.div>
  );
};

export default EventCard;
