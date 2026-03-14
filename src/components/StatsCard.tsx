import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, icon: Icon, color }) => {
  return (
    <motion.div 
      whileHover={{ y: -8, borderColor: 'var(--color-accent)' }}
      className="bg-card p-8 rounded-[2rem] border border-border flex items-center gap-6 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-0 group-hover:opacity-5 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity`}></div>
      
      <div className={`p-5 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center border border-current border-opacity-10 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
        <Icon className={color.replace('bg-', 'text-')} size={32} />
      </div>
      
      <div className="space-y-1 relative z-10">
        <h3 className="text-text/30 text-[10px] font-black uppercase tracking-[0.3em]">{title}</h3>
        <p className="text-4xl font-black text-text tracking-tighter leading-none italic">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>
    </motion.div>
  );
};

export default StatsCard;
