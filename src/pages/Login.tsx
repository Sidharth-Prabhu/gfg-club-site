import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope, faLock, faSignInAlt, faTerminal, faShieldAlt, 
  faChevronRight, faKey, faZap, faChartLine, faUser
} from '@fortawesome/free-solid-svg-icons';
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
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

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
                    <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">Member <br/>Login</h2>
                    <p className="text-white/70 text-[10px] font-medium leading-relaxed">Welcome back. Please enter your credentials to access your account and continue your progress.</p>
                </div>
                
                <div className="space-y-4 pt-6">
                    {[
                        { label: 'Secure Access', icon: faShieldAlt },
                        { label: 'Personal Dashboard', icon: faChartLine },
                        { label: 'Member Benefits', icon: faZap }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 opacity-100 translate-x-1 transition-all duration-500">
                            <div className="w-6 h-6 rounded-md flex items-center justify-center bg-white text-accent border border-white">
                                <FontAwesomeIcon icon={item.icon} className="text-[10px]" />
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
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
                <h3 className="text-2xl font-black text-text uppercase tracking-tighter italic">Welcome <span className="text-accent">Back</span></h3>
                <p className="text-[8px] font-black text-text/30 uppercase tracking-widest">Sign in to your account</p>
            </div>
            <div className="p-2.5 bg-accent/5 rounded-xl text-accent border border-accent/10">
                <FontAwesomeIcon icon={faSignInAlt} className="text-lg" />
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-[8px] font-black uppercase tracking-widest text-center italic">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-2">Email Address</label>
                <div className="relative group">
                  <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors text-sm" />
                  <input 
                    required 
                    type="email" 
                    className="w-full bg-background border-2 border-border rounded-xl py-3.5 pl-11 pr-4 focus:border-accent outline-none text-text text-sm font-bold transition shadow-inner" 
                    placeholder="name@ritchennai.edu.in" 
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[8px] font-black text-text/40 uppercase tracking-widest ml-2">Password</label>
                <div className="relative group">
                  <FontAwesomeIcon icon={faLock} className="absolute left-4 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors text-sm" />
                  <input 
                    required 
                    type="password" 
                    className="w-full bg-background border-2 border-border rounded-xl py-3.5 pl-11 pr-4 focus:border-accent outline-none text-text text-sm font-bold transition shadow-inner" 
                    placeholder="••••••••" 
                    value={formData.password} 
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent hover:bg-gfg-green-hover text-white font-black py-3.5 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-accent/10 uppercase tracking-widest text-[10px] active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Logging in...' : <><FontAwesomeIcon icon={faSignInAlt} /> Login</>}
              </button>
            </div>
          </form>

          <div className="pt-8 border-t border-border/50 text-center">
            <p className="text-text/40 font-bold text-[8px] uppercase tracking-widest">
              Don't have an account?{' '}
              <Link to="/register" className="text-accent hover:underline font-black ml-1">Register Now</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
