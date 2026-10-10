import React from 'react';

export default function LoadingOverlay({ isVisible, statusText = "Processing..." }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white/92 flex items-center justify-center p-4 select-none">
      <div className="bg-white border border-[#e7e5e1] rounded-[8px] p-8 max-w-sm w-full flex flex-col items-center justify-center gap-4 text-center">
        {/* 30px spinner with 2px ring, ink top */}
        <div
          className="w-[30px] h-[30px] rounded-full border-[2px] border-[#e7e5e1] border-t-[#111111] animate-spin"
          style={{ animationDuration: '0.8s' }}
        />
        <p className="text-[14px] text-[#111111] font-medium leading-normal">
          {statusText}
        </p>
      </div>
    </div>
  );
}
