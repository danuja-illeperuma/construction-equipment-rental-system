import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rentalApi } from '../api/rentalApi';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency, formatDate, formatDateTime } from '../../../utils/formatters';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Button } from '../../../components/common/Button';
import { Select } from '../../../components/common/Select';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { Truck, Eye, CheckCircle2 } from 'lucide-react';

export const RentalOperations = () => {
  const [rentals, setRentals] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [pickupModalOpen, setPickupModalOpen] = useState(false);
  const [selectedRentalId, setSelectedRentalId] = useState(null);
  const [processingPickup, setProcessingPickup] = useState(false);
  const { error, success } = useToast();
  const navigate = useNavigate();

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const res = await rentalApi.getAll(statusFilter || undefined);
      if (res.success) setRentals(res.data);
    } catch (err) {
      error(err.message || 'Failed to fetch rentals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, [statusFilter]);

  const handleRecordPickup = async () => {
    setProcessingPickup(true);
    try {
      const res = await rentalApi.recordPickup(selectedRentalId);
      if (res.success) {
        success('Equipment handover recorded. Rental is now active.');
        setPickupModalOpen(false);
        fetchRentals();
      }
    } catch (err) {
      error(err.message || 'Failed to record pickup');
    } finally {
      setProcessingPickup(false);
    }
  };

  const columns = [
    { header: 'Ref', accessor: 'bookingReference' },
    { header: 'Customer', accessor: 'customerName' },
    { header: 'Phone', accessor: 'customerPhone' },
    {
      header: 'Hire Period',
      render: (row) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isOverdue = row.status === 'ACTIVE' && new Date(row.endDate) < today;
        return (
          <span className={isOverdue ? "text-red-600 font-semibold" : ""}>
            {formatDate(row.startDate)} → {formatDate(row.endDate)}
          </span>
        );
      },
    },
    { header: 'Amount', render: (row) => formatCurrency(row.totalAmount) },
    {
      header: 'Status',
      render: (row) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isOverdue = row.status === 'ACTIVE' && new Date(row.endDate) < today;
        return (
          <div className="flex flex-col gap-1">
            <StatusBadge status={row.status} />
            {isOverdue && (
              <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700 animate-pulse w-fit border border-red-200">
                OVERDUE
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Pickup Recorded',
      render: (row) => (row.pickupAt ? formatDateTime(row.pickupAt) : '—'),
    },
    {
      header: 'Staff Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'CONFIRMED' && (
            <Button
              variant="success"
              size="sm"
              icon={Truck}
              onClick={() => {
                setSelectedRentalId(row.rentalId);
                setPickupModalOpen(true);
              }}
            >
              Record Handover
            </Button>
          )}

          {(row.status === 'CONFIRMED' || row.status === 'PENDING_PAYMENT') && (
            <Button
              variant="danger"
              size="sm"
              onClick={async () => {
                if (window.confirm('Are you sure you want to cancel this booking? If it is already paid, it will be marked as REFUNDED.')) {
                  try {
                    await rentalApi.cancel(row.rentalId);
                    success('Booking cancelled successfully.');
                    fetchRentals();
                  } catch (err) {
                    error(err.message || 'Failed to cancel booking');
                  }
                }
              }}
            >
              {row.status === 'CONFIRMED' ? 'Cancel & Refund' : 'Cancel'}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            icon={Eye}
            onClick={() => navigate(`/rentals/${row.rentalId}`)}
          >
            Agreement
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Rental Operations Desk"
        subtitle="Manage machinery allocations, verify payment confirmation, and execute physical pickup handovers"
      >
        <Select
          placeholder="All Operational Statuses"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'PENDING_PAYMENT', label: 'Pending Payment' },
            { value: 'CONFIRMED', label: 'Confirmed (Awaiting Pickup)' },
            { value: 'ACTIVE', label: 'Active (On Site)' },
            { value: 'COMPLETED', label: 'Completed' },
            { value: 'CANCELLED', label: 'Cancelled' },
          ]}
          className="w-56"
        />
      </PageHeader>

      <DataTable columns={columns} data={rentals} loading={loading} />

      <ConfirmDialog
        isOpen={pickupModalOpen}
        onClose={() => setPickupModalOpen(false)}
        onConfirm={handleRecordPickup}
        title="Confirm Equipment Handover"
        message="Confirm that the customer or transport hauler has picked up the machinery. This will activate the rental agreement."
        confirmText="Confirm Handover"
        variant="success"
        loading={processingPickup}
      />
    </div>
  );
};
