import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faExternalLinkAlt, faClock, faUsers, faChartLine } from '@fortawesome/free-solid-svg-icons';

const POTDCard = ({ potd, loading }) => {
  if (loading) {
    return (
      <div className="bg-card border border-border p-6 rounded-3xl shadow-sm animate-pulse space-y-4">
        <div className="h-4 bg-border/50 rounded w-1/4"></div>
        <div className="h-8 bg-border/50 rounded w-3/4"></div>
        <div className="h-20 bg-border/50 rounded w-full"></div>
      </div>
    );
  }

  if (!potd) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="bg-card border border-border p-6 rounded-3xl shadow-sm hover:border-accent transition-all group overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <FontAwesomeIcon icon={faCode} size="4x" className="text-accent" />
      </div>

      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <span className="bg-accent/10 text-accent text-[8px] font-black px-2 py-1 rounded border border-accent/20 uppercase tracking-widest italic">
            Problem of the Day
          </span>
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[8px] font-black text-text/40 uppercase tracking-widest flex items-center gap-1">
              <FontAwesomeIcon icon={faClock} /> {potd.timer || '24:00:00'}
            </span>
          </div>
        </div>
        
        {potd.sponsor && potd.sponsor.logo && (
          <div className="flex flex-col items-end gap-1">
            <p className="text-[7px] font-black text-text/30 uppercase tracking-widest">Powered by</p>
            <a href={potd.sponsor.link} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <img src={potd.sponsor.logo} alt="Sponsor" className="h-5 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all" />
            </a>
          </div>
        )}
      </div>

      <div className="space-y-4 relative z-10">
        <div>
          <p className="text-[9px] font-black text-text/40 uppercase tracking-widest mb-1">{potd.date}</p>
          <h3 className="text-xl md:text-2xl font-black text-text uppercase italic tracking-tight group-hover:text-accent transition-colors">
            {potd.title}
          </h3>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 bg-background/50 border border-border px-3 py-1.5 rounded-xl">
            <span className={`w-2 h-2 rounded-full ${
              potd.difficulty === 'Easy' ? 'bg-green-500' : 
              potd.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></span>
            <span className="text-[9px] font-black text-text/60 uppercase tracking-widest">{potd.difficulty}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-background/50 border border-border px-3 py-1.5 rounded-xl">
            <FontAwesomeIcon icon={faUsers} className="text-blue-500 text-[10px]" />
            <span className="text-[9px] font-black text-text/60 uppercase tracking-widest">{potd.submissions}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-background/50 border border-border px-3 py-1.5 rounded-xl">
            <FontAwesomeIcon icon={faChartLine} className="text-orange-500 text-[10px]" />
            <span className="text-[9px] font-black text-text/60 uppercase tracking-widest">{potd.accuracy}</span>
          </div>
        </div>

        {potd.companies && potd.companies.length > 0 && (
          <div className="space-y-2">
            <p className="text-[8px] font-black text-text/30 uppercase tracking-[0.2em]">Featured In</p>
            <div className="flex flex-wrap gap-1.5">
              {potd.companies.map((company, i) => (
                <span key={i} className="text-[7px] font-black text-text/50 bg-background border border-border px-2 py-1 rounded-md uppercase tracking-widest">
                  {company}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2">
          <a 
            href={potd.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full bg-accent hover:bg-gfg-green-hover text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition shadow-lg shadow-accent/20 flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            Solve Problem <FontAwesomeIcon icon={faExternalLinkAlt} />
          </a>
        </div>
      </div>
      
      {potd.isFallback && (
        <p className="mt-4 text-[7px] font-black text-text/20 uppercase tracking-widest text-center italic">
          Data synchronized from local cache
        </p>
      )}
    </motion.div>
  );
};

export default POTDCard;
