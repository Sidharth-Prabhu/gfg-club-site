import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import StatsCard from '../components/StatsCard';
import { 
  User, Code, Trophy, Star, Github, Globe, Code2, 
  Mail, Book, Calendar, Zap, MessageSquare, Monitor, 
  ArrowLeft, Hash, Sparkles, ShieldCheck, ExternalLink, ArrowRight, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const [profileRes, projectsRes, postsRes] = await Promise.all([
          api.get(`/users/${userId}`),
          api.get(`/projects?userId=${userId}&status=Approved`),
          api.get(`/discussions?authorId=${userId}`)
        ]);
        setProfile(profileRes.data);
        setProjects(projectsRes.data);
        setPosts(postsRes.data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        navigate('/community');
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [userId, navigate]);

  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-accent font-black tracking-[0.3em] uppercase animate-pulse text-xl italic">
          Synchronizing Persona Node...
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Header */}
      <section className="relative min-h-[40vh] md:min-h-[50vh] w-full overflow-hidden bg-card border-b border-border flex flex-col justify-end">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px] -mr-64 -mt-64"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -ml-48 -mb-48"></div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        
        <div className="absolute top-8 left-8 z-20">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-text/60 bg-card/40 hover:bg-card backdrop-blur-md px-6 py-3 rounded-full border border-border transition-all group font-black uppercase text-xs tracking-widest active:scale-95"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Reverse Traversal
          </button>
        </div>

        <div className="relative w-full p-8 md:p-20 z-10 pt-32 md:pt-48">
          <div className="max-w-7xl mx-auto space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-4">
                <span className="bg-accent/10 text-accent text-[10px] font-black px-5 py-2 rounded-full border border-accent/20 tracking-widest uppercase backdrop-blur-md flex items-center gap-2">
                    <ShieldCheck size={14} /> AUTHORIZED CORE AGENT
                </span>
                <span className="bg-blue-500/10 text-blue-400 text-[10px] font-black px-5 py-2 rounded-full border border-blue-500/20 tracking-widest uppercase backdrop-blur-md">
                    Rank: #{profile.id}
                </span>
            </motion.div>
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-10">
                <div className="w-32 h-32 md:w-48 md:h-48 rounded-[3rem] bg-accent/10 border border-accent/20 flex items-center justify-center text-6xl font-black text-accent shadow-2xl relative group overflow-hidden">
                    <div className="absolute inset-0 bg-accent rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    {profile.profile_pic ? (
                        <img src={profile.profile_pic} className="w-full h-full object-cover relative z-10" alt={profile.name} />
                    ) : (
                        profile.name[0]
                    )}
                </div>
                <div className="space-y-4">
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} 
                        className="text-5xl md:text-8xl font-black text-text leading-none tracking-tighter uppercase italic"
                    >
                        {profile.name}
                    </motion.h1>
                    <div className="flex flex-wrap items-center gap-6 text-text/40">
                        <div className="flex items-center gap-2 font-black uppercase text-xs tracking-widest">
                            <Book size={18} className="text-accent" /> {profile.department} Node
                        </div>
                        <div className="h-4 w-[1px] bg-border hidden sm:block"></div>
                        <div className="flex items-center gap-2 font-black uppercase text-xs tracking-widest">
                            <Calendar size={18} className="text-accent" /> Deployment Year {profile.year}
                        </div>
                        <div className="h-4 w-[1px] bg-border hidden sm:block"></div>
                        <div className="flex items-center gap-2 font-black uppercase text-xs tracking-widest">
                            <Sparkles size={18} className="text-accent" /> {profile.role} Authority
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-8 md:px-20 -mt-10 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard title="Problems Mastered" value={profile.problems_solved || 0} icon={Code} color="bg-accent" />
            <StatsCard title="GFG Logic Score" value={profile.gfg_score || 0} icon={Star} color="bg-yellow-500" />
            <StatsCard title="Sync Streak" value={`${profile.streak || 0} Days`} icon={Zap} color="bg-orange-500" />
            <StatsCard title="Technical Repos" value={profile.github_repos || 0} icon={Github} color="bg-blue-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mt-20">
            {/* Left Column: Details */}
            <div className="lg:col-span-2 space-y-24">
                <div className="space-y-8">
                    <div className="flex items-center gap-4">
                        <User size={28} className="text-accent" />
                        <h3 className="text-3xl font-black text-text uppercase tracking-tight italic">Technical Persona</h3>
                    </div>
                    <p className="text-text/60 text-xl leading-relaxed font-medium italic bg-card border border-border p-10 rounded-[3rem] shadow-inner">
                        {profile.about || "This agent has not yet initialized their persona narrative."}
                    </p>
                </div>

                <div className="space-y-8">
                    <div className="flex items-center gap-4">
                        <Hash size={28} className="text-accent" />
                        <h3 className="text-3xl font-black text-text uppercase tracking-tight italic">Skill Matrix</h3>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {profile.skills?.split(',').map((skill, i) => (
                            <span key={i} className="px-8 py-4 bg-card border-2 border-border rounded-2xl text-sm font-black text-text/60 uppercase tracking-widest hover:border-accent hover:text-accent transition-all cursor-default shadow-sm">
                                {skill.trim()}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Published Projects */}
                <div className="space-y-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Monitor size={28} className="text-accent" />
                            <h3 className="text-3xl font-black text-text uppercase tracking-tight italic">Operational Sectors (Projects)</h3>
                        </div>
                        <span className="text-[10px] font-black text-text/30 uppercase tracking-[0.3em]">{projects.length} Total</span>
                    </div>
                    <div className="max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {projects.length > 0 ? (
                                projects.map(proj => (
                                    <Link key={proj.id} to={`/projects/${proj.id}`} className="bg-card border border-border rounded-[2.5rem] p-8 hover:border-accent transition-all group shadow-sm flex flex-col justify-between space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-start">
                                                <span className="text-[9px] font-black text-accent bg-accent/5 px-3 py-1 rounded-lg border border-accent/10 uppercase tracking-widest">{proj.category}</span>
                                                <ExternalLink size={16} className="text-text/20 group-hover:text-accent transition-colors" />
                                            </div>
                                            <h4 className="text-xl font-black text-text uppercase tracking-tight italic group-hover:text-accent transition-colors">{proj.title}</h4>
                                            <p className="text-text/40 text-xs line-clamp-2 italic">{stripHtml(proj.description)}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-accent uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                            Explore Build <ArrowRight size={12} />
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="md:col-span-2 py-24 text-center bg-card/20 rounded-[3rem] border border-dashed border-border text-text/20 font-black uppercase tracking-widest italic">No deployments found in this sector.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Community Activities */}
                <div className="space-y-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <MessageSquare size={28} className="text-accent" />
                            <h3 className="text-3xl font-black text-text uppercase tracking-tight italic">Broadcast History (Posts)</h3>
                        </div>
                        <span className="text-[10px] font-black text-text/30 uppercase tracking-[0.3em]">{posts.length} Total</span>
                    </div>
                    <div className="max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                        <div className="space-y-6">
                            {posts.length > 0 ? (
                                posts.map(post => (
                                    <Link key={post.id} to={`/community/${post.id}`} className="bg-card border border-border rounded-[2rem] p-8 hover:border-accent transition-all group shadow-sm flex items-center justify-between gap-8">
                                        <div className="space-y-2 flex-grow min-w-0">
                                            <h4 className="text-xl font-black text-text uppercase italic tracking-tight group-hover:text-accent transition-colors truncate">{post.title}</h4>
                                            <div className="flex items-center gap-4 text-[10px] font-black text-text/30 uppercase tracking-widest">
                                                <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(post.created_at).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1.5 text-accent"><MessageSquare size={12} /> {post.comment_count} Signals</span>
                                            </div>
                                        </div>
                                        <ArrowRight size={24} className="text-text/10 group-hover:text-accent group-hover:translate-x-2 transition-all flex-shrink-0" />
                                    </Link>
                                ))
                            ) : (
                                <div className="py-24 text-center bg-card/20 rounded-[3rem] border border-dashed border-border text-text/20 font-black uppercase tracking-widest italic">Feed is dormant.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Links & Data */}
            <div className="space-y-10">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border p-10 rounded-[3rem] shadow-xl sticky top-24 space-y-10">
                    <div className="space-y-8">
                        <h5 className="font-black text-text/40 uppercase tracking-[0.3em] text-[10px]">Matrix Links</h5>
                        <div className="space-y-5">
                            {profile.github_profile && (
                                <a href={profile.github_profile} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-between p-6 bg-background border border-border hover:border-text rounded-2xl transition-all text-text/80 font-black uppercase tracking-widest text-xs group/link">
                                    <div className="flex items-center gap-4"><Github size={24} className="text-accent" /> GitHub Node</div>
                                    <Globe size={18} className="opacity-40 group-hover/link:opacity-100 transition-all" />
                                </a>
                            )}
                            {profile.leetcode_profile && (
                                <a href={profile.leetcode_profile} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-between p-6 bg-orange-500/5 border border-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white rounded-2xl transition-all font-black uppercase tracking-widest text-xs group/link shadow-lg shadow-orange-500/5">
                                    <div className="flex items-center gap-4"><Code2 size={24} /> LeetCode Hub</div>
                                    <Globe size={18} className="group-hover/link:translate-x-1 transition-transform" />
                                </a>
                            )}
                            {profile.gfg_profile && (
                                <a href={profile.gfg_profile} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-between p-6 bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-white rounded-2xl transition-all font-black uppercase tracking-widest text-xs group/link shadow-lg shadow-accent/10">
                                    <div className="flex items-center gap-4"><Sparkles size={24} /> GfG Profile</div>
                                    <Globe size={18} className="group-hover/link:translate-x-1 transition-transform" />
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="pt-8 border-t border-border/50">
                        <div className="bg-background/50 border border-border p-6 rounded-2xl space-y-4">
                            <div className="flex items-center gap-3 text-[10px] font-black text-text/40 uppercase tracking-widest">
                                <Mail size={14} className="text-accent" /> Communication Link
                            </div>
                            <p className="text-sm font-black text-text break-all">{profile.email}</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-accent); border-radius: 10px; opacity: 0.2; }
      `}</style>
    </div>
  );
};

export default Profile;
