import React, { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export default function Toast() {
  const { toastMessage, clearToast } = useAppStore();

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      clearToast();
    }, 2600);
    return () => clearTimeout(timer);
  }, [toastMessage, clearToast]);

  if (!toastMessage) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#111111] text-white text-[14px] px-4 py-2.5 rounded-[6px] shadow-sm flex items-center justify-center transition-all animate-fade-rise select-none"
    >
      {toastMessage}
    </div>
  );
}
