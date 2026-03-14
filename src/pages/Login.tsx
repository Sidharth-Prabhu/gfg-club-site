import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Mail, Lock, LogIn, Sparkles, Terminal, ShieldCheck, 
  ChevronRight, Key, Zap, Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', formData);
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto bg-card rounded-[3.5rem] border border-border shadow-2xl relative overflow-hidden flex flex-col md:flex-row"
      >
        {/* Sidebar Info - Matching Register Aesthetic */}
        <div className="md:w-1/3 bg-accent p-12 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='3' cy='3' r='3' fill='%23ffffff'/%3E%3C/svg%3E")` }}></div>
            <div className="relative z-10 space-y-8">
                <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-lg">
                    <Key size={32} />
                </div>
                <div className="space-y-4">
                    <h2 className="text-3xl font-black uppercase tracking-tighter leading-none italic">Agent <br/>Authentication</h2>
                    <p className="text-white/70 text-sm font-medium italic">Re-establish your connection to the GeeksforGeeks RITChennai Node. Synchronize your progress and access the matrix.</p>
                </div>
                
                <div className="space-y-6 pt-10">
                    {[
                        { label: 'Secure Handshake', icon: ShieldCheck },
                        { label: 'Identity Verification', icon: Activity },
                        { label: 'Node Access', icon: Zap }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 opacity-100 translate-x-2 transition-all duration-500">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white text-accent border border-white">
                                <item.icon size={16} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="relative z-10 pt-12">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">System Identity: AUTHORIZED ONLY</p>
            </div>
        </div>

        {/* Form Area */}
        <div className="flex-grow p-8 md:p-16 space-y-10">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
                <h3 className="text-3xl font-black text-text uppercase tracking-tighter italic">Authorize <span className="text-accent">Access</span></h3>
                <p className="text-[10px] font-black text-text/30 uppercase tracking-[0.3em]">Credentials Entry Protocol</p>
            </div>
            <div className="p-3 bg-accent/5 rounded-2xl text-accent border border-accent/10">
                <LogIn size={24} />
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/20 text-red-500 p-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-center italic">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">Matrix Link (Email)</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors" size={20} />
                  <input 
                    required 
                    type="email" 
                    className="w-full bg-background border-2 border-border rounded-2xl py-5 pl-14 pr-6 focus:border-accent outline-none text-text font-bold transition shadow-inner italic" 
                    placeholder="agent@ritchennai.edu.in" 
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">Access Key (Password)</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors" size={20} />
                  <input 
                    required 
                    type="password" 
                    className="w-full bg-background border-2 border-border rounded-2xl py-5 pl-14 pr-6 focus:border-accent outline-none text-text font-bold transition shadow-inner" 
                    placeholder="••••••••" 
                    value={formData.password} 
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent hover:bg-gfg-green-hover text-white font-black py-6 rounded-2xl flex items-center justify-center gap-3 transition shadow-xl shadow-accent/20 uppercase tracking-widest text-xs active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Validating Identity...' : <><LogIn size={20} /> Authorize Access</>}
              </button>
            </div>
          </form>

          <div className="pt-10 border-t border-border/50 text-center">
            <p className="text-text/40 font-bold text-[10px] uppercase tracking-widest italic">
              Unregistered Node?{' '}
              <Link to="/register" className="text-accent hover:underline font-black ml-1">Apply for Ingress</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
