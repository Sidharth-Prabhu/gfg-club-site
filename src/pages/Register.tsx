import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  User, Mail, Lock, Book, Calendar, Zap, Github, 
  Globe, Code2, FileText, Send, CheckCircle2, ChevronRight, 
  ChevronLeft, Sparkles, Hash, Terminal, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', department: '', year: '',
    gfg_profile: '', leetcode_profile: '', github_profile: '',
    skills: '', about: '', resume_url: ''
  });
  const [resumeName, setResumeName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userRole, setUserRole] = useState('User');
  const navigate = useNavigate();

  const isGuest = !formData.email.toLowerCase().includes('rit') && !formData.email.toLowerCase().includes('ritchennai');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Only PDF format is accepted.');
        return;
      }
      setResumeName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, resume_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if we can skip some fields for Guest users
    if (step < 3) {
        setStep(step + 1);
        return;
    }
    
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/register', formData);
      setUserRole(response.data.role);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Application deployment failed.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full bg-card border border-border p-12 md:p-20 rounded-[4rem] text-center space-y-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="w-24 h-24 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto text-accent mb-8 shadow-inner border border-accent/20">
            <CheckCircle2 size={48} className="animate-pulse" />
          </div>
          {userRole === 'Guest' ? (
            <>
              <h2 className="text-4xl md:text-5xl font-black text-text uppercase tracking-tighter italic">Guest Account <span className="text-accent">Created</span></h2>
              <p className="text-text/60 text-lg font-medium leading-relaxed italic">
                Your guest account has been successfully registered. You can now login and explore the public features of our community.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-4xl md:text-5xl font-black text-text uppercase tracking-tighter italic">Transmission <span className="text-accent">Logged</span></h2>
              <p className="text-text/60 text-lg font-medium leading-relaxed italic">
                Your ingress application has been broadcasted to the Central Command. 
                The Architects (Admins) will review your technical stack and institutional data.
              </p>
            </>
          )}
          <div className="bg-background/50 border border-border p-6 rounded-2xl text-left font-mono text-xs space-y-2 opacity-60">
            <p className="text-accent">{">"} Status: {userRole === 'Guest' ? 'APPROVED' : 'PENDING_APPROVAL'}</p>
            <p>{">"} Encryption: AES-256-GCM</p>
            <p>{">"} Role: {userRole === 'Guest' ? 'GUEST_ENTITY' : 'CORE_AGENT'}</p>
          </div>
          <Link to="/login" className="inline-flex items-center gap-2 bg-accent hover:bg-gfg-green-hover text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-accent/20 active:scale-95">
            Return to Matrix <ChevronRight size={20} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto bg-card rounded-[3.5rem] border border-border shadow-2xl relative overflow-hidden flex flex-col md:flex-row"
      >
        {/* Sidebar Info */}
        <div className="md:w-1/3 bg-accent p-12 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='3' cy='3' r='3' fill='%23ffffff'/%3E%3C/svg%3E")` }}></div>
            <div className="relative z-10 space-y-8">
                <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-lg">
                    <Terminal size={32} />
                </div>
                <div className="space-y-4">
                    <h2 className="text-3xl font-black uppercase tracking-tighter leading-none italic">Apply for <br/>Core Ingress</h2>
                    <p className="text-white/70 text-sm font-medium italic">Join the elite community of developers at RITChennai. Your application represents your technical potential.</p>
                </div>
                
                <div className="space-y-6 pt-10">
                    {[
                        { s: 1, label: 'Institutional Data', icon: Book },
                        { s: 2, label: 'Technical Nodes', icon: Github },
                        { s: 3, label: 'Persona Profile', icon: FileText }
                    ].map((item) => (
                        <div key={item.s} className={`flex items-center gap-4 transition-all duration-500 ${step >= item.s ? 'opacity-100 translate-x-2' : 'opacity-40'}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs border ${step >= item.s ? 'bg-white text-accent border-white' : 'border-white/30'}`}>
                                {step > item.s ? <CheckCircle2 size={16} /> : item.s}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="relative z-10 pt-12">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">GeeksforGeeks RITChennai Node</p>
            </div>
        </div>

        {/* Form Area */}
        <div className="flex-grow p-8 md:p-16 space-y-10">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-text uppercase tracking-widest">Section 0{step}</h3>
            {error && <span className="text-red-500 text-[10px] font-black uppercase animate-pulse">{error}</span>}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">Real Name (Agent ID)</label>
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors" size={20} />
                      <input required type="text" className="w-full bg-background border-2 border-border rounded-2xl py-5 pl-14 pr-6 focus:border-accent outline-none text-text font-bold transition shadow-inner italic" placeholder="e.g. Alan Turing" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">Matrix Link (Email)</label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors" size={20} />
                      <input required type="email" className="w-full bg-background border-2 border-border rounded-2xl py-5 pl-14 pr-6 focus:border-accent outline-none text-text font-bold transition shadow-inner" placeholder="agent@ritchennai.edu.in" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">Department Node</label>
                      <input required type="text" className="w-full bg-background border-2 border-border rounded-2xl py-5 px-8 focus:border-accent outline-none text-text font-bold transition shadow-inner italic" placeholder="e.g. CSE" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">Deployment Year</label>
                      <input required type="number" className="w-full bg-background border-2 border-border rounded-2xl py-5 px-8 focus:border-accent outline-none text-text font-bold transition shadow-inner" placeholder="e.g. 3" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">Access Key (Password)</label>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors" size={20} />
                      <input required type="password" className="w-full bg-background border-2 border-border rounded-2xl py-5 pl-14 pr-6 focus:border-accent outline-none text-text font-bold transition shadow-inner" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2 text-accent flex items-center gap-2"><Sparkles size={12}/> GeeksforGeeks Node URL</label>
                    <div className="relative group">
                      <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors" size={20} />
                      <input required type="url" className="w-full bg-background border-2 border-border rounded-2xl py-5 pl-14 pr-6 focus:border-accent outline-none text-text font-bold transition shadow-inner" placeholder="https://www.geeksforgeeks.org/user/..." value={formData.gfg_profile} onChange={(e) => setFormData({ ...formData, gfg_profile: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2 text-orange-500 flex items-center gap-2"><Code2 size={12}/> LeetCode Hub URL</label>
                    <div className="relative group">
                      <Code2 className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-orange-500 transition-colors" size={20} />
                      <input required type="url" className="w-full bg-background border-2 border-border rounded-2xl py-5 pl-14 pr-6 focus:border-orange-500 outline-none text-text font-bold transition shadow-inner" placeholder="https://leetcode.com/..." value={formData.leetcode_profile} onChange={(e) => setFormData({ ...formData, leetcode_profile: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2 text-text flex items-center gap-2"><Github size={12}/> GitHub Repository Node</label>
                    <div className="relative group">
                      <Github className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-text transition-colors" size={20} />
                      <input required type="url" className="w-full bg-background border-2 border-border rounded-2xl py-5 pl-14 pr-6 focus:border-text outline-none text-text font-bold transition shadow-inner" placeholder="https://github.com/..." value={formData.github_profile} onChange={(e) => setFormData({ ...formData, github_profile: e.target.value })} />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {!isGuest ? (
                    <>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">Technological Skills (CSV)</label>
                        <div className="relative group">
                          <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors" size={20} />
                          <input required type="text" className="w-full bg-background border-2 border-border rounded-2xl py-5 pl-14 pr-6 focus:border-accent outline-none text-text font-bold transition shadow-inner italic" placeholder="React, Node.js, Python, C++" value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">About Your Persona</label>
                        <textarea required rows={4} className="w-full bg-background border-2 border-border rounded-2xl py-5 px-8 focus:border-accent outline-none text-text font-medium text-lg transition shadow-inner resize-none italic" placeholder="Briefly define your technical focus and goals..." value={formData.about} onChange={(e) => setFormData({ ...formData, about: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">Technical Dossier (Resume PDF)</label>
                        <div className="relative">
                            <input required type="file" accept="application/pdf" className="hidden" id="resume-upload" onChange={handleFileChange} />
                            <label htmlFor="resume-upload" className="w-full flex items-center justify-between bg-background border-2 border-dashed border-border hover:border-accent rounded-2xl p-6 cursor-pointer transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-accent/5 rounded-xl text-accent group-hover:bg-accent group-hover:text-white transition-all"><FileText size={24} /></div>
                                    <div className="text-left">
                                        <p className="text-sm font-black text-text uppercase tracking-widest">{resumeName || 'Select PDF Dossier'}</p>
                                        <p className="text-[9px] font-bold text-text/30 uppercase tracking-[0.2em] mt-1">Maximum Size: 2MB | Format: PDF Only</p>
                                    </div>
                                </div>
                                <Plus size={20} className="text-text/20 group-hover:text-accent" />
                            </label>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-10 text-center space-y-4">
                      <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto text-accent">
                        <Sparkles size={40} />
                      </div>
                      <h4 className="text-xl font-black text-text uppercase tracking-widest">Guest Access Ready</h4>
                      <p className="text-text/50 text-sm font-medium italic">Guest accounts do not require technical dossiers or skill profiles. You're all set to join the community!</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-4 pt-6">
              {step > 1 && (
                <button type="button" onClick={() => setStep(step - 1)} className="flex-grow bg-card border border-border hover:bg-background text-text/60 font-black py-6 rounded-2xl flex items-center justify-center gap-3 transition uppercase tracking-widest text-xs shadow-sm">
                  <ChevronLeft size={20} /> Back
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] bg-accent hover:bg-gfg-green-hover text-white font-black py-6 rounded-2xl flex items-center justify-center gap-3 transition shadow-xl shadow-accent/20 uppercase tracking-widest text-xs active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Transmitting...' : step === 3 ? <><Send size={20} /> Submit Application</> : <><ChevronRight size={20} /> Continue Transition</>}
              </button>
            </div>
          </form>

          <div className="pt-8 border-t border-border/50 text-center">
            <p className="text-text/40 font-bold text-[10px] uppercase tracking-widest italic">
              Already a verified agent?{' '}
              <Link to="/login" className="text-accent hover:underline font-black ml-1">Authenticate Identity</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
