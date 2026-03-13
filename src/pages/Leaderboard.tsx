import React, { useEffect, useState } from 'react';
import api from '../services/api';
import LeaderboardTable from '../components/LeaderboardTable';
import { Trophy, Medal, Star, Hash, ShieldCheck, User as UserIcon, Star as StarIcon } from 'lucide-react';

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
      render: (_, i) => (
        <div className="flex items-center gap-2">
          {i === 0 && <Trophy size={18} className="text-yellow-500" />}
          {i === 1 && <Medal size={18} className="text-gray-400" />}
          {i === 2 && <Medal size={18} className="text-amber-600" />}
          <span className={i < 3 ? 'font-bold' : ''}>#{i + 1}</span>
        </div>
      )
    },
    { 
      header: 'Name', 
      key: 'name', 
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.name}</span>
          {row.role === 'Admin' && (
            <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/20 flex items-center gap-1">
              <ShieldCheck size={10} /> ADMIN
            </span>
          )}
          {row.role === 'Core' && (
            <span className="bg-accent/10 text-accent text-[10px] font-bold px-2 py-0.5 rounded-full border border-accent/20 flex items-center gap-1">
              <StarIcon size={10} fill="currentColor" /> CORE
            </span>
          )}
        </div>
      )
    },
    { header: 'Department', key: 'department' },
    { 
      header: 'GFG Score', 
      key: 'gfg_score',
      render: (row) => <span className="text-accent font-bold">{row.gfg_score}</span>
    },
    { header: 'GFG Solved', key: 'gfg_solved' },
    { 
      header: 'Streak', 
      key: 'streak', 
      render: (row) => (
        <div className="flex items-center gap-1 text-orange-500 font-bold">
          <Star size={14} fill="currentColor" />
          {row.streak}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold">Campus Leaderboard</h1>
        <p className="text-gray-400 mt-2">Ranking based on GeeksforGeeks Coding Score.</p>
      </div>

      <div className="flex bg-card p-1 rounded-xl border border-gray-800 w-fit">
        <button 
          onClick={() => setTab('weekly')}
          className={`px-6 py-2 rounded-lg font-medium transition ${tab === 'weekly' ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Weekly Activity
        </button>
        <button 
          onClick={() => setTab('all-time')}
          className={`px-6 py-2 rounded-lg font-medium transition ${tab === 'all-time' ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Overall Rank
        </button>
      </div>

      <div className="bg-card rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-accent font-bold">Updating campus rankings...</div>
        ) : data.length > 0 ? (
          <LeaderboardTable data={data} columns={columns} />
        ) : (
          <div className="py-20 text-center text-gray-500">
            <Trophy size={48} className="mx-auto mb-4 opacity-10" />
            <p>No rankings available yet. Sync your profile to appear here!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
