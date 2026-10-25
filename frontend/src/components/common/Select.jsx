import React from 'react';

export const Select = ({
  label,
  options = [],
  error,
  helperText,
  id,
  className = '',
  placeholder = 'Select an option',
  ...props
}) => {
  const selectId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-2xs font-heading font-bold uppercase tracking-wider text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 bg-white cursor-pointer ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-400 bg-rose-50/20'
            : 'border-slate-300 focus:border-advantis-500 focus:ring-advantis-500/20'
        } ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt, index) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={index} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
      {error ? (
        <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Select;
