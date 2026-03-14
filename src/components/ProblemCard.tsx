import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const ProblemCard = ({ problem, selectedLanguage }) => {
  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'Medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'Hard': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-text/40 bg-text/5 border-border';
    }
  };

  const finalLink = `${problem.link}?page=1&category=${selectedLanguage || 'python'}`;

  return (
    <motion.div 
      whileHover={{ y: -4, borderColor: 'var(--color-accent)' }}
      className="bg-card p-6 rounded-3xl border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group transition-all duration-300 shadow-sm hover:shadow-lg"
    >
      <div className="space-y-3 flex-grow">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${getDifficultyColor(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
          <span className="text-text/40 text-[8px] font-black uppercase tracking-widest bg-background border border-border px-2 py-1 rounded-md shadow-inner">
            {problem.topic}
          </span>
        </div>
        <h3 className="font-black text-xl md:text-2xl text-text group-hover:text-accent transition-colors leading-tight tracking-tight uppercase italic">
          {problem.title}
        </h3>
      </div>
      
      <a 
        href={finalLink} 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-full md:w-auto px-6 py-3 rounded-xl bg-accent hover:bg-gfg-green-hover text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md group-hover:shadow-accent/30 active:scale-95 whitespace-nowrap"
      >
        Solve <FontAwesomeIcon icon={faArrowRight} className="group-hover:translate-x-1 transition-transform" />
      </a>
    </motion.div>
  );
};

export default ProblemCard;
