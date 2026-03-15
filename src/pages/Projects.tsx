import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faExternalLinkAlt, faTrashAlt, 
  faCode, faDesktop, faMobileAlt, faMicrochip, faFilter, faTimes,
  faChevronUp, faChevronDown, faClock, faFileAlt, 
  faArrowLeft, faShareAlt, faStar, faChevronRight, faSave
} from '@fortawesome/free-solid-svg-icons';
import { 
  faGithub 
} from '@fortawesome/free-brands-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import MarkdownEditor from '../components/MarkdownEditor';
import MarkdownRenderer from '../components/MarkdownRenderer';

const Projects = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState('All');
  
  const [formData, setFormData] = useState({
    title: '', description: '', github_link: '', demo_link: '', tech_stack: '', category: 'Web', files: []
  });

  const categories = ['All', 'AI', 'Web', 'Mobile', 'Systems'];

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
      } catch (error) { console.error('Vote failed'); }
  };

  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation();
    if (!window.confirm('Terminate this project build?')) return;
    try {
      await api.delete(`/projects/${projectId}`);
      fetchProjects();
    } catch (error) {
      alert('Deletion failed');
    }
  };

  const stripHtml = (html) => {
      const tmp = document.createElement("DIV");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'AI': return faMicrochip;
      case 'Web': return faDesktop;
      case 'Mobile': return faMobileAlt;
      default: return faCode;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-8 pb-16">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black text-text tracking-tighter uppercase italic">Project <span className="text-accent">Gallery</span></h1>
          <p className="text-text/60 text-sm font-medium italic">Student innovation, open-sourced for the community.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-accent hover:bg-gfg-green-hover text-white px-6 py-2.5 rounded-xl font-black flex items-center gap-2 transition shadow-lg shadow-accent/10 text-[10px] uppercase tracking-widest active:scale-95">
          <FontAwesomeIcon icon={faPlus} /> Submit Build
        </button>
      </motion.div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2 rounded-lg text-[10px] font-black border transition flex items-center gap-1.5 uppercase tracking-widest whitespace-nowrap ${category === cat ? 'bg-accent border-accent text-white shadow-md' : 'bg-card border-border text-text/40 hover:border-accent/40 hover:text-accent'}`}>
            {cat !== 'All' && <FontAwesomeIcon icon={getCategoryIcon(cat)} className="text-[10px]" />} {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-24 text-center text-accent font-black tracking-widest uppercase animate-pulse text-xs">Syncing Showcase...</div>
      ) : projects.length > 0 ? (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {projects.map(project => (
            <motion.div 
              variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ y: -4, borderColor: 'var(--color-accent)' }}
              key={project.id} 
              onClick={() => navigate(`/projects/${project.id}`)}
              className="bg-card border border-border rounded-3xl overflow-hidden group cursor-pointer flex flex-col shadow-sm hover:shadow-xl transition-all duration-500"
            >
              <div className="p-6 flex-grow space-y-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/5 text-accent border border-accent/10 group-hover:bg-accent group-hover:text-white transition-all duration-500 shadow-inner flex items-center justify-center">
                            <FontAwesomeIcon icon={getCategoryIcon(project.category)} className="text-lg" />
                        </div>
                        <div className="text-[8px] font-black text-accent uppercase tracking-widest">{project.category}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex flex-col items-center bg-background border border-border rounded-xl p-1.5 shadow-inner">
                            <button onClick={(e) => handleVote(e, project.id, 1)} className="p-1 text-text/30 hover:text-accent transition-colors"><FontAwesomeIcon icon={faChevronUp} className="text-xs" /></button>
                            <span className="text-xs font-black text-text/80">{project.vote_score || 0}</span>
                            <button onClick={(e) => handleVote(e, project.id, -1)} className="p-1 text-text/30 hover:text-red-500 transition-colors"><FontAwesomeIcon icon={faChevronDown} className="text-xs" /></button>
                        </div>
                        {(user?.id === project.created_by || user?.role === 'Admin' || user?.role === 'Core') && (
                            <button 
                                onClick={(e) => handleDeleteProject(e, project.id)}
                                className="p-2 rounded-lg bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/10"
                            >
                                <FontAwesomeIcon icon={faTrashAlt} size="sm" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-black text-text leading-tight group-hover:text-accent transition-colors tracking-tight uppercase break-words italic">{project.title}</h3>
                    <div className="text-text/60 text-xs line-clamp-2 leading-relaxed font-medium break-words overflow-hidden italic">
                        <MarkdownRenderer content={project.description} />
                    </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {project.tech_stack.split(',').slice(0, 3).map((tech, i) => (
                    <span key={i} className="text-[7px] font-black text-text/40 bg-background border border-border px-2 py-1 rounded-md uppercase tracking-widest italic">
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="px-6 py-4 bg-background/50 border-t border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-[8px] font-black text-accent border border-accent/20 italic">{project.creator_name[0]}</div>
                  <span className="text-[8px] font-black text-text/40 uppercase tracking-widest italic">{project.creator_name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-accent font-black text-[8px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    Details <FontAwesomeIcon icon={faChevronRight} className="text-[8px]" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="py-32 text-center text-text/30 bg-card rounded-3xl border border-border border-dashed shadow-inner">
          <FontAwesomeIcon icon={faDesktop} size="4x" className="mx-auto mb-4 opacity-5" />
          <p className="text-xl font-black uppercase tracking-widest">No builds found</p>
        </div>
      )}

      {/* Submission Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-xl overflow-y-auto">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="bg-card border border-border rounded-3xl w-full max-w-4xl my-auto shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 md:p-8 border-b border-border flex justify-between items-center bg-background/50">
                <h2 className="text-2xl font-black text-text uppercase tracking-tighter italic">Submit Innovation</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-text/40 hover:text-red-500 p-2 rounded-full transition-all group active:scale-90"><FontAwesomeIcon icon={faTimes} size="lg" className="group-hover:rotate-90 transition-transform" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-[8px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Build Headline</label>
                    <input required type="text" className="w-full bg-background border-2 border-border rounded-xl py-3 px-5 focus:border-accent outline-none text-lg font-black text-text shadow-inner transition-colors italic" placeholder="Name of your innovation..." value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <MarkdownEditor 
                        label="Development Story"
                        value={formData.description}
                        onChange={(content) => setFormData({...formData, description: content})}
                        placeholder="Describe the architecture, challenges, and core features..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[8px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Stack (CSV)</label>
                    <input required type="text" className="w-full bg-background border-2 border-border rounded-xl py-3 px-5 focus:border-accent outline-none text-sm font-bold text-text shadow-inner transition-colors italic" placeholder="React, MySQL, Python..." value={formData.tech_stack} onChange={(e) => setFormData({...formData, tech_stack: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[8px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Classification</label>
                    <div className="relative">
                      <select className="w-full bg-background border-2 border-border rounded-xl py-3 px-5 focus:border-accent outline-none cursor-pointer font-black text-text uppercase text-[10px] appearance-none shadow-inner italic" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                        {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-text/40"><FontAwesomeIcon icon={faFilter} /></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[8px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">GitHub URL</label>
                    <input type="url" className="w-full bg-background border-2 border-border rounded-xl py-3 px-5 focus:border-accent outline-none text-sm font-bold text-text shadow-inner transition-colors" placeholder="https://github.com/..." value={formData.github_link} onChange={(e) => setFormData({...formData, github_link: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[8px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Live Node URL</label>
                    <input type="url" className="w-full bg-background border-2 border-border rounded-xl py-3 px-5 focus:border-accent outline-none text-sm font-bold text-text shadow-inner transition-colors" placeholder="https://..." value={formData.demo_link} onChange={(e) => setFormData({...formData, demo_link: e.target.value})} />
                  </div>
                </div>
                <div className="flex gap-4 pt-2">
                    <button type="submit" className="bg-accent hover:bg-gfg-green-hover text-white font-black py-4 px-8 rounded-xl transition text-sm flex-grow shadow-lg shadow-accent/10 uppercase tracking-widest active:scale-[0.98]"><FontAwesomeIcon icon={faSave} /> Deploy</button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="bg-card border border-border hover:bg-background text-text/60 font-black py-4 px-8 rounded-xl transition text-sm flex-grow uppercase tracking-widest shadow-sm italic">Abort</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .ql-container { border: none !important; font-family: inherit; font-size: 14px; background: transparent; }
        .ql-toolbar { border: none !important; border-bottom: 1px solid var(--color-border) !important; background: var(--color-card); padding: 8px !important; }
        .ql-editor { min-height: 150px; color: var(--color-text); padding: 15px !important; line-height: 1.6; }
        .ql-snow .ql-stroke { stroke: var(--color-text); opacity: 0.4; stroke-width: 2px; }
        .ql-snow .ql-fill { fill: var(--color-text); opacity: 0.4; }
        .ql-snow .ql-picker { color: var(--color-text); opacity: 0.6; font-weight: 800; }
        .ql-editor.ql-blank::before { color: var(--color-text) !important; opacity: 0.2; left: 15px !important; font-style: normal; font-weight: 700; }
        .ql-snow .ql-picker-options { background-color: var(--color-card); border: 2px solid var(--color-border); border-radius: 12px; padding: 5px; }
        .dark .ql-editor *, .dark .ql-editor span { background-color: transparent !important; color: var(--color-text) !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-accent); border-radius: 10px; opacity: 0.2; }
      `}</style>
    </div>
  );
};

export default Projects;
