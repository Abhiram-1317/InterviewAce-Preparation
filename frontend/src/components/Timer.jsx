import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function Timer({ active = true, onTick }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval = null;
    if (active) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          if (onTick) onTick(next);
          return next;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [active, onTick]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono text-sm shadow-inner">
      <Clock className={`w-4 h-4 ${active ? 'text-indigo-400 animate-spin-slow' : 'text-slate-500'}`} />
      <span>{formatTime(seconds)}</span>
    </div>
  );
}
