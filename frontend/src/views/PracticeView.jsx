import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export default function PracticeView() {
  const navigate = useNavigate();
  const {
    questions,
    practiceState,
    setPracticeState,
    startNewPracticeSession,
    showToast,
  } = useAppStore();

  const [inSetupMode, setInSetupMode] = useState(!practiceState.activeQuestion);
  const [selectedSetupOption, setSelectedSetupOption] = useState('quick');
  const [categorySelect, setCategorySelect] = useState('Technical');

  const {
    mode,
    totalQuestions,
    currentIndex,
    activeQuestion,
    timeRemaining,
    isTimeUp,
    studentAnswer,
    wordCount,
    fillerCount,
    matchedRubricIndices,
    hintKeywordsRevealed,
    isSpeaking,
  } = practiceState;

  const recognitionRef = useRef(null);

  // Setup options
  const setupCards = [
    { id: 'quick', title: 'Quick practice', desc: '5 questions for a focused drill' },
    { id: 'full', title: 'Full mock interview', desc: 'Up to 15 questions covering full role scope' },
    { id: 'category', title: 'Category focus', desc: 'Targeted single-domain practice' },
    { id: 'weak', title: 'Weak areas', desc: 'Drill your lowest-scoring competency' },
  ];

  // Timer: 3:00 countdown per question
  useEffect(() => {
    if (inSetupMode) return;

    const timer = setInterval(() => {
      setPracticeState({
        timeRemaining: Math.max(0, timeRemaining - 1),
        isTimeUp: timeRemaining <= 1,
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [inSetupMode, timeRemaining, setPracticeState]);

  // Live words & filler counter and rubric matching
  const handleTextChange = (text) => {
    const words = text.trim() ? text.trim().split(/\s+/) : [];
    const wCount = words.length;

    // Detect common English filler words
    const fillerRegex = /\b(um|uh|like|you know|basically|actually|literally|sort of|kind of|i mean)\b/gi;
    const fillerMatches = text.match(fillerRegex);
    const fCount = fillerMatches ? fillerMatches.length : 0;

    // Live rubric matching: check if key points are mentioned in text
    const rubric = activeQuestion?.expected_rubric || [];
    const lowerText = text.toLowerCase();
    const matched = [];

    rubric.forEach((item, idx) => {
      const keywords = item.toLowerCase().split(' ').filter((w) => w.length > 3);
      const isMatched = keywords.some((kw) => lowerText.includes(kw));
      if (isMatched) matched.push(idx);
    });

    setPracticeState({
      studentAnswer: text,
      wordCount: wCount,
      fillerCount: fCount,
      matchedRubricIndices: matched,
    });
  };

  // Browser Speech API integration
  const toggleSpeech = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Mock voice input fallback
      const sampleAddition = ' When architecting high concurrency, we configure Redis caching and horizontal worker scaling.';
      handleTextChange(studentAnswer + sampleAddition);
      showToast('Voice transcription simulated');
      return;
    }

    if (isSpeaking) {
      recognitionRef.current?.stop();
      setPracticeState({ isSpeaking: false });
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              transcript += event.results[i][0].transcript + ' ';
            }
          }
          if (transcript) {
            handleTextChange(studentAnswer + ' ' + transcript);
          }
        };

        recognition.onerror = () => {
          setPracticeState({ isSpeaking: false });
        };
        recognition.onend = () => {
          setPracticeState({ isSpeaking: false });
        };

        recognition.start();
        recognitionRef.current = recognition;
        setPracticeState({ isSpeaking: true });
        showToast('Listening...');
      } catch (err) {
        setPracticeState({ isSpeaking: false });
      }
    }
  };

  const handleStartPracticeFromSetup = () => {
    let count = 5;
    let selectedMode = 'Quick practice';

    if (selectedSetupOption === 'full') {
      count = 13;
      selectedMode = 'Full mock interview';
    } else if (selectedSetupOption === 'category') {
      selectedMode = `Category focus (${categorySelect})`;
    } else if (selectedSetupOption === 'weak') {
      selectedMode = 'Weak areas';
    }

    startNewPracticeSession(selectedMode, count);
    setInSetupMode(false);
  };

  const handleHintClick = () => {
    setPracticeState({ hintKeywordsRevealed: !hintKeywordsRevealed });
  };

  const handleSubmitAnswer = () => {
    if (wordCount < 3) {
      showToast('Submit needs at least 3 words');
      return;
    }

    // Stop speech if running
    if (isSpeaking) {
      recognitionRef.current?.stop();
    }

    // Calculate score for this question (Section 7.9)
    const relevance = Math.min(100, Math.round((matchedRubricIndices.length / Math.max(1, activeQuestion.expected_rubric?.length || 4)) * 100));
    const completeness = Math.min(100, Math.round((wordCount / 110) * 100));
    const specificity = studentAnswer.match(/\b\d+\b/g) ? 88 : 75;
    const structure = (studentAnswer.includes('first') || studentAnswer.includes('then') || studentAnswer.includes('result')) ? 90 : 80;
    const communication = Math.max(65, 95 - fillerCount * 4);
    const overallScore = Math.round((relevance + completeness + specificity + structure + communication) / 5);

    setPracticeState({
      evaluations: {
        ...practiceState.evaluations,
        [activeQuestion.id]: {
          overallScore,
          dimensionScores: {
            relevance,
            completeness,
            specificity,
            structure,
            communication,
          },
          studentAnswer,
          wordCount,
          fillerCount,
        },
      },
    });

    navigate('/feedback');
  };

  const handleSkip = () => {
    navigate('/feedback');
  };

  const handleEndSession = () => {
    navigate('/reports');
  };

  // Format time mm:ss
  const formatTime = (seconds) => {
    if (seconds <= 0) return 'Time is up';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Render Setup Screen
  if (inSetupMode) {
    return (
      <div className="content-container pt-11 pb-24 space-y-8">
        <div>
          <h2 className="h2-title text-[#111111]">Practice setup</h2>
          <p className="text-[15px] text-[#6b6b6b] mt-0.5">
            Choose an interview mode to start practicing with voice or text responses.
          </p>
        </div>

        {/* Four Selectable Option Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {setupCards.map((card) => (
            <div
              key={card.id}
              onClick={() => setSelectedSetupOption(card.id)}
              className={`option-card space-y-1.5 ${
                selectedSetupOption === card.id ? 'selected' : ''
              }`}
            >
              <h3 className="h3-card text-[#111111]">{card.title}</h3>
              <p className="text-[13px] text-[#6b6b6b]">{card.desc}</p>

              {card.id === 'category' && selectedSetupOption === 'category' && (
                <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={categorySelect}
                    onChange={(e) => setCategorySelect(e.target.value)}
                    className="spec-select text-[13px] py-1.5"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Behavioral">Behavioral</option>
                    <option value="Situational">Situational</option>
                    <option value="HR & culture">HR & culture</option>
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleStartPracticeFromSetup}
            className="btn-primary"
          >
            Start practice
          </button>
        </div>
      </div>
    );
  }

  // Render Live Question Screen (PDF 7.8)
  const currentNum = currentIndex + 1;
  const progressPct = ((currentNum) / totalQuestions) * 100;
  const rubricList = activeQuestion?.expected_rubric || [];

  return (
    <div className="content-container pt-11 pb-24 space-y-6">
      {/* Top Row: "Question n of N · mode" and countdown timer (3:00) */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between text-[14px]">
          <span className="font-medium text-[#111111]">
            Question {currentNum} of {totalQuestions} · {mode}
          </span>
          <span
            className={`font-mono text-[14px] font-medium ${
              isTimeUp ? 'text-[#b3261e]' : 'text-[#111111]'
            }`}
          >
            {formatTime(timeRemaining)}
          </span>
        </div>

        {/* Thin progress bar */}
        <div className="spec-progress-track">
          <div className="spec-progress-bar" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Main Card */}
      <div className="spec-card space-y-5">
        {/* Category & difficulty chips */}
        <div className="flex items-center gap-2">
          <span className="chip">{activeQuestion.category}</span>
          <span className="chip">{activeQuestion.difficulty}</span>
        </div>

        {/* The question in h2 */}
        <h2 className="h2-title text-[#111111]">
          {activeQuestion.question}
        </h2>

        {/* 200px textarea */}
        <div className="space-y-2">
          <textarea
            rows={8}
            value={studentAnswer}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Type your answer, or click 'Speak' to answer by voice..."
            className="spec-textarea h-[200px] text-[15px] leading-relaxed"
          />

          {/* Live line "x words · y filler" */}
          <div className="flex items-center justify-between text-[13px] text-[#6b6b6b]">
            <span>
              {wordCount} words · {fillerCount} filler {fillerCount === 1 ? 'word' : 'words'}
            </span>
            <span>
              {wordCount < 3 ? 'Min 3 words required' : 'Ready to submit'}
            </span>
          </div>
        </div>

        {/* Rubric chips under textarea: one chip per key point */}
        <div className="space-y-1.5 pt-1">
          <span className="eyebrow block">Rubric points (turns green when mentioned)</span>
          <div className="flex flex-wrap gap-2">
            {rubricList.map((point, idx) => {
              const isMatched = matchedRubricIndices.includes(idx);
              return (
                <span
                  key={idx}
                  className={`chip ${isMatched ? 'chip-strong' : ''}`}
                >
                  {isMatched ? `✔ ${point}` : point}
                </span>
              );
            })}
          </div>
        </div>

        {/* Hint Line */}
        {hintKeywordsRevealed && (
          <div className="answer-panel text-[13px] text-[#111111] space-y-1 animate-fade-rise">
            <span className="eyebrow block">Key Keywords</span>
            <p className="font-medium">{rubricList.slice(0, 3).join(' · ')}</p>
          </div>
        )}

        {/* Bottom Button Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#e7e5e1]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleHintClick}
              className="btn-secondary py-1.5 px-3 text-[13px]"
            >
              {hintKeywordsRevealed ? 'Hide hint' : 'Hint'}
            </button>
            <button
              type="button"
              onClick={toggleSpeech}
              className={`py-1.5 px-3 text-[13px] rounded-[6px] border font-medium cursor-pointer transition-colors ${
                isSpeaking
                  ? 'bg-[#b3261e] text-white border-[#b3261e]'
                  : 'bg-white text-[#111111] border-[#e7e5e1] hover:border-[#111111]'
              }`}
            >
              {isSpeaking ? 'Stop speaking' : 'Speak'}
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="btn-secondary py-1.5 px-3 text-[13px]"
            >
              Skip
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleEndSession}
              className="btn-ghost text-[13px]"
            >
              End session
            </button>
            <button
              type="button"
              onClick={handleSubmitAnswer}
              disabled={wordCount < 3}
              className="btn-primary"
            >
              Submit answer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
