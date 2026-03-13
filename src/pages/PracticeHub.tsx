import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ProblemCard from '../components/ProblemCard';
import { RefreshCw, Code2, Filter } from 'lucide-react';

const PracticeHub = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState('All');
  const [language, setLanguage] = useState('python');

  const fetchProblems = async (isRefresh = false) => {
    setLoading(true);
    try {
      // Collect current problem IDs to exclude them from the next set
      const excludeIds = isRefresh ? problems.map(p => p.id).join(',') : '';
      const { data } = await api.get(`/problems?difficulty=${difficulty}&excludeIds=${excludeIds}&t=${Date.now()}`);
      setProblems(data);
    } catch (error) {
      console.error('Error fetching problems:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [difficulty]);

  const languages = [
    { name: 'Python', value: 'python' },
    { name: 'Java', value: 'java' },
    { name: 'C++', value: 'cpp' },
    { name: 'C', value: 'c' },
    { name: 'JavaScript', value: 'javascript' }
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold">Practice Hub</h1>
          <p className="text-gray-400 mt-2">Curated problems to sharpen your coding skills.</p>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          {/* Refresh Button */}
          <button 
            onClick={() => fetchProblems(true)}
            disabled={loading}
            className="bg-card border border-gray-800 hover:border-accent text-white px-4 py-2 rounded-xl flex items-center gap-2 transition disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            New Set
          </button>

          {/* Language Selection */}
          <div className="bg-card border border-gray-800 rounded-xl p-1 flex items-center">
            <div className="px-3 text-gray-500"><Code2 size={18} /></div>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-sm font-medium py-2 pr-4 focus:outline-none cursor-pointer"
            >
              {languages.map(lang => (
                <option key={lang.value} value={lang.value} className="bg-card text-white">{lang.name}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="bg-card border border-gray-800 rounded-xl p-1 flex">
            {['All', 'Easy', 'Medium', 'Hard'].map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${difficulty === d ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-accent font-bold animate-pulse">Fetching fresh problems...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
          {problems.length > 0 ? (
            problems.map(problem => (
              <ProblemCard key={problem.id} problem={problem} selectedLanguage={language} />
            ))
          ) : (
            <div className="col-span-full py-20 bg-card rounded-2xl border border-gray-800 text-center text-gray-500">
              <Filter size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-xl">No problems found for the selected filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PracticeHub;
