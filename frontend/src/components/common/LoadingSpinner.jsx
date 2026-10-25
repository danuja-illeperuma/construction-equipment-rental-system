import React from 'react';

export const LoadingSpinner = ({ size = 'md', message, className = '' }) => {
  const sizeMap = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
      <div
        className={`animate-spin rounded-full border-amber-200 border-t-amber-500 ${sizeMap[size] || sizeMap.md}`}
      />
      {message && <p className="mt-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
