import React from 'react';

/**
 * Dedicated status badge component for equipment assets.
 * Valid database enums: AVAILABLE, RENTED, MAINTENANCE.
 */
export const EquipmentStatusBadge = ({ status, className = '' }) => {
  const normalized = (status || '').toUpperCase();

  const getStyle = () => {
    switch (normalized) {
      case 'AVAILABLE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'RENTED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'MAINTENANCE':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getDotStyle = () => {
    switch (normalized) {
      case 'AVAILABLE':
        return 'bg-emerald-500';
      case 'RENTED':
        return 'bg-blue-500';
      case 'MAINTENANCE':
        return 'bg-rose-500';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyle()} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${getDotStyle()}`} />
      {normalized || 'UNKNOWN'}
    </span>
  );
};

export default EquipmentStatusBadge;
