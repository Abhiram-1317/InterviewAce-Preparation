import React from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export default function LandingView() {
  const { isAuthenticated } = useAppStore();

  return (
    <div className="content-container pt-11 pb-24 space-y-20">
      {/* 1. HERO SECTION: Two columns stacking on mobile */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-4">
        {/* Left Column: Mission & Call-to-Actions (Exact Spec 7.1) */}
        <div className="md:col-span-7 space-y-6">
          <h1 className="h1-hero text-[#111111]">
            Prepare smarter.
            <br />
            <span className="italic text-[#d4421f]">Interview better.</span>
          </h1>

          <p className="text-[17px] text-[#6b6b6b] max-w-[460px] leading-relaxed">
            Upload your resume and a job description, find skill gaps, get role-specific questions, and score practice answers.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to={isAuthenticated ? "/new-preparation" : "/register"}
              className="btn-primary"
            >
              Get started
            </Link>
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className="btn-secondary"
            >
              Log in
            </Link>
          </div>
        </div>

        {/* Right Column: Sample preview card (Exact Spec 7.1) */}
        <div className="md:col-span-5">
          <div className="spec-card space-y-5 bg-white border-[#e7e5e1]">
            <div className="flex items-center justify-between">
              <div>
                <span className="eyebrow block">Target Role</span>
                <span className="h3-card text-[#111111] font-semibold">Senior Full Stack Engineer</span>
              </div>
              <span className="chip chip-strong">Sample preview</span>
            </div>

            {/* Big 72% match figure and bar */}
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="score-big text-[#111111]">72%</span>
                <span className="text-[13px] text-[#6b6b6b]">Estimated match</span>
              </div>
              <div className="spec-progress-track">
                <div className="spec-progress-bar" style={{ width: '72%' }} />
              </div>
            </div>

            {/* Three rows with status chips */}
            <div className="space-y-2.5 pt-1 text-[14px]">
              <div className="flex items-center justify-between pb-2 border-b border-[#e7e5e1]">
                <span className="text-[#111111] font-medium">Python</span>
                <span className="chip chip-strong">Strong</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[#e7e5e1]">
                <span className="text-[#111111] font-medium">PostgreSQL</span>
                <span className="chip chip-partial">Partial</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#111111] font-medium">Docker</span>
                <span className="chip chip-gap">Gap</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* 2. SUPPORTED AI PROVIDERS (CORE SPEC REQUIREMENT) */}
      <section className="space-y-6 pt-4">
        <div className="border-b border-[#e7e5e1] pb-3">
          <span className="eyebrow block">Multi-Provider Infrastructure</span>
          <h2 className="h2-title text-[#111111]">Frontier AI Without Vendor Lock-In</h2>
          <p className="text-[14px] text-[#6b6b6b] mt-1">
            InterviewAce operates on a unified multi-provider engine. Switch seamlessly between cloud intelligence backends or deploy private models on your infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Gemini */}
          <div className="spec-card space-y-2 bg-white">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[15px] text-[#111111]">Google Gemini</span>
              <span className="chip chip-strong text-[11px]">Native</span>
            </div>
            <p className="text-[12px] text-[#6b6b6b] leading-relaxed">
              Gemini 1.5 Flash & 2.0 Flash with million-token context windows for deep resume parsing and structured analysis.
            </p>
            <div className="text-[11px] font-mono text-[#8c8a85] pt-1">gemini-1.5-flash</div>
          </div>

          {/* OpenAI */}
          <div className="spec-card space-y-2 bg-white">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[15px] text-[#111111]">OpenAI</span>
              <span className="chip chip-strong text-[11px]">Supported</span>
            </div>
            <p className="text-[12px] text-[#6b6b6b] leading-relaxed">
              GPT-4o and GPT-4o-mini for gold-standard technical accuracy, code problem solving, and structured JSON outputs.
            </p>
            <div className="text-[11px] font-mono text-[#8c8a85] pt-1">gpt-4o-mini</div>
          </div>

          {/* Anthropic Claude */}
          <div className="spec-card space-y-2 bg-white">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[15px] text-[#111111]">Anthropic Claude</span>
              <span className="chip chip-strong text-[11px]">Supported</span>
            </div>
            <p className="text-[12px] text-[#6b6b6b] leading-relaxed">
              Claude 3.5 Sonnet delivers exceptional qualitative feedback, empathetic communication coaching, and STAR method structuring.
            </p>
            <div className="text-[11px] font-mono text-[#8c8a85] pt-1">claude-3-5-sonnet</div>
          </div>

          {/* Groq */}
          <div className="spec-card space-y-2 bg-white">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[15px] text-[#111111]">Groq Cloud</span>
              <span className="chip chip-strong text-[11px]">Fast LPU</span>
            </div>
            <p className="text-[12px] text-[#6b6b6b] leading-relaxed">
              Ultra-low latency LPU inference powering Llama 3.3 70B and Mixtral for instant, near real-time practice evaluations.
            </p>
            <div className="text-[11px] font-mono text-[#8c8a85] pt-1">llama-3.3-70b</div>
          </div>

          {/* OmniRoute / Custom Endpoint */}
          <div className="spec-card space-y-2 bg-white">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[15px] text-[#111111]">OmniRoute / Custom</span>
              <span className="chip chip-strong text-[11px]">Active</span>
            </div>
            <p className="text-[12px] text-[#6b6b6b] leading-relaxed">
              Connect OmniRoute, Ollama, vLLM, DeepSeek, or private local routers with auto model routing.
            </p>
            <div className="text-[11px] font-mono text-[#8c8a85] pt-1">auto/best-coding</div>
          </div>
        </div>
      </section>


      {/* 3. CORE PRODUCT CAPABILITIES (Editorial 3-up + 6-up Grid) */}
      <section id="features" className="space-y-6 pt-4">
        <div className="border-b border-[#e7e5e1] pb-3">
          <span className="eyebrow block">Comprehensive Capabilities</span>
          <h2 className="h2-title text-[#111111]">Everything You Need for Role Mastery</h2>
          <p className="text-[14px] text-[#6b6b6b] mt-1">
            Engineered to replace generic interview flashcards with high-fidelity, role-specific coaching.
          </p>
        </div>

        {/* Primary Three Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="spec-card space-y-2.5 bg-white">
            <div className="text-[12px] font-semibold text-[#d4421f] uppercase tracking-wide">01 · Gap Analysis</div>
            <h3 className="h3-card text-[#111111]">Find Your Gaps Before the Panel Does</h3>
            <p className="text-[14px] text-[#6b6b6b] leading-relaxed">
              Compare your exact background against candidate qualifications. Automatically categorizes competencies into Strong, Partial, and Critical Gaps with targeted study schedules.
            </p>
          </div>

          <div className="spec-card space-y-2.5 bg-white">
            <div className="text-[12px] font-semibold text-[#d4421f] uppercase tracking-wide">02 · Tailored Prompts</div>
            <h3 className="h3-card text-[#111111]">15 Role-Specific Questions per Session</h3>
            <p className="text-[14px] text-[#6b6b6b] leading-relaxed">
              Generates nuanced Technical, Behavioral STAR, Situational crisis, and Culture fit questions tailored to the company's business model and tech stack.
            </p>
          </div>

          <div className="spec-card space-y-2.5 bg-white">
            <div className="text-[12px] font-semibold text-[#d4421f] uppercase tracking-wide">03 · Scored Simulation</div>
            <h3 className="h3-card text-[#111111]">5-Dimension Rubric Evaluation</h3>
            <p className="text-[14px] text-[#6b6b6b] leading-relaxed">
              Practice speaking or typing with live rubric detection, word count pacing, filler word counters, and comprehensive strengths vs blind spot feedback.
            </p>
          </div>
        </div>

        {/* Secondary Six Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          <div className="spec-card space-y-1.5 bg-white">
            <h4 className="text-[14px] font-semibold text-[#111111]">Voice & Microphone Input</h4>
            <p className="text-[13px] text-[#6b6b6b]">
              Practice answering out loud using browser speech recognition or refine structured written arguments with Markdown formatting.
            </p>
          </div>

          <div className="spec-card space-y-1.5 bg-white">
            <h4 className="text-[14px] font-semibold text-[#111111]">Real-Time Speech Metrics</h4>
            <p className="text-[13px] text-[#6b6b6b]">
              Monitors live Words-Per-Minute (target 120-150 WPM), detects filler words ('um', 'like', 'you know'), and tracks keyword coverage.
            </p>
          </div>

          <div className="spec-card space-y-1.5 bg-white">
            <h4 className="text-[14px] font-semibold text-[#111111]">Interviewer Personas</h4>
            <p className="text-[13px] text-[#6b6b6b]">
              Toggle between a Supportive Coach (encouraging), a Strict Hiring Panel (unforgiving rubric), or a Stress Panel (rapid curveball follow-ups).
            </p>
          </div>

          <div className="spec-card space-y-1.5 bg-white">
            <h4 className="text-[14px] font-semibold text-[#111111]">11 Indian & Global Languages</h4>
            <p className="text-[13px] text-[#6b6b6b]">
              Indian English · Hindi · Telugu · Tamil · Kannada · Malayalam · Bengali · Marathi · Gujarati · Punjabi · Odia.
            </p>
          </div>

          <div className="spec-card space-y-1.5 bg-white">
            <h4 className="text-[14px] font-semibold text-[#111111]">STAR Framework Scaffolding</h4>
            <p className="text-[13px] text-[#6b6b6b]">
              Automatic Situation, Task, Action, and Result detection ensuring behavioural answers demonstrate tangible, quantifiable engineering impact.
            </p>
          </div>

          <div className="spec-card space-y-1.5 bg-white">
            <h4 className="text-[14px] font-semibold text-[#111111]">Exportable Session Reports</h4>
            <p className="text-[13px] text-[#6b6b6b]">
              Generate print-ready evaluation reports with score breakdowns, candidate transcripts, model answers, and next-step study priorities.
            </p>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS: 6 STEP GUIDED WALKTHROUGH */}
      <section id="how-it-works" className="space-y-6 pt-4">
        <div className="spec-card space-y-5 bg-white">
          <div className="border-b border-[#e7e5e1] pb-3">
            <span className="eyebrow block">Workflow Methodology</span>
            <h2 className="h2-title text-[#111111]">Six Steps to Interview Readiness</h2>
            <p className="text-[14px] text-[#6b6b6b] mt-1">
              From raw documents to confident, data-backed candidate delivery.
            </p>
          </div>

          <ol className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-2">
            <li className="space-y-1.5">
              <span className="text-[13px] font-bold text-[#d4421f]">01 · Account</span>
              <p className="text-[14px] text-[#111111] font-semibold">Secure Registration</p>
              <p className="text-[13px] text-[#6b6b6b] leading-relaxed">
                Create a persistent, verified profile with bcrypt encryption to store your ongoing preparations and historical progress.
              </p>
            </li>

            <li className="space-y-1.5">
              <span className="text-[13px] font-bold text-[#d4421f]">02 · Ingestion</span>
              <p className="text-[14px] text-[#111111] font-semibold">Upload Documents</p>
              <p className="text-[13px] text-[#6b6b6b] leading-relaxed">
                Drop your PDF or Word resume and paste the target job specification. Multi-provider AI extracts structured competencies.
              </p>
            </li>

            <li className="space-y-1.5">
              <span className="text-[13px] font-bold text-[#d4421f]">03 · Review</span>
              <p className="text-[14px] text-[#111111] font-semibold">Extraction Verification</p>
              <p className="text-[13px] text-[#6b6b6b] leading-relaxed">
                Inspect extracted skills, education, and achievements. Add missing proficiencies or fine-tune details before generating questions.
              </p>
            </li>

            <li className="space-y-1.5">
              <span className="text-[13px] font-bold text-[#d4421f]">04 · Diagnostics</span>
              <p className="text-[14px] text-[#111111] font-semibold">Skill Gap Matrix</p>
              <p className="text-[13px] text-[#6b6b6b] leading-relaxed">
                Review your Fit Index percentage, breakdown of overlapping vs missing skills, and estimated preparation hours required.
              </p>
            </li>

            <li className="space-y-1.5">
              <span className="text-[13px] font-bold text-[#d4421f]">05 · Question Bank</span>
              <p className="text-[14px] text-[#111111] font-semibold">Role-Specific Drills</p>
              <p className="text-[13px] text-[#6b6b6b] leading-relaxed">
                Browse 15 curated questions with underlying concepts, sample answers, and expected rubric key points.
              </p>
            </li>

            <li className="space-y-1.5">
              <span className="text-[13px] font-bold text-[#d4421f]">06 · Practice & Report</span>
              <p className="text-[14px] text-[#111111] font-semibold">Simulated Rehearsal</p>
              <p className="text-[13px] text-[#6b6b6b] leading-relaxed">
                Answer under timed conditions, receive instantaneous qualitative feedback, and save comprehensive session reports.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* 5. PRICING & USAGE TIERS */}
      <section id="pricing" className="space-y-6 pt-4">
        <div className="border-b border-[#e7e5e1] pb-3">
          <span className="eyebrow block">Usage Plans & Pricing</span>
          <h2 className="h2-title text-[#111111]">Transparent Access for Every Candidate</h2>
          <p className="text-[14px] text-[#6b6b6b] mt-1">
            Choose between self-managed BYOK keys or full cloud-managed interview simulation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tier 1: BYOK / Free Community */}
          <div className="spec-card space-y-4 bg-white flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold text-[#111111]">BYOK / Community</span>
                <span className="chip chip-strong text-[11px]">Free Forever</span>
              </div>
              <div className="text-[28px] font-serif font-bold text-[#111111]">
                $0 <span className="text-[13px] font-sans font-normal text-[#6b6b6b]">/ unlimited</span>
              </div>
              <p className="text-[13px] text-[#6b6b6b]">
                Bring your own API key for Google Gemini, OpenAI, Claude, or Groq. Zero platform markup.
              </p>
              <ul className="space-y-2 text-[13px] text-[#111111] pt-2">
                <li className="flex items-center gap-2">
                  <span className="text-[#2e7d32]">✓</span> Unlimited resume & JD parsings
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#2e7d32]">✓</span> Full 15-question custom question bank
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#2e7d32]">✓</span> Browser speech pacing & filler detection
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#2e7d32]">✓</span> Exportable session reports
                </li>
              </ul>
            </div>
            <Link to="/register" className="btn-secondary w-full text-center mt-4">
              Get Started Free
            </Link>
          </div>

          {/* Tier 2: Pro Candidate */}
          <div className="spec-card space-y-4 bg-white border-[#d4421f] flex flex-col justify-between relative shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold text-[#111111]">Pro Candidate</span>
                <span className="chip chip-strong bg-[#d4421f] text-white text-[11px]">Popular</span>
              </div>
              <div className="text-[28px] font-serif font-bold text-[#111111]">
                $19 <span className="text-[13px] font-sans font-normal text-[#6b6b6b]">/ month</span>
              </div>
              <p className="text-[13px] text-[#6b6b6b]">
                Turnkey access with included high-speed cloud inference across Gemini and GPT-4o.
              </p>
              <ul className="space-y-2 text-[13px] text-[#111111] pt-2">
                <li className="flex items-center gap-2">
                  <span className="text-[#2e7d32]">✓</span> Everything in Free Community
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#2e7d32]">✓</span> Fully managed inference (no API keys needed)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#2e7d32]">✓</span> Stress Interview & Panel simulation modes
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#2e7d32]">✓</span> Historical score progression analytics
                </li>
              </ul>
            </div>
            <Link to="/register" className="btn-primary w-full text-center mt-4">
              Start Pro Access
            </Link>
          </div>

          {/* Tier 3: University & Enterprise */}
          <div className="spec-card space-y-4 bg-white flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold text-[#111111]">University & Campus</span>
                <span className="chip chip-partial text-[11px]">Cohort</span>
              </div>
              <div className="text-[28px] font-serif font-bold text-[#111111]">
                Custom <span className="text-[13px] font-sans font-normal text-[#6b6b6b]">/ institution</span>
              </div>
              <p className="text-[13px] text-[#6b6b6b]">
                Designed for university placement cells, bootcamps, and recruiting teams.
              </p>
              <ul className="space-y-2 text-[13px] text-[#111111] pt-2">
                <li className="flex items-center gap-2">
                  <span className="text-[#2e7d32]">✓</span> Multi-student cohort dashboard
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#2e7d32]">✓</span> Custom interview rubrics & company benchmarks
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#2e7d32]">✓</span> Private on-premise model integration
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#2e7d32]">✓</span> Dedicated placement officer analytics
                </li>
              </ul>
            </div>
            <Link to="/register" className="btn-secondary w-full text-center mt-4">
              Contact Enterprise
            </Link>
          </div>
        </div>
      </section>

      {/* 6. SECURITY & PRIVACY COMMITMENT */}
      <section className="spec-card bg-[#faf9f5] border-[#e7e5e1] p-6 space-y-3">
        <h3 className="h3-card text-[#111111]">Enterprise Privacy & Security Guarantee</h3>
        <p className="text-[13px] text-[#6b6b6b] leading-relaxed max-w-[800px]">
          Your resume, job listings, and practice transcripts are strictly your confidential intellectual property. InterviewAce never sells candidate documents or trains public language models on your private data. All authentication passes through salted bcrypt hashes and stateless JWT tokens.
        </p>
      </section>
    </div>
  );
}
