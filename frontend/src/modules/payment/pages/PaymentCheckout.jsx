import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { rentalApi } from '../../rental/api/rentalApi';
import { paymentApi } from '../api/paymentApi';
import { useAuth } from '../../../context/AuthContext';
import { formatCurrency, formatDate, formatDateTime } from '../../../utils/formatters';
import { Button } from '../../../components/common/Button';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  FileText,
  Calendar,
  Layers,
  Info
} from 'lucide-react';

export const PaymentCheckout = () => {
  const { bookingReference: routeBookingRef } = useParams();
  const [searchParams] = useSearchParams();
  const queryRentalId = searchParams.get('rentalId');
  const queryRef = searchParams.get('ref');

  const targetRef = routeBookingRef || queryRef;
  const targetRentalId = queryRentalId;

  const { user } = useAuth();
  const navigate = useNavigate();

  const [rental, setRental] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(null); // 'PAY' | 'CANCEL' | null
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setApiError(null);

    try {
      let loadedRental = null;
      let loadedPayment = null;

      if (targetRef) {
        const rentalRes = await rentalApi.getByBookingReference(targetRef);
        if (rentalRes.success) {
          loadedRental = rentalRes.data;
        }

        try {
          const payRes = await paymentApi.getByBookingReference(targetRef);
          if (payRes.success) {
            loadedPayment = payRes.data;
          }
        } catch (payErr) {
          // Payment might not exist yet or will be loaded via rentalId
          if (loadedRental?.rentalId) {
            const payRes = await paymentApi.getByRentalId(loadedRental.rentalId);
            if (payRes.success) loadedPayment = payRes.data;
          }
        }
      } else if (targetRentalId) {
        const rentalRes = await rentalApi.getById(targetRentalId);
        if (rentalRes.success) {
          loadedRental = rentalRes.data;
        }

        const payRes = await paymentApi.getByRentalId(targetRentalId);
        if (payRes.success) {
          loadedPayment = payRes.data;
        }
      } else {
        setApiError('No booking reference or rental ID provided in the payment request URL.');
        setLoading(false);
        return;
      }

      setRental(loadedRental);
      setPayment(loadedPayment);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to retrieve booking or payment details.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  }, [targetRef, targetRentalId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleConfirmPayment = async () => {
    if (!rental) return;
    setProcessingAction('PAY');
    setApiError(null);
    setFeedback(null);

    try {
      const payload = {
        rentalId: rental.rentalId,
        bookingReference: rental.bookingReference,
        status: 'SUCCESS',
      };

      const res = await paymentApi.simulate(payload);
      if (res.success && res.data) {
        setPayment(res.data);
        setRental((prev) => ({
          ...prev,
          status: 'CONFIRMED',
          paymentStatus: 'SUCCESS',
        }));
        setFeedback({
          type: 'success',
          title: 'Payment Confirmed Successfully!',
          message: 'Your machinery reservation has been updated to CONFIRMED in the database.',
          txRef: res.data.transactionReference,
          paidAt: res.data.paidAt,
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Payment processing failed. Please try again.';
      setApiError(msg);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleCancelBooking = async () => {
    if (!rental) return;
    setProcessingAction('CANCEL');
    setApiError(null);
    setFeedback(null);

    try {
      const res = await rentalApi.cancel(rental.rentalId);
      if (res.success || res.data) {
        setRental((prev) => ({
          ...prev,
          status: 'CANCELLED',
        }));
        setFeedback({
          type: 'error',
          title: 'Booking Cancelled',
          message: 'This rental reservation has been cancelled. All scheduled equipment units have been released back to fleet inventory.',
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to cancel rental booking.';
      setApiError(msg);
    } finally {
      setProcessingAction(null);
      setCancelDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-slate-600 font-medium text-sm animate-pulse">Loading rental checkout details...</p>
      </div>
    );
  }

  if (apiError && !rental) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-rose-200 p-8 shadow-sm text-center space-y-4">
          <div className="inline-flex p-3 bg-rose-50 rounded-full text-rose-600">
            <XCircle className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Unable to Load Payment Details</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">{apiError}</p>
          <div className="pt-4 flex flex-wrap gap-3 justify-center">
            <Button variant="secondary" onClick={() => navigate('/my-rentals')}>
              Go to My Rentals
            </Button>
            <Button variant="primary" onClick={() => navigate('/equipment')}>
              Browse Fleet Catalog
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isCompleted = payment?.paymentStatus === 'SUCCESS' || rental?.status === 'CONFIRMED';
  const isCancelled = rental?.status === 'CANCELLED';
  const isFailed = payment?.paymentStatus === 'FAILED';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Breadcrumb / Back Link */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/my-rentals')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Rentals
        </button>
        <span className="text-xs text-slate-400 font-mono">
          Ref: {rental?.bookingReference}
        </span>
      </div>

      {/* Page Header */}
      <div className="bg-[#F5F9FC] text-[#263746] rounded-2xl p-6 sm:p-8 border border-[#DFE8F0] shadow-xs relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#E8F2FA] text-[#2473B5] border border-[#A4D0F2] text-xs font-bold uppercase tracking-wider">
            <CreditCard className="h-3.5 w-3.5" />
            Payment Checkout
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#263746]">
            Rental Payment Confirmation
          </h1>
          <p className="text-[#657786] text-sm max-w-xl">
            Review your booking specifications and complete payment to confirm your equipment rental.
          </p>
        </div>
      </div>

      {/* Secure Policy Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 flex items-center gap-3 text-slate-600 text-xs sm:text-sm shadow-xs">
        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
        <p>Zero upfront security deposit. Confirm payment to finalize machinery dispatch and secure your reservation dates.</p>
      </div>

      {/* Alert Error Box (if any action error) */}
      {apiError && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 text-rose-900 text-sm">
          <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-rose-950">Payment Action Rejected</p>
            <p className="text-rose-800">{apiError}</p>
          </div>
        </div>
      )}

      {/* Success / Failure Result Feedback Banner */}
      {feedback && (
        <div
          className={`rounded-xl border p-5 shadow-xs space-y-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-3">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="h-6 w-6 text-rose-600 shrink-0" />
            )}
            <div>
              <h3 className="text-base font-bold">{feedback.title}</h3>
              <p className="text-xs sm:text-sm text-slate-700">{feedback.message}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs font-mono">
            {feedback.txRef && (
              <div>
                <span className="text-slate-500 font-sans">Transaction Reference: </span>
                <span className="font-bold text-slate-800">{feedback.txRef}</span>
              </div>
            )}
            {feedback.paidAt && (
              <div>
                <span className="text-slate-500 font-sans">Timestamp: </span>
                <span className="font-bold text-slate-800">{formatDateTime(feedback.paidAt)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Card Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Booking Reference</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-lg font-extrabold text-slate-900 tracking-tight font-mono">
                {rental?.bookingReference}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-medium">
                ID #{rental?.rentalId}
              </span>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-2">
            {/* Rental Status */}
            <div className="text-right">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Rental Status</span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                  rental?.status === 'CONFIRMED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : rental?.status === 'PENDING_PAYMENT'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {rental?.status === 'CONFIRMED' && <CheckCircle2 className="h-3 w-3" />}
                {rental?.status === 'PENDING_PAYMENT' && <Clock className="h-3 w-3" />}
                {rental?.status || 'PENDING'}
              </span>
            </div>

            {/* Payment Status */}
            <div className="text-right">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Payment Status</span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                  payment?.paymentStatus === 'SUCCESS'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : payment?.paymentStatus === 'FAILED'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {payment?.paymentStatus === 'SUCCESS' && <CheckCircle2 className="h-3 w-3" />}
                {payment?.paymentStatus === 'FAILED' && <XCircle className="h-3 w-3" />}
                {payment?.paymentStatus === 'PENDING' && <Clock className="h-3 w-3" />}
                {payment?.paymentStatus || 'PENDING'}
              </span>
            </div>
          </div>
        </div>

        {/* Schedule & Duration Grid */}
        <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-100 bg-white">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-advantis-50 rounded-xl text-advantis-700 shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Rental Schedule</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                {formatDate(rental?.startDate)} &rarr; {formatDate(rental?.endDate)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Customer Account</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                {rental?.customerName || user?.name}
              </p>
              <p className="text-xs text-slate-500">{rental?.customerPhone || user?.phone || user?.email}</p>
            </div>
          </div>
        </div>

        {/* Machinery Items Table */}
        <div className="p-5 sm:p-6 space-y-3">
          <p className="text-xs font-heading font-bold text-advantis-900 uppercase tracking-wider">Reserved Equipment Fleet</p>
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
            {rental?.items && rental.items.length > 0 ? (
              rental.items.map((item, idx) => (
                <div key={item.rentalItemId || idx} className="p-4 flex flex-wrap items-center justify-between gap-3 bg-white">
                  <div className="space-y-0.5">
                    <p className="text-sm font-heading font-bold text-advantis-900">{item.equipmentName}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                      <span>{item.equipmentCode}</span>
                      <span>&bull;</span>
                      <span className="uppercase text-advantis-700 font-semibold">{item.rentalType}</span>
                    </div>
                  </div>

                  <div className="text-right space-y-0.5">
                    <p className="text-xs text-slate-500">
                      {item.duration} {item.rentalType === 'HOURLY' ? 'hr' : item.rentalType === 'DAILY' ? 'day(s)' : 'month'} @ {formatCurrency(item.unitRate)}
                    </p>
                    <p className="text-sm font-heading font-bold text-slate-900 tabular-nums">{formatCurrency(item.itemAmount)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                Machinery item details associated with Rental #{rental?.rentalId}
              </div>
            )}
          </div>
        </div>

        {/* Total Payable Box */}
        <div className="p-5 sm:p-6 bg-slate-50/70 border-t border-slate-100 space-y-2">
          <div className="flex justify-between text-xs text-slate-600">
            <span>Security Deposit:</span>
            <span className="text-emerald-600 font-medium">LKR 0.00 (Zero Deposit Policy)</span>
          </div>
          <div className="flex justify-between text-xs text-slate-600">
            <span>Taxes & Handling:</span>
            <span className="font-medium text-slate-800">Included</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-200">
            <span className="text-base font-heading font-bold text-advantis-900">Authoritative Total Amount:</span>
            <span className="text-2xl font-heading font-black text-advantis-950 tabular-nums tracking-tight">
              {formatCurrency(rental?.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Simulated Transaction Metadata (If Already Persisted) */}
      {payment?.transactionReference && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold uppercase">Persisted Payment Record</span>
            <span className="font-mono text-slate-500">Payment #{payment.paymentId}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono">
            <div>
              <span className="text-slate-400 block font-sans">Method</span>
              <span className="font-bold text-slate-800">{payment.paymentMethod}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-sans">Transaction Ref</span>
              <span className="font-bold text-slate-800">{payment.transactionReference}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-sans">Paid Timestamp</span>
              <span className="font-bold text-slate-800">
                {payment.paidAt ? formatDateTime(payment.paidAt) : 'Pending Confirmation'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Decision Area */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-heading font-bold text-advantis-900">
            {isCancelled
              ? 'Booking Cancelled'
              : isCompleted
              ? 'Payment Completed'
              : 'Payment Confirmation & Actions'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isCancelled
              ? 'This rental reservation has been cancelled and machinery released back to inventory.'
              : isCompleted
              ? 'This rental booking is confirmed. No further payment processing is required.'
              : 'Confirm payment to lock your machinery reservation, or cancel if you no longer require this hire.'}
          </p>
        </div>

        {isCancelled ? (
          <div className="space-y-4">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-900 text-sm">
              <XCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <span>
                <strong>Reservation Cancelled!</strong> This equipment booking has been cancelled and machinery released.
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={() => navigate('/equipment')}
              >
                <Layers className="h-4 w-4 mr-2" />
                Browse Fleet Catalog
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={() => navigate('/my-rentals')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Go to My Rentals
              </Button>
            </div>
          </div>
        ) : isCompleted ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-900 text-sm">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>
                <strong>Reservation Confirmed!</strong> Your machinery is locked and scheduled for dispatch.
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={() => navigate(`/rentals/${rental.rentalId}`)}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Booking Details
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={() => navigate('/my-rentals')}
              >
                <Layers className="h-4 w-4 mr-2" />
                Go to My Rentals
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Proper Button 1: Confirm & Pay */}
              <button
                type="button"
                disabled={processingAction !== null}
                onClick={handleConfirmPayment}
                className="group relative p-5 rounded-xl border-2 border-emerald-500 bg-emerald-50/60 hover:bg-emerald-50 text-left transition-all hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="p-2.5 bg-emerald-600 text-white rounded-lg shadow-xs group-hover:scale-105 transition-transform">
                    {processingAction === 'PAY' ? (
                      <LoadingSpinner size="sm" className="text-white" />
                    ) : (
                      <CreditCard className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Confirm & Pay
                  </span>
                </div>
                <div className="mt-3 space-y-1">
                  <h4 className="text-sm font-bold text-emerald-950 group-hover:text-emerald-700 transition-colors">
                    Confirm & Complete Payment
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Authorize payment to secure your equipment reservation and advance booking to confirmed status.
                  </p>
                </div>
              </button>

              {/* Proper Button 2: Cancel Rental Booking */}
              <button
                type="button"
                disabled={processingAction !== null}
                onClick={() => setCancelDialogOpen(true)}
                className="group relative p-5 rounded-xl border-2 border-slate-300 bg-slate-50/50 hover:bg-rose-50/40 hover:border-rose-400 text-left transition-all hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed focus:outline-hidden focus:ring-2 focus:ring-rose-400 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="p-2.5 bg-slate-700 group-hover:bg-rose-600 text-white rounded-lg shadow-xs transition-colors">
                    {processingAction === 'CANCEL' ? (
                      <LoadingSpinner size="sm" className="text-white" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 group-hover:bg-rose-100 text-slate-700 group-hover:text-rose-800 px-2.5 py-0.5 rounded-full border border-slate-200 group-hover:border-rose-200 transition-colors">
                    Cancel Booking
                  </span>
                </div>
                <div className="mt-3 space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                    Cancel Rental Booking
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Cancel this reservation and release the reserved equipment units back to available fleet.
                  </p>
                </div>
              </button>
            </div>

            {isFailed && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
                <span className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-amber-600" />
                  Previous attempt was not completed. You may retry by clicking "Confirm & Complete Payment".
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Cancellation */}
      <ConfirmDialog
        isOpen={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={handleCancelBooking}
        title="Cancel Rental Booking"
        message={`Are you sure you want to cancel booking ${rental?.bookingReference}? This will cancel the reservation and release all reserved equipment back to inventory.`}
        confirmText="Yes, Cancel Booking"
        cancelText="Keep Booking"
        variant="danger"
        loading={processingAction === 'CANCEL'}
      />

      {/* Footer Navigation */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
        <Link to="/quotation" className="hover:text-slate-800 hover:underline">
          &larr; Return to Quotation Review
        </Link>
        <Link to="/dashboard" className="hover:text-slate-800 hover:underline">
          Go to Customer Dashboard &rarr;
        </Link>
      </div>
    </div>
  );
};

export default PaymentCheckout;
