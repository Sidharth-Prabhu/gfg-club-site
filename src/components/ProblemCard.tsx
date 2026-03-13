import React from 'react';
import { ArrowRight } from 'lucide-react';
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
      whileHover={{ y: -5, borderColor: 'var(--color-accent)' }}
      className="bg-card p-8 rounded-[2rem] border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-8 group transition-all duration-300 shadow-sm hover:shadow-xl"
    >
      <div className="space-y-4 flex-grow">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getDifficultyColor(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
          <span className="text-text/40 text-[10px] font-black uppercase tracking-widest bg-background border border-border px-3 py-1.5 rounded-lg shadow-inner">
            {problem.topic}
          </span>
        </div>
        <h3 className="font-black text-2xl md:text-3xl text-text group-hover:text-accent transition-colors leading-tight tracking-tight uppercase">
          {problem.title}
        </h3>
      </div>
      
      <a 
        href={finalLink} 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-full md:w-auto px-8 py-4 rounded-2xl bg-accent hover:bg-gfg-green-hover text-white font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-md group-hover:shadow-accent/30 active:scale-95 whitespace-nowrap"
      >
        Solve Problem <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </a>
    </motion.div>
  );
};

export default ProblemCard;
