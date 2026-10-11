import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { aiApi } from '../api';

export default function SettingsView() {
  const {
    user,
    settings,
    updateSettings,
    deletePracticeData,
    showToast,
    activeAIProvider,
    setAIProvider,
    logout,
  } = useAppStore();

  const [formData, setFormData] = useState({
    name: user?.full_name || user?.name || '',
    targetRole: settings.targetRole || '',
    targetCompany: settings.targetCompany || '',
    institution: settings.institution || '',
    degree: settings.degree || '',
    graduationYear: settings.graduationYear || '',
    gpa: settings.gpa || '',
    location: settings.location || '',
  });

  const [interviewerStyle, setInterviewerStyle] = useState(settings.interviewerStyle || 'Supportive coach');
  const [fillerSensitivity, setFillerSensitivity] = useState(settings.fillerSensitivity || 'Standard');
  const [targetPace, setTargetPace] = useState(settings.targetSpeakingPace || 130);
  const [selectedLanguage, setSelectedLanguage] = useState(settings.language || 'Indian English');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Multi-Provider AI State
  const [currentProvider, setCurrentProvider] = useState(activeAIProvider || 'gemini');
  const [providersList, setProvidersList] = useState([]);
  const [providerKeys, setProviderKeys] = useState({
    gemini_api_key: '',
    openai_api_key: '',
    anthropic_api_key: '',
    groq_api_key: '',
    custom_base_url: '',
    custom_api_key: '',
  });
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSavingAI, setIsSavingAI] = useState(false);

  useEffect(() => {
    // Load providers from backend
    aiApi.getProviders()
      .then((data) => {
        if (data.providers) {
          setProvidersList(data.providers);
        }
        if (data.active_provider) {
          setCurrentProvider(data.active_provider);
        }
      })
      .catch(() => {
        // Fallback default list
        setProvidersList([
          { id: 'gemini', name: 'Google Gemini', default_model: 'gemini-1.5-flash', is_configured: true },
          { id: 'openai', name: 'OpenAI GPT-4o', default_model: 'gpt-4o-mini', is_configured: false },
          { id: 'claude', name: 'Anthropic Claude', default_model: 'claude-3-5-sonnet-20241022', is_configured: false },
          { id: 'groq', name: 'Groq Cloud (Llama 3.3)', default_model: 'llama-3.3-70b-versatile', is_configured: false },
          { id: 'custom', name: 'Custom OpenAI-Compatible', default_model: 'default', is_configured: false },
        ]);
      });

    // Load saved user BYOK config
    aiApi.getUserConfig()
      .then((cfg) => {
        if (cfg) {
          if (cfg.preferred_provider) setCurrentProvider(cfg.preferred_provider);
          setProviderKeys((prev) => ({
            ...prev,
            custom_base_url: cfg.custom_base_url || '',
          }));
        }
      })
      .catch(() => {});
  }, []);

  const languages = [
    'Indian English',
    'Hindi',
    'Telugu',
    'Tamil',
    'Kannada',
    'Malayalam',
    'Bengali',
    'Marathi',
    'Gujarati',
    'Punjabi',
    'Odia',
  ];

  const interviewerStyles = [
    { title: 'Supportive coach', desc: 'Encouraging tone, constructive guidance, and gentle pacing.' },
    { title: 'Strict hiring panel', desc: 'Direct technical scrutiny, formal evaluation, zero leeway.' },
    { title: 'Stress panel', desc: 'Rapid-fire interruptions, high stakes, aggressive questioning.' },
  ];

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateSettings({
      ...formData,
      interviewerStyle,
      fillerSensitivity,
      targetSpeakingPace: Number(targetPace),
      language: selectedLanguage,
    });
    showToast('Profile preferences saved');
  };

  const handleTestProvider = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const activeKey =
        currentProvider === 'gemini'
          ? providerKeys.gemini_api_key
          : currentProvider === 'openai'
          ? providerKeys.openai_api_key
          : currentProvider === 'claude'
          ? providerKeys.anthropic_api_key
          : currentProvider === 'groq'
          ? providerKeys.groq_api_key
          : providerKeys.custom_api_key;

      const res = await aiApi.testProvider({
        provider: currentProvider,
        api_key: activeKey || undefined,
        base_url: currentProvider === 'custom' ? providerKeys.custom_base_url : undefined,
      });

      setTestResult(res);
      if (res.success) {
        showToast(`Connected to ${currentProvider.toUpperCase()} (${res.latency_ms}ms)`);
      } else {
        showToast(`Test failed: ${res.message}`);
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err.response?.data?.detail || err.message || 'Connection test failed',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveAIConfig = async () => {
    setIsSavingAI(true);
    try {
      await aiApi.setActiveProvider(currentProvider);
      await aiApi.saveUserConfig({
        preferred_provider: currentProvider,
        ...providerKeys,
      });
      setAIProvider(currentProvider);
      showToast(`Active AI engine switched to ${currentProvider.toUpperCase()}`);
    } catch (err) {
      // Still update local store
      setAIProvider(currentProvider);
      showToast(`AI engine set to ${currentProvider.toUpperCase()}`);
    } finally {
      setIsSavingAI(false);
    }
  };

  const handleDeleteData = () => {
    deletePracticeData();
    setShowDeleteConfirm(false);
    showToast('Practice history cleared');
  };

  return (
    <div className="content-container pt-11 pb-24 space-y-8">
      <div>
        <h2 className="h2-title text-[#111111]">Settings</h2>
        <p className="text-[15px] text-[#6b6b6b] mt-0.5">
          Configure multi-provider AI engines, candidate profile details, voice pacing, and interview personas.
        </p>
      </div>

      {/* AI ENGINE & MULTI-PROVIDER CONFIGURATION (PRODUCTION COMPONENT) */}
      <div className="spec-card space-y-5 bg-white border-[#e7e5e1]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e7e5e1] pb-3">
          <div>
            <span className="eyebrow block">Intelligence Core</span>
            <h3 className="h3-card text-[#111111] font-semibold">AI Provider & Inference Engine</h3>
          </div>
          <span className="chip chip-strong text-[12px]">
            Active: {currentProvider.toUpperCase()}
          </span>
        </div>

        <p className="text-[13px] text-[#6b6b6b] leading-relaxed">
          InterviewAce supports hot-swapping between frontier AI providers without code redeployment. Select your preferred provider below or supply custom Bring-Your-Own-Key (BYOK) credentials.
        </p>

        {/* Provider Cards Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {providersList.map((p) => {
            const isSelected = currentProvider === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setCurrentProvider(p.id)}
                className={`option-card cursor-pointer space-y-1.5 p-3.5 transition-all ${
                  isSelected ? 'border-[#d4421f] bg-[#fdfaf8]' : 'border-[#e7e5e1] hover:border-[#111111]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-semibold text-[#111111]">{p.name}</span>
                  {isSelected && <span className="chip chip-strong text-[11px]">Selected</span>}
                </div>
                <p className="text-[12px] text-[#6b6b6b] line-clamp-2">
                  {p.description || `Default model: ${p.default_model}`}
                </p>
                <div className="text-[11px] text-[#8c8a85] pt-1">
                  Model: <span className="font-mono text-[#111111]">{p.default_model}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* API Key Input for Selected Provider */}
        <div className="bg-[#fbfbf9] p-4 rounded border border-[#e7e5e1] space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-medium text-[#111111] block">
              {currentProvider.toUpperCase()} API Key (Optional BYOK Override)
            </label>
            <span className="text-[12px] text-[#6b6b6b]">Leave blank to use environment default</span>
          </div>

          {currentProvider === 'gemini' && (
            <input
              type="password"
              placeholder="AIzaSy... (Google AI Studio Key)"
              value={providerKeys.gemini_api_key}
              onChange={(e) => setProviderKeys({ ...providerKeys, gemini_api_key: e.target.value })}
              className="spec-input bg-white"
            />
          )}

          {currentProvider === 'openai' && (
            <input
              type="password"
              placeholder="sk-proj-... (OpenAI Platform Key)"
              value={providerKeys.openai_api_key}
              onChange={(e) => setProviderKeys({ ...providerKeys, openai_api_key: e.target.value })}
              className="spec-input bg-white"
            />
          )}

          {currentProvider === 'claude' && (
            <input
              type="password"
              placeholder="sk-ant-... (Anthropic Console Key)"
              value={providerKeys.anthropic_api_key}
              onChange={(e) => setProviderKeys({ ...providerKeys, anthropic_api_key: e.target.value })}
              className="spec-input bg-white"
            />
          )}

          {currentProvider === 'groq' && (
            <input
              type="password"
              placeholder="gsk_... (Groq Cloud API Key)"
              value={providerKeys.groq_api_key}
              onChange={(e) => setProviderKeys({ ...providerKeys, groq_api_key: e.target.value })}
              className="spec-input bg-white"
            />
          )}

          {currentProvider === 'custom' && (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Base URL: http://localhost:11434/v1 or https://api.deepseek.com"
                value={providerKeys.custom_base_url}
                onChange={(e) => setProviderKeys({ ...providerKeys, custom_base_url: e.target.value })}
                className="spec-input bg-white"
              />
              <input
                type="password"
                placeholder="Custom API Key (optional)"
                value={providerKeys.custom_api_key}
                onChange={(e) => setProviderKeys({ ...providerKeys, custom_api_key: e.target.value })}
                className="spec-input bg-white"
              />
            </div>
          )}

          {testResult && (
            <div
              className={`p-2.5 rounded text-[13px] border ${
                testResult.success
                  ? 'bg-[#f0f9f4] border-[#c3e6cb] text-[#155724]'
                  : 'bg-[#fdf2f2] border-[#f5c6cb] text-[#721c24]'
              }`}
            >
              {testResult.success
                ? `Connection Verified: Latency ${testResult.latency_ms}ms`
                : `Connection Failed: ${testResult.message}`}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              disabled={isSavingAI}
              onClick={handleSaveAIConfig}
              className="btn-primary text-[13px] py-1.5 px-3.5"
            >
              {isSavingAI ? 'Saving…' : `Set ${currentProvider.toUpperCase()} as Active`}
            </button>

            <button
              type="button"
              disabled={isTesting}
              onClick={handleTestProvider}
              className="btn-secondary text-[13px] py-1.5 px-3.5"
            >
              {isTesting ? 'Testing Ping…' : 'Test Connection'}
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* Two cards: Candidate profile & Interviewer style */}
        <div className="grid-two-up items-start">
          {/* Card 1: Candidate profile */}
          <div className="spec-card space-y-4">
            <h3 className="h3-card text-[#111111]">Candidate profile</h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[13px] font-medium text-[#111111] block">Full name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sarah Jenkins"
                  className="spec-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[13px] font-medium text-[#111111] block">Target role</label>
                  <input
                    type="text"
                    value={formData.targetRole}
                    onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                    placeholder="e.g. Full Stack Engineer"
                    className="spec-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[13px] font-medium text-[#111111] block">Target company</label>
                  <input
                    type="text"
                    value={formData.targetCompany}
                    onChange={(e) => setFormData({ ...formData, targetCompany: e.target.value })}
                    placeholder="e.g. Stripe, Google"
                    className="spec-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[13px] font-medium text-[#111111] block">Institution</label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="e.g. University / College"
                    className="spec-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[13px] font-medium text-[#111111] block">Degree</label>
                  <input
                    type="text"
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    placeholder="e.g. B.S. in Computer Science"
                    className="spec-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[13px] font-medium text-[#111111] block">Graduation year</label>
                  <input
                    type="text"
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                    placeholder="e.g. 2024"
                    className="spec-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[13px] font-medium text-[#111111] block">GPA / Percentage</label>
                  <input
                    type="text"
                    value={formData.gpa}
                    onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                    placeholder="e.g. 3.8 / 85%"
                    className="spec-input"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[13px] font-medium text-[#111111] block">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Bengaluru, India or Remote"
                  className="spec-input"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary mt-2">
              Save profile
            </button>
          </div>

          {/* Card 2: Interviewer style */}
          <div className="spec-card space-y-4">
            <h3 className="h3-card text-[#111111]">Interviewer style</h3>

            <div className="space-y-2.5">
              {interviewerStyles.map((style) => (
                <div
                  key={style.title}
                  onClick={() => setInterviewerStyle(style.title)}
                  className={`option-card space-y-0.5 ${
                    interviewerStyle === style.title ? 'selected' : ''
                  }`}
                >
                  <h4 className="text-[14px] font-semibold text-[#111111]">{style.title}</h4>
                  <p className="text-[12px] text-[#6b6b6b]">{style.desc}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[13px] font-medium text-[#111111] block">Filler sensitivity</label>
                <select
                  value={fillerSensitivity}
                  onChange={(e) => setFillerSensitivity(e.target.value)}
                  className="spec-select text-[13px]"
                >
                  <option value="Lenient">Lenient</option>
                  <option value="Standard">Standard</option>
                  <option value="Strict">Strict</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[13px] font-medium text-[#111111] block">Target pace (WPM)</label>
                <input
                  type="number"
                  value={targetPace}
                  onChange={(e) => setTargetPace(e.target.value)}
                  className="spec-input text-[13px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Voice & Language Preference (11 Languages) */}
        <div className="spec-card space-y-3">
          <div className="flex items-center justify-between border-b border-[#e7e5e1] pb-2.5">
            <h3 className="h3-card text-[#111111]">Voice & language preference</h3>
            <span className="text-[12px] text-[#6b6b6b]">Drives speech recognition parser</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {languages.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => {
                  setSelectedLanguage(lang);
                  updateSettings({ language: lang });
                  showToast(`Language set to ${lang}`);
                }}
                className={selectedLanguage === lang ? 'btn-primary py-1.5 px-3 text-[13px]' : 'btn-secondary py-1.5 px-3 text-[13px]'}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Account & Data Management */}
        <div className="spec-card space-y-4 border-[#e7e5e1]">
          <h3 className="h3-card text-[#111111]">Account & Privacy</h3>
          <p className="text-[13px] text-[#6b6b6b]">
            Authenticated session: <span className="font-mono text-[#111111]">{user?.email || 'Active User'}</span>
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {showDeleteConfirm ? (
              <div className="flex items-center gap-3 animate-fade-rise">
                <span className="text-[13px] font-medium text-[#b3261e]">Confirm clear all practice history?</span>
                <button
                  type="button"
                  onClick={handleDeleteData}
                  className="btn-primary bg-[#b3261e] border-[#b3261e] text-[13px] py-1 px-3"
                >
                  Yes, delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary text-[13px] py-1 px-3"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="btn-secondary text-[#b3261e] border-[#e7e5e1] hover:border-[#b3261e] text-[13px]"
              >
                Clear all practice sessions
              </button>
            )}

            <button
              type="button"
              onClick={logout}
              className="btn-secondary text-[13px] hover:border-[#111111]"
            >
              Sign Out
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
