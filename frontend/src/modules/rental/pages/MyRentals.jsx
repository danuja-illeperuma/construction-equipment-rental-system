import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rentalApi } from '../api/rentalApi';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Button } from '../../../components/common/Button';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { CreditCard, Eye, XCircle } from 'lucide-react';

export const MyRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedRentalId, setSelectedRentalId] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const { error, success } = useToast();
  const navigate = useNavigate();

  const fetchMyRentals = async () => {
    setLoading(true);
    try {
      const res = await rentalApi.getMyRentals();
      if (res.success) setRentals(res.data);
    } catch (err) {
      error(err.message || 'Failed to fetch personal rentals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRentals();
  }, []);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await rentalApi.cancel(selectedRentalId);
      success('Rental reservation cancelled');
      setCancelModalOpen(false);
      fetchMyRentals();
    } catch (err) {
      error(err.message || 'Failed to cancel reservation');
    } finally {
      setCancelling(false);
    }
  };

  const columns = [
    { header: 'Booking Ref', accessor: 'bookingReference' },
    {
      header: 'Dates',
      render: (row) => `${formatDate(row.startDate)} to ${formatDate(row.endDate)}`,
    },
    { header: 'Total Amount', render: (row) => formatCurrency(row.totalAmount) },
    {
      header: 'Rental Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Payment Status',
      render: (row) => <StatusBadge status={row.paymentStatus || 'PENDING'} />,
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'PENDING_PAYMENT' && (
            <Button
              variant="primary"
              size="sm"
              icon={CreditCard}
              onClick={() => navigate(`/payments/checkout?rentalId=${row.rentalId}`)}
            >
              Pay Now
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            icon={Eye}
            onClick={() => navigate(`/rentals/${row.rentalId}`)}
          >
            Details
          </Button>

          {row.status === 'PENDING_PAYMENT' && (
            <Button
              variant="secondary"
              size="sm"
              icon={XCircle}
              onClick={() => {
                setSelectedRentalId(row.rentalId);
                setCancelModalOpen(true);
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageHeader
        title="My Rental Bookings"
        subtitle="Track equipment orders, complete pending payments, and view hire agreements"
      />

      <DataTable columns={columns} data={rentals} loading={loading} />

      <ConfirmDialog
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Equipment Reservation"
        message="Are you sure you want to cancel this booking? Reserved equipment will be released back to the general fleet."
        loading={cancelling}
      />
    </div>
  );
};
