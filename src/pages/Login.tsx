import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Mail, Lock, LogIn, Sparkles } from 'lucide-react';
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto mt-16 p-10 bg-card rounded-[2.5rem] border border-border shadow-2xl relative overflow-hidden"
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      
      <div className="text-center mb-10 space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-2xl text-accent mb-4">
            <Sparkles size={28} />
        </div>
        <h2 className="text-4xl font-black text-text uppercase tracking-tighter">Welcome <span className="text-accent">Back</span></h2>
        <p className="text-text/40 font-black text-[10px] uppercase tracking-[0.3em]">Authorize your core identity</p>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-8 text-xs font-bold uppercase tracking-widest text-center">
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">Secure Email</label>
          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors" size={20} />
            <input
              type="email"
              required
              className="w-full bg-background border-2 border-border rounded-2xl py-5 pl-14 pr-6 focus:border-accent outline-none text-text font-bold transition shadow-inner"
              placeholder="agent@matrix.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">Access Key</label>
          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors" size={20} />
            <input
              type="password"
              required
              className="w-full bg-background border-2 border-border rounded-2xl py-5 pl-14 pr-6 focus:border-accent outline-none text-text font-bold transition shadow-inner"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent hover:bg-gfg-green-hover text-white font-black py-6 rounded-2xl transition shadow-xl shadow-accent/20 flex items-center justify-center gap-3 uppercase tracking-widest text-xs active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : <><LogIn size={20} /> Authorize Access</>}
        </button>
      </form>

      <div className="mt-10 pt-8 border-t border-border/50 text-center">
        <p className="text-text/40 font-bold text-xs uppercase tracking-widest">
          New to the Matrix?{' '}
          <Link to="/register" className="text-accent hover:underline font-black ml-1">Initialize Identity</Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Login;
