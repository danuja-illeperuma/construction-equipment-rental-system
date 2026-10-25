import React, { useState, useEffect } from 'react';
import { reportsApi } from '../api/reportsApi';
import { formatCurrency } from '../../../utils/formatters';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatCard } from '../../../components/common/StatCard';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { DollarSign, Truck, Calendar, Wrench, TrendingUp, AlertTriangle } from 'lucide-react';

export const ReportsDashboard = () => {
  const [revenue, setRevenue] = useState(null);
  const [rentals, setRentals] = useState(null);
  const [utilization, setUtilization] = useState(null);
  const [maintenance, setMaintenance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportsApi.getRevenueReport(),
      reportsApi.getRentalReport(),
      reportsApi.getEquipmentUtilization(),
      reportsApi.getMaintenanceReport(),
    ])
      .then(([revRes, rentRes, utilRes, maintRes]) => {
        if (revRes.success) setRevenue(revRes.data);
        if (rentRes.success) setRentals(rentRes.data);
        if (utilRes.success) setUtilization(utilRes.data);
        if (maintRes.success) setMaintenance(maintRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Fleet Analytics & Revenue Intelligence"
        subtitle="Key business metrics, revenue projections, equipment utilization, and workshop expenditures"
      />

      {/* Revenue KPI Section */}
      <div>
        <h3 className="text-sm font-heading font-bold text-advantis-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-advantis-600" />
          Revenue Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Net Business Revenue"
            value={formatCurrency(revenue?.netRevenue)}
            subtitle="Rental fees + Late + Damages"
            icon={TrendingUp}
            color="emerald"
          />
          <StatCard
            title="Base Rental Revenue"
            value={formatCurrency(revenue?.totalRentalRevenue)}
            subtitle="Paid upfront bookings"
            icon={DollarSign}
            color="brand"
          />
          <StatCard
            title="Late Overtime Charges"
            value={formatCurrency(revenue?.totalLateCharges)}
            subtitle="Incurred return penalties"
            icon={Calendar}
            color="amber"
          />
          <StatCard
            title="Damage Claim Recoveries"
            value={formatCurrency(revenue?.totalDamageCharges)}
            subtitle="Assessed breakage charges"
            icon={AlertTriangle}
            color="rose"
          />
        </div>
      </div>

      {/* Fleet Utilization Section */}
      <div>
        <h3 className="text-sm font-heading font-bold text-advantis-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Truck className="h-4 w-4 text-advantis-600" />
          Fleet Utilization & Readiness
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Fleet Utilization Rate"
            value={`${utilization?.utilizationRatePercentage || 0}%`}
            subtitle="Active on site vs total fleet"
            icon={TrendingUp}
            color="blue"
          />
          <StatCard
            title="Total Fleet Size"
            value={utilization?.totalFleet || 0}
            subtitle="Active machines registered"
            icon={Truck}
            color="brand"
          />
          <StatCard
            title="Currently on Hire"
            value={utilization?.rentedCount || 0}
            subtitle="Deployed on contractor sites"
            icon={Calendar}
            color="emerald"
          />
          <StatCard
            title="Under Maintenance"
            value={utilization?.maintenanceCount || 0}
            subtitle="In workshop / undergoing repair"
            icon={Wrench}
            color="amber"
          />
        </div>
      </div>

      {/* Rental Volumes & Workshop Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <h4 className="text-base font-heading font-bold text-advantis-900 mb-4">Rental Booking Lifecycle Metrics</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Total Bookings Recorded:</span>
              <span className="font-bold text-slate-900 tabular-nums">{rentals?.totalRentals || 0}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Currently Active on Site:</span>
              <span className="font-bold text-emerald-600 tabular-nums">{rentals?.activeRentals || 0}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Completed & Returned:</span>
              <span className="font-bold text-slate-700 tabular-nums">{rentals?.completedRentals || 0}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Pending Payment:</span>
              <span className="font-bold text-amber-600 tabular-nums">{rentals?.pendingRentals || 0}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-600">Cancelled Bookings:</span>
              <span className="font-bold text-rose-600 tabular-nums">{rentals?.cancelledRentals || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <h4 className="text-base font-heading font-bold text-advantis-900 mb-4">Workshop & Maintenance Expense</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Total Service Records:</span>
              <span className="font-bold text-slate-900 tabular-nums">{maintenance?.total_records || 0}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Total Maintenance Expenditure:</span>
              <span className="font-bold text-rose-600 tabular-nums">
                {formatCurrency(maintenance?.total_expense || 0)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Active Workshop Jobs:</span>
              <span className="font-bold text-amber-600 tabular-nums">{maintenance?.pending_records || 0}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-600">Completed Service Cycles:</span>
              <span className="font-bold text-emerald-600 tabular-nums">{maintenance?.completed_records || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
