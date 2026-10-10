import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Header from './components/Header';
import Toast from './components/Toast';

import LandingView from './views/LandingView';
import RegisterView from './views/RegisterView';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import NewPreparationView from './views/NewPreparationView';
import ReviewExtractedView from './views/ReviewExtractedView';
import SkillGapView from './views/SkillGapView';
import QuestionBankView from './views/QuestionBankView';
import PracticeView from './views/PracticeView';
import FeedbackView from './views/FeedbackView';
import SessionReportView from './views/SessionReportView';
import HistoryView from './views/HistoryView';
import SettingsView from './views/SettingsView';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white text-[#111111] flex flex-col font-sans selection:bg-[#d4421f] selection:text-white">
        {/* Editorial sticky header */}
        <Header />

        {/* Main Content Area */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingView />} />
            <Route path="/register" element={<RegisterView />} />
            <Route path="/login" element={<LoginView />} />
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/new-preparation" element={<NewPreparationView />} />
            <Route path="/review" element={<ReviewExtractedView />} />
            <Route path="/skill-gap" element={<SkillGapView />} />
            <Route path="/questions" element={<QuestionBankView />} />
            <Route path="/practice" element={<PracticeView />} />
            <Route path="/feedback" element={<FeedbackView />} />
            <Route path="/reports" element={<SessionReportView />} />
            <Route path="/history" element={<HistoryView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Small black rounded rectangle toast at bottom center */}
        <Toast />
      </div>
    </Router>
  );
}
