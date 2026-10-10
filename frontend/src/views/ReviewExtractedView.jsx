import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export default function ReviewExtractedView() {
  const navigate = useNavigate();
  const { plan, updatePlan, showToast } = useAppStore();

  const [candidateName, setCandidateName] = useState(plan.resumeName || '');
  const [resumeSkills, setResumeSkills] = useState(plan.resumeSkills || []);
  const [newResumeSkill, setNewResumeSkill] = useState('');
  const [education, setEducation] = useState(plan.resumeEducation || '');
  const [projectsExp, setProjectsExp] = useState(plan.resumeProjects || '');

  const [jdRole, setJdRole] = useState(plan.jdTitle || '');
  const [jdCompany, setJdCompany] = useState(plan.jdCompany || '');
  const [jdSkills, setJdSkills] = useState(plan.jdSkills || []);
  const [newJdSkill, setNewJdSkill] = useState('');
  const [responsibilities, setResponsibilities] = useState(plan.jdResponsibilities || '');

  const handleRemoveResumeSkill = (skillToRemove) => {
    const updated = resumeSkills.filter((s) => s !== skillToRemove);
    setResumeSkills(updated);
    updatePlan({ resumeSkills: updated });
  };

  const handleAddResumeSkill = (e) => {
    if (e.key === 'Enter' && newResumeSkill.trim()) {
      e.preventDefault();
      const updated = [...resumeSkills, newResumeSkill.trim()];
      setResumeSkills(updated);
      updatePlan({ resumeSkills: updated });
      setNewResumeSkill('');
    }
  };

  const handleRemoveJdSkill = (skillToRemove) => {
    const updated = jdSkills.filter((s) => s !== skillToRemove);
    setJdSkills(updated);
    updatePlan({ jdSkills: updated });
  };

  const handleAddJdSkill = (e) => {
    if (e.key === 'Enter' && newJdSkill.trim()) {
      e.preventDefault();
      const updated = [...jdSkills, newJdSkill.trim()];
      setJdSkills(updated);
      updatePlan({ jdSkills: updated });
      setNewJdSkill('');
    }
  };

  const handleConfirm = () => {
    updatePlan({
      resumeName: candidateName,
      resumeEducation: education,
      resumeProjects: projectsExp,
      jdTitle: jdRole,
      jdCompany: jdCompany,
      jdResponsibilities: responsibilities,
      resumeSkills,
      jdSkills,
    });
    showToast('Information confirmed');
    navigate('/skill-gap');
  };


  return (
    <div className="content-container pt-11 pb-24 space-y-8">
      <div>
        <h2 className="h2-title text-[#111111]">Review extracted information</h2>
        <p className="text-[15px] text-[#6b6b6b] mt-0.5">
          Verify the information extracted by the parser. Add or remove skills as needed.
        </p>
      </div>

      <div className="grid-two-up items-start">
        {/* Card 1: Resume summary */}
        <div className="spec-card space-y-4">
          <div className="border-b border-[#e7e5e1] pb-2.5">
            <h3 className="h3-card text-[#111111]">Resume summary</h3>
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#111111] block">Candidate name</label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="Candidate Name"
              className="spec-input"
            />
          </div>


          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#111111] block">Education</label>
            <input
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="spec-input"
            />
          </div>

          {/* Skills as removable chips with add field */}
          <div className="space-y-2">
            <label className="text-[13px] font-medium text-[#111111] block">
              Extracted skills ({resumeSkills.length})
            </label>
            <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 border border-[#e7e5e1] rounded-[6px]">
              {resumeSkills.map((skill) => (
                <span key={skill} className="chip">
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveResumeSkill(skill)}
                    className="hover:text-[#b3261e] cursor-pointer ml-0.5"
                    aria-label={`Remove ${skill}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={newResumeSkill}
              onChange={(e) => setNewResumeSkill(e.target.value)}
              onKeyDown={handleAddResumeSkill}
              placeholder="Type skill and press Enter to add..."
              className="spec-input text-[13px]"
            />
          </div>

          {/* Projects and experience textarea */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#111111] block">Projects & experience highlights</label>
            <textarea
              rows={4}
              value={projectsExp}
              onChange={(e) => setProjectsExp(e.target.value)}
              className="spec-textarea text-[13px]"
            />
          </div>
        </div>

        {/* Card 2: Job description summary */}
        <div className="spec-card space-y-4">
          <div className="border-b border-[#e7e5e1] pb-2.5">
            <h3 className="h3-card text-[#111111]">Job description summary</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-[#111111] block">Role</label>
              <input
                type="text"
                value={jdRole}
                onChange={(e) => setJdRole(e.target.value)}
                className="spec-input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-[#111111] block">Company</label>
              <input
                type="text"
                value={jdCompany}
                onChange={(e) => setJdCompany(e.target.value)}
                className="spec-input"
              />
            </div>
          </div>

          {/* Required skills as removable chips with add field */}
          <div className="space-y-2">
            <label className="text-[13px] font-medium text-[#111111] block">
              Required competencies ({jdSkills.length})
            </label>
            <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 border border-[#e7e5e1] rounded-[6px]">
              {jdSkills.map((skill) => (
                <span key={skill} className="chip">
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveJdSkill(skill)}
                    className="hover:text-[#b3261e] cursor-pointer ml-0.5"
                    aria-label={`Remove ${skill}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={newJdSkill}
              onChange={(e) => setNewJdSkill(e.target.value)}
              onKeyDown={handleAddJdSkill}
              placeholder="Type required skill and press Enter to add..."
              className="spec-input text-[13px]"
            />
          </div>

          {/* Responsibilities textarea */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#111111] block">Key responsibilities</label>
            <textarea
              rows={4}
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              className="spec-textarea text-[13px]"
            />
          </div>
        </div>
      </div>

      {/* Buttons: Back and Confirm */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => navigate('/new-preparation')}
          className="btn-secondary"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="btn-primary"
        >
          Confirm & see skill gap
        </button>
      </div>
    </div>
  );
}
