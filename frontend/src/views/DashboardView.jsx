import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export default function DashboardView() {
  const navigate = useNavigate();
  const { user, sessionsHistory, startNewPracticeSession } = useAppStore();

  const firstName = user?.first_name || user?.full_name?.split(' ')[0] || user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Candidate';

  // Active unarchived sessions
  const activeSessions = sessionsHistory.filter((s) => !s.isArchived);
  const totalSessions = activeSessions.length;
  const questionsPracticed = totalSessions > 0
    ? activeSessions.reduce((acc, curr) => acc + (curr.questionsCount || 5), 0)
    : 0;

  const avgScore = totalSessions > 0
    ? Math.round(activeSessions.reduce((acc, curr) => acc + curr.score, 0) / totalSessions)
    : null;

  const verdict = avgScore === null
    ? '—'
    : avgScore >= 80
    ? 'Strong'
    : avgScore >= 60
    ? 'Rising'
    : 'Building';

  // SVG Line Chart points
  const scoreData = activeSessions.map((s) => s.score).reverse();
  const svgWidth = 420;
  const svgHeight = 130;
  const paddingX = 30;
  const paddingY = 20;

  const points = scoreData.map((val, idx) => {
    const x = paddingX + (idx / Math.max(1, scoreData.length - 1)) * (svgWidth - 2 * paddingX);
    const y = svgHeight - paddingY - ((val - 50) / 50) * (svgHeight - 2 * paddingY);
    return { x, y, val };
  });

  const polylineStr = points.map((p) => `${p.x},${p.y}`).join(' ');

  const handleStartPractice = () => {
    startNewPracticeSession('Quick practice', 5);
    navigate('/practice');
  };

  return (
    <div className="content-container pt-11 pb-24 space-y-8">
      {/* 7.4 Greeting & Top Action Buttons */}
      <div className="space-y-4">
        <div>
          <h2 className="h2-title text-[#111111]">Hi, {firstName}</h2>
          <p className="text-[15px] text-[#6b6b6b] mt-0.5">
            Start a new plan for a job, or pick up where you left off.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link to="/new-preparation" className="btn-primary">
            New preparation
          </Link>
          <button type="button" onClick={handleStartPractice} className="btn-secondary">
            Continue practice
          </button>
          <Link to="/reports" className="btn-secondary">
            View reports
          </Link>
        </div>
      </div>

      {/* Four Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="spec-card space-y-1">
          <span className="text-[13px] font-medium text-[#6b6b6b]">Preparation sessions</span>
          <div className="stat-number text-[#111111]">{totalSessions}</div>
        </div>

        <div className="spec-card space-y-1">
          <span className="text-[13px] font-medium text-[#6b6b6b]">Questions practised</span>
          <div className="stat-number text-[#111111]">{questionsPracticed}</div>
        </div>

        <div className="spec-card space-y-1">
          <span className="text-[13px] font-medium text-[#6b6b6b]">Average score</span>
          <div className="stat-number text-[#111111]">
            {avgScore !== null ? `${avgScore}%` : '—'}
          </div>
        </div>

        <div className="spec-card space-y-1">
          <span className="text-[13px] font-medium text-[#6b6b6b]">Interview verdict</span>
          <div className="stat-number text-[#111111]">{verdict}</div>
        </div>
      </div>

      {/* Two cards: Line chart & Recent sessions */}
      <div className="grid-two-up">
        {/* Card 1: Line chart of session scores with dots (SVG) */}
        <div className="spec-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="h3-card text-[#111111]">Score progression</h3>
            <span className="text-[13px] text-[#6b6b6b]">Past sessions</span>
          </div>

          {scoreData.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-[140px] overflow-visible"
              >
                {/* Horizontal guide lines */}
                <line x1="20" y1={paddingY} x2={svgWidth - 20} y2={paddingY} stroke="#e7e5e1" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="20" y1={svgHeight / 2} x2={svgWidth - 20} y2={svgHeight / 2} stroke="#e7e5e1" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="20" y1={svgHeight - paddingY} x2={svgWidth - 20} y2={svgHeight - paddingY} stroke="#e7e5e1" strokeWidth="1" />

                {/* Score line */}
                <polyline
                  fill="none"
                  stroke="#111111"
                  strokeWidth="2"
                  points={polylineStr}
                />

                {/* Dots with scores */}
                {points.map((pt, i) => (
                  <g key={i}>
                    <circle cx={pt.x} cy={pt.y} r="4" fill="#ffffff" stroke="#111111" strokeWidth="2" />
                    <text
                      x={pt.x}
                      y={pt.y - 8}
                      textAnchor="middle"
                      fill="#6b6b6b"
                      fontSize="10"
                      fontFamily="Public Sans, sans-serif"
                    >
                      {pt.val}%
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          ) : (
            <div className="py-8 text-center text-[13px] text-[#6b6b6b]">
              Complete your first session to see your score trajectory.
            </div>
          )}
        </div>

        {/* Card 2: Recent sessions */}
        <div className="spec-card space-y-3">
          <div className="flex items-center justify-between border-b border-[#e7e5e1] pb-2.5">
            <h3 className="h3-card text-[#111111]">Recent sessions</h3>
            <Link to="/history" className="text-[13px] text-[#6b6b6b] hover:text-[#111111]">
              View all
            </Link>
          </div>

          <div className="space-y-2">
            {activeSessions.slice(0, 5).map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => navigate('/reports')}
                className="w-full text-left p-2.5 rounded-[6px] border border-[#e7e5e1] hover:border-[#111111] bg-white transition-colors flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="text-[14px] font-semibold text-[#111111] flex items-center gap-2">
                    <span>{session.company}</span>
                    {session.isSample && <span className="chip text-[11px] py-0 px-1.5">Sample</span>}
                  </div>
                  <div className="text-[12px] text-[#6b6b6b] mt-0.5">
                    {session.role} · {session.date}
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-serif text-[18px] font-medium text-[#111111]">
                    {session.score}%
                  </span>
                </div>
              </button>
            ))}

            {activeSessions.length === 0 && (
              <p className="text-[13px] text-[#6b6b6b] py-6 text-center">
                No sessions completed yet. Start your first mock interview.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
