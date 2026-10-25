import React from 'react';
import { getStatusConfig } from '../../utils/statusHelpers';

export const StatusBadge = ({ status, className = '' }) => {
  if (!status) return null;
  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-heading font-bold uppercase tracking-wider border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
