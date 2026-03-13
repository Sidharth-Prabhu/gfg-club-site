import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, icon: Icon, color }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-card p-6 rounded-2xl border border-border flex items-center gap-5 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className={`p-4 rounded-xl ${color} bg-opacity-10 flex items-center justify-center`}>
        <Icon className={color.replace('bg-', 'text-')} size={28} />
      </div>
      <div>
        <h3 className="text-text/60 text-sm font-semibold uppercase tracking-wider">{title}</h3>
        <p className="text-3xl font-extrabold text-text mt-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>
    </motion.div>
  );
};

export default StatsCard;
