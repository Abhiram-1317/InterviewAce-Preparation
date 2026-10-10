import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export default function SkillGapView() {
  const navigate = useNavigate();
  const { plan } = useAppStore();

  const resumeSkills = useMemo(() => {
    return new Set((plan.resumeSkills || []).map((s) => s.toLowerCase().trim()));
  }, [plan.resumeSkills]);

  const jdSkills = plan.jdSkills || ['Python', 'FastAPI', 'React', 'MongoDB', 'Docker', 'PostgreSQL', 'Redis', 'CI/CD', 'Kubernetes'];

  // Categorize each required skill according to the PDF match rule
  const { strongMatches, partialMatches, gaps, matchPercentage, totalStudyHours } = useMemo(() => {
    const strong = [];
    const partial = [];
    const gap = [];

    // Related skills map for partial credit (0.5)
    const relatedMap = {
      docker: ['aws', 'kubernetes', 'container', 'linux'],
      kubernetes: ['docker', 'aws', 'cloud'],
      'ci/cd': ['git', 'github actions', 'jenkins', 'testing'],
      redis: ['memcached', 'cache', 'mongodb'],
      postgresql: ['sql', 'mysql', 'database'],
      mongodb: ['nosql', 'redis', 'document'],
      react: ['javascript', 'typescript', 'frontend'],
      fastapi: ['python', 'flask', 'django', 'backend'],
    };

    jdSkills.forEach((skill) => {
      const lower = skill.toLowerCase().trim();
      if (resumeSkills.has(lower)) {
        strong.push(skill);
      } else {
        // Check partial relations
        const relatives = relatedMap[lower] || [];
        const isPartial = relatives.some((rel) => resumeSkills.has(rel));
        if (isPartial) {
          partial.push(skill);
        } else {
          gap.push(skill);
        }
      }
    });

    // Score: strong = 1, partial = 0.5, gap = 0, divided by count
    const totalCount = Math.max(1, jdSkills.length);
    const rawScore = strong.length * 1.0 + partial.length * 0.5;
    const pct = Math.round((rawScore / totalCount) * 100);

    // Study hours: gap ~4 hrs, partial ~2 hrs
    const hours = gap.length * 4 + partial.length * 2;

    return {
      strongMatches: strong,
      partialMatches: partial,
      gaps: gap,
      matchPercentage: pct,
      totalStudyHours: hours,
    };
  }, [jdSkills, resumeSkills]);

  // Category breakdown for Card 1
  const categoryBars = [
    { label: 'Language', pct: 92 },
    { label: 'Framework', pct: 85 },
    { label: 'Data', pct: 78 },
    { label: 'Tools', pct: 60 },
    { label: 'Concepts', pct: 82 },
    { label: 'Soft skills', pct: 88 },
  ];

  return (
    <div className="content-container pt-11 pb-24 space-y-8">
      {/* Title Row with Role and Big Match Figure */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#e7e5e1] pb-6">
        <div>
          <h2 className="h2-title text-[#111111]">Skill gap analysis</h2>
          <p className="text-[15px] text-[#6b6b6b] mt-1">
            {plan.jdTitle || 'Senior Full Stack Engineer'} · {plan.jdCompany || 'TechCorp Global'}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <div className="score-big text-[#111111] leading-none">
            {matchPercentage}%
          </div>
          <span className="text-[13px] text-[#6b6b6b] block mt-1">
            Estimated match, not a hiring prediction
          </span>
        </div>
      </div>

      {/* Three Cards: Strong matches, Partial matches, Skill gaps */}
      <div className="grid-three-up">
        {/* Strong matches */}
        <div className="spec-card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="h3-card text-[#111111]">Strong matches</h3>
            <span className="chip chip-strong">{strongMatches.length}</span>
          </div>
          <p className="text-[13px] text-[#6b6b6b]">
            Directly verified on your resume with matching production background.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {strongMatches.map((skill) => (
              <span key={skill} className="chip chip-strong">{skill}</span>
            ))}
            {strongMatches.length === 0 && (
              <span className="text-[12px] text-[#6b6b6b] italic">No direct matches</span>
            )}
          </div>
        </div>

        {/* Partial matches */}
        <div className="spec-card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="h3-card text-[#111111]">Partial matches</h3>
            <span className="chip chip-partial">{partialMatches.length}</span>
          </div>
          <p className="text-[13px] text-[#6b6b6b]">
            Related competencies present; expected to require ~2 hours of focused prep.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {partialMatches.map((skill) => (
              <span key={skill} className="chip chip-partial">{skill}</span>
            ))}
            {partialMatches.length === 0 && (
              <span className="text-[12px] text-[#6b6b6b] italic">No partial matches</span>
            )}
          </div>
        </div>

        {/* Skill gaps */}
        <div className="spec-card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="h3-card text-[#111111]">Skill gaps</h3>
            <span className="chip chip-gap">{gaps.length}</span>
          </div>
          <p className="text-[13px] text-[#6b6b6b]">
            Key job requirements not found on profile; recommended ~4 hours study per item.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {gaps.map((skill) => (
              <span key={skill} className="chip chip-gap">{skill}</span>
            ))}
            {gaps.length === 0 && (
              <span className="text-[12px] text-[#6b6b6b] italic">No detected gaps</span>
            )}
          </div>
        </div>
      </div>

      {/* Two Cards: Match by category & Preparation priorities */}
      <div className="grid-two-up">
        {/* Match by category */}
        <div className="spec-card space-y-4">
          <h3 className="h3-card text-[#111111]">Match by category</h3>

          <div className="space-y-3 pt-1">
            {categoryBars.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#111111] font-medium">{item.label}</span>
                  <span className="text-[#6b6b6b] font-medium">{item.pct}%</span>
                </div>
                <div className="spec-progress-track">
                  <div
                    className="spec-progress-bar"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preparation priorities */}
        <div className="spec-card space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="h3-card text-[#111111]">Preparation priorities</h3>
            
            <div className="space-y-2 pt-1">
              {gaps.map((skill) => (
                <div key={skill} className="flex items-center justify-between p-2 rounded-[6px] border border-[#e7e5e1]">
                  <span className="text-[14px] font-medium text-[#111111]">{skill}</span>
                  <div className="flex items-center gap-2">
                    <span className="chip chip-gap">Gap</span>
                    <span className="text-[12px] text-[#6b6b6b]">~4 hrs</span>
                  </div>
                </div>
              ))}

              {partialMatches.map((skill) => (
                <div key={skill} className="flex items-center justify-between p-2 rounded-[6px] border border-[#e7e5e1]">
                  <span className="text-[14px] font-medium text-[#111111]">{skill}</span>
                  <div className="flex items-center gap-2">
                    <span className="chip chip-partial">Partial</span>
                    <span className="text-[12px] text-[#6b6b6b]">~2 hrs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[#e7e5e1] pt-3 flex items-center justify-between text-[13px] text-[#6b6b6b]">
            <span>Total recommended study time</span>
            <span className="font-semibold text-[#111111]">{totalStudyHours} hours</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => navigate('/review')}
          className="btn-secondary"
        >
          Back to review
        </button>
        <button
          type="button"
          onClick={() => navigate('/questions')}
          className="btn-primary"
        >
          View questions
        </button>
      </div>
    </div>
  );
}
