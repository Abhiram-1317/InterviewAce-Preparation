import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { jdApi } from '../api';
import { useAppStore } from '../store/useAppStore';
import {
  Briefcase,
  Sparkles,
  CheckCircle2,
  Building2,
  Layers,
  ArrowRight,
  Code,
  AlertCircle,
} from 'lucide-react';

export default function JdInputView() {
  const [roleTitle, setRoleTitle] = useState('Senior Full-Stack Engineer');
  const [company, setCompany] = useState('Stripe / TechCorp');
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const { jdId, parsedJd, setJd } = useAppStore();

  const handleAnalyzeJd = async (e) => {
    e.preventDefault();
    if (!jdText.trim()) {
      toast.warning('Please enter or paste the job description text.');
      return;
    }

    setLoading(true);
    try {
      const res = await jdApi.pasteJd({
        role_title: roleTitle,
        company: company,
        job_description_text: jdText,
      });

      const newJdId = res.jd_id || res.id;
      const parsed = res.parsed_jd || res.data || res;
      setJd(newJdId, parsed);
      toast.success('Job description analyzed and skills extracted!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to process Job Description.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSampleJd = () => {
    const sampleText = `Role: Senior Full Stack Engineer (Python & React)
Company: Stripe / TechCorp
Experience: 5+ years

Key Responsibilities:
- Design, scale, and maintain mission-critical backend APIs using FastAPI, Python, and async architecture.
- Build ultra-responsive web applications with React 18, TailwindCSS, and state management.
- Architect NoSQL and relational data models in MongoDB and PostgreSQL with Redis caching.
- Optimize database queries and conduct rigorous code reviews to maintain high engineering standards.
- Collaborate with product and design teams to build user-facing financial tooling.

Required Qualifications & Skills:
- 5+ years building distributed cloud platforms in Python and JavaScript/TypeScript.
- Strong proficiency with FastAPI, React, RESTful APIs, and microservice architecture.
- Hands-on experience with MongoDB, Redis, Docker, and CI/CD pipelines.
- Deep understanding of system design trade-offs, scalability, and asynchronous processing.
- Exceptional analytical problem-solving and cross-functional communication skills.`;

    setRoleTitle('Senior Full-Stack Engineer');
    setCompany('TechCorp Global');
    setJdText(sampleText);

    // Also populate state with parsed structure for immediate preview
    const sampleParsed = {
      role_title: 'Senior Full Stack Engineer',
      company: 'TechCorp Global',
      experience_level: 'Senior (5+ years)',
      required_skills: ['Python', 'FastAPI', 'React', 'MongoDB', 'Docker', 'Redis', 'System Design', 'TypeScript', 'PostgreSQL'],
      responsibilities: [
        'Design and scale high-throughput async APIs',
        'Build reactive frontend web applications with React 18',
        'Manage NoSQL & relational databases with Redis caching',
      ],
      difficulty: 'Hard',
    };
    setJd('sample_jd_12345', sampleParsed);
    toast.success('Sample Job Description loaded & analyzed!');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Target Role Extraction</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Job Description Parser</h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Paste the job listing or role requirements. The AI engine extracts required competencies, seniority expectations, and key questions to grill you on.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <form onSubmit={handleAnalyzeJd} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Job Title
                </label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Company Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Google, Stripe"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Paste Job Description Text
              </label>
              <textarea
                rows={10}
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the requirements, qualifications, and role responsibilities here..."
                className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-xs leading-relaxed"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? 'Extracting Skills...' : 'Analyze Job Description'}</span>
              </button>

              <button
                type="button"
                onClick={handleLoadSampleJd}
                className="px-4 py-3 rounded-xl font-medium text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                ⚡ Load Sample JD
              </button>
            </div>
          </form>
        </div>

        {/* Parsed Insights Column (6 cols) */}
        <div className="lg:col-span-6">
          {parsedJd ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{parsedJd.role_title || roleTitle}</h3>
                  <p className="text-xs text-indigo-400 font-medium">
                    {parsedJd.company || company} • {parsedJd.experience_level || 'Mid-Senior Level'}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Target Role Active
                </span>
              </div>

              {/* Required Skills */}
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Mandatory Technical Requirements</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {(parsedJd.required_skills || ['Python', 'FastAPI', 'React', 'MongoDB', 'Docker', 'Redis']).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Responsibilities */}
              {parsedJd.responsibilities && parsedJd.responsibilities.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Key Responsibilities & Deliverables</span>
                  </span>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {parsedJd.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next Step Banner */}
              <div className="pt-2">
                <a
                  href="/skill-gap"
                  className="w-full py-2.5 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-white border border-slate-700 flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Compare with Resume in Skill Gap Matrix</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          ) : (
            <div className="h-full min-h-[300px] border border-slate-800/80 rounded-2xl bg-slate-900/30 flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <Briefcase className="w-12 h-12 stroke-[1.5] mb-3 text-slate-600" />
              <p className="text-sm font-medium text-slate-400">No Job Description Analyzed</p>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Paste job details on the left or click &quot;Load Sample JD&quot; to inspect required competencies.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
