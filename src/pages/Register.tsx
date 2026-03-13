import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Mail, Lock, Book, Calendar, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    year: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', formData);
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-xl mx-auto mt-10 p-10 bg-card rounded-[3rem] border border-border shadow-2xl relative overflow-hidden"
    >
      {/* Background Accent */}
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent/5 rounded-full -ml-20 -mb-20 blur-3xl"></div>
      
      <div className="text-center mb-10 space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-2xl text-accent mb-4">
            <Zap size={28} className="fill-accent" />
        </div>
        <h2 className="text-4xl font-black text-text uppercase tracking-tighter">Join the <span className="text-accent">Club</span></h2>
        <p className="text-text/40 font-black text-[10px] uppercase tracking-[0.3em]">Initialize your coding identity</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-8 text-xs font-bold uppercase tracking-widest text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">Full Agent Name</label>
          <div className="relative group">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors" size={20} />
            <input
              type="text"
              required
              className="w-full bg-background border-2 border-border rounded-2xl py-4 pl-14 pr-6 focus:border-accent outline-none text-text font-bold transition shadow-inner"
              placeholder="e.g. Alan Turing"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">Matrix Email</label>
          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors" size={20} />
            <input
              type="email"
              required
              className="w-full bg-background border-2 border-border rounded-2xl py-4 pl-14 pr-6 focus:border-accent outline-none text-text font-bold transition shadow-inner"
              placeholder="agent@college.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">Core Department</label>
            <div className="relative group">
              <Book className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors" size={20} />
              <input
                type="text"
                required
                className="w-full bg-background border-2 border-border rounded-2xl py-4 pl-14 pr-6 focus:border-accent outline-none text-text font-bold transition shadow-inner"
                placeholder="e.g. CSE"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">Academic Year</label>
            <div className="relative group">
              <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors" size={20} />
              <input
                type="number"
                required
                className="w-full bg-background border-2 border-border rounded-2xl py-4 pl-14 pr-6 focus:border-accent outline-none text-text font-bold transition shadow-inner"
                placeholder="3"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-black text-text/40 uppercase tracking-widest ml-2">Access Key (Password)</label>
          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors" size={20} />
            <input
              type="password"
              required
              className="w-full bg-background border-2 border-border rounded-2xl py-4 pl-14 pr-6 focus:border-accent outline-none text-text font-bold transition shadow-inner"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent hover:bg-gfg-green-hover text-white font-black py-6 rounded-2xl mt-4 transition shadow-xl shadow-accent/20 uppercase tracking-widest text-xs active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? 'Initializing...' : 'Deploy Core Identity'}
        </button>
      </form>

      <div className="mt-10 pt-8 border-t border-border/50 text-center">
        <p className="text-text/40 font-bold text-xs uppercase tracking-widest">
          Already verified?{' '}
          <Link to="/login" className="text-accent hover:underline font-black ml-1">Authorize Access</Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Register;
