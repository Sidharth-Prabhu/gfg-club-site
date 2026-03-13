import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Github, ExternalLink, Trash2, 
  Code2, Monitor, Smartphone, Cpu, Filter, X,
  ChevronUp, ChevronDown, Clock, FileText, 
  ArrowLeft, Share2, Star, ChevronRight
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
    toolbar: [['bold', 'italic', 'underline'], [{'list': 'ordered'}, {'list': 'bullet'}], ['link', 'image'], ['clean']],
  }), []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
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
    } catch (error) { alert('Submission failed'); }
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

  const stripHtml = (html) => {
      const tmp = document.createElement("DIV");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'AI': return <Cpu size={24} />;
      case 'Web': return <Monitor size={24} />;
      case 'Mobile': return <Smartphone size={24} />;
      default: return <Code2 size={24} />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-12 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black text-text tracking-tighter uppercase">Project <span className="text-accent">Gallery</span></h1>
          <p className="text-text/60 text-lg font-medium">Student-led innovation, open-sourced for the community.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-accent hover:bg-gfg-green-hover text-white px-10 py-5 rounded-2xl font-black flex items-center gap-3 transition shadow-xl shadow-accent/20 text-lg uppercase tracking-widest active:scale-95">
          <Plus size={24} /> Submit Build
        </button>
      </motion.div>

      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} className={`px-6 py-3 rounded-xl text-xs font-black border transition flex items-center gap-2 uppercase tracking-widest whitespace-nowrap ${category === cat ? 'bg-accent border-accent text-white shadow-lg' : 'bg-card border-border text-text/40 hover:border-accent/40 hover:text-accent'}`}>
            {cat !== 'All' && getCategoryIcon(cat)} {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-32 text-center text-accent font-black tracking-widest uppercase animate-pulse text-xl">Syncing Matrix Showcase...</div>
      ) : projects.length > 0 ? (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {projects.map(project => (
            <motion.div 
              variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ y: -8, borderColor: 'var(--color-accent)' }}
              key={project.id} 
              onClick={() => setExpandedProject(project)}
              className="bg-card border border-border rounded-[2.5rem] overflow-hidden group cursor-pointer flex flex-col shadow-sm hover:shadow-2xl transition-all duration-500"
            >
              <div className="p-10 flex-grow space-y-8">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-5">
                        <div className="p-4 rounded-2xl bg-accent/5 text-accent border border-accent/10 group-hover:bg-accent group-hover:text-white transition-all duration-500 shadow-inner">{getCategoryIcon(project.category)}</div>
                        <div className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">{project.category}</div>
                    </div>
                    <div className="flex flex-col items-center bg-background border border-border rounded-2xl p-2 shadow-inner">
                        <button onClick={(e) => handleVote(e, project.id, 1)} className="p-1.5 text-text/30 hover:text-accent transition-colors"><ChevronUp size={20} /></button>
                        <span className="text-sm font-black text-text/80">{project.vote_score || 0}</span>
                        <button onClick={(e) => handleVote(e, project.id, -1)} className="p-1.5 text-text/30 hover:text-red-500 transition-colors"><ChevronDown size={20} /></button>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-2xl md:text-3xl font-black text-text leading-tight group-hover:text-accent transition-colors tracking-tight uppercase">{project.title}</h3>
                    <p className="text-text/60 text-sm line-clamp-3 leading-relaxed font-medium">
                        {stripHtml(project.description)}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {project.tech_stack.split(',').slice(0, 3).map((tech, i) => (
                    <span key={i} className="text-[9px] font-black text-text/40 bg-background border border-border px-3 py-1.5 rounded-lg uppercase tracking-widest">
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="px-10 py-8 bg-background/50 border-t border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-[10px] font-black text-accent border border-accent/20">{project.creator_name[0]}</div>
                  <span className="text-[10px] font-black text-text/40 uppercase tracking-widest">{project.creator_name}</span>
                </div>
                <div className="flex items-center gap-2 text-accent font-black text-[10px] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                    Explore Build <ChevronRight size={14} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="py-40 text-center text-text/30 bg-card rounded-[3rem] border border-border border-dashed shadow-inner">
          <Monitor size={80} className="mx-auto mb-6 opacity-5" />
          <p className="text-2xl font-black uppercase tracking-widest">No builds found</p>
        </div>
      )}

      {/* Expanded Project View Modal */}
      <AnimatePresence>
        {expandedProject && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-xl overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.98, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 20 }} className="bg-card border border-border rounded-[3.5rem] w-full max-w-6xl shadow-2xl relative overflow-hidden my-auto flex flex-col min-h-[90vh]">
              <button onClick={() => setExpandedProject(null)} className="absolute top-10 right-10 z-20 p-4 bg-background border border-border hover:bg-card hover:text-accent rounded-full text-text/60 transition-all shadow-xl group active:scale-90"><X size={24} className="group-hover:rotate-90 transition-transform" /></button>
              <div className="p-10 md:p-20 space-y-16 flex-grow">
                    <div className="space-y-8">
                        <div className="flex flex-wrap items-center gap-4">
                            <span className="bg-accent/10 text-accent text-[10px] font-black px-5 py-2 rounded-full border border-accent/20 tracking-widest uppercase">{expandedProject.category} Node</span>
                            <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase">Verified Deployment</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-text leading-[1.1] tracking-tighter uppercase">{expandedProject.title}</h2>
                        <div className="flex flex-wrap items-center gap-12 text-text/40 pt-8 border-t border-border/50">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-accent/10 flex items-center justify-center text-2xl font-black text-accent border border-accent/20 shadow-inner">{expandedProject.creator_name[0]}</div>
                                <div className="text-left">
                                    <p className="font-black text-2xl text-text uppercase tracking-widest">{expandedProject.creator_name}</p>
                                    <p className="text-[10px] text-accent font-black uppercase tracking-[0.3em] mt-1">Lead Architect</p>
                                </div>
                            </div>
                            <div className="h-12 w-[1px] bg-border hidden sm:block"></div>
                            <span className="flex items-center gap-3 font-black uppercase text-xs tracking-widest"><Clock size={20} className="text-accent" /> {new Date(expandedProject.created_at).toLocaleDateString()}</span>
                            <span className="flex items-center gap-3 font-black uppercase text-xs tracking-widest text-accent"><Star size={20} className="fill-accent" /> {expandedProject.vote_score || 0} Excellence Points</span>
                        </div>
                    </div>
                    <div className="flex flex-col lg:flex-row gap-20">
                        <div className="flex-grow space-y-16">
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <FileText size={28} className="text-accent" />
                                    <h4 className="text-3xl font-black text-text uppercase tracking-tight">Technical Narrative</h4>
                                </div>
                                <div className="prose dark:prose-invert prose-accent max-w-none text-text/80 text-xl leading-[1.8] font-medium ql-editor !p-0" dangerouslySetInnerHTML={{ __html: expandedProject.description }} />
                            </div>
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <Code2 size={28} className="text-accent" />
                                    <h4 className="text-3xl font-black text-text uppercase tracking-tight">Architecture Stack</h4>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    {expandedProject.tech_stack.split(',').map((tech, i) => (
                                        <span key={i} className="px-8 py-4 bg-background border-2 border-border rounded-[1.5rem] text-sm font-black text-text/60 uppercase tracking-widest shadow-inner">{tech.trim()}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="lg:w-96 space-y-10 flex-shrink-0">
                            <div className="bg-background/50 border border-border p-10 rounded-[3rem] space-y-8 shadow-inner relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                <h5 className="font-black text-text/40 uppercase tracking-[0.3em] text-[10px]">Resource Links</h5>
                                <div className="space-y-5">
                                    {expandedProject.github_link && (
                                        <a href={expandedProject.github_link} target="_blank" className="w-full flex items-center justify-between p-6 bg-card border border-border hover:border-text rounded-2xl transition-all text-text/80 font-black uppercase tracking-widest text-xs group/link">
                                            <div className="flex items-center gap-4"><Github size={24} className="text-accent" /> Source Code</div>
                                            <ExternalLink size={18} className="opacity-40 group-hover/link:opacity-100 transition-all group-hover/link:translate-x-1 group-hover/link:-translate-y-1" />
                                        </a>
                                    )}
                                    {expandedProject.demo_link && (
                                        <a href={expandedProject.demo_link} target="_blank" className="w-full flex items-center justify-between p-6 bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-white rounded-2xl transition-all font-black uppercase tracking-widest text-xs group/link shadow-lg shadow-accent/10">
                                            <div className="flex items-center gap-4"><Monitor size={24} /> Live Node</div>
                                            <ExternalLink size={18} className="group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-5">
                                <div className="flex gap-5">
                                    <button onClick={(e) => handleVote(e, expandedProject.id, 1)} className="flex-1 py-7 bg-card border-2 border-border hover:border-accent rounded-[2rem] text-text/30 hover:text-accent transition-all flex flex-col items-center gap-2 group/btn shadow-sm active:scale-95">
                                        <ChevronUp size={36} className="group-hover/btn:-translate-y-1 transition-transform" /> 
                                        <span className="text-[10px] font-black uppercase tracking-widest">Applaud</span>
                                    </button>
                                    <button onClick={(e) => handleVote(e, expandedProject.id, -1)} className="flex-1 py-7 bg-card border-2 border-border hover:border-red-500 rounded-[2rem] text-text/30 hover:text-red-500 transition-all flex flex-col items-center gap-2 group/btn shadow-sm active:scale-95">
                                        <ChevronDown size={36} className="group-hover/btn:translate-y-1 transition-transform" /> 
                                        <span className="text-[10px] font-black uppercase tracking-widest">Critique</span>
                                    </button>
                                </div>
                                <button className="w-full py-6 bg-card border border-border hover:bg-background text-text/60 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-sm active:scale-95"><Share2 size={20} className="text-accent" /> Share Matrix</button>
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
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-xl overflow-y-auto">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="bg-card border border-border rounded-[3.5rem] w-full max-w-5xl my-auto shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-10 border-b border-border flex justify-between items-center bg-background/50">
                <h2 className="text-3xl font-black text-text uppercase tracking-tighter">Submit Innovation</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-text/40 hover:text-red-500 p-4 hover:bg-red-500/5 rounded-full transition-all group active:scale-90"><X size={32} className="group-hover:rotate-90 transition-transform" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-10 md:p-14 space-y-12 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="md:col-span-2 space-y-4">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Build Headline</label>
                    <input required type="text" className="w-full bg-background border-2 border-border rounded-[1.5rem] py-6 px-10 focus:border-accent outline-none text-2xl font-black text-text shadow-inner transition-colors" placeholder="Name of your innovation..." value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Development Story</label>
                    <div className="bg-background rounded-[2rem] overflow-hidden border-2 border-border focus-within:border-accent transition shadow-inner">
                        <ReactQuill theme="snow" value={formData.description} onChange={(content) => setFormData({...formData, description: content})} modules={modules} placeholder="Describe your architecture and process..." />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Technical Stack (CSV)</label>
                    <input required type="text" className="w-full bg-background border-2 border-border rounded-[1.5rem] py-6 px-10 focus:border-accent outline-none font-bold text-text shadow-inner transition-colors" placeholder="React, MySQL, Python..." value={formData.tech_stack} onChange={(e) => setFormData({...formData, tech_stack: e.target.value})} />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Node Classification</label>
                    <div className="relative">
                      <select className="w-full bg-background border-2 border-border rounded-[1.5rem] py-6 px-10 focus:border-accent outline-none cursor-pointer font-black text-text uppercase text-xs appearance-none shadow-inner" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                        {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-text/40"><Filter size={20} /></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">GitHub Node URL</label>
                    <input type="url" className="w-full bg-background border-2 border-border rounded-[1.5rem] py-6 px-10 focus:border-accent outline-none font-bold text-text shadow-inner transition-colors" placeholder="https://github.com/..." value={formData.github_link} onChange={(e) => setFormData({...formData, github_link: e.target.value})} />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Live Node URL</label>
                    <input type="url" className="w-full bg-background border-2 border-border rounded-[1.5rem] py-6 px-10 focus:border-accent outline-none font-bold text-text shadow-inner transition-colors" placeholder="https://..." value={formData.demo_link} onChange={(e) => setFormData({...formData, demo_link: e.target.value})} />
                  </div>
                </div>
                <div className="flex gap-6 pt-4">
                    <button type="submit" className="flex-grow bg-accent hover:bg-gfg-green-hover text-white font-black py-7 px-14 rounded-[1.5rem] transition text-xl shadow-2xl shadow-accent/20 uppercase tracking-widest active:scale-[0.98]">Deploy to Showcase</button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="bg-card border border-border hover:bg-background text-text/60 font-black py-7 px-14 rounded-[1.5rem] transition text-xl uppercase tracking-widest shadow-sm">Abort</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .ql-container { border: none !important; font-family: inherit; font-size: 18px; background: transparent; }
        .ql-toolbar { border: none !important; border-bottom: 2px solid var(--color-border) !important; background: var(--color-card); padding: 20px !important; }
        .ql-editor { min-height: 300px; color: var(--color-text); padding: 40px !important; line-height: 1.8; }
        .ql-snow .ql-stroke { stroke: var(--color-text); opacity: 0.4; stroke-width: 2px; }
        .ql-snow .ql-fill { fill: var(--color-text); opacity: 0.4; }
        .ql-snow .ql-picker { color: var(--color-text); opacity: 0.6; font-weight: 800; }
        .ql-editor.ql-blank::before { color: var(--color-text) !important; opacity: 0.2; left: 40px !important; font-style: normal; font-weight: 700; }
        .ql-snow .ql-picker-options { background-color: var(--color-card); border: 2px solid var(--color-border); border-radius: 16px; padding: 10px; }
      `}</style>
    </div>
  );
};

export default Projects;
