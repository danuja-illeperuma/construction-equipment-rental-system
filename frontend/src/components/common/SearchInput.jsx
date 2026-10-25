import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchInput = ({
  value,
  onChange,
  placeholder = 'Search...',
  onClear,
  className = '',
  ...props
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
        <Search className="h-4 w-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-9 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors"
        {...props}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
