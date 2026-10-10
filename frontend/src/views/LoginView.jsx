import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { authApi } from '../api';

export default function LoginView() {
  const navigate = useNavigate();
  const { isAuthenticated, setAuth, showToast } = useAppStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorLine, setErrorLine] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorLine('');
    setLoading(true);

    try {
      const res = await authApi.login({
        email: email.trim(),
        password,
      });

      if (!res.access_token) {
        throw new Error('Authentication token missing in response');
      }

      const userData = res.user || {
        email: email.trim(),
        full_name: email.trim().split('@')[0],
      };

      setAuth(res.access_token, userData);
      showToast(`Welcome back, ${userData.full_name || 'Candidate'}!`);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setErrorLine(detail);
      } else if (Array.isArray(detail)) {
        setErrorLine(detail.map((d) => d.msg || d).join(', '));
      } else if (err.response?.status === 401) {
        setErrorLine('Invalid email or password.');
      } else if (!err.response) {
        setErrorLine('Unable to reach server. Please check backend connection.');
      } else {
        setErrorLine('Authentication failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    showToast('Password recovery instructions sent if email exists.');
  };

  return (
    <div className="content-container pt-16 pb-24 flex justify-center">
      <div className="spec-card w-full max-w-[420px] space-y-6 bg-white">
        <div>
          <h2 className="h2-title text-[#111111]">Sign In</h2>
          <p className="text-[14px] text-[#6b6b6b] mt-1">
            Access your verified InterviewAce preparation workspace and saved sessions.
          </p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#111111] block">Work or Personal Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="candidate@example.com"
              className="spec-input"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[13px] font-medium text-[#111111] block">Password</label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[12px] text-[#6b6b6b] hover:text-[#d4421f] transition-colors"
              >
                Forgot?
              </button>
            </div>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? 'Authenticating…' : 'Sign in to workspace'}
          </button>
        </form>

        <div className="border-t border-[#e7e5e1] pt-4 text-center text-[13px] text-[#6b6b6b]">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-[#111111] font-semibold hover:text-[#d4421f] underline ml-1">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
