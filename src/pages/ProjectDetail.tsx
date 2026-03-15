import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faExternalLinkAlt, faTrashAlt, faEdit, faArrowLeft, faClock, 
  faStar, faChevronUp, faChevronDown, faDesktop, faMicrochip, faMobileAlt, 
  faCode, faFileAlt, faShareAlt, faSave, faTimes, faHashtag, faFilter
} from '@fortawesome/free-solid-svg-icons';
import { 
  faGithub 
} from '@fortawesome/free-brands-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import MarkdownRenderer from '../components/MarkdownRenderer';
import MarkdownEditor from '../components/MarkdownEditor';
import NeuralBackground from '../components/NeuralBackground';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '', description: '', github_link: '', demo_link: '', tech_stack: '', category: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['AI', 'Web', 'Mobile', 'Systems'];

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
      navigate('/projects');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchProject();
      setLoading(false);
    };
    init();
  }, [id]);

  useEffect(() => {
    if (project && new URLSearchParams(window.location.search).get('edit') === 'true' && (user?.id === project.created_by || user?.role === 'Admin' || user?.role === 'Core')) {
      handleOpenEditModal();
      window.history.replaceState({}, '', `/projects/${id}`);
    }
  }, [project, user]);

  const handleVote = async (voteType) => {
    if (!user) return navigate('/login');
    try {
      await api.post('/projects/vote', { projectId: project.id, voteType });
      fetchProject();
    } catch (error) { console.error('Vote failed'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      navigate('/projects');
    } catch (error) {
      alert('Deletion failed');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.title.trim() || !editFormData.description.trim()) return;
    
    setIsSubmitting(true);
    try {
      await api.put(`/projects/${id}`, editFormData);
      setIsEditModalOpen(false);
      fetchProject();
      alert('Project updated and sent for review');
    } catch (error) {
      alert('Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = () => {
    setEditFormData({
      title: project.title,
      description: project.description,
      github_link: project.github_link || '',
      demo_link: project.demo_link || '',
      tech_stack: project.tech_stack,
      category: project.category
    });
    setIsEditModalOpen(true);
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'AI': return faMicrochip;
      case 'Web': return faDesktop;
      case 'Mobile': return faMobileAlt;
      default: return faCode;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-accent font-black tracking-[0.2em] uppercase animate-pulse text-xs italic">
          Loading Project...
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden bg-card border-b border-border flex flex-col justify-end">
        <div className="absolute inset-0 pointer-events-none">
          <NeuralBackground />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        
        <div className="absolute top-6 left-6 z-20">
          <button 
            onClick={() => navigate('/projects')} 
            className="flex items-center gap-1.5 text-text/60 bg-card/40 hover:bg-card backdrop-blur-md px-4 py-2 rounded-full border border-border transition-all group font-black uppercase text-[10px] tracking-widest active:scale-95"
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Back
          </button>
        </div>

        <div className="relative w-full p-6 md:p-12 z-10 pt-24 md:pt-32">
          <div className="max-w-7xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-3">
                <span className="bg-accent/10 text-accent text-[8px] font-black px-3 py-1 rounded-full border border-accent/20 tracking-widest uppercase backdrop-blur-md">
                    {project.category} PROJECT
                </span>
                <span className={`px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase backdrop-blur-md border ${project.status === 'Approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                    {project.status === 'Approved' ? 'VERIFIED' : 'PENDING'}
                </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }} 
              className="text-3xl md:text-6xl font-black text-text leading-[1.1] tracking-tighter uppercase max-w-5xl italic"
            >
              {project.title}
            </motion.h1>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-8 text-text/40 pt-2"
            >
              <div className="flex items-center gap-4">
                <Link to={`/profile/${project.created_by}`} className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-lg font-black text-accent border border-accent/20 shadow-inner hover:bg-accent hover:text-white transition-all italic">
                  {project.creator_name[0]}
                </Link>
                <div>
                  <Link to={`/profile/${project.created_by}`} className="font-black text-lg text-text uppercase tracking-widest hover:text-accent transition-colors italic">{project.creator_name}</Link>
                  <p className="text-[8px] text-accent font-black uppercase tracking-[0.2em] mt-0.5 italic">Author</p>
                </div>
              </div>
              <div className="h-8 w-[1px] bg-border hidden sm:block"></div>
              <span className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest text-text/40 italic">
                <FontAwesomeIcon icon={faClock} className="text-accent" /> {new Date(project.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest text-accent italic">
                <FontAwesomeIcon icon={faStar} /> {project.vote_score || 0} Points
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mt-10 md:mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faFileAlt} className="text-accent text-xl" />
                <h4 className="text-2xl font-black text-text uppercase tracking-tight italic">Description</h4>
              </div>
              <div className="bg-card border border-border p-8 rounded-3xl shadow-xl italic overflow-hidden">
                <MarkdownRenderer content={project.description} />
              </div>
            </div>

            {/* Tech Stack */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faCode} className="text-accent text-xl" />
                <h4 className="text-2xl font-black text-text uppercase tracking-tight italic">Technologies</h4>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {project.tech_stack.split(',').map((tech, i) => (
                  <span key={i} className="px-5 py-2.5 bg-card border border-border rounded-xl text-[10px] font-black text-text/60 uppercase tracking-widest shadow-sm italic">
                    {tech.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border p-8 rounded-3xl shadow-xl sticky top-20 space-y-8">
              <div className="space-y-6">
                <h5 className="font-black text-text/40 uppercase tracking-[0.2em] text-[8px]">Resources</h5>
                <div className="space-y-3">
                  {project.github_link && (
                    <a href={project.github_link} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-between p-4 bg-background border border-border hover:border-text rounded-xl transition-all text-text/80 font-black uppercase tracking-widest text-[10px] group/link shadow-inner">
                      <div className="flex items-center gap-3"><FontAwesomeIcon icon={faGithub} className="text-lg" /> Source Code</div>
                      <FontAwesomeIcon icon={faExternalLinkAlt} className="opacity-40 group-hover/link:opacity-100 transition-all text-[10px]" />
                    </a>
                  )}
                  {project.demo_link && (
                    <a href={project.demo_link} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-between p-4 bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-white rounded-xl transition-all font-black uppercase tracking-widest text-[10px] group/link shadow-lg shadow-accent/10">
                      <div className="flex items-center gap-3"><FontAwesomeIcon icon={faDesktop} /> Live Demo</div>
                      <FontAwesomeIcon icon={faExternalLinkAlt} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform text-[10px]" />
                    </a>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <button onClick={() => handleVote(1)} className="flex-1 py-5 bg-background border border-border hover:border-accent rounded-2xl text-text/30 hover:text-accent transition-all flex flex-col items-center gap-1.5 group/btn shadow-inner active:scale-95">
                    <FontAwesomeIcon icon={faChevronUp} size="2x" className="group-hover/btn:-translate-y-0.5 transition-transform" /> 
                    <span className="text-[8px] font-black uppercase tracking-widest">Upvote</span>
                  </button>
                  <button onClick={() => handleVote(-1)} className="flex-1 py-5 bg-background border border-border hover:border-red-500 rounded-2xl text-text/30 hover:text-red-500 transition-all flex flex-col items-center gap-1.5 group/btn shadow-inner active:scale-95">
                    <FontAwesomeIcon icon={faChevronDown} size="2x" className="group-hover/btn:translate-y-0.5 transition-transform" /> 
                    <span className="text-[8px] font-black uppercase tracking-widest">Downvote</span>
                  </button>
                </div>
              </div>

              {/* Owner/Mod Actions */}
              <div className="space-y-3 pt-6 border-t border-border/50">
                {(user?.id === project.created_by || user?.role === 'Admin' || user?.role === 'Core') && (
                  <button onClick={handleOpenEditModal} className="w-full py-3.5 rounded-xl bg-blue-500/5 text-blue-500 border border-border hover:bg-blue-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 active:scale-95">
                    <FontAwesomeIcon icon={faEdit} /> Edit
                  </button>
                )}
                {(user?.id === project.created_by || user?.role === 'Admin' || user?.role === 'Core') && (
                  <button onClick={handleDelete} className="w-full py-3.5 rounded-xl bg-red-500/5 text-red-500 border border-border hover:bg-red-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 active:scale-95">
                    <FontAwesomeIcon icon={faTrashAlt} /> Delete
                  </button>
                )}
                <button className="w-full py-3.5 bg-background border border-border text-text/40 hover:text-accent hover:border-accent rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all active:scale-95"><FontAwesomeIcon icon={faShareAlt} /> Share</button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-xl overflow-y-auto">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="bg-card border border-border rounded-3xl w-full max-w-4xl my-auto shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 md:p-8 border-b border-border flex justify-between items-center bg-background/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg text-accent"><FontAwesomeIcon icon={faEdit} /></div>
                  <h2 className="text-xl font-black text-text uppercase tracking-tighter italic">Edit Project</h2>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="text-text/40 hover:text-red-500 p-1.5 rounded-full transition-all group active:scale-90"><FontAwesomeIcon icon={faTimes} size="lg" className="group-hover:rotate-90 transition-transform" /></button>
              </div>
              <form onSubmit={handleEdit} className="p-6 md:p-10 space-y-8 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-[8px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Project Title</label>
                    <input required type="text" className="w-full bg-background border-2 border-border rounded-xl py-3 px-5 focus:border-accent outline-none text-lg font-black text-text shadow-inner transition-colors italic" placeholder="Project name..." value={editFormData.title} onChange={(e) => setEditFormData({...editFormData, title: e.target.value})} />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <MarkdownEditor 
                        label="Development Story"
                        value={editFormData.description}
                        onChange={(content) => setEditFormData({...editFormData, description: content})}
                        placeholder="Describe the architecture, challenges, and core features..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[8px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Technologies (comma separated)</label>
                    <input required type="text" className="w-full bg-background border-2 border-border rounded-xl py-3 px-5 focus:border-accent outline-none font-bold text-sm text-text shadow-inner transition-colors italic" placeholder="React, Python..." value={editFormData.tech_stack} onChange={(e) => setEditFormData({...editFormData, tech_stack: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[8px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Category</label>
                    <div className="relative">
                      <select className="w-full bg-background border-2 border-border rounded-xl py-3 px-5 focus:border-accent outline-none cursor-pointer font-black text-text uppercase text-[10px] appearance-none shadow-inner italic" value={editFormData.category} onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-text/40"><FontAwesomeIcon icon={faFilter} /></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[8px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">GitHub URL</label>
                    <input type="url" className="w-full bg-background border-2 border-border rounded-xl py-3 px-5 focus:border-accent outline-none font-bold text-xs text-text shadow-inner transition-colors" value={editFormData.github_link} onChange={(e) => setEditFormData({...editFormData, github_link: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[8px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Demo URL</label>
                    <input type="url" className="w-full bg-background border-2 border-border rounded-xl py-3 px-5 focus:border-accent outline-none font-bold text-xs text-text shadow-inner transition-colors" value={editFormData.demo_link} onChange={(e) => setEditFormData({...editFormData, demo_link: e.target.value})} />
                  </div>
                </div>
                <div className="flex gap-4 pt-2">
                    <button type="submit" disabled={isSubmitting} className="flex-grow bg-accent hover:bg-gfg-green-hover text-white font-black py-4 px-8 rounded-xl transition text-sm shadow-xl shadow-accent/10 uppercase tracking-widest active:scale-[0.98] disabled:opacity-50">
                        <FontAwesomeIcon icon={faSave} /> {isSubmitting ? 'Updating...' : 'Save Changes'}
                    </button>
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="bg-card border border-border hover:bg-background text-text/60 font-black py-4 px-8 rounded-xl transition text-sm flex-grow uppercase tracking-widest shadow-sm italic">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .ql-container { border: none !important; font-family: inherit; font-size: 14px; background: transparent; }
        .ql-toolbar { border: none !important; border-bottom: 1px solid var(--color-border) !important; background: var(--color-card); padding: 8px !important; }
        .ql-editor { min-height: 200px; color: var(--color-text); padding: 15px !important; line-height: 1.6; }
        .ql-snow .ql-stroke { stroke: var(--color-text); opacity: 0.4; stroke-width: 2px; }
        .ql-snow .ql-fill { fill: var(--color-text); opacity: 0.4; }
        .ql-snow .ql-picker { color: var(--color-text); opacity: 0.6; font-weight: 800; }
        .ql-editor.ql-blank::before { color: var(--color-text) !important; opacity: 0.2; left: 15px !important; font-style: normal; font-weight: 700; }
        .dark .ql-editor *, .dark .ql-editor span { background-color: transparent !important; color: var(--color-text) !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-accent); border-radius: 10px; opacity: 0.2; }
      `}</style>
    </div>
  );
};

export default ProjectDetail;
