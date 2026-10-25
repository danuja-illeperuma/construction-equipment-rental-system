import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { rentalApi } from '../../rental/api/rentalApi';
import { equipmentApi } from '../../equipment/api/equipmentApi';
import { maintenanceApi } from '../../maintenance/api/maintenanceApi';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { getEquipmentImage, handleImageError } from '../../../utils/equipmentImages';
import { BRAND } from '../../../utils/constants';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import {
  HardHat,
  Truck,
  CalendarCheck,
  Clock,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  PhoneCall,
  User,
  AlertCircle,
  CheckCircle2,
  Wrench,
  Lock,
  AlertTriangle,
} from 'lucide-react';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [myRentals, setMyRentals] = useState([]);
  const [mostRentedEquipment, setMostRentedEquipment] = useState([]);
  const [maintenanceSummary, setMaintenanceSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      rentalApi.getMyRentals().catch(() => ({ data: [] })),
      equipmentApi.getAll().catch(() => ({ data: [] })),
      maintenanceApi.getMyCharges().catch(() => ({ data: null })),
    ])
      .then(([rentRes, eqRes, maintRes]) => {
        const rentalsList = rentRes.data || rentRes || [];
        if (Array.isArray(rentalsList)) {
          setMyRentals(rentalsList);
        }
        const equipList = eqRes.data || eqRes || [];
        if (Array.isArray(equipList)) {
          // Count rental occurrences per equipment to identify the most rented units
          const rentalFrequency = {};
          if (Array.isArray(rentalsList)) {
            rentalsList.forEach((r) => {
              if (Array.isArray(r.items)) {
                r.items.forEach((it) => {
                  if (it.equipmentId) {
                    rentalFrequency[it.equipmentId] =
                      (rentalFrequency[it.equipmentId] || 0) + (it.quantity || 1);
                  }
                });
              }
            });
          }

          // Sort by highest rental frequency, then AVAILABLE status, then ID
          const sorted = [...equipList].sort((a, b) => {
            const freqA = rentalFrequency[a.equipmentId] || 0;
            const freqB = rentalFrequency[b.equipmentId] || 0;
            if (freqB !== freqA) return freqB - freqA;
            if (a.status === 'AVAILABLE' && b.status !== 'AVAILABLE') return -1;
            if (b.status === 'AVAILABLE' && a.status !== 'AVAILABLE') return 1;
            return a.equipmentId - b.equipmentId;
          });

          setMostRentedEquipment(sorted.slice(0, 8));
        }

        const maintData = maintRes?.data || maintRes;
        if (maintData) {
          setMaintenanceSummary(maintData);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  // Filter rentals by state
  const activeRentals = myRentals.filter((r) => r.status === 'ACTIVE');
  const upcomingRentals = myRentals.filter((r) => ['CONFIRMED', 'PENDING_PAYMENT'].includes(r.status));
  const completedRentals = myRentals.filter((r) => r.status === 'COMPLETED');
  const hasOutstandingMaintenance = Boolean(maintenanceSummary?.hasOutstandingDues || (Number(maintenanceSummary?.outstandingAmount) > 0));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ============================================================ */}
      {/* 0. OUTSTANDING MAINTENANCE WARNING BANNER                    */}
      {/* ============================================================ */}
      {hasOutstandingMaintenance && (
        <div className="rounded-2xl bg-rose-50 border-2 border-rose-300 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-100 rounded-xl text-rose-700 flex-shrink-0">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-3xs font-extrabold uppercase tracking-wider bg-rose-600 text-white">
                  Account Locked
                </span>
                <h3 className="text-base font-heading font-black text-rose-900 uppercase tracking-wide">
                  Unpaid Equipment Maintenance Dues: {formatCurrency(maintenanceSummary?.outstandingAmount)}
                </h3>
              </div>
              <p className="text-xs text-rose-800 leading-relaxed">
                You have an outstanding equipment maintenance liability of{' '}
                <strong className="text-rose-950 font-black text-sm">
                  {formatCurrency(maintenanceSummary?.outstandingAmount)}
                </strong>
                . In accordance with system policy, new equipment bookings and reservations are locked until this fee is settled.
              </p>
              <p className="text-2xs text-rose-700 font-semibold pt-1">
                Please contact our depot office to clear this payment. Once staff verifies and marks your payment as received, your account will be immediately unlocked.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. CUSTOMER WELCOME BANNER                                   */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-advantis-950 via-advantis-900 to-[#011627] p-6 sm:p-8 text-white shadow-xl border border-advantis-800">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-equipment-500/20 px-3 py-1 text-xs font-heading font-bold uppercase tracking-wider text-equipment-300 border border-equipment-500/30">
            <HardHat className="h-3.5 w-3.5 text-equipment-400" />
            <span>{BRAND.name} Client Portal</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-heading font-black tracking-tight text-white">
            Welcome back, {user?.name || 'Valued Client'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Registered as <strong className="text-equipment-400 font-bold">{user?.customerType || 'INDIVIDUAL'}</strong>. Manage your ongoing equipment deployments, check real-time machinery availability, and reserve units with zero upfront deposit.
          </p>

          <div className="pt-3 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/equipment')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider bg-equipment-500 text-advantis-950 hover:bg-equipment-400 transition-colors shadow-md cursor-pointer"
            >
              <Truck className="h-4 w-4 text-advantis-950" />
              <span>Browse Fleet Catalog</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. SUMMARY METRICS                                           */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-heading font-bold text-slate-500 uppercase tracking-wider block">
              Active On-Site
            </span>
            <span className="text-2xl font-heading font-bold text-slate-900 mt-1 block tabular-nums">
              {activeRentals.length}
            </span>
            <span className="text-3xs text-emerald-700 font-bold mt-0.5 block">
              Deployments in progress
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
            <Truck className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-heading font-bold text-slate-500 uppercase tracking-wider block">
              Upcoming Bookings
            </span>
            <span className="text-2xl font-heading font-bold text-slate-900 mt-1 block tabular-nums">
              {upcomingRentals.length}
            </span>
            <span className="text-3xs text-equipment-600 font-bold mt-0.5 block">
              Pending or confirmed
            </span>
          </div>
          <div className="p-3 rounded-xl bg-equipment-50 text-equipment-600">
            <CalendarCheck className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-heading font-bold text-slate-500 uppercase tracking-wider block">
              Completed Rentals
            </span>
            <span className="text-2xl font-heading font-bold text-slate-900 mt-1 block tabular-nums">
              {completedRentals.length}
            </span>
            <span className="text-3xs text-slate-500 font-medium mt-0.5 block">
              Successfully returned
            </span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-700">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className={`rounded-xl border p-5 shadow-xs flex items-center justify-between ${
          hasOutstandingMaintenance ? 'bg-rose-50/80 border-rose-300' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className="text-xs font-heading font-bold text-slate-500 uppercase tracking-wider block">
              Maintenance Dues
            </span>
            <span className={`text-xl font-heading font-black mt-1 block tabular-nums ${
              hasOutstandingMaintenance ? 'text-rose-700' : 'text-emerald-700'
            }`}>
              {hasOutstandingMaintenance
                ? formatCurrency(maintenanceSummary?.outstandingAmount)
                : 'All Settled'}
            </span>
            <span className={`text-3xs font-semibold mt-0.5 block ${
              hasOutstandingMaintenance ? 'text-rose-600' : 'text-slate-400'
            }`}>
              {hasOutstandingMaintenance ? 'Payment required to unlock' : 'LKR 0.00 Outstanding'}
            </span>
          </div>
          <div className={`p-3 rounded-xl ${
            hasOutstandingMaintenance ? 'bg-rose-100 text-rose-700' : 'bg-advantis-50 text-advantis-700'
          }`}>
            <Wrench className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. ACTIVE & UPCOMING RENTALS                                 */}
      {/* ============================================================ */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-heading font-bold text-advantis-900">Your Active & Recent Bookings</h2>
            <p className="text-xs text-slate-500">Track machinery deployed on your construction sites</p>
          </div>
          <Link
            to="/my-rentals"
            className="text-xs font-heading font-bold text-advantis-700 hover:text-advantis-900 inline-flex items-center gap-1 uppercase tracking-wider"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {myRentals.length === 0 ? (
          <div className="p-8 text-center text-slate-500 space-y-3">
            <Truck className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-sm font-heading font-bold text-slate-700">No equipment bookings yet.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Select any machinery from our catalog to book with flexible daily or monthly rates.
            </p>
            <button
              onClick={() => navigate('/equipment')}
              className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-heading font-bold uppercase tracking-wider bg-equipment-500 text-advantis-950 hover:bg-equipment-400 transition-colors shadow-xs cursor-pointer"
            >
              <Truck className="h-3.5 w-3.5" />
              <span>Browse Fleet Catalog</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f0f4f8] border-b border-slate-200 text-advantis-900 font-heading font-bold uppercase tracking-wider text-2xs">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Total (LKR)</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {myRentals.slice(0, 5).map((rental) => (
                  <tr key={rental.rentalId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-advantis-700 block">
                        {rental.bookingReference}
                      </span>
                      <span className="text-3xs text-slate-400 block font-heading uppercase tracking-wider">
                        {rental.rentalType || 'DAILY'} Hire
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div>{formatDate(rental.startDate)} &rarr; {formatDate(rental.endDate)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={rental.status} />
                    </td>
                    <td className="py-3 px-4 font-heading font-bold text-slate-900 tabular-nums">
                      {formatCurrency(rental.totalAmount)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/rentals/${rental.rentalId}`}
                        className="inline-flex items-center gap-1 text-xs font-heading font-bold text-advantis-700 hover:text-advantis-900"
                      >
                        <span>Details</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 3.5. CUSTOMER MAINTENANCE & DAMAGE CHARGES                   */}
      {/* ============================================================ */}
      {maintenanceSummary?.records && maintenanceSummary.records.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-advantis-700" />
                <h2 className="text-base font-heading font-bold text-advantis-900">
                  Equipment Maintenance & Repair Charges
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Service logs, machine repair charges, and settlement status
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xs uppercase font-heading font-bold text-slate-400 block tracking-wider">
                Total Outstanding
              </span>
              <span className={`text-sm font-heading font-black tabular-nums ${
                hasOutstandingMaintenance ? 'text-rose-600' : 'text-emerald-600'
              }`}>
                {formatCurrency(maintenanceSummary.outstandingAmount || 0)}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f0f4f8] border-b border-slate-200 text-advantis-900 font-heading font-bold uppercase tracking-wider text-2xs">
                <tr>
                  <th className="py-3 px-4">Maintenance ID</th>
                  <th className="py-3 px-4">Equipment Unit</th>
                  <th className="py-3 px-4">Type & Description</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Cost (LKR)</th>
                  <th className="py-3 px-4 text-right">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {maintenanceSummary.records.map((record) => (
                  <tr key={record.maintenanceId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-advantis-800">
                      #{record.maintenanceId}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 block">
                        {record.equipmentName}
                      </span>
                      <span className="text-3xs text-slate-400 font-mono">
                        {record.equipmentCode}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <span className="inline-block px-1.5 py-0.5 rounded text-3xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600 mr-1.5">
                        {record.maintenanceType}
                      </span>
                      <span>{record.description}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatDate(record.maintenanceDate)}
                    </td>
                    <td className="py-3 px-4 font-heading font-bold text-slate-900 tabular-nums">
                      {formatCurrency(record.maintenanceCost)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {record.isPaid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Unpaid / Due
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. MOST RENTED MACHINERY FLEET                               */}
      {/* ============================================================ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-heading font-bold text-advantis-900">Most Rented Machinery & Fleet</h2>
            <p className="text-xs text-slate-500">Popular equipment ready for immediate job-site dispatch</p>
          </div>
          <Link
            to="/equipment"
            className="text-xs font-heading font-bold text-advantis-700 hover:text-advantis-900 inline-flex items-center gap-1 uppercase tracking-wider"
          >
            <span>Full Catalog</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mostRentedEquipment.map((item) => {
            const img = getEquipmentImage(item);
            return (
              <div
                key={item.equipmentId}
                onClick={() => navigate(`/equipment/${item.equipmentId}`)}
                className="bg-white rounded-xl border border-[#DFE8F0] overflow-hidden shadow-xs hover:border-[#368BD1] hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="relative h-36 bg-[#F5F9FC] overflow-hidden">
                    <img
                      src={img}
                      alt={item.equipmentName}
                      onError={(e) => handleImageError(e, img)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="text-3xs font-mono font-bold px-1.5 py-0.5 rounded bg-white/95 text-[#263746] border border-[#DFE8F0] shadow-2xs">
                        {item.equipmentCode}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <span className="text-3xs font-heading font-bold text-[#368BD1] uppercase tracking-wider block">
                      {item.categoryName || 'Heavy Fleet'}
                    </span>
                    <h3 className="text-sm font-heading font-bold text-[#263746] group-hover:text-[#368BD1] transition-colors line-clamp-1">
                      {item.equipmentName}
                    </h3>
                    <p className="text-xs text-[#657786]">
                      {item.brand ? `${item.brand} ${item.model || ''}` : 'Heavy Duty Unit'}
                    </p>
                    <div className="pt-2 text-xs font-heading font-bold text-[#263746] tabular-nums">
                      {formatCurrency(item.dailyRate)}{' '}
                      <span className="text-3xs text-[#657786] font-normal">/ day</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/equipment/${item.equipmentId}`);
                    }}
                    className="w-full text-center py-2 px-3 rounded-lg text-xs font-heading font-bold uppercase tracking-wider bg-[#368BD1] text-white hover:bg-[#2473B5] transition-colors cursor-pointer shadow-xs"
                  >
                    Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
