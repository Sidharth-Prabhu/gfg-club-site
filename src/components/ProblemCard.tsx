import React from 'react';
import { ExternalLink } from 'lucide-react';

const ProblemCard = ({ problem, selectedLanguage }) => {
  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'Medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'Hard': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  // Build the final GfG link with language/category parameter
  const finalLink = `${problem.link}?page=1&category=${selectedLanguage || 'python'}`;

  return (
    <div className="bg-card p-5 rounded-2xl border border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group hover:border-accent transition-all duration-300">
      <div className="space-y-2 flex-grow">
        <h3 className="font-bold text-lg group-hover:text-accent transition-colors">{problem.title}</h3>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getDifficultyColor(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
          <span className="text-gray-500 text-sm bg-gray-800/50 px-2 py-0.5 rounded-md">{problem.topic}</span>
        </div>
      </div>
      
      <a 
        href={finalLink} 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-accent hover:bg-green-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all group-hover:shadow-[0_0_15px_rgba(47,141,70,0.3)]"
      >
        Solve Problem <ExternalLink size={16} />
      </a>
    </div>
  );
};

export default ProblemCard;
