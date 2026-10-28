import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { maintenanceApi } from '../api/maintenanceApi';
import { equipmentApi } from '../../equipment/api/equipmentApi';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatCard } from '../../../components/common/StatCard';
import { Button } from '../../../components/common/Button';
import { DataTable } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Modal } from '../../../components/common/Modal';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import {
  CalendarClock,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Wrench,
  Search,
  Filter,
  Plus,
  RefreshCw,
  ShieldAlert,
  ArrowRight,
  HardHat,
  Check,
} from 'lucide-react';

export const MaintenanceSchedule = () => {
  const navigate = useNavigate();
  const { error, success } = useToast();

  const [records, setRecords] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [timeFilter, setTimeFilter] = useState('DUE_OVERDUE'); // 'DUE_OVERDUE' | 'TODAY' | 'OVERDUE' | 'UPCOMING' | 'PENDING' | 'COMPLETED' | 'ALL'
  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL' | 'ROUTINE' | 'REPAIR'
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog & Modal states
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [recordToComplete, setRecordToComplete] = useState(null);
  const [completeLoading, setCompleteLoading] = useState(false);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
  const [startingProgressId, setStartingProgressId] = useState(null);

  const todayStr = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [scheduleForm, setScheduleForm] = useState({
    equipmentId: '',
    maintenanceType: 'ROUTINE',
    description: '',
    maintenanceCost: '0.00',
    maintenanceDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    notes: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [maintRes, equipRes] = await Promise.all([
        maintenanceApi.getAll(),
        equipmentApi.getAll(),
      ]);

      if (maintRes?.success) setRecords(maintRes.data);
      else if (Array.isArray(maintRes)) setRecords(maintRes);
      else setRecords([]);

      if (equipRes?.success) setEquipmentList(equipRes.data);
      else if (Array.isArray(equipRes)) setEquipmentList(equipRes);
      else setEquipmentList([]);
    } catch (err) {
      error(err.message || 'Failed to fetch maintenance schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Days difference utility
  const getDayDiff = (targetDateStr) => {
    if (!targetDateStr) return 0;
    const target = new Date(String(targetDateStr).substring(0, 10));
    const today = new Date(todayStr);
    const diffTime = target - today;
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  // Metrics computation: items in progress are separated from pending waiting queues
  const metrics = useMemo(() => {
    let dueToday = 0;
    let inProgress = 0;
    let overdue = 0;
    let upcoming = 0;
    let completed = 0;

    records.forEach((r) => {
      const dateStr = r.maintenanceDate ? String(r.maintenanceDate).substring(0, 10) : '';
      if (r.status === 'COMPLETED') {
        completed++;
      } else if (r.status === 'PENDING') {
        const inProg = Boolean(r.notes && r.notes.includes('[IN_PROGRESS]'));
        if (inProg) {
          inProgress++;
        } else if (dateStr === todayStr) {
          dueToday++;
        } else if (dateStr < todayStr) {
          overdue++;
        } else if (dateStr > todayStr) {
          upcoming++;
        }
      }
    });

    return { dueToday, inProgress, overdue, upcoming, completed };
  }, [records, todayStr]);

  // Filtered records: moved items no longer appear under Today or Overdue waiting lists
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const dateStr = r.maintenanceDate ? String(r.maintenanceDate).substring(0, 10) : '';
      const isPending = r.status === 'PENDING';
      const isCompleted = r.status === 'COMPLETED';
      const inProg = isPending && Boolean(r.notes && r.notes.includes('[IN_PROGRESS]'));
      const isOverdue = isPending && !inProg && dateStr && dateStr < todayStr;
      const isDueToday = isPending && !inProg && dateStr && dateStr === todayStr;
      const isUpcoming = isPending && !inProg && dateStr && dateStr > todayStr;

      // Time filter check
      let timeMatch = true;
      if (timeFilter === 'DUE_OVERDUE') {
        timeMatch = isDueToday || isOverdue;
      } else if (timeFilter === 'TODAY') {
        timeMatch = isDueToday;
      } else if (timeFilter === 'IN_PROGRESS') {
        timeMatch = inProg;
      } else if (timeFilter === 'OVERDUE') {
        timeMatch = isOverdue;
      } else if (timeFilter === 'UPCOMING') {
        timeMatch = isUpcoming;
      } else if (timeFilter === 'PENDING') {
        timeMatch = isPending;
      } else if (timeFilter === 'COMPLETED') {
        timeMatch = isCompleted;
      } else if (timeFilter === 'ALL') {
        timeMatch = true;
      }

      // Type filter check
      let typeMatch = true;
      if (typeFilter !== 'ALL') {
        typeMatch = r.maintenanceType === typeFilter;
      }

      // Search query check
      let searchMatch = true;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const code = (r.equipmentCode || '').toLowerCase();
        const name = (r.equipmentName || '').toLowerCase();
        const desc = (r.description || '').toLowerCase();
        const cust = (r.customerName || '').toLowerCase();
        searchMatch = code.includes(query) || name.includes(query) || desc.includes(query) || cust.includes(query);
      }

      return timeMatch && typeMatch && searchMatch;
    });
  }, [records, timeFilter, typeFilter, searchQuery, todayStr]);

  // Start Maintenance Progress handler (extra button for Due Today / Overdue)
  const handleStartProgress = async (record) => {
    setStartingProgressId(record.maintenanceId);
    try {
      await maintenanceApi.startProgress(record.maintenanceId, record);
      success(`Work order #${record.maintenanceId} (${record.equipmentName}) moved to IN PROGRESS! Equipment marked as MAINTENANCE and payment handled by company.`);
      fetchData();
    } catch (err) {
      error(err.message || 'Failed to start maintenance progress');
    } finally {
      setStartingProgressId(null);
    }
  };

  // Complete maintenance handler
  const handleCompleteConfirm = async () => {
    if (!recordToComplete) return;
    setCompleteLoading(true);
    try {
      await maintenanceApi.complete(recordToComplete.maintenanceId);
      success(`Work Order #${recordToComplete.maintenanceId} completed! Equipment is certified safe and returned to AVAILABLE.`);
      setCompleteDialogOpen(false);
      setRecordToComplete(null);
      fetchData();
    } catch (err) {
      error(err.message || 'Failed to complete maintenance');
    } finally {
      setCompleteLoading(false);
    }
  };

  // Schedule new maintenance handler
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleForm.equipmentId) {
      error('Please select an equipment');
      return;
    }
    if (scheduleForm.maintenanceDate <= todayStr) {
      error('Scheduled service date must be in the future (tomorrow or later). Routine maintenance is scheduled in advance so MySQL Event evt_daily_maintenance_status_check activates it at 02:00 AM on the scheduled date.');
      return;
    }

    setScheduleSubmitting(true);
    try {
      await maintenanceApi.schedule({
        equipmentId: Number(scheduleForm.equipmentId),
        maintenanceType: scheduleForm.maintenanceType,
        description: scheduleForm.description,
        maintenanceCost: Number(scheduleForm.maintenanceCost || 0),
        maintenanceDate: scheduleForm.maintenanceDate,
        notes: scheduleForm.notes,
      });
      success('Maintenance service successfully scheduled! Equipment remains AVAILABLE until the scheduled date when the 02:00 AM automated event activates it.');
      setScheduleModalOpen(false);
      setScheduleForm({
        equipmentId: '',
        maintenanceType: 'ROUTINE',
        description: '',
        maintenanceCost: '0.00',
        maintenanceDate: tomorrowStr,
        notes: '',
      });
      fetchData();
    } catch (err) {
      error(err.message || 'Failed to schedule maintenance');
    } finally {
      setScheduleSubmitting(false);
    }
  };

  // Table columns definition
  const columns = [
    {
      header: 'Equipment',
      render: (row) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-2xs font-extrabold text-advantis-800 bg-[#E8F2FA] px-1.5 py-0.5 rounded border border-[#A4D0F2]">
              {row.equipmentCode}
            </span>
            <span className="font-heading font-bold text-slate-900 text-xs sm:text-sm">
              {row.equipmentName}
            </span>
          </div>
          {row.customerName && (
            <p className="text-3xs text-slate-500 mt-0.5">
              Assigned Customer: <span className="font-medium text-slate-700">{row.customerName}</span>
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Service Type',
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded text-3xs font-heading font-extrabold uppercase border ${
            row.maintenanceType === 'ROUTINE'
              ? 'bg-sky-50 text-sky-700 border-sky-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          {row.maintenanceType || 'ROUTINE'}
        </span>
      ),
    },
    {
      header: 'Scheduled Date',
      render: (row) => (
        <div className="text-xs font-semibold text-slate-800">
          {row.maintenanceDate ? formatDate(row.maintenanceDate) : '—'}
        </div>
      ),
    },
    {
      header: 'Timeline & Urgency',
      render: (row) => {
        const dateStr = row.maintenanceDate ? String(row.maintenanceDate).substring(0, 10) : '';
        const isPending = row.status === 'PENDING';
        const isCompleted = row.status === 'COMPLETED';
        const diffDays = getDayDiff(dateStr);
        const isInProgress = isPending && Boolean(row.notes && row.notes.includes('[IN_PROGRESS]'));

        if (isCompleted) {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
              Completed
            </span>
          );
        }

        if (isInProgress) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs animate-pulse">
              <Wrench className="h-3 w-3 text-amber-700 animate-spin shrink-0" />
              In Maintenance Progress
            </span>
          );
        }

        if (isPending) {
          if (dateStr === todayStr) {
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                <Clock className="h-3 w-3 text-amber-700 shrink-0" />
                Due Today
              </span>
            );
          }
          if (dateStr < todayStr) {
            const pastDays = Math.abs(diffDays);
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-extrabold uppercase bg-rose-100 text-rose-800 border border-rose-300">
                <AlertTriangle className="h-3 w-3 text-rose-600 shrink-0" />
                Overdue ({pastDays} {pastDays === 1 ? 'day' : 'days'} ago)
              </span>
            );
          }
          if (dateStr > todayStr) {
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-extrabold uppercase bg-sky-50 text-sky-700 border border-sky-200">
                <Calendar className="h-3 w-3 text-sky-600 shrink-0" />
                In {diffDays} {diffDays === 1 ? 'day' : 'days'}
              </span>
            );
          }
        }

        return <StatusBadge status={row.status} />;
      },
    },
    {
      header: 'Service Scope / Notes',
      render: (row) => (
        <div className="max-w-xs text-xs text-slate-600 truncate" title={row.description || row.notes}>
          {row.description || row.notes || 'Routine standard safety overhaul'}
        </div>
      ),
    },
    {
      header: 'Est. Cost',
      align: 'right',
      render: (row) => (
        <div className="font-heading font-bold text-xs text-slate-900 tabular-nums text-right">
          {formatCurrency(row.maintenanceCost)}
        </div>
      ),
    },
    {
      header: 'Payment Handling',
      render: (row) => {
        if (!row.customerId) {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold bg-blue-50 text-[#2473B5] border border-[#A4D0F2]">
              🏢 Handled by Company
            </span>
          );
        }
        return row.isPaid ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" /> Paid (Customer)
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <Clock className="h-3 w-3" /> Billed to Customer
          </span>
        );
      },
    },
    {
      header: 'Status',
      align: 'center',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => {
        const dateStr = row.maintenanceDate ? String(row.maintenanceDate).substring(0, 10) : '';
        const isPending = row.status === 'PENDING';
        const isInProgress = isPending && Boolean(row.notes && row.notes.includes('[IN_PROGRESS]'));
        const isDueOrOverdue = isPending && (dateStr <= todayStr);

        return (
          <div className="flex items-center justify-end gap-1.5">
            {isPending && !isInProgress && isDueOrOverdue && (
              <Button
                variant="primary"
                size="xs"
                icon={Wrench}
                onClick={() => handleStartProgress(row)}
                loading={startingProgressId === row.maintenanceId}
                className="text-2xs font-heading font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                title="Mark this machine into active workshop servicing (handled by company)"
              >
                In Progress
              </Button>
            )}
            {isPending && (
              <Button
                variant="outline"
                size="xs"
                icon={Check}
                onClick={() => {
                  setRecordToComplete(row);
                  setCompleteDialogOpen(true);
                }}
                className="text-2xs font-heading font-bold text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                title="Certify equipment safe and restore to AVAILABLE"
              >
                Complete
              </Button>
            )}
            <button
              onClick={() => navigate('/maintenance')}
              className="text-xs font-heading font-bold text-advantis-700 hover:text-advantis-900 cursor-pointer"
              title="Open Workshop Details"
            >
              Hub &rarr;
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Fleet Service & Maintenance Schedule"
        subtitle="Daily fleet servicing roadmap: monitor equipment due today, overdue machines from past dates, and scheduled future overhauls."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={fetchData}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setScheduleModalOpen(true)}
          >
            Schedule Service
          </Button>
        </div>
      </PageHeader>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          title="Due Today"
          value={metrics.dueToday}
          subtitle="Waiting for workshop intake today"
          icon={Clock}
          color="amber"
          className={metrics.dueToday > 0 ? 'ring-2 ring-amber-400/40 bg-amber-50/20' : ''}
        />
        <StatCard
          title="In Progress"
          value={metrics.inProgress}
          subtitle="Active in workshop bay"
          icon={Wrench}
          color="purple"
          className={metrics.inProgress > 0 ? 'ring-2 ring-purple-400/40 bg-purple-50/20' : ''}
        />
        <StatCard
          title="Overdue (Past Days)"
          value={metrics.overdue}
          subtitle="Past due awaiting intake"
          icon={AlertTriangle}
          color="rose"
          className={metrics.overdue > 0 ? 'ring-2 ring-rose-400/40 bg-rose-50/20' : ''}
        />
        <StatCard
          title="Upcoming Servicing"
          value={metrics.upcoming}
          subtitle="Planned future jobs"
          icon={CalendarClock}
          color="blue"
        />
        <StatCard
          title="Completed"
          value={metrics.completed}
          subtitle="Certified safe & restored"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Automated Safety Dispatch Guard Banner (Member 2 Event Connection) */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5 sm:mt-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-heading font-bold text-amber-900">
                Automated Depot Dispatch Guard
              </h4>
              <span className="px-2 py-0.5 text-3xs font-mono font-bold uppercase rounded bg-amber-200 text-amber-900">
                MySQL Event: evt_daily_maintenance_status_check
              </span>
            </div>
            <p className="mt-1 text-xs text-amber-800 leading-relaxed">
              Every night at <strong>02:00 AM</strong>, this scheduled database event scans all equipment maintenance schedules. Any machinery with routine servicing scheduled for <strong>today or overdue from previous days</strong> is automatically transitioned to <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-amber-300">MAINTENANCE</span> status in the fleet registry, ensuring unserviced machines cannot be booked or dispatched from the yard.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/maintenance')}
            className="text-xs font-heading font-bold border-amber-300 text-amber-900 hover:bg-amber-100/70"
          >
            Workshop Hub &rarr;
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="bg-white rounded-xl border border-[#DFE8F0] p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Time Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTimeFilter('DUE_OVERDUE')}
              className={`px-3 py-1.5 text-xs font-heading font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                timeFilter === 'DUE_OVERDUE'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>Due Today & Overdue</span>
              {(metrics.dueToday + metrics.overdue) > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-3xs font-extrabold ${
                    timeFilter === 'DUE_OVERDUE' ? 'bg-white text-amber-900' : 'bg-red-500 text-white'
                  }`}
                >
                  {metrics.dueToday + metrics.overdue}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setTimeFilter('TODAY')}
              className={`px-3 py-1.5 text-xs font-heading font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                timeFilter === 'TODAY'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>Today</span>
              {metrics.dueToday > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-3xs font-extrabold ${
                    timeFilter === 'TODAY' ? 'bg-white text-amber-900' : 'bg-amber-600 text-white'
                  }`}
                >
                  {metrics.dueToday}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setTimeFilter('IN_PROGRESS')}
              className={`px-3 py-1.5 text-xs font-heading font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                timeFilter === 'IN_PROGRESS'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>In Progress</span>
              {metrics.inProgress > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-3xs font-extrabold ${
                    timeFilter === 'IN_PROGRESS' ? 'bg-white text-purple-900' : 'bg-purple-600 text-white'
                  }`}
                >
                  {metrics.inProgress}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setTimeFilter('OVERDUE')}
              className={`px-3 py-1.5 text-xs font-heading font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                timeFilter === 'OVERDUE'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>Overdue (Past Days)</span>
              {metrics.overdue > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-3xs font-extrabold ${
                    timeFilter === 'OVERDUE' ? 'bg-white text-rose-900' : 'bg-rose-600 text-white'
                  }`}
                >
                  {metrics.overdue}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setTimeFilter('UPCOMING')}
              className={`px-3 py-1.5 text-xs font-heading font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                timeFilter === 'UPCOMING'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Upcoming ({metrics.upcoming})
            </button>

            <button
              type="button"
              onClick={() => setTimeFilter('PENDING')}
              className={`px-3 py-1.5 text-xs font-heading font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                timeFilter === 'PENDING'
                  ? 'bg-advantis-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Pending ({metrics.dueToday + metrics.overdue + metrics.upcoming + metrics.inProgress})
            </button>

            <button
              type="button"
              onClick={() => setTimeFilter('COMPLETED')}
              className={`px-3 py-1.5 text-xs font-heading font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                timeFilter === 'COMPLETED'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Completed ({metrics.completed})
            </button>

            <button
              type="button"
              onClick={() => setTimeFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-heading font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                timeFilter === 'ALL'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Records ({records.length})
            </button>
          </div>

          {/* Type Selector & Search Box */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-hidden focus:border-advantis-600"
            >
              <option value="ALL">All Types</option>
              <option value="ROUTINE">Routine Maintenance</option>
              <option value="REPAIR">Damage & Repair</option>
            </select>

            <div className="relative min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search equipment or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-advantis-600 text-slate-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredRecords}
        loading={loading}
        emptyTitle="No Maintenance Records Found"
        emptyMessage={
          timeFilter === 'DUE_OVERDUE'
            ? 'No machinery currently overdue or due today awaiting intake. All active fleet units are operating normally!'
            : timeFilter === 'TODAY'
            ? 'No machinery awaiting intake today.'
            : timeFilter === 'IN_PROGRESS'
            ? 'No machinery currently undergoing active servicing in workshop bays.'
            : 'No maintenance records match your active schedule filter.'
        }
      />

      {/* Complete Maintenance Confirmation Dialog */}
      <ConfirmDialog
        isOpen={completeDialogOpen}
        onClose={() => {
          setCompleteDialogOpen(false);
          setRecordToComplete(null);
        }}
        onConfirm={handleCompleteConfirm}
        title="Complete Maintenance Order"
        message={
          recordToComplete
            ? `Mark servicing complete for ${recordToComplete.equipmentName} (${recordToComplete.equipmentCode})? This will certify the equipment safe and return its fleet status to AVAILABLE.`
            : 'Complete this maintenance record?'
        }
        confirmText="Certify Safe & Complete"
        variant="success"
        loading={completeLoading}
      />

      {/* Schedule Service Modal */}
      <Modal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title="Schedule Equipment Servicing"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <Select
            label="Equipment Machine"
            required
            value={scheduleForm.equipmentId}
            onChange={(e) => setScheduleForm({ ...scheduleForm, equipmentId: e.target.value })}
            options={[
              { value: '', label: 'Select Equipment Unit...' },
              ...equipmentList.map((eq) => ({
                value: String(eq.equipmentId),
                label: `${eq.equipmentCode} — ${eq.name} (${eq.status})`,
              })),
            ]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Maintenance Type"
              required
              value={scheduleForm.maintenanceType}
              onChange={(e) => setScheduleForm({ ...scheduleForm, maintenanceType: e.target.value })}
              options={[
                { value: 'ROUTINE', label: 'Routine Preventative Servicing' },
                { value: 'REPAIR', label: 'Repair & Mechanical Overhaul' },
              ]}
            />
            <Input
              label="Estimated Cost (LKR)"
              type="number"
              step="0.01"
              value={scheduleForm.maintenanceCost}
              onChange={(e) => setScheduleForm({ ...scheduleForm, maintenanceCost: e.target.value })}
            />
          </div>

          <Input
            label="Scheduled Service Date"
            type="date"
            required
            min={tomorrowStr}
            value={scheduleForm.maintenanceDate}
            onChange={(e) => setScheduleForm({ ...scheduleForm, maintenanceDate: e.target.value })}
            helperText="Must be scheduled in advance (tomorrow or later). Equipment stays AVAILABLE until 02:00 AM on this date."
          />

          <Input
            label="Service Scope / Description"
            required
            placeholder="e.g. 500-hour hydraulic fluid replacement and track tension calibration"
            value={scheduleForm.description}
            onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
          />

          <div>
            <label className="block text-xs font-heading font-bold text-slate-700 uppercase mb-1">
              Workshop Notes (Optional)
            </label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:outline-hidden focus:border-advantis-600"
              placeholder="Depot location, mechanic assigned, replacement parts..."
              value={scheduleForm.notes}
              onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setScheduleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={scheduleSubmitting}
            >
              Add to Schedule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaintenanceSchedule;
