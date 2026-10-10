import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function DimensionScoresChart({ scores }) {
  // scores: { relevance, completeness, specificity, structure, communication }
  const data = [
    { dimension: 'Relevance', score: scores?.relevance ?? 80 },
    { dimension: 'Completeness', score: scores?.completeness ?? 75 },
    { dimension: 'Specificity', score: scores?.specificity ?? 85 },
    { dimension: 'Structure', score: scores?.structure ?? 90 },
    { dimension: 'Communication', score: scores?.communication ?? 85 },
  ];

  const getColor = (val) => {
    if (val >= 80) return '#10b981'; // emerald
    if (val >= 65) return '#6366f1'; // indigo
    if (val >= 50) return '#f59e0b'; // amber
    return '#ef4444'; // rose
  };

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 25, left: 25, bottom: 5 }}>
          <XAxis type="number" domain={[0, 100]} stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis type="category" dataKey="dimension" stroke="#475569" tick={{ fill: '#cbd5e1', fontSize: 11 }} width={95} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
            formatter={(value) => [`${value}%`, 'Score']}
          />
          <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={16}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
