import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'amber',
  trend,
  className = '',
}) => {
  const colorMap = {
    brand: 'bg-[#F5F9FC] text-[#368BD1] border-[#DFE8F0]',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-[#F5F9FC] text-[#368BD1] border-[#DFE8F0]',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-200',
    slate: 'bg-[#F5F9FC] text-[#263746] border-[#DFE8F0]',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };

  return (
    <div className={`bg-white rounded-xl border border-[#DFE8F0] p-5 shadow-xs transition-shadow hover:shadow-md ${className}`}>
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-2xs font-heading font-bold uppercase tracking-wider text-[#657786] truncate">{title}</p>
          <h4 className="mt-1.5 text-2xl sm:text-3xl font-heading font-bold text-[#263746] tracking-tight tabular-nums">{value}</h4>
          {subtitle && <p className="mt-1 text-xs text-[#657786] truncate">{subtitle}</p>}
          {trend && (
            <p className="mt-1 text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <span>{trend}</span>
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border shrink-0 ml-3 ${colorMap[color] || colorMap.blue}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
