import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rentalApi } from '../api/rentalApi';
import { formatCurrency, formatDate, formatDateTime } from '../../../utils/formatters';
import { PageHeader } from '../../../components/common/PageHeader';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Button } from '../../../components/common/Button';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { ArrowLeft, CreditCard, CheckCircle } from 'lucide-react';

export const RentalDetail = () => {
  const { id } = useParams();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    rentalApi.getById(id)
      .then((res) => {
        if (res.success) setRental(res.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner size="lg" />;
  if (!rental) return <div className="p-8 text-center text-slate-500">Rental agreement not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate(-1)}>
        Back
      </Button>

      <PageHeader
        title={`Rental Booking #${rental.bookingReference}`}
        subtitle={`Reserved on ${formatDate(rental.createdAt)}`}
      >
        <div className="flex items-center gap-3">
          <StatusBadge status={rental.status} />
          {rental.status === 'PENDING_PAYMENT' && (
            <Button
              variant="primary"
              size="sm"
              icon={CreditCard}
              onClick={() => navigate(`/payments/checkout?rentalId=${rental.rentalId}`)}
            >
              Pay Now
            </Button>
          )}
          {(rental.status === 'CONFIRMED' || rental.status === 'PENDING_PAYMENT') && (
            <Button
              variant="danger"
              size="sm"
              onClick={async () => {
                if (window.confirm('Are you sure you want to cancel this booking? If it is already paid, it will be marked as REFUNDED.')) {
                  try {
                    await rentalApi.cancel(rental.rentalId);
                    window.location.reload();
                  } catch (err) {
                    alert(err.message || 'Failed to cancel booking');
                  }
                }
              }}
            >
              {rental.status === 'CONFIRMED' ? 'Cancel & Refund' : 'Cancel Booking'}
            </Button>
          )}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer & Period Information */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-heading font-bold text-advantis-900 uppercase tracking-wider">
            Booking & Customer Details
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Customer:</span>
              <span className="font-semibold text-slate-800">{rental.customerName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Phone:</span>
              <span className="font-medium text-slate-800">{rental.customerPhone}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Hire Start:</span>
              <span className="font-medium text-slate-800">{formatDate(rental.startDate)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Expected Return:</span>
              <span className="font-medium text-slate-800">{formatDate(rental.endDate)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Actual Pickup At:</span>
              <span className="font-semibold text-advantis-700">
                {rental.pickupAt ? formatDateTime(rental.pickupAt) : 'Not Yet Picked Up'}
              </span>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-heading font-bold text-advantis-900 uppercase tracking-wider">
            Payment & Total Amount
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Payment Status:</span>
              <StatusBadge status={rental.paymentStatus || 'PENDING'} />
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Security Deposit:</span>
              <span className="font-medium text-slate-500">None</span>
            </div>
            <div className="flex justify-between py-2 items-center">
              <span className="text-base font-bold text-slate-800">Total Hire Charge:</span>
              <span className="text-xl font-heading font-extrabold text-advantis-900 tabular-nums">
                {formatCurrency(rental.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Rental Items Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-base font-heading font-bold text-advantis-900 mb-4">Itemized Machinery Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-[#f0f4f8] text-2xs font-heading font-bold uppercase tracking-wider text-advantis-900 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Equipment</th>
                <th className="px-4 py-3">Rate Type</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Unit Rate</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Return Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rental.items?.map((item) => (
                <tr key={item.rentalItemId}>
                  <td className="px-4 py-3 font-semibold text-advantis-700">{item.equipmentCode}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{item.equipmentName}</td>
                  <td className="px-4 py-3 text-slate-600">{item.rentalType}</td>
                  <td className="px-4 py-3 text-slate-600">{item.duration}</td>
                  <td className="px-4 py-3 text-slate-600 tabular-nums">{formatCurrency(item.unitRate)}</td>
                  <td className="px-4 py-3 font-bold text-slate-800 tabular-nums">{formatCurrency(item.itemAmount)}</td>
                  <td className="px-4 py-3">
                    {item.isReturned ? (
                      <span className="inline-flex items-center text-xs font-semibold text-emerald-600 gap-1">
                        <CheckCircle className="h-3.5 w-3.5" /> Returned
                      </span>
                    ) : (
                      <span className="text-xs text-amber-600 font-medium">On Site / Pending Return</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
