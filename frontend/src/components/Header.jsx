import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAppStore();

  const signedOutLinks = [
    { label: 'Home', path: '/' },
    { label: 'Features', path: '/#features', isAnchor: true },
    { label: 'How it works', path: '/#how-it-works', isAnchor: true },
    { label: 'Pricing', path: '/#pricing', isAnchor: true },
    { label: 'Login', path: '/login' },
    { label: 'Register', path: '/register' },
  ];

  const signedInLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'New preparation', path: '/new-preparation' },
    { label: 'Questions', path: '/questions' },
    { label: 'Practice', path: '/practice' },
    { label: 'Reports', path: '/reports' },
    { label: 'History', path: '/history' },
    { label: 'Settings', path: '/settings' },
  ];

  const handleAnchorClick = (path) => {
    if (path.startsWith('/#')) {
      const id = path.substring(2);
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const navLinks = isAuthenticated ? signedInLinks : signedOutLinks;

  return (
    <header className="sticky top-0 z-40 bg-white/94 backdrop-blur-sm border-b border-[#e7e5e1] px-7 py-3.5 transition-colors">
      <div className="max-w-[1000px] mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Left: Logo in Newsreader 23px with vermilion full stop */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-baseline select-none">
          <span className="font-serif text-[23px] font-medium tracking-tight text-[#111111]">
            InterviewAce
          </span>
          <span className="font-serif text-[23px] font-medium text-[#d4421f]">.</span>
        </Link>

        {/* Right: Navigation links */}
        <nav className="flex flex-wrap items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            if (link.isAnchor) {
              return (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => handleAnchorClick(link.path)}
                  className="nav-link cursor-pointer"
                >
                  <span className="nav-text">{link.label}</span>
                </button>
              );
            }
            return (
              <Link
                key={link.label}
                to={link.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <span className="nav-text">{link.label}</span>
              </Link>
            );
          })}

          {isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="text-[13px] font-normal text-[#6b6b6b] hover:text-[#111111] px-2.5 py-1.5 ml-1 transition-colors cursor-pointer"
            >
              Log out
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
