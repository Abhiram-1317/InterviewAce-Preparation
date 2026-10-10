import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export default function SkillRadarChart({ data, title = "Skill Proficiency Radar" }) {
  // Default mock/fallback data if empty
  const chartData = data && data.length > 0 ? data : [
    { subject: 'Technical', A: 85, fullMark: 100 },
    { subject: 'Problem Solving', A: 90, fullMark: 100 },
    { subject: 'Communication', A: 75, fullMark: 100 },
    { subject: 'Behavioral', A: 80, fullMark: 100 },
    { subject: 'System Design', A: 70, fullMark: 100 },
    { subject: 'Code Quality', A: 85, fullMark: 100 },
  ];

  return (
    <div className="w-full h-72 flex flex-col items-center justify-center">
      {title && <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{title}</h4>}
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
          <PolarGrid stroke="#334155" strokeDasharray="3 3" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fill: '#64748b', fontSize: 10 }} />
          <Radar
            name="Score"
            dataKey="A"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.45}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
            itemStyle={{ color: '#818cf8' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
