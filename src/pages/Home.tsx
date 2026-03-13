import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code, Users, Award, TrendingUp, ArrowRight, Zap, BookOpen, Terminal, Trophy } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import EventCard from '../components/EventCard';
import api from '../services/api';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [campusStats, setCampusStats] = useState({
    totalMembers: 0,
    totalProblemsSolved: 0,
    activeCoders: 0,
    weeklyContests: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, statsRes] = await Promise.all([
          api.get('/events'),
          api.get('/stats/campus')
        ]);
        setEvents(eventsRes.data.slice(0, 3));
        setCampusStats(statsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative py-20 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent -z-10"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl space-y-6"
        >
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-medium border border-accent/20 mb-4">
            <Zap size={16} />
            <span>Campus Coding Ecosystem</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Level up your <span className="text-accent">Coding Skills</span> with GfG Club
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            The ultimate platform for campus coders to learn, practice, and compete. Join the most active coding community on campus.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link to="/register" className="bg-accent hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2">
              Join the Club <ArrowRight size={20} />
            </Link>
            <Link to="/leaderboard" className="bg-card hover:bg-gray-800 text-white border border-gray-700 px-8 py-4 rounded-xl font-bold text-lg transition">
              View Leaderboard
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Members" value={campusStats.totalMembers} icon={Users} color="bg-blue-500" />
        <StatsCard title="Problems Solved" value={campusStats.totalProblemsSolved} icon={Code} color="bg-accent" />
        <StatsCard title="Active Coders" value={campusStats.activeCoders} icon={TrendingUp} color="bg-purple-500" />
        <StatsCard title="Weekly Contests" value={campusStats.weeklyContests} icon={Award} color="bg-yellow-500" />
      </section>

      {/* Upcoming Events */}
      <section className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold">Upcoming Events</h2>
            <p className="text-gray-400 mt-2">Don't miss out on our upcoming workshops and contests.</p>
          </div>
          <Link to="/events" className="text-accent hover:underline flex items-center gap-1 font-medium">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="bg-card p-12 rounded-xl border border-gray-800 text-center text-gray-500">
            No upcoming events at the moment.
          </div>
        )}
      </section>

      {/* Learning Tracks */}
      <section className="space-y-8 pb-10">
        <h2 className="text-3xl font-bold text-center">Learning Tracks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'DSA Beginner', icon: BookOpen, desc: 'Master the fundamentals of Data Structures.' },
            { title: 'Competitive Programming', icon: Trophy, desc: 'Excel in coding contests and algorithms.' },
            { title: 'Interview Prep', icon: Terminal, desc: 'Get ready for top tech company interviews.' },
            { title: 'Web Development', icon: Code, desc: 'Build modern and responsive web applications.' }
          ].map((track, i) => (
            <div key={i} className="bg-card p-8 rounded-xl border border-gray-800 hover:border-accent transition group cursor-pointer">
              <track.icon className="text-accent mb-4 group-hover:scale-110 transition" size={32} />
              <h3 className="text-xl font-bold mb-2">{track.title}</h3>
              <p className="text-gray-400 text-sm">{track.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
