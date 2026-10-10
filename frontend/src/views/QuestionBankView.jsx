import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export default function QuestionBankView() {
  const navigate = useNavigate();
  const {
    questions,
    bookmarkedIds,
    toggleBookmark,
    drillIds,
    toggleDrill,
    startNewPracticeSession,
    showToast,
  } = useAppStore();

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [expandedAnswers, setExpandedAnswers] = useState({});

  const toggleExpandAnswer = (id) => {
    setExpandedAnswers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter and order: gap skills first as specified in PDF 7.7
  const filteredQuestions = useMemo(() => {
    return questions
      .filter((q) => {
        if (categoryFilter !== 'All' && q.category !== categoryFilter) return false;
        if (difficultyFilter !== 'All' && q.difficulty !== difficultyFilter) return false;
        if (onlyBookmarked && !bookmarkedIds.includes(q.id)) return false;
        return true;
      })
      .sort((a, b) => {
        const order = { gap: 1, partial: 2, strong: 3 };
        return (order[a.skill_status] || 3) - (order[b.skill_status] || 3);
      });
  }, [questions, categoryFilter, difficultyFilter, onlyBookmarked, bookmarkedIds]);

  const handlePracticeSingle = (q) => {
    startNewPracticeSession('Single Question', 1);
    navigate('/practice');
  };

  const handleStartDrill = () => {
    if (drillIds.length === 0) {
      showToast('Add questions to drill list first');
      return;
    }
    startNewPracticeSession('Custom Drill', drillIds.length);
    navigate('/practice');
  };

  const handleStartPracticeAll = () => {
    startNewPracticeSession('Quick practice', 5);
    navigate('/practice');
  };

  return (
    <div className="content-container pt-11 pb-24 space-y-6">
      {/* Intro line with question count, ordered by relevance (gap skills first) */}
      <div className="border-b border-[#e7e5e1] pb-4">
        <h2 className="h2-title text-[#111111]">Question bank</h2>
        <p className="text-[14px] text-[#6b6b6b] mt-0.5">
          {filteredQuestions.length} questions tailored to your profile, ordered by priority (gap skills first).
        </p>
      </div>

      {/* Filter Rows: category, difficulty, bookmarked toggle */}
      <div className="space-y-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[12px] font-medium text-[#6b6b6b] mr-1">Category:</span>
          {['All', 'Technical', 'Behavioral', 'Situational', 'HR & culture'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={categoryFilter === cat ? 'btn-primary py-1 px-3 text-[13px]' : 'btn-secondary py-1 px-3 text-[13px]'}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Difficulty Pills and Bookmark Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-medium text-[#6b6b6b] mr-1">Difficulty:</span>
            {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficultyFilter(diff)}
                className={difficultyFilter === diff ? 'btn-primary py-1 px-3 text-[13px]' : 'btn-secondary py-1 px-3 text-[13px]'}
              >
                {diff}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setOnlyBookmarked(!onlyBookmarked)}
            className={onlyBookmarked ? 'btn-primary py-1 px-3 text-[13px]' : 'btn-secondary py-1 px-3 text-[13px]'}
          >
            {onlyBookmarked ? '★ Showing Bookmarked' : '☆ Bookmarked only'}
          </button>
        </div>
      </div>

      {/* One Card Containing List of Questions */}
      <div className="spec-card p-0 overflow-hidden divide-y divide-[#e7e5e1]">
        {filteredQuestions.map((q) => {
          const isBookmarked = bookmarkedIds.includes(q.id);
          const isDrill = drillIds.includes(q.id);
          const isExpanded = !!expandedAnswers[q.id];

          return (
            <div key={q.id} className="p-5 space-y-3 bg-white hover:bg-[#faf9f6]/40 transition-colors">
              {/* Question Header: Text in bold and star bookmark on the right */}
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-[15px] font-semibold text-[#111111] leading-snug">
                  {q.question}
                </h3>
                <button
                  type="button"
                  onClick={() => toggleBookmark(q.id)}
                  aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark question'}
                  className="text-[18px] text-[#111111] hover:text-[#d4421f] cursor-pointer shrink-0 transition-colors"
                >
                  {isBookmarked ? '★' : '☆'}
                </button>
              </div>

              {/* Chips for Category, Difficulty, and Related Skills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="chip">{q.category}</span>
                <span className="chip">{q.difficulty}</span>

                {q.related_skills.map((skill) => (
                  <span
                    key={skill}
                    className={`chip ${
                      q.skill_status === 'gap'
                        ? 'chip-gap'
                        : q.skill_status === 'partial'
                        ? 'chip-partial'
                        : 'chip-strong'
                    }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Muted one-line "Why this question" note */}
              <p className="text-[13px] text-[#6b6b6b]">
                {q.why_note}
              </p>

              {/* Actions row: View answer, Practice this, Add to drill */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => toggleExpandAnswer(q.id)}
                  className="btn-secondary py-1 px-2.5 text-[12px]"
                >
                  {isExpanded ? 'Hide answer' : 'View answer'}
                </button>
                <button
                  type="button"
                  onClick={() => handlePracticeSingle(q)}
                  className="btn-secondary py-1 px-2.5 text-[12px]"
                >
                  Practice this
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toggleDrill(q.id);
                    showToast(isDrill ? 'Removed from drill' : 'Added to drill');
                  }}
                  className={`py-1 px-2.5 text-[12px] rounded-[6px] border transition-colors cursor-pointer ${
                    isDrill
                      ? 'bg-[#111111] text-white border-[#111111]'
                      : 'bg-white text-[#111111] border-[#e7e5e1] hover:border-[#111111]'
                  }`}
                >
                  {isDrill ? 'In drill' : 'Add to drill'}
                </button>
              </div>

              {/* Expanded Answer Panel */}
              {isExpanded && (
                <div className="answer-panel space-y-3 mt-3 animate-fade-rise text-[13px]">
                  {q.category === 'Technical' ? (
                    <div className="space-y-2">
                      <div>
                        <span className="eyebrow block">Concept</span>
                        <p className="text-[#111111] font-medium">{q.concept}</p>
                      </div>
                      <div>
                        <span className="eyebrow block">Explanation</span>
                        <p className="text-[#111111]">{q.explanation}</p>
                      </div>
                      <div>
                        <span className="eyebrow block">Connect to your project</span>
                        <p className="text-[#6b6b6b]">{q.connect_project}</p>
                      </div>
                      <div>
                        <span className="eyebrow block">Likely follow-up</span>
                        <p className="text-[#6b6b6b] italic">{q.likely_followup}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div>
                        <span className="eyebrow block">Approach</span>
                        <p className="text-[#111111] font-medium">{q.concept}</p>
                      </div>
                      <div className="space-y-1 pt-1">
                        <span className="eyebrow block">STAR Response Outline</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
                          <div className="bg-white p-2 rounded-[4px] border border-[#e7e5e1]">
                            <strong className="text-[#d4421f]">Situation:</strong> Define project context and urgency.
                          </div>
                          <div className="bg-white p-2 rounded-[4px] border border-[#e7e5e1]">
                            <strong className="text-[#d4421f]">Task:</strong> State your specific technical responsibility.
                          </div>
                          <div className="bg-white p-2 rounded-[4px] border border-[#e7e5e1]">
                            <strong className="text-[#d4421f]">Action:</strong> Explain the exact steps and trade-offs made.
                          </div>
                          <div className="bg-white p-2 rounded-[4px] border border-[#e7e5e1]">
                            <strong className="text-[#d4421f]">Result:</strong> Quantify the outcome and key team learnings.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredQuestions.length === 0 && (
          <div className="p-12 text-center text-[14px] text-[#6b6b6b]">
            No questions match your current filter settings.
          </div>
        )}
      </div>

      {/* Bottom Buttons: Back to skill gap, Start drill (count), and primary Start practice */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={() => navigate('/skill-gap')}
          className="btn-secondary"
        >
          Back to skill gap
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleStartDrill}
            className="btn-secondary"
          >
            Start drill ({drillIds.length})
          </button>
          <button
            type="button"
            onClick={handleStartPracticeAll}
            className="btn-primary"
          >
            Start practice
          </button>
        </div>
      </div>
    </div>
  );
}
