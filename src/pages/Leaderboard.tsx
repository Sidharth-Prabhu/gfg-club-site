import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LeaderboardTable from '../components/LeaderboardTable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrophy, 
  faMedal, 
  faStar, 
  faShieldAlt 
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { REWARD_LEVELS, calculateLevel } from '../utils/rewards';

const Leaderboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all-time');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const endpoint = tab === 'weekly' ? '/leaderboard/weekly' : '/leaderboard';
        const { data } = await api.get(endpoint);
        setData(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tab]);

  const columns = [
    { 
      header: 'Rank', 
      render: (_: any, i: number) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center relative">
            {i === 0 && <FontAwesomeIcon icon={faTrophy} className="text-yellow-500 text-lg drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" />}
            {i === 1 && <FontAwesomeIcon icon={faMedal} className="text-gray-400 text-lg drop-shadow-[0_0_8px_rgba(156,163,175,0.4)]" />}
            {i === 2 && <FontAwesomeIcon icon={faMedal} className="text-amber-600 text-lg drop-shadow-[0_0_8px_rgba(217,119,6,0.4)]" />}
            {i > 2 && <span className="text-text/30 font-black text-base leading-none">#{i + 1}</span>}
          </div>
        </div>
      )
    },
    { 
      header: 'Member', 
      key: 'name', 
      render: (row: any) => {
        const level = calculateLevel(row);
        return (
          <div className="flex items-center gap-3">
            <Link to={`/profile/${row.id}`} className="w-8 h-8 rounded-xl bg-accent/5 flex items-center justify-center text-accent font-black text-xs border border-accent/10 shadow-inner hover:bg-accent hover:text-white transition-all overflow-hidden">
              {row.profile_pic ? (
                  <img src={row.profile_pic} className="w-full h-full object-cover" alt="" />
              ) : (
                  row.name[0]
              )}
            </Link>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Link to={`/profile/${row.id}`} className="font-black text-text uppercase tracking-tight text-sm italic hover:text-accent transition-colors">{row.name}</Link>
                {level > 0 && (
                  <span className="text-[7px] font-black text-yellow-500 bg-yellow-500/5 px-1.5 py-0.5 rounded border border-yellow-500/10 uppercase tracking-tighter italic">
                    {REWARD_LEVELS[level-1].name}
                  </span>
                )}
              </div>
              <div className="flex gap-1.5 mt-0.5">
                {row.role === 'Admin' && (
                  <span className="bg-red-500/10 text-red-500 text-[7px] font-black px-1.5 py-0.5 rounded border border-red-500/20 flex items-center gap-1 uppercase tracking-widest">
                    <FontAwesomeIcon icon={faShieldAlt} size="xs" /> ADMIN
                  </span>
                )}
                {row.role === 'Core' && (
                  <span className="bg-accent/10 text-accent text-[7px] font-black px-1.5 py-0.5 rounded border border-accent/20 flex items-center gap-1 uppercase tracking-widest">
                    <FontAwesomeIcon icon={faStar} size="xs" /> CORE
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      }
    },
    { 
      header: 'Department', 
      key: 'department',
      render: (row: any) => <span className="text-text/40 font-black text-[10px] uppercase tracking-widest">{row.department}</span>
    },
    { 
      header: 'Club Score', 
      key: 'gfg_score',
      render: (row: any) => <span className="text-accent font-black text-xl tracking-tighter drop-shadow-sm">{row.gfg_score}</span>
    },
    { 
      header: 'Solved', 
      key: 'problems_solved',
      render: (row: any) => <span className="text-text font-black text-base">{row.problems_solved || 0}</span>
    },
    { 
      header: 'Streak', 
      key: 'streak', 
      render: (row: any) => (
        <div className="flex items-center gap-1.5 text-orange-500 font-black text-base">
          <FontAwesomeIcon icon={faStar} className="drop-shadow-sm text-xs" />
          {row.streak}D
        </div>
      )
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6 space-y-8 pb-16 max-w-6xl">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black text-text tracking-tighter uppercase italic">Club <span className="text-accent">Leaderboard</span></h1>
          <p className="text-text/60 text-sm font-medium">Real-time rankings based on performance and contributions.</p>
        </div>

        <div className="flex bg-card p-1 rounded-xl border border-border w-fit shadow-sm">
          <button 
            onClick={() => setTab('weekly')}
            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'weekly' ? 'bg-accent text-white shadow-lg' : 'text-text/40 hover:text-accent hover:bg-accent/5'}`}
          >
            Weekly
          </button>
          <button 
            onClick={() => setTab('all-time')}
            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'all-time' ? 'bg-accent text-white shadow-lg' : 'text-text/40 hover:text-accent hover:bg-accent/5'}`}
          >
            All-Time
          </button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-3xl border border-border overflow-hidden shadow-xl relative"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none"></div>

        {loading ? (
          <div className="py-32 text-center space-y-4">
            <div className="w-12 h-12 bg-accent/10 border-2 border-accent/20 border-t-accent rounded-full animate-spin mx-auto"></div>
            <p className="text-accent font-black tracking-[0.3em] uppercase text-xs animate-pulse">Loading Leaderboard...</p>
          </div>
        ) : data.length > 0 ? (
          <div className="p-1 md:p-4">
            <LeaderboardTable data={data} columns={columns} />
          </div>
        ) : (
          <div className="py-32 text-center text-text/30 space-y-4">
            <FontAwesomeIcon icon={faTrophy} size="4x" className="mx-auto opacity-5" />
            <p className="text-xl font-black uppercase tracking-widest">No Active Rankings</p>
          </div>
        )}
      </motion.div>

      {!loading && data.length > 0 && (
         <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 bg-background border border-border rounded-3xl shadow-inner text-center md:text-left"
         >
            <div className="space-y-3">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                    <FontAwesomeIcon icon={faStar} className="text-accent" size="lg" />
                    <h3 className="text-xl font-black text-text uppercase tracking-tight italic">Top Performers</h3>
                </div>
                <p className="text-text/60 text-sm font-medium">Rankings updated regularly. Keep participating to improve your rank.</p>
            </div>
            <div className="flex items-center gap-6">
               <div className="text-center">
                  <p className="text-[8px] font-black text-text/30 uppercase tracking-[0.3em] mb-0.5">Active Members</p>
                  <p className="text-3xl font-black text-text">{data.length}</p>
               </div>
               <div className="h-8 w-[1px] bg-border"></div>
               <div className="text-center">
                  <p className="text-[8px] font-black text-text/30 uppercase tracking-[0.3em] mb-0.5">Total Points</p>
                  <p className="text-3xl font-black text-accent">{data.reduce((acc, curr) => acc + (curr.gfg_score || 0), 0).toLocaleString()}</p>
               </div>
            </div>
         </motion.div>
      )}
    </div>
  );
};

export default Leaderboard;
