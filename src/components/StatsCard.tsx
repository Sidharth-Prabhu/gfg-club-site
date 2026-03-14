import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const StatsCard = ({ title, value, icon, color }) => {
  return (
    <motion.div 
      whileHover={{ y: -4, borderColor: 'var(--color-accent)' }}
      className="bg-card p-5 rounded-2xl border border-border flex items-center gap-4 shadow-sm hover:shadow-lg transition-all duration-500 group relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-0 group-hover:opacity-5 rounded-full blur-3xl -mr-12 -mt-12 transition-opacity`}></div>
      
      <div className={`w-10 h-10 rounded-xl ${color} bg-opacity-10 flex items-center justify-center border border-current border-opacity-10 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
        <FontAwesomeIcon icon={icon} className={color.replace('bg-', 'text-')} size="lg" />
      </div>
      
      <div className="space-y-0.5 relative z-10">
        <h3 className="text-text/30 text-[8px] font-black uppercase tracking-[0.2em]">{title}</h3>
        <p className="text-2xl font-black text-text tracking-tighter leading-none italic">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>
    </motion.div>
  );
};

export default StatsCard;
