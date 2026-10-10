import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAppStore } from '../store/useAppStore';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  LayoutDashboard,
  BrainCircuit,
  TrendingUp,
} from 'lucide-react';
import ScoreGauge from '../components/ScoreGauge';

export default function SessionSummaryView() {
  const navigate = useNavigate();
  const { sessionSummary, activeSession } = useAppStore();

  const summary = sessionSummary || {
    overall_score: 86.5,
    total_questions: 5,
    questions_attempted: 5,
    readiness_rating: 'Ready',
    category_scores: {
      technical: 88,
      behavioral: 84,
      situational: 85,
      hr: 82,
    },
    top_strengths: [
      'Comprehensive understanding of distributed database caching and invalidation',
      'Structured behavioral communication using the STAR methodology',
      'Clear articulation of operational trade-offs and latency impact',
    ],
    focus_areas: [
      'Deepen coverage of distributed transaction protocols (e.g. 2PC, Saga)',
      'Include concrete monitoring metric thresholds when handling system spikes',
    ],
    personalized_recommendations: [
      'Review system design patterns for idempotency and distributed locking',
      'Conduct a targeted behavioral drill focusing on conflict resolution with product managers',
    ],
  };

  useEffect(() => {
    // Fire celebratory confetti on view
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  const ratingBadgeMap = {
    Ready: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    'Almost Ready': 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    'Needs Practice': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Celebration Header */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold"
        >
          <Award className="w-4 h-4" />
          <span>Practice Session Completed</span>
        </motion.div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Session Performance & Readiness Report
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Here is your comprehensive evaluation summary synthesized from all answered questions in this mock interview.
        </p>
      </div>

      {/* Hero Score Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl items-center"
      >
        <div className="md:col-span-5 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800 pb-6 md:pb-0">
          <ScoreGauge score={summary.overall_score} size={160} strokeWidth={14} label="Cumulative Session Score" />
          <div className="mt-4 flex flex-col items-center">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
              ratingBadgeMap[summary.readiness_rating] || ratingBadgeMap.Ready
            }`}>
              Rating: {summary.readiness_rating || 'Ready'}
            </span>
            <span className="text-xs text-slate-400 mt-2">
              {summary.questions_attempted} of {summary.total_questions} Questions Evaluated
            </span>
          </div>
        </div>

        {/* Category Breakdown (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <BrainCircuit className="w-4 h-4 text-indigo-400" />
            <span>Category Proficiency Breakdown</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {Object.entries(summary.category_scores || {}).map(([cat, score]) => (
              <div key={cat} className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                <span className="text-xs font-medium text-slate-400 capitalize">{cat}</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xl font-bold text-white">{Math.round(score)}%</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    {score >= 80 ? 'Mastery' : 'Developing'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400"
                    style={{ width: `${Math.min(100, score)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Strengths and Focus Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Strengths */}
        <div className="bg-slate-900/80 border border-emerald-500/20 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Demonstrated Strengths</h3>
          </div>
          <ul className="space-y-2 text-sm text-slate-300">
            {(summary.top_strengths || []).map((str, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Focus Areas */}
        <div className="bg-slate-900/80 border border-amber-500/20 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Growth & Focus Areas</h3>
          </div>
          <ul className="space-y-2 text-sm text-slate-300">
            {(summary.focus_areas || []).map((area, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400 mt-1">•</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Personalized Recommendations */}
      {summary.personalized_recommendations && (
        <div className="bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Personalized AI Action Plan</h3>
          </div>
          <ul className="space-y-2 text-sm text-slate-300">
            {summary.personalized_recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1 font-bold">→</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <Link
          to="/practice-setup"
          className="px-6 py-3 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Start Another Practice Session</span>
        </Link>
        <Link
          to="/dashboard"
          className="px-6 py-3 rounded-xl font-semibold text-sm bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 flex items-center gap-2 transition-all"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
