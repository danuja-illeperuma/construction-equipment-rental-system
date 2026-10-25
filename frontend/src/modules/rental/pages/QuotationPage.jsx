import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { rentalApi } from '../api/rentalApi';
import { maintenanceApi } from '../../maintenance/api/maintenanceApi';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { getEquipmentImage, handleImageError } from '../../../utils/equipmentImages';
import { BRAND } from '../../../utils/constants';
import { Button } from '../../../components/common/Button';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import {
  FileText,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Truck,
  MapPin,
  ShieldCheck,
  UserCheck,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Info,
  Edit3,
  CalendarCheck,
  Printer,
  FileCheck,
  Tag,
  Lock,
  User,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  X,
} from 'lucide-react';

export const QuotationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, isCustomer } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  // Local component state
  const [loading, setLoading] = useState(true);
  const [refreshingAvailability, setRefreshingAvailability] = useState(false);
  const [quotation, setQuotation] = useState(null);
  const [error, setError] = useState(null);
  const [availabilityTimestamp, setAvailabilityTimestamp] = useState(null);

  // Phase 5: Booking Confirmation & Creation State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [maintenanceSummary, setMaintenanceSummary] = useState(null);

  // Retrieve incoming config from location state, URL params, or sessionStorage
  const resolveInitialConfig = () => {
    // 1. Route state
    if (location.state?.quotationConfig) {
      return location.state.quotationConfig;
    }

    // 2. Query parameters
    const paramEqId = searchParams.get('equipmentId');
    const paramRentalType = searchParams.get('rentalType');
    const paramStart = searchParams.get('startDate');
    const paramEnd = searchParams.get('endDate');
    const paramQty = searchParams.get('quantity');
    const paramHours = searchParams.get('hours');

    if (paramEqId && paramRentalType && paramStart && paramEnd) {
      return {
        equipmentId: Number(paramEqId),
        rentalType: paramRentalType.toUpperCase(),
        startDate: paramStart,
        endDate: paramEnd,
        quantity: parseInt(paramQty, 10) || 1,
        hours: paramHours ? parseInt(paramHours, 10) : 8,
      };
    }

    // 3. SessionStorage fallback
    try {
      const stored = sessionStorage.getItem('cerms_pending_quote');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      // Ignore parsing errors
    }

    return null;
  };

  const [activeConfig, setActiveConfig] = useState(resolveInitialConfig);

  // Load authoritative quotation from backend
  const fetchQuotation = async (config) => {
    if (!config || !config.equipmentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        equipmentId: Number(config.equipmentId),
        rentalType: config.rentalType.toUpperCase(),
        startDate: config.startDate,
        endDate: config.endDate,
        quantity: parseInt(config.quantity, 10) || 1,
        duration: config.rentalType === 'HOURLY' ? Number(config.hours || 8) : null,
      };

      const res = await rentalApi.calculateQuote(payload);
      if (res && (res.success || res.data)) {
        const quoteData = res.data || res;
        setQuotation(quoteData);
        setAvailabilityTimestamp(new Date());

        // Update sessionStorage with latest authoritative quote
        const mergedConfig = {
          ...config,
          ...quoteData,
        };
        sessionStorage.setItem('cerms_pending_quote', JSON.stringify(mergedConfig));
      } else {
        throw new Error(res?.message || 'Failed to generate quotation from server.');
      }
    } catch (err) {
      console.error('Failed to calculate quotation:', err);
      if (config.estimatedTotal && config.unitRate) {
        // Fallback to client-side data
        setQuotation({
          quotationReference: `QT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10000 + Math.random() * 90000)}`,
          equipmentId: config.equipmentId,
          equipmentName: config.equipmentName || 'Equipment #' + config.equipmentId,
          equipmentCode: config.equipmentCode || 'EQ-' + config.equipmentId,
          brand: config.brand || 'Commercial',
          model: config.model || 'Standard',
          categoryName: config.categoryName || 'Heavy Machinery',
          location: config.location || 'Colombo Depot',
          rentalType: config.rentalType,
          startDate: config.startDate,
          endDate: config.endDate,
          duration: config.duration || 1,
          durationLabel: config.durationLabel || `${config.duration || 1} Days`,
          quantity: config.quantity || 1,
          unitRate: config.unitRate,
          subtotal: config.estimatedTotal,
          totalAmount: config.estimatedTotal,
          isAvailable: config.availabilityResult?.isAvailable ?? true,
          availabilityMessage: config.availabilityResult?.message || 'Availability checked.',
        });
        setAvailabilityTimestamp(new Date());
      } else {
        setError(err.message || 'Unable to generate quotation for selected equipment.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeConfig) {
      fetchQuotation(activeConfig);
    } else {
      setLoading(false);
    }
  }, [activeConfig?.equipmentId, activeConfig?.startDate, activeConfig?.endDate, activeConfig?.rentalType, activeConfig?.quantity]);

  useEffect(() => {
    if (isAuthenticated && isCustomer) {
      maintenanceApi.getMyCharges()
        .then((res) => {
          if (res?.success && res?.data) {
            setMaintenanceSummary(res.data);
          }
        })
        .catch((err) => {
          console.warn('Failed to load customer maintenance charges:', err);
        });
    }
  }, [isAuthenticated, isCustomer]);

  // Action: Check Availability Again
  const handleRecheckAvailability = async () => {
    if (!quotation) return;

    setRefreshingAvailability(true);
    try {
      const res = await rentalApi.calculateQuote({
        equipmentId: Number(quotation.equipmentId),
        rentalType: quotation.rentalType,
        startDate: quotation.startDate,
        endDate: quotation.endDate,
        quantity: quotation.quantity,
        duration: quotation.rentalType === 'HOURLY' ? Number(quotation.duration) : null,
      });

      if (res && (res.success || res.data)) {
        const quoteData = res.data || res;
        setQuotation(quoteData);
        setAvailabilityTimestamp(new Date());
      }
    } catch (err) {
      console.error('Rechecking availability failed:', err);
    } finally {
      setRefreshingAvailability(false);
    }
  };

  // Action: Edit Rental (returns to equipment details page preserving state)
  const handleEditRental = () => {
    if (!quotation) return;

    const params = new URLSearchParams({
      rentalType: quotation.rentalType,
      startDate: quotation.startDate,
      endDate: quotation.endDate,
      quantity: String(quotation.quantity),
      hours: String(quotation.rentalType === 'HOURLY' ? quotation.duration : 8),
      edit: 'true',
    });

    navigate(`/equipment/${quotation.equipmentId}?${params.toString()}`, {
      state: {
        editConfig: {
          rentalType: quotation.rentalType,
          startDate: quotation.startDate,
          endDate: quotation.endDate,
          quantity: quotation.quantity,
          duration: quotation.duration,
          hours: quotation.rentalType === 'HOURLY' ? quotation.duration : 8,
        },
      },
    });
  };

  // Action: Prompt Login/Registration for Unauthenticated Hirers
  const handleAuthRedirect = (targetPath) => {
    const currentUrl = location.pathname + location.search;
    navigate(`${targetPath}?redirect=${encodeURIComponent(currentUrl)}`, {
      state: {
        from: currentUrl,
        quotationConfig: quotation,
      },
    });
  };

  // Phase 5 Action: Submit and Create Actual Rental Booking
  const handleConfirmAndCreateBooking = async () => {
    if (!quotation || isSubmittingBooking) return;

    setIsSubmittingBooking(true);
    setBookingError(null);

    try {
      const bookingPayload = {
        startDate: quotation.startDate,
        endDate: quotation.endDate,
        items: [
          {
            equipmentId: Number(quotation.equipmentId),
            rentalType: quotation.rentalType.toUpperCase(),
            quantity: parseInt(quotation.quantity, 10) || 1,
            duration: Number(quotation.duration) || 1,
          },
        ],
      };

      const res = await rentalApi.create(bookingPayload);
      if (res && (res.success || res.data)) {
        const booking = res.data || res;
        setCreatedBooking(booking);
        setShowConfirmModal(false);
        toastSuccess(`Booking ${booking.bookingReference} created successfully!`);

        // Save active booking to sessionStorage for Phase 6 checkout flow
        sessionStorage.setItem('cerms_active_booking', JSON.stringify(booking));
        sessionStorage.removeItem('cerms_pending_quote');
      } else {
        throw new Error(res?.message || 'Failed to create booking.');
      }
    } catch (err) {
      console.error('Booking creation error:', err);

      // Handle specific HTTP error responses
      const status = err.response?.status;
      const apiMessage = err.response?.data?.message || err.message;

      if (status === 409) {
        setBookingError('Equipment is currently unavailable for the chosen dates. Another booking overlaps with your requested dates. Please modify rental dates or select another machine.');
        // Re-check live availability to update UI
        handleRecheckAvailability();
      } else if (status === 401) {
        setBookingError('Your session has expired. Please sign in again to confirm this reservation.');
      } else if (status === 403) {
        setBookingError('Internal staff and admin accounts are not permitted to create customer bookings. Please sign in with an authenticated customer account.');
      } else if (status === 400) {
        setBookingError(apiMessage || 'Invalid rental configuration');
      } else {
        setBookingError(apiMessage || 'A database error occurred while creating your booking. Please try again or contact support.');
      }
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Navigate to Temporary Payment Page (Phase 6)
  const handleProceedToPayment = () => {
    if (!createdBooking) return;
    navigate(`/payment/${createdBooking.bookingReference}`, {
      state: {
        rental: createdBooking,
      },
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <LoadingSpinner size="lg" />
        <h2 className="text-base font-extrabold text-slate-800">Calculating Quotation...</h2>
        <p className="text-xs text-slate-500">Checking pricing and equipment availability.</p>
      </div>
    );
  }

  // Fallback: If no quotation config exists
  if (!activeConfig || (!quotation && error)) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
          <FileText className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">No Rental Quotation Active</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          {error || 'Please select an equipment asset from our fleet catalog, choose your rental schedule and quantity to generate an official quotation.'}
        </p>
        <div className="pt-2">
          <Button variant="primary" icon={Truck} onClick={() => navigate('/equipment')}>
            Browse Equipment Fleet
          </Button>
        </div>
      </div>
    );
  }

  const machineImg = getEquipmentImage(quotation);
  const createdDateStr = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleEditRental}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-amber-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Edit Rental Selections</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-3xs font-mono font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
            REF: {quotation.quotationReference || 'QT-PENDING'}
          </span>
          <button
            onClick={() => window.print()}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            <span>Print Quote</span>
          </button>
        </div>
      </div>

      {/* PHASE 5: SUCCESS STATE - Booking Created */}
      {createdBooking ? (
        <div className="bg-white rounded-3xl border border-emerald-200 shadow-md overflow-hidden space-y-6">
          <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-950 p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-300 shrink-0">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <span className="inline-block text-3xs font-mono font-bold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded mb-1 shadow-xs">
                  BOOKING CONFIRMED &bull; PENDING PAYMENT
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-emerald-950">
                  Rental Booking Created Successfully!
                </h1>
                <p className="text-xs text-emerald-800 mt-1">
                  Your reservation is held in the registry under status <strong>PENDING_PAYMENT</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Booking Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-3xs text-slate-400 uppercase font-bold block">Booking Reference</span>
                <span className="text-sm font-mono font-black text-amber-600 block mt-1">
                  {createdBooking.bookingReference}
                </span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-3xs text-slate-400 uppercase font-bold block">Rental ID</span>
                <span className="text-sm font-mono font-bold text-slate-800 block mt-1">
                  #{createdBooking.rentalId}
                </span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-3xs text-slate-400 uppercase font-bold block">Rental Status</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-500/15 text-amber-800 border border-amber-500/30 mt-1">
                  {createdBooking.status}
                </span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-3xs text-slate-400 uppercase font-bold block">Payment Status</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-500/15 text-blue-800 border border-blue-500/30 mt-1">
                  {createdBooking.paymentStatus || 'PENDING'}
                </span>
              </div>
            </div>

            {/* Authoritative Final Amount Summary */}
            <div className="bg-emerald-50/70 rounded-2xl p-5 border border-emerald-200 space-y-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-950 block">
                    Total Rental Amount
                  </span>
                  <span className="text-3xs text-emerald-700">
                    Confirmed rental booking total
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-950">
                    {formatCurrency(createdBooking.totalAmount)}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 ml-1">LKR</span>
                </div>
              </div>
            </div>

            {/* Payment Next Step Callout */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Booking Confirmed — Proceed to Payment
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your rental is logged in the database with status <code>PENDING_PAYMENT</code>. Complete payment to transition it to <code>CONFIRMED</code>.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => navigate('/my-rentals')}
                className="w-full sm:w-auto"
              >
                View in My Rentals
              </Button>

              <Button
                variant="primary"
                size="lg"
                icon={CreditCard}
                onClick={handleProceedToPayment}
                className="w-full sm:w-auto font-black shadow-lg shadow-amber-500/20 py-3.5 px-8"
              >
                Proceed to Payment
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* STANDARD QUOTATION VIEW & CONFIRM BOOKING */
        <div className="bg-white rounded-3xl border border-[#DFE8F0] shadow-md overflow-hidden">
          {/* Document Header Ribbon */}
          <div className="bg-[#F5F9FC] text-[#263746] p-6 sm:p-8 border-b border-[#DFE8F0]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-3xs font-heading font-bold uppercase tracking-wider bg-[#368BD1] text-white font-mono shadow-xs">
                    OFFICIAL QUOTATION
                  </span>
                  <span className="text-3xs text-[#657786] font-semibold">
                    Valid for 7 Days &bull; Generated {createdDateStr}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-heading font-bold text-[#263746] tracking-tight">
                  Rental Cost Estimate & Breakdown
                </h1>
                <p className="text-xs text-[#657786] mt-1">
                  {BRAND.name} &bull; Construction Plant Hire Division
                </p>
              </div>

              <div className="text-left sm:text-right bg-white p-3 sm:p-4 rounded-2xl border border-[#DFE8F0] shadow-xs shrink-0">
                <span className="text-3xs font-mono text-[#657786] uppercase tracking-widest block">
                  Quotation Reference
                </span>
                <span className="text-sm sm:text-base font-mono font-bold text-[#368BD1] block mt-0.5">
                  {quotation.quotationReference}
                </span>
                <span className="text-3xs text-[#2473B5] font-heading font-bold block mt-0.5">
                  Pre-Approved Zero Upfront Deposit
                </span>
              </div>
            </div>
          </div>

          {/* First-Come, First-Served Notice / Estimate Only Disclaimer Banner */}
          <div className="bg-sky-50/70 border-b border-sky-100 px-6 py-3.5 flex items-start sm:items-center gap-3">
            <Info className="h-4 w-4 text-[#368BD1] shrink-0 mt-0.5 sm:mt-0" />
            <div className="text-xs text-[#263746] leading-relaxed">
              <strong className="font-heading font-bold text-[#263746]">Important Notice:</strong> This quotation does <strong>not</strong> hold or reserve equipment. Equipment remains available on a{' '}
              <span className="font-heading font-bold text-[#2473B5]">first-come, first-served basis</span> until you click <strong>Confirm Booking</strong> below.
            </div>
          </div>

          {/* Customer Authentication State Banner */}
          {!isAuthenticated ? (
            <div className="p-4 bg-[#F5F9FC] text-[#263746] flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[#DFE8F0]">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-[#368BD1] shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-[#263746]">Contractor Authentication Required:</span>
                  <span className="text-[#657786] ml-1.5">
                    Please log in or register your account to confirm this machinery booking.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleAuthRedirect('/login')}
                  className="px-3 py-1.5 rounded-lg bg-[#368BD1] hover:bg-[#2473B5] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleAuthRedirect('/register')}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-[#368BD1] font-bold text-xs border border-[#368BD1] transition-colors cursor-pointer"
                >
                  Register
                </button>
              </div>
            </div>
          ) : !isCustomer ? (
            <div className="p-4 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                <strong>Internal Account Notice:</strong> You are signed in as an internal user ({user?.role}). Only customer accounts may create customer equipment bookings.
              </span>
            </div>
          ) : maintenanceSummary?.hasOutstandingDues ? (
            <div className="p-4 bg-rose-50 border-b border-rose-200 text-rose-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
                <div>
                  <strong className="block font-bold">New Bookings Restricted Due to Outstanding Maintenance Dues</strong>
                  <span>
                    Your account has unpaid equipment maintenance fees totaling{' '}
                    <strong>{formatCurrency(maintenanceSummary.outstandingAmount)} LKR</strong>.
                    Please settle these fees with staff to restore booking privileges.
                  </span>
                </div>
              </span>
              <Link
                to="/dashboard"
                className="shrink-0 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-xs"
              >
                View Dues in Dashboard
              </Link>
            </div>
          ) : (
            <div className="px-6 py-2.5 bg-emerald-50/70 border-b border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-emerald-600" />
                <span>
                  Booking as Verified Customer: <strong>{user?.name}</strong> ({user?.email})
                </span>
              </span>
              <span className="text-3xs font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Pre-Approved Account
              </span>
            </div>
          )}

          <div className="p-6 sm:p-8 space-y-8">
            {/* Equipment Asset Overview Card */}
            <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-6 bg-[#F5F9FC] p-5 rounded-2xl border border-[#DFE8F0]">
              <div className="w-full sm:w-44 h-36 bg-[#E8F2FA] rounded-xl overflow-hidden shrink-0 relative border border-[#DFE8F0]">
                <img
                  src={machineImg}
                  alt={quotation.equipmentName}
                  onError={(e) => handleImageError(e, machineImg)}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 text-3xs font-mono font-bold bg-white/95 text-[#263746] px-2 py-0.5 rounded border border-[#DFE8F0] shadow-xs">
                  {quotation.equipmentCode}
                </span>
              </div>

              <div className="flex-1 flex flex-col justify-between w-full space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-3xs font-bold uppercase tracking-wider text-amber-600">
                      {quotation.categoryName || 'Heavy Equipment'}
                    </span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-3xs text-slate-500 font-semibold">
                      {quotation.brand} {quotation.model}
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900">
                    {quotation.equipmentName}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-200/70">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>Depot: <strong>{quotation.location || 'Central Yard'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-[#368BD1] shrink-0" />
                    <span>
                      Asset Code: <strong>{quotation.equipmentCode || 'N/A'}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rental Configuration Schedule Breakdown */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center justify-between">
                <span>Rental Schedule & Capacity</span>
                <button
                  onClick={handleEditRental}
                  className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 text-3xs font-bold uppercase transition-colors cursor-pointer"
                >
                  <Edit3 className="h-3 w-3" />
                  <span>Modify Selections</span>
                </button>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-3xs text-slate-400 uppercase font-bold flex items-center gap-1">
                    <Tag className="h-3 w-3 text-amber-500" />
                    Rental Scheme
                  </span>
                  <span className="text-sm font-black text-slate-900 block">
                    {quotation.rentalType} HIRE
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-3xs text-slate-400 uppercase font-bold flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-amber-500" />
                    Rental Dates
                  </span>
                  <span className="text-xs font-extrabold text-slate-900 block">
                    {formatDate(quotation.startDate)}
                    {quotation.startDate !== quotation.endDate && (
                      <> &rarr; {formatDate(quotation.endDate)}</>
                    )}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-3xs text-slate-400 uppercase font-bold flex items-center gap-1">
                    <Clock className="h-3 w-3 text-amber-500" />
                    Total Duration
                  </span>
                  <span className="text-sm font-black text-slate-900 block">
                    {quotation.durationLabel || `${quotation.duration} Days`}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-3xs text-slate-400 uppercase font-bold flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    Fleet Allocation
                  </span>
                  <span className="text-sm font-black text-slate-900 block">
                    1 Dedicated Unit
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing Calculation Breakdown */}
            <div className="bg-[#F5F9FC] rounded-3xl p-6 sm:p-7 border border-[#DFE8F0] space-y-4">
              <div className="flex items-center justify-between border-b border-[#DFE8F0] pb-3">
                <div>
                  <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-[#263746]">
                    Itemized Rate Calculation
                  </h4>
                  <p className="text-3xs text-[#657786]">
                    Standard fleet rate breakdown
                  </p>
                </div>
                <span className="text-3xs font-heading font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#E8F2FA] text-[#2473B5]">
                  Formula: Duration &times; Rate
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-[#263746]">
                <div className="flex items-center justify-between">
                  <span>Base Rate ({quotation.rentalType.toLowerCase()}):</span>
                  <span className="font-heading font-bold text-[#263746] tabular-nums">
                    {formatCurrency(quotation.unitRate)} <span className="text-3xs font-normal text-[#657786]">/ {quotation.rentalType === 'HOURLY' ? 'hr' : quotation.rentalType === 'DAILY' ? 'day' : 'month'}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Calculated Duration:</span>
                  <span className="font-bold text-[#263746]">
                    {quotation.durationLabel || `${quotation.duration} units`}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#DFE8F0]">
                  <span className="text-[#657786] font-semibold">Subtotal:</span>
                  <span className="font-heading font-bold text-[#263746] tabular-nums">
                    {formatCurrency(quotation.subtotal || quotation.totalAmount)} LKR
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-[#DFE8F0] flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div>
                  <span className="text-sm font-heading font-bold uppercase tracking-wider text-[#263746] block">
                    Estimated Total
                  </span>
                  <span className="text-3xs text-[#657786]">
                    Sri Lankan Rupees (LKR) &bull; Inclusive of standard equipment wear & tear
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-2xl sm:text-3xl font-heading font-black text-[#263746] tabular-nums">
                    {formatCurrency(quotation.totalAmount)}
                  </span>
                  <span className="text-xs font-heading font-bold text-[#657786] ml-1.5">LKR</span>
                </div>
              </div>
            </div>

            {/* Live Availability Status Card & Recheck Button */}
            <div
              className={`p-5 rounded-2xl border transition-all space-y-3 ${
                quotation.isAvailable
                  ? 'bg-emerald-50/70 border-emerald-300/80 text-emerald-950'
                  : 'bg-rose-50/80 border-rose-300/80 text-rose-950'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  {quotation.isAvailable ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <strong className="text-xs sm:text-sm font-extrabold block">
                      {quotation.isAvailable
                        ? 'Live Availability Verified — Equipment Ready for Reservation'
                        : 'Equipment Currently Unavailable for Selected Dates'}
                    </strong>
                    <p className="text-xs text-slate-700 mt-0.5">
                      {quotation.availabilityMessage ||
                        (quotation.isAvailable
                          ? 'No conflicting rental bookings found in the live registry.'
                          : 'Overlapping bookings exist for the selected dates.')}
                    </p>
                    {availabilityTimestamp && (
                      <span className="text-3xs text-slate-400 block mt-1">
                        Last checked: {availabilityTimestamp.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action: Check Availability Again */}
                <button
                  type="button"
                  onClick={handleRecheckAvailability}
                  disabled={refreshingAvailability}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 transition-colors shadow-xs cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 text-amber-600 ${refreshingAvailability ? 'animate-spin' : ''}`} />
                  <span>{refreshingAvailability ? 'Checking...' : 'Check Availability Again'}</span>
                </button>
              </div>
            </div>

            {/* Pre-Approved Zero Upfront Deposit Terms Callout */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-extrabold text-slate-900">Pre-Approved Zero Upfront Deposit Terms</strong>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  As part of LK Construction Equipment Rental business terms, no cash deposit is required prior to reservation checkout. Billed usage and payment will be settled upon confirmed handover via corporate invoicing or bank transfer.
                </p>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Edit Rental Button */}
              <Button
                variant="outline"
                size="lg"
                icon={Edit3}
                onClick={handleEditRental}
                className="w-full sm:w-auto font-bold"
              >
                Edit Rental Parameters
              </Button>

              {/* PHASE 5: Confirm Booking CTA */}
              {!isAuthenticated ? (
                <Button
                  variant="primary"
                  size="lg"
                  icon={Lock}
                  onClick={() => handleAuthRedirect('/login')}
                  className="w-full sm:w-auto font-extrabold shadow-lg shadow-amber-500/20 py-3.5 px-8"
                >
                  Sign In to Confirm Booking
                </Button>
              ) : !isCustomer ? (
                <Button
                  variant="secondary"
                  size="lg"
                  disabled
                  className="w-full sm:w-auto font-bold cursor-not-allowed opacity-60"
                >
                  Customer Account Required
                </Button>
              ) : maintenanceSummary?.hasOutstandingDues ? (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                    <span>
                      Booking locked: Outstanding maintenance dues of{' '}
                      <strong>{formatCurrency(maintenanceSummary.outstandingAmount)} LKR</strong>.
                    </span>
                  </div>
                  <Button
                    variant="danger"
                    size="lg"
                    disabled
                    icon={Lock}
                    className="w-full sm:w-auto font-bold opacity-60 cursor-not-allowed"
                  >
                    Booking Locked (Dues Pending)
                  </Button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  icon={ArrowRight}
                  onClick={() => {
                    setBookingError(null);
                    setShowConfirmModal(true);
                  }}
                  disabled={!quotation.isAvailable}
                  className={`w-full sm:w-auto font-extrabold shadow-lg shadow-amber-500/20 py-3.5 px-8 ${
                    !quotation.isAvailable ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Confirm Booking
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PHASE 5: BOOKING CONFIRMATION MODAL */}
      {showConfirmModal && quotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden space-y-6">
            {/* Modal Header */}
            <div className="bg-[#F5F9FC] text-[#263746] p-6 flex items-center justify-between border-b border-[#DFE8F0]">
              <div>
                <span className="text-3xs font-mono font-bold uppercase text-[#368BD1] tracking-wider block">
                  Step 2 of Booking Creation
                </span>
                <h3 className="text-lg font-heading font-bold text-[#263746] mt-0.5">
                  Confirm Rental Booking
                </h3>
              </div>
              <button
                type="button"
                onClick={() => !isSubmittingBooking && setShowConfirmModal(false)}
                disabled={isSubmittingBooking}
                className="p-1 rounded-lg text-[#657786] hover:text-[#263746] hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 pt-0 space-y-5">
              {/* Customer Identity Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-3xs text-slate-400 font-bold uppercase block">Hirer / Customer</span>
                  <span className="text-sm font-black text-slate-900 block">{user?.name}</span>
                  <span className="text-3xs text-slate-500">{user?.email}</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-3xs font-bold text-emerald-800">
                  Verified Hirer
                </span>
              </div>

              {/* Machinery & Rental Summary */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Equipment:</span>
                  <span className="font-bold text-slate-900">
                    {quotation.equipmentName} ({quotation.equipmentCode})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rental Scheme:</span>
                  <span className="font-bold text-slate-900">{quotation.rentalType} HIRE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scheduled Dates:</span>
                  <span className="font-bold text-slate-900">
                    {formatDate(quotation.startDate)} &rarr; {formatDate(quotation.endDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rental Duration:</span>
                  <span className="font-bold text-slate-900">
                    {quotation.durationLabel || `${quotation.duration} units`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Unit Rate:</span>
                  <span className="font-semibold text-slate-800">
                    {formatCurrency(quotation.unitRate)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 items-baseline">
                  <span className="font-bold text-slate-900">Estimated Total:</span>
                  <span className="text-xl font-black text-slate-950">
                    {formatCurrency(quotation.totalAmount)} <span className="text-xs font-bold text-slate-500">LKR</span>
                  </span>
                </div>
              </div>

              {/* Booking Error Banner */}
              {bookingError && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Booking Submission Failed:</strong>
                    <span className="mt-0.5 block">{bookingError}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isSubmittingBooking}
                >
                  Cancel
                </Button>

                <Button
                  variant="primary"
                  icon={CheckCircle}
                  loading={isSubmittingBooking}
                  disabled={isSubmittingBooking}
                  onClick={handleConfirmAndCreateBooking}
                  className="font-extrabold shadow-md shadow-amber-500/20 px-6"
                >
                  {isSubmittingBooking ? 'Submitting to Registry...' : 'Confirm & Create Booking'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationPage;
