import React from 'react';

export const Textarea = ({
  label,
  error,
  helperText,
  id,
  rows = 3,
  className = '',
  ...props
}) => {
  const textareaId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={`w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-400 bg-rose-50/20'
            : 'border-slate-300 focus:border-amber-500 focus:ring-amber-400 bg-white'
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Textarea;
