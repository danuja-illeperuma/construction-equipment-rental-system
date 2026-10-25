import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({
  type = 'info',
  message,
  onClose,
  className = '',
}) => {
  const typeMap = {
    success: {
      bg: 'bg-emerald-900/90 border-emerald-700 text-white',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />,
    },
    error: {
      bg: 'bg-rose-900/90 border-rose-700 text-white',
      icon: <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-900/90 border-amber-700 text-white',
      icon: <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />,
    },
    info: {
      bg: 'bg-slate-900/95 border-slate-700 text-white',
      icon: <Info className="h-5 w-5 text-amber-400 shrink-0" />,
    },
  };

  const style = typeMap[type] || typeMap.info;

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-xs transition-all text-sm font-medium ${style.bg} ${className}`}
    >
      {style.icon}
      <p className="flex-1 text-xs sm:text-sm leading-snug">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default Toast;
