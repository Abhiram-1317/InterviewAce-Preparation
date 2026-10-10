import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export default function FeedbackView() {
  const navigate = useNavigate();
  const {
    questions,
    practiceState,
    setPracticeState,
    settings,
  } = useAppStore();

  const {
    currentIndex,
    totalQuestions,
    activeQuestion,
    evaluations,
  } = practiceState;

  const currentEval = evaluations[activeQuestion?.id] || {
    overallScore: 84,
    dimensionScores: {
      relevance: 90,
      completeness: 82,
      specificity: 85,
      structure: 80,
      communication: 85,
    },
    studentAnswer: practiceState.studentAnswer || 'In our microservices architecture, we implemented Redis as a cache-aside layer in front of MongoDB, reducing p95 latency by 45%.',
    wordCount: practiceState.wordCount || 85,
    fillerCount: practiceState.fillerCount || 2,
  };

  const isLastQuestion = currentIndex >= totalQuestions - 1;

  // Filler % and Pace
  const fillerPct = currentEval.wordCount > 0
    ? ((currentEval.fillerCount / currentEval.wordCount) * 100).toFixed(1)
    : '0.0';
  const paceWpm = Math.round((currentEval.wordCount / 45) * 60) || 128;

  // 5 Dimension scores
  const dimensions = [
    { label: 'Relevance', score: currentEval.dimensionScores.relevance },
    { label: 'Completeness', score: currentEval.dimensionScores.completeness },
    { label: 'Specificity', score: currentEval.dimensionScores.specificity },
    { label: 'Structure', score: currentEval.dimensionScores.structure },
    { label: 'Communication', score: currentEval.dimensionScores.communication },
  ];

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      navigate('/reports');
    } else {
      const nextIndex = currentIndex + 1;
      const nextQuestion = questions[nextIndex] || questions[0];
      setPracticeState({
        currentIndex: nextIndex,
        activeQuestion: nextQuestion,
        studentAnswer: '',
        wordCount: 0,
        fillerCount: 0,
        matchedRubricIndices: [],
        hintKeywordsRevealed: false,
        timeRemaining: 180,
        isTimeUp: false,
      });
      navigate('/practice');
    }
  };

  const handleReattempt = () => {
    setPracticeState({
      studentAnswer: '',
      wordCount: 0,
      fillerCount: 0,
      matchedRubricIndices: [],
      hintKeywordsRevealed: false,
      timeRemaining: 180,
      isTimeUp: false,
    });
    navigate('/practice');
  };

  return (
    <div className="content-container pt-11 pb-24 space-y-8">
      {/* Question text on left, Big score out of 100 on right */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-[#e7e5e1] pb-6">
        <div className="space-y-2 max-w-xl">
          <span className="eyebrow block">
            Question {currentIndex + 1} of {totalQuestions} · Evaluated
          </span>
          <h2 className="h2-title text-[#111111]">
            {activeQuestion?.question}
          </h2>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <div className="score-big text-[#111111] leading-none">
            {currentEval.overallScore}
            <span className="text-[24px] font-sans font-normal text-[#6b6b6b]">/100</span>
          </div>
          <span className="text-[13px] text-[#6b6b6b] block mt-1">
            Rubric score
          </span>
        </div>
      </div>

      {/* Chips: filler word %, pace in wpm, interviewer style */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="chip">{fillerPct}% fillers</span>
        <span className="chip">{paceWpm} words per minute</span>
        <span className="chip">{settings.interviewerStyle}</span>
      </div>

      {/* Card with five labelled bars */}
      <div className="spec-card space-y-4">
        <h3 className="h3-card text-[#111111]">Evaluation breakdown</h3>
        <div className="space-y-3 pt-1">
          {dimensions.map((dim) => (
            <div key={dim.label} className="space-y-1">
              <div className="flex justify-between text-[13px]">
                <span className="text-[#111111] font-medium">{dim.label}</span>
                <span className="text-[#6b6b6b] font-medium">{dim.score}%</span>
              </div>
              <div className="spec-progress-track">
                <div
                  className="spec-progress-bar"
                  style={{ width: `${dim.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two cards: Your answer and Suggested answer */}
      <div className="grid-two-up items-start">
        <div className="spec-card space-y-2">
          <span className="eyebrow block">Your answer</span>
          <p className="text-[14px] text-[#111111] leading-relaxed whitespace-pre-wrap">
            {currentEval.studentAnswer || 'No answer recorded.'}
          </p>
        </div>

        <div className="spec-card space-y-2">
          <span className="eyebrow block">Suggested answer</span>
          <p className="text-[14px] text-[#111111] leading-relaxed">
            {activeQuestion?.explanation} {activeQuestion?.concept}
          </p>
        </div>
      </div>

      {/* Three cards: Strong points, Missing points (red chips), Improvement tip */}
      <div className="grid-three-up">
        <div className="spec-card space-y-2">
          <h3 className="h3-card text-[#111111]">Strong points</h3>
          <p className="text-[13px] text-[#6b6b6b]">
            Articulated practical system design trade-offs and correctly referenced async database drivers.
          </p>
        </div>

        <div className="spec-card space-y-2">
          <h3 className="h3-card text-[#111111]">Missing points</h3>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="chip chip-gap">Cache stampede</span>
            <span className="chip chip-gap">TTL expiration</span>
          </div>
        </div>

        <div className="spec-card space-y-2">
          <h3 className="h3-card text-[#111111]">Improvement tip</h3>
          <p className="text-[13px] text-[#6b6b6b]">
            Quantify operational thresholds (e.g., connection pool size limits or p99 target ms) to reinforce seniority.
          </p>
        </div>
      </div>

      {/* Buttons: Re-attempt, primary Next question, ghost End session */}
      <div className="flex items-center justify-between pt-2 border-t border-[#e7e5e1]">
        <button
          type="button"
          onClick={handleReattempt}
          className="btn-secondary"
        >
          Re-attempt
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/reports')}
            className="btn-ghost"
          >
            End session
          </button>
          <button
            type="button"
            onClick={handleNextQuestion}
            className="btn-primary"
          >
            {isLastQuestion ? 'Finish and see report' : 'Next question'}
          </button>
        </div>
      </div>
    </div>
  );
}
