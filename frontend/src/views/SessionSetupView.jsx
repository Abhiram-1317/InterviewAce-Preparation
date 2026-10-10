import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { sessionApi, practiceApi } from '../api';
import { useAppStore } from '../store/useAppStore';
import {
  PlayCircle,
  Sliders,
  Sparkles,
  CheckCircle2,
  Brain,
  Shield,
  Layers,
  HelpCircle,
  FileText,
  Briefcase,
} from 'lucide-react';

export default function SessionSetupView() {
  const navigate = useNavigate();
  const { resumeId, jdId, parsedResume, parsedJd, setActiveSession } = useAppStore();

  const [sessionName, setSessionName] = useState('Full Stack Mock Interview');
  const [difficulty, setDifficulty] = useState('Medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [categories, setCategories] = useState({
    technical: true,
    behavioral: true,
    situational: true,
    hr: false,
  });
  const [loading, setLoading] = useState(false);

  const toggleCategory = (cat) => {
    setCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleStartSession = async (e) => {
    e.preventDefault();
    setLoading(true);

    const activeCategories = Object.keys(categories).filter((c) => categories[c]);
    if (activeCategories.length === 0) {
      toast.warning('Please select at least one question category.');
      setLoading(false);
      return;
    }

    try {
      // 1. Create Session
      const sessionPayload = {
        title: sessionName,
        difficulty: difficulty.toLowerCase(),
        total_questions: numQuestions,
        categories: activeCategories,
        resume_id: resumeId || null,
        jd_id: jdId || null,
      };

      const sessionRes = await sessionApi.createSession(sessionPayload);
      const newSessionId = sessionRes.session_id || sessionRes.id;

      // 2. Generate Questions
      toast.info('Generating tailored interview questions with AI...');
      const questionsRes = await practiceApi.generateQuestions(newSessionId);
      
      const fullSession = {
        ...sessionRes,
        session_id: newSessionId,
        questions: questionsRes.questions || questionsRes || [],
      };

      setActiveSession(fullSession);
      toast.success('Interview session ready! Commencing practice...');
      navigate('/practice');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to initialize session. Using simulated session.');
      
      // Fallback simulated session for reliable demo
      const fallbackSession = {
        session_id: `sess_sim_${Date.now()}`,
        title: sessionName,
        difficulty: difficulty.toLowerCase(),
        total_questions: 3,
        questions: [
          {
            question_id: 'q1',
            category: 'technical',
            difficulty: 'Medium',
            question: 'How do you handle database concurrency and race conditions when multiple workers update a shared resource in FastAPI and MongoDB?',
            expected_answer_key_points: [
              'Optimistic concurrency control with version tags',
              'Atomic operations using findAndModify or $inc',
              'Distributed locking with Redis (Redlock algorithm)',
              'Idempotency keys on incoming HTTP requests'
            ],
            hints: ['Mention Redis distributed locks and atomic MongoDB operators.'],
          },
          {
            question_id: 'q2',
            category: 'behavioral',
            difficulty: 'Medium',
            question: 'Describe a situation where you had a strong technical disagreement with a team member about system architecture. How did you resolve it?',
            expected_answer_key_points: [
              'Structured trade-off analysis (STAR method)',
              'Objective benchmarking or proof of concept',
              'Respectful communication and consensus building',
              'Commitment to team velocity once decided'
            ],
            hints: ['Use the STAR framework: Situation, Task, Action, Result.'],
          },
          {
            question_id: 'q3',
            category: 'situational',
            difficulty: 'Hard',
            question: 'Your microservice API experiences an unexpected 10x traffic spike causing connection pool exhaustion. What immediate steps do you take to stabilize the system?',
            expected_answer_key_points: [
              'Rate limiting and circuit breaker activation',
              'Connection pool sizing adjustments and backpressure',
              'Horizontal autoscaling of stateless containers',
              'Cache aggressive fallback for read queries'
            ],
            hints: ['Discuss circuit breakers, Redis caching, and connection pooling.'],
          },
        ],
      };
      setActiveSession(fallbackSession);
      navigate('/practice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Sliders className="w-3.5 h-3.5" />
          <span>Session Configurator</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Configure Practice Session</h1>
        <p className="text-sm text-slate-400 mt-1 max-w-xl">
          Customize question difficulty, category composition, and depth to match your interview preparation targets.
        </p>
      </div>

      <form onSubmit={handleStartSession} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Session Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Session Title
          </label>
          <input
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="e.g. Senior Backend Architecture Mock"
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Difficulty Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Target Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficulty(diff)}
                className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  difficulty === diff
                    ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Question Categories Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Question Dimensions & Categories
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'technical', label: 'Technical', desc: 'Coding & Architecture' },
              { id: 'behavioral', label: 'Behavioral', desc: 'STAR Framework' },
              { id: 'situational', label: 'Situational', desc: 'System Incidents' },
              { id: 'hr', label: 'HR / Culture', desc: 'Values & Team Fit' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                  categories[cat.id]
                    ? 'bg-indigo-600/15 border-indigo-500/60 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs">{cat.label}</span>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${categories[cat.id] ? 'text-indigo-400' : 'text-slate-600'}`} />
                </div>
                <span className="text-[10px] text-slate-400">{cat.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Number of Questions Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-300">
              Total Questions in Session
            </label>
            <span className="font-mono text-sm font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-indigo-500/20">
              {numQuestions} questions
            </span>
          </div>
          <input
            type="range"
            min={3}
            max={10}
            step={1}
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
            className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-[11px] text-slate-500 mt-1">
            <span>Quick Blitz (3)</span>
            <span>Standard (5)</span>
            <span>Comprehensive (10)</span>
          </div>
        </div>

        {/* Profile Context Indicators */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-300">
              Resume Context: {parsedResume ? 'Active (Personalized)' : 'Default Profile'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-purple-400" />
            <span className="text-slate-300">
              Target JD: {parsedJd ? parsedJd.role_title || 'Configured' : 'General Tech'}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-700 text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
        >
          <PlayCircle className="w-5 h-5" />
          <span>{loading ? 'Synthesizing Questions with AI...' : 'Begin Mock Interview Session'}</span>
        </button>
      </form>
    </div>
  );
}
