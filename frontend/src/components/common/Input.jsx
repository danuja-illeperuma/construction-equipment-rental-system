import React from 'react';

export const Input = ({
  label,
  error,
  helperText,
  id,
  className = '',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  ...props
}) => {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-2xs font-heading font-bold uppercase tracking-wider text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative rounded-lg shadow-2xs">
        {LeftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <LeftIcon className="h-4 w-4" />
          </div>
        )}
        <input
          id={inputId}
          className={`w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
            LeftIcon ? 'pl-9' : ''
          } ${RightIcon ? 'pr-9' : ''} ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-400 bg-rose-50/20'
              : 'border-slate-300 focus:border-advantis-500 focus:ring-advantis-500/20 bg-white'
          } ${className}`}
          {...props}
        />
        {RightIcon && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
            <RightIcon className="h-4 w-4" />
          </div>
        )}
      </div>
      {error ? (
        <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Input;
