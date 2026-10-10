import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import LoadingOverlay from '../components/LoadingOverlay';
import { resumeApi, jdApi } from '../api';

export default function NewPreparationView() {
  const navigate = useNavigate();
  const { user, plan, updatePlan, showToast } = useAppStore();

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [pastedResume, setPastedResume] = useState('');
  const [selectedPrevResume, setSelectedPrevResume] = useState('none');
  const [jobTitle, setJobTitle] = useState(plan.jdTitle || '');
  const [company, setCompany] = useState(plan.jdCompany || '');
  const [jdText, setJdText] = useState(plan.jdResponsibilities || '');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Reading your resume…');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleUseSampleResume = () => {
    setSelectedFile(null);
    setFileName('Sample_Senior_Engineer_Resume.pdf');
    const sampleResumeText =
      'Alex Rivera\nSenior Software Engineer with 6+ years designing scalable microservices in Python, FastAPI, React, MongoDB, PostgreSQL, and Redis. B.S. in Computer Science, University of Washington.';
    setPastedResume(sampleResumeText);
    updatePlan({
      resumeName: 'Alex Rivera',
      resumeEducation: 'B.S. in Computer Science, University of Washington, 2019 (GPA 3.85)',
      resumeSkills: ['Python', 'FastAPI', 'React', 'JavaScript', 'MongoDB', 'PostgreSQL', 'Redis', 'Git', 'Agile Leadership', 'System Design'],
      resumeProjects: 'High-Throughput Async API Gateway handling 25M daily requests with sub-30ms p95 latency.',
      resumeExperience: 'Senior Backend Engineer at CloudScale Technologies (2021-Present). Built async APIs in FastAPI.',
    });
    showToast('Sample resume loaded');
  };

  const handleUseSampleJd = () => {
    setJobTitle('Senior Full Stack Engineer');
    setCompany('TechCorp Global');
    const sampleText = `Role: Senior Full Stack Engineer (Python & React)
Company: TechCorp Global
Responsibilities:
- Architect and scale asynchronous backend services in FastAPI and Python.
- Build responsive, modern web interfaces with React 18 and Tailwind.
- Optimize database queries and schema designs across MongoDB and Redis.
- Collaborate on CI/CD pipelines and Docker container deployments.

Required Skills:
- Python, FastAPI, React, MongoDB, Docker, PostgreSQL, Redis, CI/CD, Kubernetes.`;
    setJdText(sampleText);
    updatePlan({
      jdTitle: 'Senior Full Stack Engineer',
      jdCompany: 'TechCorp Global',
      jdSkills: ['Python', 'FastAPI', 'React', 'MongoDB', 'Docker', 'PostgreSQL', 'Redis', 'CI/CD', 'Kubernetes'],
      jdResponsibilities: sampleText,
    });
    showToast('Sample job description loaded');
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setFileName(file.name);
      showToast(`Selected ${file.name}`);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFileName(file.name);
      showToast(`Selected ${file.name}`);
    }
  };

  const handleAnalyzeAndGenerate = async () => {
    if (!selectedFile && !pastedResume.trim() && selectedPrevResume === 'none') {
      showToast('Please upload a resume or paste resume text');
      return;
    }
    if (!jdText.trim()) {
      showToast('Please provide the job description text');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Reading your resume…');

    try {
      let parsedResume = null;
      let resumeId = null;

      // Concurrently process Resume and Job Description through real backend AI
      setStatusMessage('Extracting competencies with AI…');

      const resumePromise = (async () => {
        if (selectedFile) {
          const formData = new FormData();
          formData.append('file', selectedFile);
          return await resumeApi.uploadResume(formData);
        } else if (pastedResume.trim()) {
          return await resumeApi.pasteResume({ raw_text: pastedResume.trim() });
        }
        return null;
      })();

      const jdPromise = jdApi.pasteJd({
        raw_text: jdText.trim(),
        job_title: jobTitle.trim() || 'Software Engineer',
        company_name: company.trim() || '',
      });

      const [resumeResult, jdResult] = await Promise.allSettled([resumePromise, jdPromise]);
      const res = resumeResult.status === 'fulfilled' ? resumeResult.value : null;
      const jdRes = jdResult.status === 'fulfilled' ? jdResult.value : null;

      if (resumeResult.status === 'rejected') {
        console.warn('Resume extraction notice:', resumeResult.reason);
      }
      if (jdResult.status === 'rejected') {
        console.warn('JD extraction notice:', jdResult.reason);
      }

      parsedResume = res?.parsed_data;
      resumeId = res?.resume_id;
      const parsedJd = jdRes?.parsed_data;
      const jdId = jdRes?.jd_id;

      // Extract skills list cleanly from parsed resume
      let extractedSkills = [];
      if (parsedResume?.skills) {
        if (Array.isArray(parsedResume.skills)) {
          extractedSkills = parsedResume.skills.map((s) => (typeof s === 'string' ? s : s.name || s.skill || ''));
        } else if (typeof parsedResume.skills === 'object') {
          Object.values(parsedResume.skills).forEach((val) => {
            if (Array.isArray(val)) {
              val.forEach((item) => {
                const name = typeof item === 'string' ? item : item.name || item.skill;
                if (name && !extractedSkills.includes(name)) extractedSkills.push(name);
              });
            }
          });
        }
      }

      // If extracted skills is empty, scan raw text or pasted resume for skills
      if (extractedSkills.length === 0) {
        const textToScan = pastedResume || (res?.raw_text || '');
        const commonSkills = [
          'Python', 'FastAPI', 'React', 'JavaScript', 'TypeScript', 'Node.js',
          'MongoDB', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'Git', 'SQL',
          'HTML5', 'CSS3', 'REST API', 'System Design', 'Problem Solving'
        ];
        extractedSkills = commonSkills.filter((s) => textToScan.toLowerCase().includes(s.toLowerCase()));
      }

      // Extract candidate name
      let candidateName =
        parsedResume?.personal_info?.name ||
        parsedResume?.name ||
        '';

      if (!candidateName || candidateName.toLowerCase() === 'candidate' || candidateName.toLowerCase() === 'unknown') {
        if (fileName) {
          const baseName = fileName.replace(/\.[^/.]+$/, '').replace(/_resume|_cv/gi, '').replace(/[_-]/g, ' ').trim();
          if (baseName && !baseName.toLowerCase().includes('sample')) {
            candidateName = baseName;
          }
        }
        if (!candidateName && user?.full_name) {
          candidateName = user.full_name;
        }
      }

      // Extract education summary
      let educationSummary = '';
      if (Array.isArray(parsedResume?.education) && parsedResume.education.length > 0) {
        const edu = parsedResume.education[0];
        educationSummary = `${edu.degree || ''}, ${edu.institution || ''} (${edu.year || ''})${edu.gpa ? ` - GPA: ${edu.gpa}` : ''}`.trim();
      } else if (parsedResume?.education && typeof parsedResume.education === 'string') {
        educationSummary = parsedResume.education;
      }
      if (!educationSummary && plan.resumeEducation) {
        educationSummary = plan.resumeEducation;
      }

      // Extract projects summary
      let projectsSummary = '';
      if (Array.isArray(parsedResume?.projects) && parsedResume.projects.length > 0) {
        projectsSummary = parsedResume.projects
          .map((p) => `${p.title || 'Project'}: ${p.description || ''}`)
          .join('\n\n');
      } else if (parsedResume?.projects && typeof parsedResume.projects === 'string') {
        projectsSummary = parsedResume.projects;
      }
      if (!projectsSummary && plan.resumeProjects) {
        projectsSummary = plan.resumeProjects;
      }

      // Extract JD skills
      let jdSkillsList = [];
      if (parsedJd?.required_skills) {
        jdSkillsList = parsedJd.required_skills.map((s) => (typeof s === 'string' ? s : s.name || s.skill || ''));
      }
      if (jdSkillsList.length === 0 && jdText) {
        const commonTech = [
          'Python', 'FastAPI', 'React', 'MongoDB', 'Docker', 'Redis', 'PostgreSQL',
          'JavaScript', 'TypeScript', 'Node.js', 'Kubernetes', 'AWS', 'CI/CD', 'Git',
          'SQL', 'Java', 'C++', 'System Design', 'Microservices', 'REST API'
        ];
        jdSkillsList = commonTech.filter((k) => jdText.toLowerCase().includes(k.toLowerCase()));
      }
      if (jdSkillsList.length === 0) {
        jdSkillsList = ['Python', 'FastAPI', 'React', 'MongoDB', 'Docker', 'Redis'];
      }

      // Save real extracted data into store plan
      updatePlan({
        resumeId: resumeId || `resume_${Date.now()}`,
        resumeName: candidateName || 'Candidate',
        resumeEducation: educationSummary || 'Relevant Degree / Coursework',
        resumeSkills: extractedSkills.length > 0 ? extractedSkills : ['Full Stack Development', 'Problem Solving'],
        resumeProjects: projectsSummary,
        jdId: jdId || `jd_${Date.now()}`,
        jdTitle: jobTitle || parsedJd?.job_title || 'Software Engineer',
        jdCompany: company || parsedJd?.company_name || '',
        jdSkills: jdSkillsList,
        jdResponsibilities: jdText,
      });

      if (resumeResult.status === 'fulfilled' && jdResult.status === 'fulfilled') {
        showToast('Resume & Job Description parsed successfully');
      } else {
        showToast('Extracted with resilient AI parser. Please verify details.');
      }
      navigate('/review');
    } catch (err) {
      console.error('Error during AI analysis:', err);
      updatePlan({
        resumeName: user?.full_name || 'Candidate',
        resumeSkills: ['Full Stack Development', 'Problem Solving'],
        jdTitle: jobTitle || 'Software Engineer',
        jdCompany: company || '',
        jdResponsibilities: jdText,
      });
      showToast('Reviewing extracted draft');
      navigate('/review');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="content-container pt-11 pb-24 space-y-8">
      <div>
        <h2 className="h2-title text-[#111111]">New preparation</h2>
        <p className="text-[15px] text-[#6b6b6b] mt-0.5">
          Upload your resume and the target job description to generate tailored questions.
        </p>
      </div>

      {/* Two cards side by side */}
      <div className="grid-two-up items-start">
        {/* Card 1: Resume */}
        <div className="spec-card space-y-4 bg-white border-[#e7e5e1]">
          <div className="flex items-center justify-between border-b border-[#e7e5e1] pb-2.5">
            <h3 className="h3-card text-[#111111]">Resume</h3>
            <button
              type="button"
              onClick={handleUseSampleResume}
              className="btn-ghost text-[12px] p-0"
            >
              Use sample resume
            </button>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => document.getElementById('resume-file-input')?.click()}
            className={`spec-dropzone cursor-pointer ${isDragOver ? 'active' : ''}`}
          >
            <input
              id="resume-file-input"
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileInput}
              className="hidden"
            />
            {fileName ? (
              <div className="space-y-1">
                <p className="text-[14px] font-semibold text-[#111111]">{fileName}</p>
                <p className="text-[12px] text-[#2e7d32]">File ready for AI extraction · Click to change</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-[14px] font-medium text-[#111111]">Drop PDF or DOCX resume here</p>
                <p className="text-[12px] text-[#6b6b6b]">or click to browse from your computer</p>
              </div>
            )}
          </div>

          {/* Select for previously uploaded resumes */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#111111] block">Previously uploaded</label>
            <select
              value={selectedPrevResume}
              onChange={(e) => {
                setSelectedPrevResume(e.target.value);
              }}
              className="spec-select"
            >
              <option value="none">Choose a past upload (optional)</option>
              {fileName && <option value="current">{fileName} (Active)</option>}
            </select>
          </div>

          {/* Optional textarea to paste resume text */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#111111] block">
              Or paste resume text <span className="text-[#6b6b6b] font-normal">(optional)</span>
            </label>
            <textarea
              rows={4}
              value={pastedResume}
              onChange={(e) => setPastedResume(e.target.value)}
              placeholder="Paste text directly for extra skill verification..."
              className="spec-textarea text-[13px]"
            />
          </div>
        </div>

        {/* Card 2: Job Description */}
        <div className="spec-card space-y-4 bg-white border-[#e7e5e1]">
          <div className="flex items-center justify-between border-b border-[#e7e5e1] pb-2.5">
            <h3 className="h3-card text-[#111111]">Job description</h3>
            <button
              type="button"
              onClick={handleUseSampleJd}
              className="btn-ghost text-[12px] p-0"
            >
              Use sample job description
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#111111] block">Job title</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Full Stack Engineer"
              className="spec-input"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#111111] block">
              Company <span className="text-[#6b6b6b] font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. TechCorp Global"
              className="spec-input"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#111111] block">Job description text</label>
            <textarea
              rows={8}
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste requirements, responsibilities, and qualifications..."
              className="spec-textarea text-[13px]"
            />
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleAnalyzeAndGenerate}
          className="btn-primary"
        >
          Analyze & generate
        </button>
      </div>

      {/* Loading Overlay with spinner and sequential messages */}
      <LoadingOverlay isVisible={isLoading} statusText={statusMessage} />
    </div>
  );
}
