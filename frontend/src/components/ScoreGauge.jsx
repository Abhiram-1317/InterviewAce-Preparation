import React from 'react';
import { motion } from 'framer-motion';

export default function ScoreGauge({ score = 0, size = 120, strokeWidth = 10, label = "Overall Score" }) {
  const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  const getColor = (s) => {
    if (s >= 80) return '#10b981'; // emerald
    if (s >= 65) return '#6366f1'; // indigo
    if (s >= 50) return '#f59e0b'; // amber
    return '#ef4444'; // rose
  };

  const color = getColor(normalizedScore);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Fill */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeLinecap="round"
            fill="transparent"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span 
            className="text-2xl font-bold tracking-tight text-white"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            {normalizedScore}%
          </motion.span>
        </div>
      </div>
      {label && <span className="mt-2 text-xs font-medium text-slate-400">{label}</span>}
    </div>
  );
}
