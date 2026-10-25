import React from 'react';

const variants = {
  primary: 'bg-[#368BD1] hover:bg-[#2473B5] text-white font-heading font-semibold shadow-xs focus:ring-[#5BA9E6] border border-transparent',
  accent: 'bg-[#5BA9E6] hover:bg-[#368BD1] text-white font-heading font-bold shadow-xs focus:ring-[#5BA9E6]',
  secondary: 'bg-white hover:bg-[#F5F9FC] text-[#368BD1] font-heading font-semibold border border-[#368BD1] shadow-xs focus:ring-[#5BA9E6]',
  outline: 'border border-[#DFE8F0] hover:bg-[#F5F9FC] hover:border-[#368BD1] text-[#263746] font-heading font-semibold focus:ring-[#5BA9E6] bg-white',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white font-heading font-medium shadow-xs focus:ring-rose-400',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-medium shadow-xs focus:ring-emerald-400',
  ghost: 'text-[#657786] hover:text-[#263746] hover:bg-[#F5F9FC] font-heading font-medium',
};

const sizes = {
  sm: 'px-2.5 py-1.5 text-xs rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-5 py-2.5 text-base rounded-lg',
};

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  icon: Icon,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : Icon ? (
        <Icon className="-ml-0.5 mr-2 h-4 w-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
