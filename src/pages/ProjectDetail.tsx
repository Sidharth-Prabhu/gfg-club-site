import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Github, ExternalLink, Trash2, Edit3, ArrowLeft, Clock, 
  Star, ChevronUp, ChevronDown, Monitor, Cpu, Smartphone, 
  Code2, FileText, Share2, Save, X, Hash, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

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
    if (!window.confirm('Terminate this project deployment?')) return;
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
      alert('Project updated and sent for re-approval');
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
      case 'AI': return <Cpu size={24} />;
      case 'Web': return <Monitor size={24} />;
      case 'Mobile': return <Smartphone size={24} />;
      default: return <Code2 size={24} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-accent font-black tracking-[0.3em] uppercase animate-pulse text-xl italic">
          Syncing Project Node...
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] md:min-h-[60vh] w-full overflow-hidden bg-card border-b border-border flex flex-col justify-end">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px] -mr-64 -mt-64"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -ml-48 -mb-48"></div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        
        <div className="absolute top-8 left-8 z-20">
          <button 
            onClick={() => navigate('/projects')} 
            className="flex items-center gap-2 text-text/60 bg-card/40 hover:bg-card backdrop-blur-md px-6 py-3 rounded-full border border-border transition-all group font-black uppercase text-xs tracking-widest active:scale-95"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Showcase
          </button>
        </div>

        <div className="relative w-full p-8 md:p-20 z-10 pt-32 md:pt-48">
          <div className="max-w-7xl mx-auto space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-4">
                <span className="bg-accent/10 text-accent text-[10px] font-black px-5 py-2 rounded-full border border-accent/20 tracking-widest uppercase backdrop-blur-md">
                    {project.category} PROJECT NODE
                </span>
                <span className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase backdrop-blur-md border ${project.status === 'Approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                    {project.status === 'Approved' ? 'VERIFIED DEPLOYMENT' : 'PENDING APPROVAL'}
                </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }} 
              className="text-5xl md:text-8xl font-black text-text leading-[1.1] tracking-tighter uppercase max-w-5xl"
            >
              {project.title}
            </motion.h1>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-12 text-text/40 pt-4"
            >
              <div className="flex items-center gap-5">
                <Link to={`/profile/${project.created_by}`} className="w-16 h-16 rounded-[1.5rem] bg-accent/10 flex items-center justify-center text-2xl font-black text-accent border border-accent/20 shadow-inner hover:bg-accent hover:text-white transition-all">
                  {project.creator_name[0]}
                </Link>
                <div>
                  <Link to={`/profile/${project.created_by}`} className="font-black text-2xl text-text uppercase tracking-widest hover:text-accent transition-colors">{project.creator_name}</Link>
                  <p className="text-[10px] text-accent font-black uppercase tracking-[0.3em] mt-1">Lead Architect</p>
                </div>
              </div>
              <div className="h-12 w-[1px] bg-border hidden sm:block"></div>
              <span className="flex items-center gap-3 font-black uppercase text-xs tracking-widest text-text/40">
                <Clock size={20} className="text-accent" /> {new Date(project.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-3 font-black uppercase text-xs tracking-widest text-accent">
                <Star size={20} className="fill-accent" /> {project.vote_score || 0} Excellence Points
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="max-w-7xl mx-auto px-8 md:px-20 mt-12 md:mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
          <div className="lg:col-span-2 space-y-20">
            {/* Description */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <FileText size={28} className="text-accent" />
                <h4 className="text-3xl font-black text-text uppercase tracking-tight italic">Technical Narrative</h4>
              </div>
              <div className="prose dark:prose-invert prose-accent max-w-none text-text/80 text-xl leading-[1.8] font-medium ql-editor !p-0" dangerouslySetInnerHTML={{ __html: project.description }} />
            </div>

            {/* Tech Stack */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <Code2 size={28} className="text-accent" />
                <h4 className="text-3xl font-black text-text uppercase tracking-tight italic">Architecture Stack</h4>
              </div>
              <div className="flex flex-wrap gap-4">
                {project.tech_stack.split(',').map((tech, i) => (
                  <span key={i} className="px-8 py-4 bg-card border-2 border-border rounded-[1.5rem] text-sm font-black text-text/60 uppercase tracking-widest shadow-sm">
                    {tech.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-10">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border p-10 rounded-[3rem] shadow-xl sticky top-24 space-y-10">
              <div className="space-y-8">
                <h5 className="font-black text-text/40 uppercase tracking-[0.3em] text-[10px]">Resource Links</h5>
                <div className="space-y-5">
                  {project.github_link && (
                    <a href={project.github_link} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-between p-6 bg-background border border-border hover:border-text rounded-2xl transition-all text-text/80 font-black uppercase tracking-widest text-xs group/link">
                      <div className="flex items-center gap-4"><Github size={24} className="text-accent" /> Source Code</div>
                      <ExternalLink size={18} className="opacity-40 group-hover/link:opacity-100 transition-all group-hover/link:translate-x-1 group-hover/link:-translate-y-1" />
                    </a>
                  )}
                  {project.demo_link && (
                    <a href={project.demo_link} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-between p-6 bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-white rounded-2xl transition-all font-black uppercase tracking-widest text-xs group/link shadow-lg shadow-accent/10">
                      <div className="flex items-center gap-4"><Monitor size={24} /> Live Node</div>
                      <ExternalLink size={18} className="group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                    </a>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex gap-5">
                  <button onClick={() => handleVote(1)} className="flex-1 py-7 bg-background border-2 border-border hover:border-accent rounded-[2rem] text-text/30 hover:text-accent transition-all flex flex-col items-center gap-2 group/btn shadow-inner active:scale-95">
                    <ChevronUp size={36} className="group-hover/btn:-translate-y-1 transition-transform" /> 
                    <span className="text-[10px] font-black uppercase tracking-widest">Applaud</span>
                  </button>
                  <button onClick={() => handleVote(-1)} className="flex-1 py-7 bg-background border-2 border-border hover:border-red-500 rounded-[2rem] text-text/30 hover:text-red-500 transition-all flex flex-col items-center gap-2 group/btn shadow-inner active:scale-95">
                    <ChevronDown size={36} className="group-hover/btn:translate-y-1 transition-transform" /> 
                    <span className="text-[10px] font-black uppercase tracking-widest">Critique</span>
                  </button>
                </div>
              </div>

              {/* Owner/Mod Actions */}
              <div className="space-y-4 pt-8 border-t border-border/50">
                {(user?.id === project.created_by || user?.role === 'Admin' || user?.role === 'Core') && (
                  <button onClick={handleOpenEditModal} className="w-full py-5 rounded-2xl bg-blue-500/5 text-blue-500 border border-border hover:bg-blue-500 hover:text-white transition-all font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 active:scale-95">
                    <Edit3 size={18} /> Edit Deployment
                  </button>
                )}
                {(user?.id === project.created_by || user?.role === 'Admin' || user?.role === 'Core') && (
                  <button onClick={handleDelete} className="w-full py-5 rounded-2xl bg-red-500/5 text-red-500 border border-border hover:bg-red-500 hover:text-white transition-all font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 active:scale-95">
                    <Trash2 size={18} /> Terminate Build
                  </button>
                )}
                <button className="w-full py-5 bg-background border border-border text-text/40 hover:text-accent hover:border-accent rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-95"><Share2 size={18} /> Share Matrix</button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 bg-background/95 backdrop-blur-xl overflow-y-auto">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="bg-card border border-border rounded-[3.5rem] w-full max-w-5xl my-auto shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-10 border-b border-border flex justify-between items-center bg-background/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/10 rounded-xl text-accent"><Edit3 size={24} /></div>
                  <h2 className="text-3xl font-black text-text uppercase tracking-tighter italic">Re-Configure Build</h2>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="text-text/40 hover:text-red-500 p-4 hover:bg-red-500/5 rounded-full transition-all group active:scale-90"><X size={32} className="group-hover:rotate-90 transition-transform" /></button>
              </div>
              <form onSubmit={handleEdit} className="p-10 md:p-14 space-y-12 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="md:col-span-2 space-y-4">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Build Headline</label>
                    <input required type="text" className="w-full bg-background border-2 border-border rounded-[1.5rem] py-6 px-10 focus:border-accent outline-none text-2xl font-black text-text shadow-inner transition-colors" placeholder="Name of your innovation..." value={editFormData.title} onChange={(e) => setEditFormData({...editFormData, title: e.target.value})} />
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Development Story</label>
                    <div className="bg-background rounded-[2rem] overflow-hidden border-2 border-border focus-within:border-accent transition shadow-inner">
                        <ReactQuill theme="snow" value={editFormData.description} onChange={(content) => setEditFormData({...editFormData, description: content})} placeholder="Describe your architecture and process..." />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Technical Stack (CSV)</label>
                    <input required type="text" className="w-full bg-background border-2 border-border rounded-[1.5rem] py-6 px-10 focus:border-accent outline-none font-bold text-text shadow-inner transition-colors" placeholder="React, MySQL, Python..." value={editFormData.tech_stack} onChange={(e) => setEditFormData({...editFormData, tech_stack: e.target.value})} />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Node Classification</label>
                    <div className="relative">
                      <select className="w-full bg-background border-2 border-border rounded-[1.5rem] py-6 px-10 focus:border-accent outline-none cursor-pointer font-black text-text uppercase text-xs appearance-none shadow-inner" value={editFormData.category} onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-text/40"><Filter size={20} /></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">GitHub Node URL</label>
                    <input type="url" className="w-full bg-background border-2 border-border rounded-[1.5rem] py-6 px-10 focus:border-accent outline-none font-bold text-text shadow-inner transition-colors" placeholder="https://github.com/..." value={editFormData.github_link} onChange={(e) => setEditFormData({...editFormData, github_link: e.target.value})} />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-[0.2em] ml-2">Live Node URL</label>
                    <input type="url" className="w-full bg-background border-2 border-border rounded-[1.5rem] py-6 px-10 focus:border-accent outline-none font-bold text-text shadow-inner transition-colors" placeholder="https://..." value={editFormData.demo_link} onChange={(e) => setEditFormData({...editFormData, demo_link: e.target.value})} />
                  </div>
                </div>
                <div className="flex gap-6 pt-4">
                    <button type="submit" disabled={isSubmitting} className="flex-grow bg-accent hover:bg-gfg-green-hover text-white font-black py-7 px-14 rounded-[1.5rem] transition text-xl shadow-2xl shadow-accent/20 uppercase tracking-widest active:scale-[0.98] disabled:opacity-50">
                        {isSubmitting ? 'Updating Node...' : 'Commit Changes'}
                    </button>
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="bg-card border border-border hover:bg-background text-text/60 font-black py-7 px-14 rounded-[1.5rem] transition text-xl uppercase tracking-widest shadow-sm">Abort</button>
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
        .dark .ql-editor *, .dark .ql-editor span { background-color: transparent !important; color: var(--color-text) !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-accent); border-radius: 10px; opacity: 0.2; }
      `}</style>
    </div>
  );
};

export default ProjectDetail;
