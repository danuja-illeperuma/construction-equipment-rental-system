import React from 'react';
import { PackageOpen } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No records found',
  description = 'There is currently no data matching your criteria.',
  action,
  className = '',
}) => {
  return (
    <div className={`text-center py-12 px-6 rounded-xl border border-dashed border-slate-300 bg-white ${className}`}>
      <div className="inline-flex p-3.5 rounded-full bg-slate-100 text-slate-500 mb-3">
        <Icon className="h-8 w-8 stroke-[1.75]" />
      </div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;
