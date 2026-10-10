import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { analyticsApi, sessionApi } from '../api';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Award,
  Layers,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export default function AnalyticsView() {
  const [stats, setStats] = useState({
    total_sessions: 3,
    total_questions_practiced: 14,
    average_overall_score: 84.5,
    readiness_trend: 'Improving',
  });
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [overviewData, sessionData] = await Promise.allSettled([
        analyticsApi.getOverview(),
        sessionApi.getUserSessions(),
      ]);

      if (overviewData.status === 'fulfilled' && overviewData.value) {
        setStats(overviewData.value);
      }
      if (sessionData.status === 'fulfilled' && sessionData.value) {
        const list = Array.isArray(sessionData.value) ? sessionData.value : sessionData.value.sessions || [];
        setSessions(list);
      }
    } catch (err) {
      console.warn('Analytics notice:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mock progression timeline data
  const progressionData = [
    { date: 'Session 1', score: 68, technical: 70, behavioral: 65 },
    { date: 'Session 2', score: 76, technical: 80, behavioral: 72 },
    { date: 'Session 3', score: 82, technical: 85, behavioral: 78 },
    { date: 'Session 4', score: 86, technical: 88, behavioral: 84 },
    { date: 'Session 5', score: 89, technical: 92, behavioral: 86 },
  ];

  const categoryMastery = [
    { category: 'Technical Architecture', score: 88 },
    { category: 'Behavioral (STAR)', score: 84 },
    { category: 'Incident Management', score: 82 },
    { category: 'Culture & Communication', score: 90 },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Longitudinal Intelligence</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Performance Analytics</h1>
        <p className="text-sm text-slate-400 mt-1 max-w-xl">
          Track historical progression, score trajectories, and interview readiness over time.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Total Practice Runs</span>
          <div className="text-2xl font-bold text-white mt-1">{stats.total_sessions}</div>
          <span className="text-[11px] text-slate-500">Completed mock drills</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Questions Answered</span>
          <div className="text-2xl font-bold text-white mt-1">{stats.total_questions_practiced}</div>
          <span className="text-[11px] text-slate-500">Evaluated with rubrics</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Average Score</span>
          <div className="text-2xl font-bold text-indigo-400 mt-1">
            {stats.average_overall_score ? `${Math.round(stats.average_overall_score)}%` : '—'}
          </div>
          <span className="text-[11px] text-slate-500">Across all categories</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Trajectory Trend</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1 flex items-center gap-1">
            <span>{stats.readiness_trend}</span>
            <ArrowUpRight className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-[11px] text-slate-500">+18% gain over baseline</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Progression Line Chart */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Overall Score Progression</h3>
              <p className="text-xs text-slate-400">Session-over-session score trend</p>
            </div>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-medium">
              Upward Trajectory
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressionData}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis domain={[50, 100]} stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Overall Score"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="technical"
                  name="Technical"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Mastery Bar Chart */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Category Mastery Rates</h3>
              <p className="text-xs text-slate-400">Average performance by interview category</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryMastery} layout="vertical">
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis dataKey="category" type="category" stroke="#475569" tick={{ fill: '#cbd5e1', fontSize: 10 }} width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={(val) => [`${val}%`, 'Mastery']}
                />
                <Bar dataKey="score" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
