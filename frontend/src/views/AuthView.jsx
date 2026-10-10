import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { authApi } from '../api';
import { useAppStore } from '../store/useAppStore';
import { Lock, Mail, User, Sparkles, ArrowRight, KeyRound } from 'lucide-react';

export default function AuthView() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
  });

  const navigate = useNavigate();
  const setAuth = useAppStore((state) => state.setAuth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const res = await authApi.login({
          email: formData.email,
          password: formData.password,
        });
        const token = res.access_token || res.token;
        const user = res.user || { email: formData.email, full_name: formData.email.split('@')[0] };
        setAuth(token, user);
        toast.success(`Welcome back, ${user.full_name || 'Candidate'}!`);
        navigate('/dashboard');
      } else {
        const res = await authApi.register({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
        });
        toast.success('Account created successfully! Logging you in...');
        // Auto login
        const loginRes = await authApi.login({
          email: formData.email,
          password: formData.password,
        });
        const token = loginRes.access_token || loginRes.token;
        const user = loginRes.user || { email: formData.email, full_name: formData.full_name };
        setAuth(token, user);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      const errorMsg = Array.isArray(detail)
        ? detail.map((d) => d.msg).join(', ')
        : (detail || 'Authentication failed. Please verify credentials.');
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    const demoEmail = `demo_candidate_${Math.floor(Math.random() * 9000 + 1000)}@interviewace.ai`;
    const demoPass = 'Password123!';
    try {
      await authApi.register({
        email: demoEmail,
        password: demoPass,
        full_name: 'Alex Rivera (Demo Candidate)',
      });
      const loginRes = await authApi.login({
        email: demoEmail,
        password: demoPass,
      });
      const token = loginRes.access_token || loginRes.token;
      setAuth(token, { email: demoEmail, full_name: 'Alex Rivera' });
      toast.success('Instant demo access granted!');
      navigate('/dashboard');
    } catch (err) {
      // In case user exists, attempt login
      try {
        const loginRes = await authApi.login({ email: demoEmail, password: demoPass });
        setAuth(loginRes.access_token || loginRes.token, { email: demoEmail, full_name: 'Alex Rivera' });
        toast.success('Welcome back!');
        navigate('/dashboard');
      } catch (e) {
        toast.error('Could not auto-login demo account.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3 text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isLogin ? 'Sign In to InterviewAce' : 'Create Your Account'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {isLogin
              ? 'Access your resume analyses and practice sessions'
              : 'Join to start practicing realistic AI-powered interviews'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-xl mb-6 border border-slate-800">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              isLogin ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              !isLogin ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required={!isLogin}
                  placeholder="e.g. Alex Rivera"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Free Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Demo Login */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400 mb-3">Hackathon Judge / Instant Evaluation?</p>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-medium text-xs bg-slate-800/80 hover:bg-slate-750 text-indigo-300 hover:text-white border border-slate-700/80 hover:border-indigo-500/40 flex items-center justify-center gap-2 transition-all"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>1-Click Demo Account Login</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
