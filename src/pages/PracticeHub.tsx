import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ProblemCard from '../components/ProblemCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync, faCode, faFilter } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const PracticeHub = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState('All');
  const [language, setLanguage] = useState('python');

  const fetchProblems = async (isRefresh = false) => {
    setLoading(true);
    try {
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
    <div className="container mx-auto px-4 py-6 space-y-8 pb-16 max-w-6xl">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
      >
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black text-text tracking-tighter uppercase italic">Practice <span className="text-accent">Hub</span></h1>
          <p className="text-text/60 text-sm font-medium">Curated problems to improve your coding skills.</p>
        </div>
        
        {/* GfG Data Disclaimer */}
        <div className="w-full lg:w-auto">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-2 border-blue-500/30 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-blue-500/30 flex items-center justify-center shrink-0 border border-blue-400/30">
              <span className="text-2xl">📊</span>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-wider">Data Source</p>
              <p className="text-[11px] font-bold text-blue-200 leading-snug">Problems are fetched directly from <span className="text-green-400 font-black">GeeksforGeeks</span> via HTTP requests. <span className="text-amber-400">No API</span> is used.</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full lg:w-auto items-center">
          <button 
            onClick={() => fetchProblems(true)}
            disabled={loading}
            className="bg-card border border-border hover:border-accent text-text/80 hover:text-accent px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-sm font-black uppercase text-[10px] tracking-widest disabled:opacity-50 active:scale-95 group"
          >
            <FontAwesomeIcon icon={faSync} className={`${loading ? 'fa-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            Refresh
          </button>

          <div className="bg-card border border-border rounded-xl p-0.5 flex items-center shadow-sm">
            <div className="px-3 text-text/30 border-r border-border/50 mr-1"><FontAwesomeIcon icon={faCode} /></div>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-text text-[10px] font-black uppercase tracking-widest py-2 pr-5 pl-1 focus:outline-none cursor-pointer appearance-none"
            >
              {languages.map(lang => (
                <option key={lang.value} value={lang.value} className="bg-card text-text font-sans normal-case">{lang.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-card border border-border rounded-xl p-1 flex shadow-sm">
            {['All', 'Easy', 'Medium', 'Hard'].map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${difficulty === d ? 'bg-accent text-white shadow-md' : 'text-text/40 hover:text-accent hover:bg-accent/5'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="py-32 text-center space-y-4">
          <div className="w-12 h-12 bg-accent/10 border-2 border-accent/20 border-t-accent rounded-full animate-spin mx-auto"></div>
          <p className="text-accent font-black tracking-[0.3em] uppercase text-xs animate-pulse">Loading Challenges...</p>
        </div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8"
        >
          {problems.length > 0 ? (
            problems.map((problem) => (
              <motion.div
                key={problem.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <ProblemCard problem={problem} selectedLanguage={language} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-32 bg-card rounded-3xl border-2 border-dashed border-border text-center text-text/30 shadow-inner">
              <FontAwesomeIcon icon={faFilter} size="4x" className="mx-auto mb-4 opacity-5" />
              <p className="text-xl font-black uppercase tracking-widest">No Matches Found</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default PracticeHub;
