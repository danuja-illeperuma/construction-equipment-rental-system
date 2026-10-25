import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { getEquipmentImage, handleImageError } from '../../../utils/equipmentImages';
import { BRAND } from '../../../utils/constants';
import { Button } from '../../../components/common/Button';
import {
  CalendarCheck,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  ShieldCheck,
  UserCheck,
  Calendar,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

export const BookingPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve preserved booking configuration from navigation state or sessionStorage
  let bookingData = location.state?.bookingData;
  if (!bookingData) {
    try {
      const stored = sessionStorage.getItem('cerms_pending_booking');
      if (stored) {
        bookingData = JSON.parse(stored);
      }
    } catch (e) {
      // Ignore
    }
  }

  if (!bookingData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <Truck className="h-16 w-16 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">No Active Booking Selection</h2>
        <p className="text-sm text-slate-500">
          Please select an equipment item and check its availability before proceeding to booking.
        </p>
        <Button variant="primary" onClick={() => navigate('/equipment')}>
          Browse Equipment Fleet
        </Button>
      </div>
    );
  }

  const machineImg = getEquipmentImage(bookingData);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (bookingData.quotationReference) {
              navigate('/quotation');
            } else {
              navigate(`/equipment/${bookingData.equipmentId}`);
            }
          }}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-amber-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{bookingData.quotationReference ? 'Back to Rental Quotation' : 'Back to Equipment Configuration'}</span>
        </button>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          <span>Availability Verified</span>
        </span>
      </div>

      {/* Booking Notice Banner */}
      <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl space-y-1">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-emerald-950">
            Booking Preview &bull; Availability Confirmed
          </h2>
        </div>
        <p className="text-xs text-emerald-800 leading-relaxed">
          Your equipment schedule, rental duration, and pricing have been verified. Review your booking details below before proceeding to checkout.
        </p>
      </div>

      {/* Booking Summary Card */}
      <div className="bg-white rounded-3xl border border-[#DFE8F0] shadow-md overflow-hidden">
        {/* Header Machinery Ribbon */}
        <div className="p-6 bg-[#F5F9FC] text-[#263746] flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DFE8F0]">
          <div className="flex items-center gap-4">
            <img
              src={machineImg}
              alt={bookingData.equipmentName}
              onError={(e) => handleImageError(e, machineImg)}
              className="w-16 h-16 rounded-xl object-cover border border-[#DFE8F0] shrink-0"
            />
            <div>
              <span className="inline-block text-3xs font-heading font-bold uppercase bg-[#368BD1] text-white px-2 py-0.5 rounded mb-1 shadow-2xs">
                {bookingData.equipmentCode}
              </span>
              <h1 className="text-lg sm:text-xl font-heading font-black text-[#263746]">
                {bookingData.equipmentName}
              </h1>
              <p className="text-xs text-[#657786]">
                {bookingData.brand} {bookingData.model} &bull; {bookingData.categoryName || 'Heavy Plant'}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            {bookingData.quotationReference && (
              <span className="text-3xs font-heading font-bold text-[#368BD1] block mb-1">
                Quote Ref: {bookingData.quotationReference}
              </span>
            )}
            <span className="text-3xs text-[#657786] font-heading font-bold uppercase tracking-wider block">
              Rental Scheme
            </span>
            <span className="text-sm font-heading font-extrabold text-[#368BD1]">
              {bookingData.rentalType} HIRE
            </span>
          </div>
        </div>

        {/* Selected Parameters Grid */}
        <div className="p-6 sm:p-8 space-y-6">
          <h3 className="text-xs font-heading font-black uppercase tracking-wider text-[#263746] border-b border-[#DFE8F0] pb-2">
            Preserved Schedule & Cost Breakdown
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#f0f4f8] p-4 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-3xs text-slate-500 uppercase font-heading font-bold flex items-center gap-1">
                <Calendar className="h-3 w-3 text-advantis-600" />
                Start Date
              </span>
              <span className="text-sm font-heading font-extrabold text-advantis-900 block tabular-nums">
                {formatDate(bookingData.startDate)}
              </span>
            </div>

            <div className="bg-[#f0f4f8] p-4 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-3xs text-slate-500 uppercase font-heading font-bold flex items-center gap-1">
                <Calendar className="h-3 w-3 text-advantis-600" />
                End Date
              </span>
              <span className="text-sm font-heading font-extrabold text-advantis-900 block tabular-nums">
                {formatDate(bookingData.endDate)}
              </span>
            </div>

            <div className="bg-[#f0f4f8] p-4 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-3xs text-slate-500 uppercase font-heading font-bold flex items-center gap-1">
                <Clock className="h-3 w-3 text-advantis-600" />
                Duration
              </span>
              <span className="text-sm font-heading font-extrabold text-advantis-900 block">
                {bookingData.durationLabel || `${bookingData.duration} Days`}
              </span>
            </div>

            <div className="bg-[#f0f4f8] p-4 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-3xs text-slate-500 uppercase font-heading font-bold flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-advantis-600" />
                Fleet Allocation
              </span>
              <span className="text-sm font-heading font-extrabold text-advantis-900 block tabular-nums">
                1 Dedicated Unit
              </span>
            </div>
          </div>

          {/* Pricing Calculation Summary */}
          <div className="bg-advantis-50/50 rounded-2xl p-5 border border-advantis-100 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-700">
              <span className="font-heading font-semibold">Unit Rate ({bookingData.rentalType.toLowerCase()}):</span>
              <span className="font-bold tabular-nums text-advantis-900">{formatCurrency(bookingData.unitRate)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-700">
              <span className="font-heading font-semibold">Duration Multiplier:</span>
              <span className="font-bold text-advantis-900">{bookingData.durationLabel}</span>
            </div>
            <div className="pt-3 border-t border-advantis-200 flex items-baseline justify-between">
              <div>
                <span className="text-xs font-heading font-black uppercase tracking-wider text-advantis-950 block">
                  Estimated Total
                </span>
                <span className="text-3xs text-slate-500">Inclusive of base hire rates</span>
              </div>
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-heading font-black text-advantis-950 tabular-nums">
                  {formatCurrency(bookingData.estimatedTotal)}
                </span>
                <span className="text-xs font-heading font-semibold text-slate-500 ml-1">LKR</span>
              </div>
            </div>
          </div>

          {/* Site Logistics Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
              <MapPin className="h-4 w-4 text-amber-500 shrink-0" />
              <span>
                Dispatch Yard: <strong>{bookingData.location || 'Central Depot'}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
              <Truck className="h-4 w-4 text-[#368BD1] shrink-0" />
              <span>
                Asset Code: <strong>{bookingData.equipmentCode || 'N/A'}</strong>
              </span>
            </div>
          </div>

          {/* Zero Upfront Deposit Callout */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-slate-900">Pre-Approved Zero Upfront Deposit Terms</strong>
              <p className="text-slate-600 mt-0.5">
                No security deposit is required upfront for verified client accounts. Billing is handled upon rental confirmation.
              </p>
            </div>
          </div>

          {/* Action Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => navigate(`/equipment/${bookingData.equipmentId}`)}
              className="w-full sm:w-auto"
            >
              Modify Dates or Rental Type
            </Button>

            <Button
              variant="primary"
              onClick={() => navigate('/equipment')}
              className="w-full sm:w-auto"
            >
              Browse More Fleet Machinery
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPreview;
