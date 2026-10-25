import React from 'react';

export const PageHeader = ({
  title,
  subtitle,
  children,
  breadcrumbs,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-6 border-b border-slate-200 gap-4 ${className}`}>
      <div className="min-w-0 flex-1">
        {breadcrumbs && (
          <div className="text-xs font-semibold text-slate-400 mb-1">
            {breadcrumbs}
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-advantis-900 tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-3 shrink-0">{children}</div>}
    </div>
  );
};

export default PageHeader;
