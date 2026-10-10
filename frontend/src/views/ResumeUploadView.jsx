import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { resumeApi } from '../api';
import { useAppStore } from '../store/useAppStore';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Code,
  GraduationCap,
  Briefcase,
  Layers,
} from 'lucide-react';

export default function ResumeUploadView() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { resumeId, parsedResume, setResume } = useAppStore();

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) {
      toast.warning('Please select or drop a PDF/DOCX resume file.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await resumeApi.uploadResume(formData);
      const newResumeId = res.resume_id || res.id;
      const parsedData = res.parsed_resume || res.data || res;
      setResume(newResumeId, parsedData);
      toast.success('Resume parsed and analyzed successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to parse resume. Check server connection.');
    } finally {
      setUploading(false);
    }
  };

  // Sample resume for testing without local pdf files
  const handleLoadSampleResume = () => {
    const sample = {
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      phone: '+1 555-0199',
      summary: 'Senior Software Engineer with 6+ years designing scalable microservices in Python, FastAPI, React, and MongoDB.',
      skills: {
        technical: ['Python', 'FastAPI', 'React', 'TypeScript', 'Node.js', 'MongoDB', 'PostgreSQL', 'Docker', 'Redis', 'AWS'],
        soft_skills: ['System Design', 'Agile Leadership', 'Technical Mentorship', 'Problem Solving', 'Communication'],
        tools: ['Git', 'GitHub Actions', 'Postman', 'Linux', 'Kubernetes'],
      },
      experience: [
        {
          role: 'Senior Backend Engineer',
          company: 'CloudScale Technologies',
          duration: '2021 - Present',
          description: 'Architected high-throughput async APIs in FastAPI handling 25M daily requests.',
        },
        {
          role: 'Full Stack Developer',
          company: 'Innovate Solutions',
          duration: '2019 - 2021',
          description: 'Built responsive enterprise dashboards with React and integrated secure RESTful endpoints.',
        },
      ],
      education: [
        {
          degree: 'B.S. in Computer Science',
          institution: 'University of Washington',
          year: '2019',
        },
      ],
    };
    setResume('sample_resume_67890', sample);
    toast.success('Sample Senior Full-Stack resume loaded!');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <FileText className="w-3.5 h-3.5" />
          <span>Profile Extraction Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Resume Profiler</h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Upload your resume in PDF or DOCX format. Our AI parser extracts your technical proficiencies, work history, and seniority to tailor your mock interview questions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Column (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* React Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[260px] ${
              isDragActive
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80'
            }`}
          >
            <input {...getInputProps()} />
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <UploadCloud className="w-7 h-7" />
            </div>
            {file ? (
              <div className="text-center">
                <p className="text-sm font-semibold text-white truncate max-w-xs">{file.name}</p>
                <p className="text-xs text-slate-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                <span className="mt-3 inline-block text-xs text-indigo-400 underline">Click or drag to replace</span>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-white">
                  {isDragActive ? 'Drop your resume file here' : 'Drag & drop your resume here'}
                </p>
                <p className="text-xs text-slate-400 mt-1.5">Supports PDF or DOCX up to 10MB</p>
                <span className="mt-3 inline-block px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  Browse Files
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{uploading ? 'Extracting Resume Insights...' : 'Analyze Resume with AI'}</span>
            </button>

            <button
              type="button"
              onClick={handleLoadSampleResume}
              className="w-full py-2.5 rounded-xl font-medium text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            >
              ⚡ Load Sample Senior Engineer Resume
            </button>
          </div>
        </div>

        {/* Parsed Insights Column (7 cols) */}
        <div className="lg:col-span-7">
          {parsedResume ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl"
            >
              {/* Header profile */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{parsedResume.name || 'Candidate Profile'}</h3>
                  <p className="text-xs text-slate-400">
                    {parsedResume.email} {parsedResume.phone && `• ${parsedResume.phone}`}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Profile Active</span>
                </span>
              </div>

              {/* Summary */}
              {parsedResume.summary && (
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Professional Summary
                  </span>
                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                    {parsedResume.summary}
                  </p>
                </div>
              )}

              {/* Skills categorization */}
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Detected Technical Skills</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {(parsedResume.skills?.technical || parsedResume.technical_skills || ['Python', 'React', 'FastAPI', 'MongoDB']).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Soft skills & Tools */}
              {(parsedResume.skills?.soft_skills || parsedResume.skills?.tools) && (
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    <span>Tools & Core Competencies</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      ...(parsedResume.skills?.soft_skills || []),
                      ...(parsedResume.skills?.tools || []),
                    ].map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700/60"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience Highlights */}
              {parsedResume.experience && parsedResume.experience.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                    <span>Work Experience</span>
                  </span>
                  <div className="space-y-2.5">
                    {parsedResume.experience.map((exp, idx) => (
                      <div key={idx} className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 text-xs">
                        <div className="flex justify-between items-center text-slate-200 font-semibold">
                          <span>{exp.role || exp.title}</span>
                          <span className="text-slate-500 font-mono text-[11px]">{exp.duration}</span>
                        </div>
                        <div className="text-indigo-400 mt-0.5">{exp.company}</div>
                        {exp.description && <p className="text-slate-400 mt-1 leading-normal">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="h-full min-h-[300px] border border-slate-800/80 rounded-2xl bg-slate-900/30 flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <FileText className="w-12 h-12 stroke-[1.5] mb-3 text-slate-600" />
              <p className="text-sm font-medium text-slate-400">No Resume Analyzed Yet</p>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Drop your PDF or DOCX resume on the left or click &quot;Load Sample Senior Engineer Resume&quot; to test the extractor.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
