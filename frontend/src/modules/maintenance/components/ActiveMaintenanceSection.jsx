import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { Button } from '../../../components/common/Button';
import {
  Wrench,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const ActiveMaintenanceSection = ({
  records = [],
  onComplete,
  loading = false,
}) => {
  const navigate = useNavigate();

  // Filter only records that staff explicitly marked In Progress (taken to repair bay)
  const activeRecords = records.filter(
    (r) => r.status === 'PENDING' && Boolean(r.notes && r.notes.includes('[IN_PROGRESS]'))
  );

  return (
    <div className="bg-white rounded-xl border border-amber-200/80 shadow-xs overflow-hidden mb-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent px-5 py-4 border-b border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-xs">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-heading font-bold text-slate-900">
                Active Maintenance Workshop Bay
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-2xs font-heading font-extrabold uppercase bg-amber-500 text-white shadow-2xs">
                {activeRecords.length} In Progress
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Machinery moved from schedule into active workshop servicing. Fleet status is locked to <strong className="text-amber-800">MAINTENANCE</strong> and payment is handled by company.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="xs"
            onClick={() => navigate('/maintenance/schedule')}
            className="text-xs font-heading font-bold text-advantis-800 border-[#DFE8F0] hover:bg-slate-50"
          >
            Service Schedule &rarr;
          </Button>
        </div>
      </div>

      {/* Content */}
      {activeRecords.length === 0 ? (
        <div className="py-10 px-4 text-center">
          <div className="inline-flex p-3 rounded-full bg-emerald-50 text-emerald-600 mb-3 border border-emerald-100">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-heading font-bold text-slate-800">
            No Equipment Currently in Workshop Bays
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            All equipment is operating normally or awaiting its scheduled date. When an item is marked <strong>In Progress</strong> from the Service Schedule, it moves here for active servicing.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead className="bg-slate-50 text-2xs font-heading font-bold uppercase tracking-wider text-slate-700">
                <tr>
                  <th className="py-3 px-4">Equipment Unit</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Workshop Status</th>
                  <th className="py-3 px-4">Service Scope & Mechanic Notes</th>
                  <th className="py-3 px-4 text-right">Est. Cost</th>
                  <th className="py-3 px-4">Payment Handling</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {activeRecords.map((item) => (
                  <tr key={item.maintenanceId} className="hover:bg-amber-50/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-2xs font-extrabold text-advantis-800 bg-[#E8F2FA] px-2 py-0.5 rounded border border-[#A4D0F2]">
                          {item.equipmentCode}
                        </span>
                        <div>
                          <span className="font-heading font-bold text-slate-900 text-xs sm:text-sm block">
                            {item.equipmentName}
                          </span>
                          <span className="text-3xs text-slate-500">
                            Service Date: {item.maintenanceDate ? formatDate(item.maintenanceDate) : '—'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-3xs font-heading font-extrabold uppercase border ${
                          item.maintenanceType === 'ROUTINE'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {item.maintenanceType || 'ROUTINE'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs animate-pulse">
                        <Wrench className="h-3 w-3 text-amber-700 animate-spin shrink-0" />
                        In Maintenance Progress
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-xs text-slate-800 font-medium truncate" title={item.description}>
                        {item.description || 'Standard safety overhaul'}
                      </p>
                      {item.notes && (
                        <p className="text-3xs text-slate-500 truncate mt-0.5" title={item.notes}>
                          {item.notes.replace('[IN_PROGRESS]', '').trim() || 'Servicing in progress'}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-heading font-bold text-xs text-slate-900 tabular-nums">
                      {formatCurrency(item.maintenanceCost)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold bg-blue-50 text-[#2473B5] border border-[#A4D0F2]">
                        🏢 Handled by Company
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {onComplete && (
                        <Button
                          variant="success"
                          size="xs"
                          icon={CheckCircle2}
                          onClick={() => onComplete(item)}
                          className="font-heading font-bold text-2xs shadow-xs"
                          title="Certify equipment safe and return to AVAILABLE"
                        >
                          Complete Service
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveMaintenanceSection;
