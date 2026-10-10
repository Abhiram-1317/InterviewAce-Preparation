import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, ArrowRight, Sparkles, BookOpen, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ScoreGauge from './ScoreGauge';
import DimensionScoresChart from './DimensionScoresChart';

export default function EvaluationModal({ evaluation, isOpen, onClose, onNext, isLastQuestion }) {
  if (!isOpen || !evaluation) return null;

  const {
    overall_score = 0,
    dimension_scores = {},
    strengths = [],
    weaknesses = [],
    key_missing_points = [],
    feedback = '',
    model_answer = '',
  } = evaluation;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                AI Evaluation & Scoring Report
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="overflow-y-auto p-6 space-y-6 flex-1">
            {/* Top Score Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-950/60 p-5 rounded-xl border border-slate-800/80">
              <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0">
                <ScoreGauge score={overall_score} size={130} label="Candidate Performance" />
                <span className={`mt-2 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  overall_score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                  overall_score >= 60 ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30' :
                  'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}>
                  {overall_score >= 80 ? 'Exemplary' : overall_score >= 60 ? 'Proficient' : 'Needs Development'}
                </span>
              </div>

              {/* 5 Dimensions Chart */}
              <div className="md:col-span-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  5-Dimension Evaluation Matrix
                </h4>
                <DimensionScoresChart scores={dimension_scores} />
              </div>
            </div>

            {/* Strengths & Focus Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Strengths */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-semibold text-emerald-300">Key Strengths</h4>
                </div>
                <ul className="space-y-2 text-sm text-slate-300">
                  {strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                  {strengths.length === 0 && (
                    <li className="text-slate-500 italic">No specific strengths highlighted</li>
                  )}
                </ul>
              </div>

              {/* Focus Areas & Missing Points */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-amber-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-semibold text-amber-300">Focus Areas & Missing Points</h4>
                </div>
                <ul className="space-y-2 text-sm text-slate-300">
                  {key_missing_points.map((pt, idx) => (
                    <li key={`missing-${idx}`} className="flex items-start gap-2 text-amber-200/90">
                      <span className="text-amber-400 mt-0.5">⚠</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                  {weaknesses.map((w, idx) => (
                    <li key={`weak-${idx}`} className="flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                  {key_missing_points.length === 0 && weaknesses.length === 0 && (
                    <li className="text-slate-500 italic">Comprehensive coverage achieved</li>
                  )}
                </ul>
              </div>
            </div>

            {/* General Feedback */}
            {feedback && (
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Evaluator Summary
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">{feedback}</p>
              </div>
            )}

            {/* Model Answer (Rendered with ReactMarkdown) */}
            {model_answer && (
              <div className="bg-indigo-950/20 p-5 rounded-xl border border-indigo-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-sm font-semibold text-indigo-300">
                    Recommended Model Answer
                  </h4>
                </div>
                <div className="prose prose-invert prose-indigo prose-sm max-w-none text-slate-200 leading-relaxed space-y-2">
                  <ReactMarkdown>{model_answer}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Review Details
            </button>
            <button
              onClick={onNext}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <span>{isLastQuestion ? 'Complete Session & View Report' : 'Proceed to Next Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
