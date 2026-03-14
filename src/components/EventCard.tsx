import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faMapPin, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const EventCard = ({ event }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="bg-card rounded-3xl overflow-hidden border border-border hover:border-accent transition-all duration-300 group shadow-sm hover:shadow-lg flex flex-col"
    >
      <div className="h-44 overflow-hidden bg-background relative">
        {event.poster ? (
          <img src={event.poster} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-accent/5">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-3xl text-accent/20" />
          </div>
        )}
        <div className="absolute top-3 right-3 bg-accent/90 text-white px-2 py-0.5 rounded-lg text-[8px] font-black shadow-lg uppercase tracking-widest italic">
          Upcoming
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-black mb-2 text-text group-hover:text-accent transition-colors line-clamp-1 uppercase italic tracking-tight">{event.title}</h3>
        <p className="text-text/60 text-xs mb-4 line-clamp-2 leading-relaxed font-medium italic">{event.description}</p>
        
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-[10px] text-text/80 font-bold uppercase tracking-widest">
            <div className="bg-accent/10 p-1.5 rounded-lg">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-accent" />
            </div>
            {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-text/80 font-bold uppercase tracking-widest">
            <div className="bg-accent/10 p-1.5 rounded-lg">
              <FontAwesomeIcon icon={faMapPin} className="text-accent" />
            </div>
            {event.location}
          </div>
        </div>

        <Link 
          to={`/events/${event.id}`} 
          className="mt-auto flex items-center justify-center gap-2 w-full bg-accent hover:bg-gfg-green-hover text-white font-black py-3 rounded-xl transition-all shadow-md active:scale-95 group-hover:shadow-accent/20 group-hover:shadow-lg uppercase tracking-widest text-[10px]"
        >
          View <FontAwesomeIcon icon={faArrowRight} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
};

export default EventCard;
