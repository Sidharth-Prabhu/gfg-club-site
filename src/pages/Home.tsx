import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCode, faUsers, faAward, faChartLine, faArrowRight, faZap, 
  faBookOpen, faTrophy, faChevronRight, faStar, 
  faBullseye, faLightbulb, faCalendarAlt, faCircle
} from '@fortawesome/free-solid-svg-icons';
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

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-32 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 pt-10">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] animate-pulse delay-700"></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232f8d46' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
        </div>
        
        <motion.div 
          style={{ opacity, scale }}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-5xl space-y-8"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-3 bg-accent/10 text-accent px-6 py-2 rounded-full text-sm font-bold border border-accent/20 shadow-sm uppercase tracking-widest"
          >
            <img src="/src/assets/gfg-rit.png" alt="Logo" className="h-6 w-auto" />
            <span>Official Campus Body of RITChennai</span>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-6xl md:text-8xl font-black tracking-tight leading-[1.1] text-text uppercase"
          >
            Think in Logic. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-green-500 to-accent bg-[length:200%_auto] animate-gradient">Build with Code.</span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl text-text/60 max-w-3xl mx-auto leading-relaxed font-medium"
          >
            The ultimate ecosystem for campus coders to learn, practice, and excel. 
            Join the most vibrant coding community and launch your tech career.
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-5 justify-center pt-8"
          >
            <Link to="/register" className="group bg-accent hover:bg-gfg-green-hover text-white px-10 py-5 rounded-2xl font-black text-xl transition-all shadow-xl hover:shadow-accent/40 hover:-translate-y-1 flex items-center justify-center gap-3 uppercase tracking-widest">
              Get Started <FontAwesomeIcon icon={faArrowRight} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/practice" className="bg-card hover:bg-background text-text border border-border px-10 py-5 rounded-2xl font-bold text-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 uppercase tracking-widest">
              Explore Practice Hub
            </Link>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="pt-16 flex items-center justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500"
          >
            <div className="text-sm font-bold uppercase tracking-widest">Powered by</div>
            <div className="text-2xl font-black italic">GeeksforGeeks</div>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer text-text/30"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <FontAwesomeIcon icon={faChevronRight} className="rotate-90 text-2xl" />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          <StatsCard title="Community Members" value={campusStats.totalMembers} icon={faUsers} color="bg-blue-500" />
          <StatsCard title="Problems Solved" value={campusStats.totalProblemsSolved} icon={faCode} color="bg-accent" />
          <StatsCard title="Active Coders" value={campusStats.activeCoders} icon={faChartLine} color="bg-purple-500" />
          <StatsCard title="Weekly Contests" value={campusStats.weeklyContests} icon={faAward} color="bg-yellow-500" />
        </motion.div>
      </section>

      {/* About Section */}
      <section className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-10"
          >
            <div className="space-y-4">
              <h2 className="text-accent font-black uppercase tracking-[0.3em] text-sm text-left">About the Club</h2>
              <h3 className="text-4xl md:text-6xl font-black text-text uppercase leading-tight">GeeksforGeeks <br /><span className="text-accent">Campus Club</span></h3>
            </div>
            <p className="text-text/60 text-lg md:text-xl leading-relaxed font-medium">
              We are a community of passionate developers and problem solvers at RITChennai. 
              As an official campus body of GeeksforGeeks, we aim to bridge the gap between 
              academic learning and industry requirements through a culture of consistent practice.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 pt-4">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent border border-accent/20">
                  <FontAwesomeIcon icon={faZap} size="lg" />
                </div>
                <h4 className="font-black text-text uppercase tracking-widest text-sm">Innovation First</h4>
                <p className="text-text/40 text-[10px] font-black leading-loose uppercase tracking-widest">We encourage students to build real-world solutions through peer collaboration and open-source contributions.</p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent border border-accent/20">
                  <FontAwesomeIcon icon={faStar} size="lg" />
                </div>
                <h4 className="font-black text-text uppercase tracking-widest text-sm">Skill Centric</h4>
                <p className="text-text/40 text-[10px] font-black leading-loose uppercase tracking-widest">A structured focus on Data Structures, Algorithms, Full-Stack Development, and Technical Interview Preparation.</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative lg:h-[600px] flex items-center justify-center"
          >
            <div className="w-full aspect-square md:aspect-video lg:aspect-square rounded-[3.5rem] bg-accent/5 border border-accent/10 p-8 flex items-center justify-center relative overflow-visible">
              <div className="absolute inset-0 opacity-10 rounded-[3.5rem] overflow-hidden" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0V0zm20 20h20v20H20V20z' fill='%232f8d46' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")` }}></div>
              <FontAwesomeIcon icon={faCode} className="text-accent opacity-[0.03] absolute animate-pulse text-[200px]" />
              
              <div className="relative z-10 w-full max-w-sm">
                <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-700 overflow-hidden group">
                  <div className="bg-white/5 border-b border-white/5 px-6 py-4 flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                    </div>
                    <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest ml-4">identity.config.ts</div>
                  </div>
                  <div className="p-8 font-mono text-sm leading-relaxed">
                    <p className="text-blue-400">const <span className="text-white">ritGfgClub</span> = {'{'}</p>
                    <p className="pl-6 text-purple-400">mission: <span className="text-green-400">'Logic Over Luck'</span>,</p>
                    <p className="pl-6 text-purple-400">focus: [<span className="text-orange-400">'DSA'</span>, <span className="text-orange-400">'Dev'</span>],</p>
                    <p className="pl-6 text-purple-400">active: <span className="text-blue-400">true</span>,</p>
                    <p className="pl-6 text-purple-400">impact: <span className="text-green-400">'Exponential'</span></p>
                    <p className="text-blue-400">{'};'}</p>
                    <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                        <div className="text-[10px] text-white/20 uppercase tracking-tighter">Status: Fully Operational</div>
                        <div className="w-2 h-2 rounded-full bg-accent animate-ping"></div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-6 bg-accent text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-xl -rotate-12 group-hover:rotate-0 transition-transform">Official Node</div>
                <div className="absolute -bottom-8 -left-6 bg-white text-black px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-xl rotate-12 group-hover:rotate-0 transition-transform">RIT Chennai</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-4 py-10 relative">
        <div className="bg-card border border-border rounded-[4rem] p-12 md:p-24 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
          
          <div className="relative z-10 space-y-20">
            <div className="text-center space-y-4">
              <h2 className="text-accent font-black uppercase tracking-[0.3em] text-sm">Our Purpose</h2>
              <h3 className="text-4xl md:text-6xl font-black text-text uppercase italic">Mission & Objectives</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { title: 'Knowledge Sharing', icon: faBookOpen, desc: 'Conducting peer-to-peer learning sessions and expert workshops to disseminate technical knowledge.' },
                { title: 'Project Incubation', icon: faLightbulb, desc: 'Providing a platform for students to work on collaborative projects and showcase their builds.' },
                { title: 'Career Alignment', icon: faBullseye, desc: 'Bridging the gap between campus and industry through mock interviews and placement tracks.' }
              ].map((obj, i) => (
                <div key={i} className="space-y-6 group">
                  <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent border border-accent/20 group-hover:bg-accent group-hover:text-white transition-all duration-500">
                    <FontAwesomeIcon icon={obj.icon} size="lg" />
                  </div>
                  <h4 className="text-2xl font-black text-text uppercase tracking-tight">{obj.title}</h4>
                  <p className="text-text/50 leading-relaxed font-medium">{obj.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Learning Tracks */}
      <section className="container mx-auto px-4 py-10 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -z-10"></div>
        
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-accent font-black uppercase tracking-[0.3em] text-sm">Learning Path</h2>
          <h3 className="text-4xl md:text-5xl font-black text-text uppercase">Choose Your Track</h3>
          <p className="text-text/60 max-w-2xl mx-auto font-medium">Structured curricula designed by industry experts to take you from beginner to pro.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { title: 'DSA Mastery', icon: faBookOpen, desc: 'Master complex data structures and algorithms with curated practice sets.', color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { title: 'Competitive Coding', icon: faTrophy, desc: 'Level up your ranking in international coding contests and hackathons.', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
            { title: 'Full Stack Dev', icon: faCode, desc: 'Build scalable applications using modern frameworks and technologies.', color: 'text-accent', bg: 'bg-accent/10' },
            { title: 'Interview Bootcamp', icon: faBullseye, desc: 'Crush technical interviews at top-tier product companies like MAANG.', color: 'text-purple-500', bg: 'bg-purple-500/10' }
          ].map((track, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
              className="bg-card p-10 rounded-[2.5rem] border border-border group cursor-pointer relative overflow-hidden shadow-sm"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${track.bg} -mr-16 -mt-16 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              <div className={`${track.bg} ${track.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                <FontAwesomeIcon icon={track.icon} size="2x" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-text uppercase">{track.title}</h3>
              <p className="text-text/60 leading-relaxed mb-6 font-medium">{track.desc}</p>
              <div className="flex items-center gap-2 text-accent font-bold group-hover:gap-3 transition-all uppercase text-xs tracking-widest">
                Start Learning <FontAwesomeIcon icon={faChevronRight} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Coordinators Section */}
      <section className="container mx-auto px-4 py-10">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-accent font-black uppercase tracking-[0.3em] text-sm">Lead Architects</h2>
          <h3 className="text-4xl md:text-5xl font-black text-text uppercase">Club Coordinators</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {[
            { name: 'Sidharth Prabhu', role: 'President & Tech Lead', img: '/src/assets/hero.png' },
            { name: 'Dr. Jane Doe', role: 'Faculty Coordinator', img: '/src/assets/hero.png' },
            { name: 'Alex Matrix', role: 'Vice President', img: '/src/assets/hero.png' },
            { name: 'Sarah Logic', role: 'Events Head', img: '/src/assets/hero.png' }
          ].map((member, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <div className="relative mb-6 rounded-[2rem] overflow-hidden aspect-[4/5] bg-card border border-border group-hover:border-accent transition-colors">
                <img 
                  src={member.img} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 opacity-50 group-hover:opacity-100" 
                  alt={member.name} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60"></div>
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-black text-text uppercase tracking-tight group-hover:text-accent transition-colors">{member.name}</h4>
                <p className="text-[10px] font-black text-text/40 uppercase tracking-[0.2em]">{member.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="container mx-auto px-4 space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-4">
            <h2 className="text-accent font-black uppercase tracking-[0.3em] text-sm">Stay Updated</h2>
            <h3 className="text-4xl md:text-5xl font-black text-text uppercase">Upcoming Club Events</h3>
            <p className="text-text/60 max-w-xl font-medium">Join our workshops, webinars, and hackathons to learn and network with peers.</p>
          </div>
          <Link to="/events" className="group bg-accent/10 hover:bg-accent text-accent hover:text-white px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 uppercase text-sm tracking-widest shadow-sm">
            View All Events <FontAwesomeIcon icon={faChevronRight} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="bg-card p-20 rounded-[3rem] border-2 border-dashed border-border text-center">
            <div className="bg-accent/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FontAwesomeIcon icon={faCalendarAlt} size="2x" className="text-accent/40" />
            </div>
            <h4 className="text-2xl font-bold text-text mb-2 uppercase tracking-widest">No Active Events</h4>
            <p className="text-text/50 font-medium">Stay tuned! We're planning something big for the community.</p>
          </div>
        )}
      </section>

      {/* Why Join Us Section */}
      <section className="container mx-auto px-4 py-10">
        <div className="bg-accent rounded-[4rem] p-12 md:p-24 relative overflow-hidden shadow-2xl shadow-accent/20">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='3' cy='3' r='3' fill='%23ffffff'/%3E%3Ccircle cx='13' cy='13' r='3' fill='%23ffffff'/%3E%3C/g%3E%3C/svg%3E")` }}></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <div className="space-y-8">
              <h2 className="text-white/80 font-black uppercase tracking-[0.3em] text-sm">Why Join Us?</h2>
              <h3 className="text-4xl md:text-6xl font-black text-white leading-[1.1] uppercase">
                Become a Part of Something Bigger
              </h3>
              <p className="text-white/80 text-lg leading-relaxed font-medium">
                Joining the GfG Campus Body isn't just about coding. It's about community, mentorship, and building a foundation for your entire career. 
                Gain access to exclusive resources, networking opportunities, and a support system of like-minded individuals.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                {[
                  { icon: faStar, text: 'GfG Official Certification' },
                  { icon: faCircle, text: 'Industry Expert Mentorship' },
                  { icon: faLightbulb, text: 'Hands-on Project Work' },
                  { icon: faUsers, text: 'Vibrant Coding Community' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-white font-bold uppercase text-xs tracking-widest">
                    <div className="bg-white/20 p-2 rounded-lg flex items-center justify-center w-8 h-8">
                      <FontAwesomeIcon icon={item.icon} />
                    </div>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-md rounded-[3rem] p-8 border border-white/20 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700">
                <div className="space-y-6">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="font-mono text-white/90 text-sm md:text-base space-y-2">
                    <p className="text-blue-200">class GfGCommunity {'{'}</p>
                    <p className="pl-4 text-purple-200">constructor(student) {'{'}</p>
                    <p className="pl-8">this.student = student;</p>
                    <p className="pl-8">this.growth = "Exponential";</p>
                    <p className="pl-4">{'}'}</p>
                    <p className="pl-4 text-purple-200">async accelerate() {'{'}</p>
                    <p className="pl-8">await this.student.learnDSA();</p>
                    <p className="pl-8 text-green-200">// Unlocking potential...</p>
                    <p className="pl-8">return this.student.landJob("MAANG");</p>
                    <p className="pl-4">{'}'}</p>
                    <p className="text-blue-200">{'}'}</p>
                  </div>
                </div>
              </div>
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 bg-yellow-400 text-black p-4 rounded-2xl font-black shadow-xl hidden md:block uppercase text-xs tracking-widest"
              >
                10x Growth!
              </motion.div>
              <motion.div 
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-10 -left-10 bg-white text-accent p-4 rounded-2xl font-black shadow-xl hidden md:block uppercase text-xs tracking-widest"
              >
                Sign Up 🚀
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="container mx-auto px-4 text-center pb-20">
        <div className="max-w-4xl mx-auto space-y-10">
          <h2 className="text-5xl md:text-7xl font-black text-text uppercase leading-tight">Ready to <span className="text-accent underline decoration-accent/30 underline-offset-8">Code Your Future</span>?</h2>
          <p className="text-xl text-text/60 font-medium">
            Stop waiting for the perfect moment. The best time to start was yesterday. The second best time is now. Join hundreds of students already building their future.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/register" className="bg-accent hover:bg-gfg-green-hover text-white px-12 py-6 rounded-2xl font-black text-2xl transition-all shadow-xl shadow-accent/20 hover:-translate-y-2 active:scale-95 uppercase tracking-widest">
              Register Now — It's Free!
            </Link>
          </div>
          <div className="pt-10 flex flex-wrap justify-center gap-12 opacity-50">
            {['Trust', 'Community', 'Growth', 'Excellence'].map((item) => (
              <div key={item} className="flex items-center gap-2 font-black uppercase tracking-widest text-sm">
                <FontAwesomeIcon icon={faStar} className="text-accent" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
