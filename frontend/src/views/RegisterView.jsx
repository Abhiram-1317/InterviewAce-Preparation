import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { authApi } from '../api';

export default function RegisterView() {
  const navigate = useNavigate();
  const { isAuthenticated, setAuth, showToast } = useAppStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorLine, setErrorLine] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorLine('');

    if (password.length < 6) {
      setErrorLine('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorLine('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // 1. Create real user in MongoDB via backend
      await authApi.register({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
      });

      // 2. Issue JWT token via backend login
      const loginRes = await authApi.login({
        email: email.trim(),
        password,
      });

      if (!loginRes.access_token) {
        throw new Error('Authentication token missing');
      }

      const userData = loginRes.user || {
        email: email.trim(),
        full_name: fullName.trim(),
      };

      setAuth(loginRes.access_token, userData);
      showToast('Account registered successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setErrorLine(detail);
      } else if (Array.isArray(detail)) {
        setErrorLine(detail.map((d) => d.msg || d).join(', '));
      } else if (err.response?.status === 400 && String(detail).includes('already registered')) {
        setErrorLine('This email address is already registered. Please sign in instead.');
      } else if (!err.response) {
        setErrorLine('Unable to reach server. Please check backend connection.');
      } else {
        setErrorLine('Failed to create account. Please check inputs and retry.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-container pt-16 pb-24 flex justify-center">
      <div className="spec-card w-full max-w-[440px] space-y-6 bg-white">
        <div>
          <h2 className="h2-title text-[#111111]">Create Account</h2>
          <p className="text-[14px] text-[#6b6b6b] mt-1">
            Build your personalized interview readiness profile with verified credentials.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#111111] block">Full Name</label>
            <input
              type="text"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="spec-input"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#111111] block">Email Address</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah@example.com"
              className="spec-input"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#111111] block">Password (min 6 characters)</label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="spec-input"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#111111] block">Confirm Password</label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="spec-input"
            />
          </div>

          {errorLine && (
            <div className="p-3 bg-[#fdf2f2] border border-[#f5c6cb] rounded text-[13px] text-[#b3261e] font-medium">
              {errorLine}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2"
          >
            {loading ? 'Creating profile…' : 'Register and continue'}
          </button>
        </form>

        <div className="border-t border-[#e7e5e1] pt-4 text-center text-[13px] text-[#6b6b6b]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#111111] font-semibold hover:text-[#d4421f] underline ml-1">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
