import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export default function SessionReportView() {
  const navigate = useNavigate();
  const { practiceState, startNewPracticeSession } = useAppStore();

  const overallScore = 85;
  const dateStr = '10 Oct 2026';
  const modeStr = practiceState.mode || 'Quick practice';

  // Readiness chip
  const readiness = overallScore >= 80
    ? { label: 'Interview ready', cls: 'chip-strong' }
    : overallScore >= 60
    ? { label: 'Almost there', cls: 'chip-partial' }
    : { label: 'Needs practice', cls: 'chip-gap' };

  // Category scores
  const categoryScores = [
    { name: 'Technical', score: 88 },
    { name: 'Behavioral', score: 84 },
    { name: 'Situational', score: 82 },
    { name: 'HR & culture', score: 86 },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handlePracticeWeakest = () => {
    startNewPracticeSession('Weak areas drill', 3);
    navigate('/practice');
  };

  const handleTryDifferent = () => {
    navigate('/questions');
  };

  const handlePracticeAgain = () => {
    startNewPracticeSession('Quick practice', 5);
    navigate('/practice');
  };

  return (
    <div className="content-container pt-11 pb-24 space-y-8">
      {/* 7.10 Header: Date and mode, big overall score and readiness chip, comparison line */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#e7e5e1] pb-6">
        <div className="space-y-1">
          <span className="eyebrow block">
            {dateStr} · {modeStr}
          </span>
          <h2 className="h2-title text-[#111111]">Session report</h2>
          <p className="text-[14px] text-[#6b6b6b]">
            +6% improvement compared to your previous preparation session.
          </p>
        </div>

        <div className="text-left sm:text-right">
          <div className="flex items-baseline gap-2 justify-start sm:justify-end">
            <span className="score-big text-[#111111]">{overallScore}</span>
            <span className={`chip ${readiness.cls}`}>{readiness.label}</span>
          </div>
          <span className="text-[13px] text-[#6b6b6b] block mt-1">Overall session score</span>
        </div>
      </div>

      {/* Three stat cards: estimated percentile, filler word %, words per minute */}
      <div className="grid-three-up">
        <div className="spec-card space-y-1">
          <span className="text-[13px] font-medium text-[#6b6b6b]">Estimated percentile</span>
          <div className="stat-number text-[#111111]">88th</div>
          <span className="text-[12px] text-[#6b6b6b]">Top tier among candidates</span>
        </div>

        <div className="spec-card space-y-1">
          <span className="text-[13px] font-medium text-[#6b6b6b]">Filler word rate</span>
          <div className="stat-number text-[#111111]">2.6%</div>
          <span className="text-[12px] text-[#6b6b6b]">Within executive threshold</span>
        </div>

        <div className="spec-card space-y-1">
          <span className="text-[13px] font-medium text-[#6b6b6b]">Speaking pace</span>
          <div className="stat-number text-[#111111]">132</div>
          <span className="text-[12px] text-[#6b6b6b]">Target words per minute</span>
        </div>
      </div>

      {/* Two cards: Score by category & Strengths/Critical/Recommendations */}
      <div className="grid-two-up">
        {/* Card 1: Score by category (strongest and weakest named) */}
        <div className="spec-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="h3-card text-[#111111]">Score by category</h3>
            <span className="text-[12px] text-[#6b6b6b]">Strongest: Technical · Weakest: Situational</span>
          </div>

          <div className="space-y-3 pt-1">
            {categoryScores.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#111111] font-medium">{cat.name}</span>
                  <span className="text-[#6b6b6b] font-medium">{cat.score}%</span>
                </div>
                <div className="spec-progress-track">
                  <div className="spec-progress-bar" style={{ width: `${cat.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Strengths, Critical areas, Recommendations */}
        <div className="spec-card space-y-4">
          <div className="space-y-1">
            <span className="eyebrow block text-[#2f7d4f]">Demonstrated Strengths</span>
            <p className="text-[13px] text-[#111111]">
              Consistent architectural vocabulary, structured STAR behavioral responses, and concise articulation of technical trade-offs.
            </p>
          </div>

          <div className="space-y-1 border-t border-[#e7e5e1] pt-3">
            <span className="eyebrow block text-[#b3261e]">Critical Areas</span>
            <p className="text-[13px] text-[#111111]">
              Situational incident response needs deeper operational metric citations (e.g. latency percentiles and rollback triggers).
            </p>
          </div>

          <div className="space-y-1 border-t border-[#e7e5e1] pt-3">
            <span className="eyebrow block text-[#111111]">Recommendations</span>
            <p className="text-[13px] text-[#6b6b6b]">
              Practice Docker multi-stage container optimization questions and review Redis distributed lock patterns.
            </p>
          </div>
        </div>
      </div>

      {/* Question Results List */}
      <div className="spec-card space-y-3">
        <h3 className="h3-card text-[#111111]">Question performance</h3>
        <div className="divide-y divide-[#e7e5e1] text-[14px]">
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-[#111111] font-medium">1. Database caching & concurrency in FastAPI</span>
            <span className="font-serif font-medium text-[#111111]">88%</span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-[#111111] font-medium">2. Docker multi-stage builds and container footprint</span>
            <span className="font-serif font-medium text-[#111111]">80%</span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-[#111111] font-medium">3. Architectural trade-offs between PostgreSQL and MongoDB</span>
            <span className="font-serif font-medium text-[#111111]">85%</span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-[#111111] font-medium">4. Project deadline risk under technical roadblocks (STAR)</span>
            <span className="font-serif font-medium text-[#111111]">86%</span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-[#111111] font-medium">5. Production 500% latency spike incident triage</span>
            <span className="text-[12px] text-[#6b6b6b] italic">Skipped</span>
          </div>
        </div>
      </div>

      {/* Buttons (Hidden when printing via @media print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#e7e5e1] no-print">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePracticeWeakest}
            className="btn-secondary text-[13px]"
          >
            Practice weakest area
          </button>
          <button
            type="button"
            onClick={handleTryDifferent}
            className="btn-secondary text-[13px]"
          >
            Try different questions
          </button>
          <button
            type="button"
            onClick={handlePracticeAgain}
            className="btn-secondary text-[13px]"
          >
            Practice again
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="btn-secondary text-[13px]"
          >
            Download report (PDF)
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="btn-primary"
        >
          Back to dashboard
        </button>
      </div>
    </div>
  );
}
