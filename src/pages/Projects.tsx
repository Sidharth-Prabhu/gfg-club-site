import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Github, ExternalLink, Trash2, 
  Code2, Monitor, Smartphone, Cpu, Filter, X, Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState('All');
  
  const [formData, setFormData] = useState({
    title: '', description: '', github_link: '', demo_link: '', tech_stack: '', category: 'Web'
  });

  const categories = ['All', 'AI', 'Web', 'Mobile', 'Systems'];

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/projects?category=${category}`);
      setProjects(data);
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
      setFormData({ title: '', description: '', github_link: '', demo_link: '', tech_stack: '', category: 'Web' });
      setIsModalOpen(false);
      fetchProjects();
    } catch (error) {
      alert('Failed to add project');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this project?')) {
      try {
        await api.delete(`/projects/${id}`);
        fetchProjects();
      } catch (error) {
        alert('Action failed');
      }
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'AI': return <Cpu size={18} />;
      case 'Web': return <Monitor size={18} />;
      case 'Mobile': return <Smartphone size={18} />;
      default: return <Code2 size={18} />;
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold">Project Showcase</h1>
          <p className="text-gray-400 mt-2">Amazing things built by our club members.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-accent hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition shadow-lg shadow-accent/20"
        >
          <Plus size={20} /> Submit Project
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-6 py-2 rounded-xl text-sm font-medium border transition flex items-center gap-2 ${category === cat ? 'bg-accent border-accent text-white' : 'bg-card border-gray-800 text-gray-400 hover:border-gray-600'}`}
          >
            {cat !== 'All' && getCategoryIcon(cat)}
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-accent font-bold animate-pulse">Compiling projects...</div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map(project => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={project.id} 
              className="bg-card border border-gray-800 rounded-3xl p-6 hover:border-accent/30 transition-all group flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg bg-accent/10 text-accent`}>
                  {getCategoryIcon(project.category)}
                </div>
                {(user?.role === 'Admin' || user?.role === 'Core' || user?.id === project.created_by) && (
                  <button onClick={() => handleDelete(project.id)} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="flex-grow space-y-3 mb-6">
                <h3 className="text-xl font-bold text-gray-100">{project.title}</h3>
                <p className="text-gray-400 text-sm line-clamp-3">{project.description}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {project.tech_stack.split(',').map((tech, i) => (
                    <span key={i} className="text-[10px] font-bold text-gray-500 bg-background border border-gray-800 px-2 py-0.5 rounded-md uppercase">
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">
                    {project.creator_name[0]}
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{project.creator_name}</span>
                </div>
                <div className="flex gap-3">
                  {project.github_link && (
                    <a href={project.github_link} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                      <Github size={18} />
                    </a>
                  )}
                  {project.demo_link && (
                    <a href={project.demo_link} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-accent transition">
                      <ExternalLink size={18} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-40 text-center text-gray-500 bg-card rounded-3xl border border-gray-800 border-dashed">
          <Monitor size={64} className="mx-auto mb-4 opacity-10" />
          <p className="text-xl">No projects in this category yet. Be the first!</p>
        </div>
      )}

      {/* Add Project Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-card border border-gray-800 rounded-3xl w-full max-w-xl my-auto shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Submit Your Project</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Project Title</label>
                    <input required type="text" className="w-full bg-background border border-gray-700 rounded-xl py-3 px-4 focus:border-accent outline-none" placeholder="e.g. Campus Buddy" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                    <select className="w-full bg-background border border-gray-700 rounded-xl py-3 px-4 focus:border-accent outline-none cursor-pointer" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                      {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Tech Stack (CSV)</label>
                    <input required type="text" className="w-full bg-background border border-gray-700 rounded-xl py-3 px-4 focus:border-accent outline-none" placeholder="React, Node, MySQL" value={formData.tech_stack} onChange={(e) => setFormData({...formData, tech_stack: e.target.value})} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                    <textarea required rows={3} className="w-full bg-background border border-gray-700 rounded-xl py-3 px-4 focus:border-accent outline-none resize-none" placeholder="What does this project do?" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">GitHub Repository URL</label>
                    <input type="url" className="w-full bg-background border border-gray-700 rounded-xl py-3 px-4 focus:border-accent outline-none" placeholder="https://github.com/..." value={formData.github_link} onChange={(e) => setFormData({...formData, github_link: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Live Demo URL</label>
                    <input type="url" className="w-full bg-background border border-gray-700 rounded-xl py-3 px-4 focus:border-accent outline-none" placeholder="https://..." value={formData.demo_link} onChange={(e) => setFormData({...formData, demo_link: e.target.value})} />
                  </div>
                </div>
                <button type="submit" className="w-full bg-accent hover:bg-green-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition text-lg shadow-xl shadow-accent/20">
                  <Save size={24} /> Showcase Project
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Projects;
