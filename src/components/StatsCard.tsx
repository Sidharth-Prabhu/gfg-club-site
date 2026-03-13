import React from 'react';
import { TrendingUp, Users, Code, Award } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, color }) => {
  return (
    <div className="bg-card p-6 rounded-xl border border-gray-800 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color} bg-opacity-20`}>
        <Icon className={color.replace('bg-', 'text-')} size={24} />
      </div>
      <div>
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
