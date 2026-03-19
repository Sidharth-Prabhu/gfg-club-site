import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, faEnvelope, faLock, faBook, faCalendarAlt, faZap, 
  faGlobe, faCode, faFileAlt, faPaperPlane, faCheckCircle, faChevronRight, 
  faChevronLeft, faStar, faHashtag, faTerminal, faPlus 
} from '@fortawesome/free-solid-svg-icons';
import { 
  faGithub 
} from '@fortawesome/free-brands-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import MarkdownEditor from '../components/MarkdownEditor';

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
      setError(err.response?.data?.message || 'Registration failed.');
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
          className="max-w-2xl w-full bg-card border border-border p-12 md:p-20 rounded-3xl text-center space-y-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto text-accent mb-8 shadow-inner border border-accent/20">
            <FontAwesomeIcon icon={faCheckCircle} size="2x" className="animate-pulse" />
          </div>
          {userRole === 'Guest' ? (
            <>
              <h2 className="text-3xl md:text-4xl font-black text-text uppercase tracking-tighter">Guest Account <span className="text-accent">Created</span></h2>
              <p className="text-text/60 text-base font-medium leading-relaxed">
                Your guest account has been successfully registered. You can now login and explore the public features of our community.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-black text-text uppercase tracking-tighter">Registration <span className="text-accent">Successful</span></h2>
              <p className="text-text/60 text-base font-medium leading-relaxed">
                Your application has been submitted to the team for review. 
                We will verify your technical profile and university information soon.
              </p>
            </>
          )}
          <div className="bg-background/50 border border-border p-6 rounded-2xl text-left font-mono text-[10px] space-y-2 opacity-60">
            <p className="text-accent">{">"} Status: {userRole === 'Guest' ? 'APPROVED' : 'PENDING'}</p>
            <p>{">"} Role: {userRole === 'Guest' ? 'GUEST' : 'MEMBER'}</p>
          </div>
          <Link to="/login" className="inline-flex items-center gap-2 bg-accent hover:bg-gfg-green-hover text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-xl shadow-accent/20 active:scale-95 text-[10px]">
            Go to Login <FontAwesomeIcon icon={faChevronRight} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-3xl border border-border shadow-xl relative overflow-hidden flex flex-col md:flex-row"
      >
        {/* Sidebar Info */}
        <div className="md:w-1/3 bg-accent p-8 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='3' cy='3' r='3' fill='%23ffffff'/%3E%3C/svg%3E")` }}></div>
            <div className="relative z-10 space-y-6">
                <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-lg">
                    <FontAwesomeIcon icon={faUser} size="lg" />
                </div>
                <div className="space-y-3">
                    <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">Join the <br/>Community</h2>
                    <p className="text-white/70 text-[10px] font-medium leading-relaxed">Become a part of our elite tech community and showcase your potential.</p>
                </div>
                
                <div className="space-y-4 pt-6">
                    {[
                        { s: 1, label: 'Academic Info', icon: faBook },
                        { s: 2, label: 'Online Presence', icon: faGithub },
                        { s: 3, label: 'Profile Details', icon: faFileAlt }
                    ].map((item) => (
                        <div key={item.s} className={`flex items-center gap-3 transition-all duration-500 ${step >= item.s ? 'opacity-100 translate-x-1' : 'opacity-40'}`}>
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-[10px] border ${step >= item.s ? 'bg-white text-accent border-white' : 'border-white/30'}`}>
                                {step > item.s ? <FontAwesomeIcon icon={faCheckCircle} /> : item.s}
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="relative z-10 pt-8">
                <p className="text-[8px] font-black uppercase tracking-widest opacity-40">GfG RITChennai Chapter</p>
            </div>
        </div>

        {/* Form Area */}
        <div className="flex-grow p-6 md:p-10 space-y-8">
          {/* Login Notice Banner */}
          <div className="bg-blue-500/10 border-2 border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
              <span className="text-lg">ℹ️</span>
            </div>
            <div className="flex-grow">
              <p className="text-[9px] font-black text-blue-300 uppercase tracking-wider mb-1">Already have an account?</p>
              <p className="text-[8px] font-bold text-blue-200/80 leading-snug mb-2">Please <Link to="/login" className="text-blue-400 underline font-black">LOGIN</Link> instead of registering again. Registration is only for new users who have never created an account.</p>
              <div className="flex items-center gap-2 text-[7px] font-bold text-blue-400/60 uppercase tracking-wider">
                <span>Demo account available for testing</span>
                <span>→</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-text uppercase tracking-widest">Step 0{step}</h3>
            {error && <span className="text-red-500 text-[8px] font-black uppercase animate-pulse">{error}</span>}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-2">Full Name</label>
                    <div className="relative group">
                      <FontAwesomeIcon icon={faUser} className="absolute left-4 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors text-sm" />
                      <input required type="text" className="w-full bg-background border-2 border-border rounded-xl py-3.5 pl-11 pr-4 focus:border-accent outline-none text-text text-sm font-bold transition shadow-inner" placeholder="Alan Turing" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-2">Email Address</label>
                    <div className="relative group">
                      <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors text-sm" />
                      <input required type="email" className="w-full bg-background border-2 border-border rounded-xl py-3.5 pl-11 pr-4 focus:border-accent outline-none text-text text-sm font-bold transition shadow-inner" placeholder="name@ritchennai.edu.in" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-2">Department</label>
                      <input required type="text" className="w-full bg-background border-2 border-border rounded-xl py-3.5 px-5 focus:border-accent outline-none text-text text-sm font-bold transition shadow-inner" placeholder="CSE" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-2">Current Year</label>
                      <input required type="number" className="w-full bg-background border-2 border-border rounded-xl py-3.5 px-5 focus:border-accent outline-none text-text text-sm font-bold transition shadow-inner" placeholder="3" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-2">Password</label>
                    <div className="relative group">
                      <FontAwesomeIcon icon={faLock} className="absolute left-4 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors text-sm" />
                      <input required type="password" className="w-full bg-background border-2 border-border rounded-xl py-3.5 pl-11 pr-4 focus:border-accent outline-none text-text text-sm font-bold transition shadow-inner" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-2 text-accent flex items-center gap-1.5"><FontAwesomeIcon icon={faStar} className="text-[8px]"/> GeeksforGeeks Profile</label>
                    <div className="relative group">
                      <FontAwesomeIcon icon={faGlobe} className="absolute left-4 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors text-sm" />
                      <input required type="url" className="w-full bg-background border-2 border-border rounded-xl py-3.5 pl-11 pr-4 focus:border-accent outline-none text-text text-sm font-bold transition shadow-inner" placeholder="https://www.geeksforgeeks.org/user/..." value={formData.gfg_profile} onChange={(e) => setFormData({ ...formData, gfg_profile: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-2 text-orange-500 flex items-center gap-1.5"><FontAwesomeIcon icon={faCode} className="text-[8px]"/> LeetCode Profile</label>
                    <div className="relative group">
                      <FontAwesomeIcon icon={faCode} className="absolute left-4 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-orange-500 transition-colors text-sm" />
                      <input required type="url" className="w-full bg-background border-2 border-border rounded-xl py-3.5 pl-11 pr-4 focus:border-orange-500 outline-none text-text text-sm font-bold transition shadow-inner" placeholder="https://leetcode.com/..." value={formData.leetcode_profile} onChange={(e) => setFormData({ ...formData, leetcode_profile: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-2 text-text flex items-center gap-1.5"><FontAwesomeIcon icon={faGithub} className="text-[8px]"/> GitHub Profile</label>
                    <div className="relative group">
                      <FontAwesomeIcon icon={faGithub} className="absolute left-4 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-text transition-colors text-sm" />
                      <input required type="url" className="w-full bg-background border-2 border-border rounded-xl py-3.5 pl-11 pr-4 focus:border-text outline-none text-text text-sm font-bold transition shadow-inner" placeholder="https://github.com/..." value={formData.github_profile} onChange={(e) => setFormData({ ...formData, github_profile: e.target.value })} />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {!isGuest ? (
                    <>
                      <div className="space-y-1.5">
                        <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-2">Technical Skills</label>
                        <div className="relative group">
                          <FontAwesomeIcon icon={faHashtag} className="absolute left-4 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors text-sm" />
                          <input required type="text" className="w-full bg-background border-2 border-border rounded-xl py-3.5 pl-11 pr-4 focus:border-accent outline-none text-text text-sm font-bold transition shadow-inner" placeholder="React, Node.js, Python" value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <MarkdownEditor 
                            label="About You"
                            value={formData.about}
                            onChange={(val) => setFormData({ ...formData, about: val })}
                            placeholder="Tell us about your technical focus..."
                            minHeight="200px"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-2">Resume (PDF)</label>
                        <div className="relative">
                            <input required type="file" accept="application/pdf" className="hidden" id="resume-upload" onChange={handleFileChange} />
                            <label htmlFor="resume-upload" className="w-full flex items-center justify-between bg-background border-2 border-dashed border-border hover:border-accent rounded-xl p-4 cursor-pointer transition-all group shadow-inner">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-accent/5 rounded-lg text-accent group-hover:bg-accent group-hover:text-white transition-all"><FontAwesomeIcon icon={faFileAlt} /></div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black text-text uppercase tracking-widest">{resumeName || 'Select Resume'}</p>
                                        <p className="text-[7px] font-bold text-text/30 uppercase tracking-widest mt-0.5">Max 2MB | PDF Only</p>
                                    </div>
                                </div>
                                <FontAwesomeIcon icon={faPlus} className="text-text/20 group-hover:text-accent text-sm" />
                            </label>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-8 text-center space-y-3">
                      <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto text-accent shadow-inner">
                        <FontAwesomeIcon icon={faStar} size="2x" />
                      </div>
                      <h4 className="text-lg font-black text-text uppercase tracking-widest">Guest Ready</h4>
                      <p className="text-text/50 text-[10px] font-medium">Guest accounts do not require extra technical profile data.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <button type="button" onClick={() => setStep(step - 1)} className="flex-grow bg-card border border-border hover:bg-background text-text/60 font-black py-3.5 rounded-xl flex items-center justify-center gap-2 transition uppercase tracking-widest text-[10px] shadow-sm">
                  <FontAwesomeIcon icon={faChevronLeft} /> Back
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] bg-accent hover:bg-gfg-green-hover text-white font-black py-3.5 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-accent/10 uppercase tracking-widest text-[10px] active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Submitting...' : step === 3 ? <><FontAwesomeIcon icon={faPaperPlane} /> Submit</> : <><FontAwesomeIcon icon={faChevronRight} /> Continue</>}
              </button>
            </div>
          </form>

          <div className="pt-6 border-t border-border/50 text-center">
            <p className="text-text/40 font-bold text-[8px] uppercase tracking-widest">
              Already have an account?{' '}
              <Link to="/login" className="text-accent hover:underline font-black ml-1">Login</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
