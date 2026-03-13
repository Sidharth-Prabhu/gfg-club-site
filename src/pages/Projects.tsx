import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Github, ExternalLink, Trash2, 
  Code2, Monitor, Smartphone, Cpu, Filter, X, Save,
  ChevronUp, ChevronDown, CheckCircle, XCircle, Clock,
  FileText, Image as ImageIcon, Link as LinkIcon, Info,
  ArrowLeft, Share2, Star, ShieldCheck, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedProject, setExpandedProject] = useState(null);
  const [category, setCategory] = useState('All');
  
  const [formData, setFormData] = useState({
    title: '', description: '', github_link: '', demo_link: '', tech_stack: '', category: 'Web', files: []
  });

  const categories = ['All', 'AI', 'Web', 'Mobile', 'Systems'];

  const modules = useMemo(() => ({
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image'],
      ['clean']
    ],
  }), []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      // Showcase only shows Approved projects
      const { data } = await api.get(`/projects?category=${category}&status=Approved`);
      setPosts(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', formData);
      alert('Project submitted for approval!');
      setFormData({ title: '', description: '', github_link: '', demo_link: '', tech_stack: '', category: 'Web', files: [] });
      setIsModalOpen(false);
      fetchProjects();
    } catch (error) {
      alert('Failed to submit project');
    }
  };

  const handleVote = async (e, projectId, voteType) => {
      e.stopPropagation();
      try {
          await api.post('/projects/vote', { projectId, voteType });
          fetchProjects();
          if (expandedProject?.id === projectId) {
              const { data: updatedProjects } = await api.get(`/projects?status=Approved`);
              const updated = updatedProjects.find(p => p.id === projectId);
              if (updated) setExpandedProject(updated);
          }
      } catch (error) { console.error('Vote failed'); }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'AI': return <Cpu size={20} />;
      case 'Web': return <Monitor size={20} />;
      case 'Mobile': return <Smartphone size={20} />;
      default: return <Code2 size={20} />;
    }
  };

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Project Gallery</h1>
          <p className="text-gray-400 mt-2 text-lg">A curated showcase of student-built innovations.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-accent hover:bg-green-700 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition shadow-xl shadow-accent/20">
          <Plus size={24} /> Submit Project
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} className={`px-6 py-2.5 rounded-xl text-sm font-bold border transition flex items-center gap-2 ${category === cat ? 'bg-accent border-accent text-white shadow-lg shadow-accent/10' : 'bg-card border-gray-800 text-gray-400 hover:border-gray-600'}`}>
            {cat !== 'All' && getCategoryIcon(cat)} {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-32 text-center text-accent font-bold animate-pulse">Initializing showcase...</div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map(project => (
            <motion.div 
              layoutId={`project-card-${project.id}`}
              whileHover={{ y: -5 }}
              key={project.id} 
              onClick={() => setExpandedProject(project)}
              className="bg-card/60 backdrop-blur-sm border border-gray-800 rounded-[2rem] overflow-hidden group cursor-pointer flex flex-col hover:border-accent/50 hover:bg-card transition-all duration-300"
            >
              <div className="p-8 flex-grow space-y-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-2xl bg-accent/10 text-accent border border-accent/20 group-hover:scale-110 transition-transform duration-500">{getCategoryIcon(project.category)}</div>
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{project.category}</div>
                    </div>
                    <div className="flex flex-col items-center bg-background/40 rounded-xl p-1 border border-gray-800/50">
                        <button onClick={(e) => handleVote(e, project.id, 1)} className="p-1 hover:text-accent transition-colors"><ChevronUp size={18} /></button>
                        <span className="text-xs font-black text-gray-300">{project.vote_score || 0}</span>
                        <button onClick={(e) => handleVote(e, project.id, -1)} className="p-1 hover:text-red-500 transition-colors"><ChevronDown size={18} /></button>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-2xl font-black text-white leading-tight group-hover:text-accent transition-colors">{project.title}</h3>
                    <div className="text-gray-400 text-sm line-clamp-3 leading-relaxed ql-editor !p-0" dangerouslySetInnerHTML={{ __html: project.description }} />
                </div>

                <div className="flex flex-wrap gap-2">
                  {project.tech_stack.split(',').slice(0, 3).map((tech, i) => (
                    <span key={i} className="text-[9px] font-black text-gray-500 bg-background/50 border border-gray-800 px-2.5 py-1 rounded-lg uppercase tracking-tighter">
                      {tech.trim()}
                    </span>
                  ))}
                  {project.tech_stack.split(',').length > 3 && <span className="text-[9px] font-black text-gray-600 px-1 py-1">+{project.tech_stack.split(',').length - 3} more</span>}
                </div>
              </div>

              <div className="px-8 py-6 bg-background/30 border-t border-gray-800/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-black text-accent border border-accent/20 shadow-inner">{project.creator_name[0]}</div>
                  <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">{project.creator_name}</span>
                </div>
                <div className="flex items-center gap-2 text-accent font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    Details <ChevronRight size={14} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-40 text-center text-gray-500 bg-card rounded-[3rem] border border-gray-800 border-dashed">
          <Monitor size={64} className="mx-auto mb-4 opacity-10" />
          <p className="text-xl font-bold uppercase tracking-[0.2em]">Showcase is empty.</p>
        </div>
      )}

      {/* Expanded Project View */}
      <AnimatePresence>
        {expandedProject && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-gray-800 rounded-[3rem] w-full max-w-5xl shadow-2xl relative overflow-hidden my-auto">
              <button onClick={() => setExpandedProject(null)} className="absolute top-8 right-8 z-20 p-3 bg-black/50 hover:bg-black/80 rounded-full text-white transition-all"><X size={28} /></button>
              <div className="p-10 md:p-16 space-y-10">
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center gap-4">
                            <span className="bg-accent/10 text-accent text-xs font-black px-4 py-1.5 rounded-full border border-accent/20 tracking-widest uppercase">{expandedProject.category}</span>
                            <span className={`px-4 py-1.5 rounded-full text-xs font-black border tracking-widest uppercase ${expandedProject.status === 'Approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>{expandedProject.status}</span>
                        </div>
                        <h2 className="text-5xl md:text-6xl font-black text-white leading-tight">{expandedProject.title}</h2>
                        <div className="flex flex-wrap items-center gap-8 text-gray-500 border-b border-gray-800 pb-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-accent">{expandedProject.creator_name[0]}</div>
                                <span className="font-bold text-lg text-gray-200">{expandedProject.creator_name}</span>
                            </div>
                            <span className="flex items-center gap-2"><Clock size={18} /> {new Date(expandedProject.created_at).toLocaleDateString()}</span>
                            <span className="flex items-center gap-2"><Star size={18} className="text-yellow-500" /> {expandedProject.vote_score || 0} Upvotes</span>
                        </div>
                    </div>
                    <div className="flex flex-col lg:flex-row gap-16">
                        <div className="flex-grow space-y-12">
                            <div className="space-y-6">
                                <h4 className="text-2xl font-black text-white flex items-center gap-3"><FileText size={24} className="text-accent" /> Project Story</h4>
                                <div className="prose prose-invert prose-accent max-w-none text-gray-300 text-lg leading-relaxed ql-editor !p-0" dangerouslySetInnerHTML={{ __html: expandedProject.description }} />
                            </div>
                            <div className="space-y-6">
                                <h4 className="text-2xl font-black text-white flex items-center gap-3"><Code2 size={24} className="text-accent" /> Built With</h4>
                                <div className="flex flex-wrap gap-3">
                                    {expandedProject.tech_stack.split(',').map((tech, i) => (
                                        <span key={i} className="px-6 py-2.5 bg-background border-2 border-gray-800 rounded-2xl text-sm font-black text-gray-400 uppercase tracking-wider">{tech.trim()}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="lg:w-80 space-y-8 flex-shrink-0">
                            <div className="bg-background/50 border border-gray-800 p-8 rounded-[2.5rem] space-y-6 shadow-inner">
                                <h5 className="font-black text-white uppercase tracking-widest text-sm">Resources</h5>
                                <div className="space-y-4">
                                    {expandedProject.github_link && (
                                        <a href={expandedProject.github_link} target="_blank" className="w-full flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 rounded-2xl border border-gray-700 hover:border-white transition-all text-gray-300 font-bold group">
                                            <div className="flex items-center gap-3"><Github size={20} /> Code</div>
                                            <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    )}
                                    {expandedProject.demo_link && (
                                        <a href={expandedProject.demo_link} target="_blank" className="w-full flex items-center justify-between p-4 bg-accent/10 hover:bg-accent text-accent hover:text-white rounded-2xl border border-accent/20 transition-all font-bold group">
                                            <div className="flex items-center gap-3"><Monitor size={20} /> Live Demo</div>
                                            <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <button onClick={(e) => handleVote(e, expandedProject.id, 1)} className="flex-1 py-5 bg-card border-2 border-gray-800 hover:border-accent rounded-2xl text-gray-400 hover:text-accent transition-all flex flex-col items-center gap-1">
                                        <ChevronUp size={28} /> <span className="text-[10px] font-black uppercase">Upvote</span>
                                    </button>
                                    <button onClick={(e) => handleVote(e, expandedProject.id, -1)} className="flex-1 py-5 bg-card border-2 border-gray-800 hover:border-red-500 rounded-2xl text-gray-400 hover:text-red-500 transition-all flex flex-col items-center gap-1">
                                        <ChevronDown size={28} /> <span className="text-[10px] font-black uppercase">Downvote</span>
                                    </button>
                                </div>
                                <button className="w-full py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"><Share2 size={18} /> Share Build</button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Submission Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="bg-card border border-gray-800 rounded-[2.5rem] w-full max-w-4xl my-auto shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-background/50">
                <h2 className="text-3xl font-black text-white">New Submission</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-3 hover:bg-gray-800 rounded-full transition-all"><X size={28} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2"><label className="block text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">Project Title</label><input required type="text" className="w-full bg-background border-2 border-gray-800 rounded-2xl py-5 px-8 focus:border-accent outline-none text-xl font-bold text-white shadow-inner" placeholder="e.g. Campus Buddy" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} /></div>
                  <div><label className="block text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">Domain</label><select className="w-full bg-background border-2 border-gray-800 rounded-2xl py-5 px-8 focus:border-accent outline-none cursor-pointer font-bold text-white" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>{categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div><label className="block text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">Stack (CSV)</label><input required type="text" className="w-full bg-background border-2 border-gray-800 rounded-2xl py-5 px-8 focus:border-accent outline-none font-bold text-white" placeholder="React, Node, MySQL" value={formData.tech_stack} onChange={(e) => setFormData({...formData, tech_stack: e.target.value})} /></div>
                  <div className="md:col-span-2"><label className="block text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">Narrative</label><div className="bg-background rounded-3xl overflow-hidden border-2 border-gray-800 focus-within:border-accent transition shadow-inner"><ReactQuill theme="snow" value={formData.description} onChange={(content) => setFormData({...formData, description: content})} modules={modules} placeholder="Share the story behind your build..." /></div></div>
                  <div><label className="block text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">Repository</label><div className="relative"><Github className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={20} /><input type="url" className="w-full bg-background border-2 border-gray-800 rounded-2xl py-5 pl-14 pr-8 focus:border-accent outline-none transition font-medium text-white shadow-inner" placeholder="GitHub URL" value={formData.github_link} onChange={(e) => setFormData({...formData, github_link: e.target.value})} /></div></div>
                  <div><label className="block text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">Live Demo</label><div className="relative"><LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={20} /><input type="url" className="w-full bg-background border-2 border-gray-800 rounded-2xl py-5 pl-14 pr-8 focus:border-accent outline-none transition font-medium text-white shadow-inner" placeholder="Demo URL" value={formData.demo_link} onChange={(e) => setFormData({...formData, demo_link: e.target.value})} /></div></div>
                </div>
                <button type="submit" className="w-full bg-accent hover:bg-green-700 text-white font-black py-6 px-12 rounded-[1.5rem] transition text-xl flex-grow shadow-2xl shadow-accent/30 uppercase tracking-widest">Submit for Review</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .ql-container { border: none !important; font-family: inherit; font-size: 18px; }
        .ql-toolbar { border: none !important; border-bottom: 2px solid #1e293b !important; background: #1e293b; padding: 15px !important; }
        .ql-editor { min-height: 250px; color: #f1f5f9; padding: 30px !important; line-height: 1.8; }
        .ql-snow .ql-stroke { stroke: #94a3b8; stroke-width: 2px; }
        .ql-snow .ql-fill { fill: #94a3b8; }
        .ql-snow .ql-picker { color: #94a3b8; font-weight: 800; }
        .ql-editor.ql-blank::before { color: #334155 !important; left: 30px !important; font-style: normal; font-weight: 700; }
        .ql-snow .ql-picker-options { background-color: #1e293b; border: 2px solid #334155; border-radius: 12px; }
      `}</style>
    </div>
  );
};

export default Projects;
