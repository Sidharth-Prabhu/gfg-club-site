import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ProblemCard from '../components/ProblemCard';
import { RefreshCw, Code2, Filter, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="space-y-12 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8"
      >
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black text-text tracking-tighter uppercase">Practice <span className="text-accent">Hub</span></h1>
          <p className="text-text/60 text-lg font-medium">Curated algorithmic challenges to sharpen your technical edge.</p>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full lg:w-auto items-center">
          <button 
            onClick={() => fetchProblems(true)}
            disabled={loading}
            className="bg-card border border-border hover:border-accent text-text/80 hover:text-accent px-6 py-3 rounded-2xl flex items-center gap-3 transition-all shadow-sm font-black uppercase text-xs tracking-widest disabled:opacity-50 active:scale-95 group"
          >
            <RefreshCw size={18} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            New Challenges
          </button>

          <div className="bg-card border border-border rounded-2xl p-1 flex items-center shadow-sm">
            <div className="px-4 text-text/30 border-r border-border/50 mr-1"><Code2 size={20} /></div>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-text text-xs font-black uppercase tracking-widest py-3 pr-6 pl-2 focus:outline-none cursor-pointer appearance-none"
            >
              {languages.map(lang => (
                <option key={lang.value} value={lang.value} className="bg-card text-text font-sans normal-case">{lang.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-card border border-border rounded-2xl p-1.5 flex shadow-sm">
            {['All', 'Easy', 'Medium', 'Hard'].map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${difficulty === d ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-text/40 hover:text-accent hover:bg-accent/5'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="py-40 text-center space-y-4">
          <div className="w-16 h-16 bg-accent/10 border-2 border-accent/20 border-t-accent rounded-full animate-spin mx-auto"></div>
          <p className="text-accent font-black tracking-widest uppercase text-sm animate-pulse">Syncing Problem Matrix...</p>
        </div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10"
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
            <div className="col-span-full py-40 bg-card rounded-[3rem] border-2 border-dashed border-border text-center text-text/30 shadow-inner">
              <Filter size={80} className="mx-auto mb-6 opacity-5" />
              <p className="text-2xl font-black uppercase tracking-widest">No Matches Found</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default PracticeHub;
