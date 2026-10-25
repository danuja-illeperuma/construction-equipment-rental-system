import React, { useState, useEffect } from 'react';
import { paymentApi } from '../api/paymentApi';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Select } from '../../../components/common/Select';
import { CreditCard, DollarSign } from 'lucide-react';

export const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const { error } = useToast();

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await paymentApi.getAll({ status: statusFilter || undefined });
      if (res.success || Array.isArray(res.data)) {
        setPayments(res.data || []);
      }
    } catch (err) {
      error(err.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const columns = [
    { header: 'Payment ID', accessor: 'paymentId' },
    { header: 'Booking Ref', accessor: 'bookingReference' },
    { header: 'Customer', accessor: 'customerName' },
    {
      header: 'Amount',
      render: (row) => (
        <span className="font-bold text-slate-900">{formatCurrency(row.amount)}</span>
      ),
    },
    {
      header: 'Payment Method',
      render: (row) => (
        <span className="font-mono text-2xs uppercase bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-700">
          {row.paymentMethod}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.paymentStatus} />,
    },
    {
      header: 'Transaction Ref',
      render: (row) => (
        <span className="font-mono text-2xs text-slate-500">
          {row.transactionReference || '—'}
        </span>
      ),
    },
    {
      header: 'Paid At',
      render: (row) => (row.paidAt ? formatDateTime(row.paidAt) : 'Pending'),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Payment Transactions"
        subtitle="Transaction history and records of customer rental payments"
      >
        <Select
          placeholder="All Payment Statuses"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'PENDING', label: 'PENDING' },
            { value: 'COMPLETED', label: 'COMPLETED' },
            { value: 'FAILED', label: 'FAILED' },
            { value: 'REFUNDED', label: 'REFUNDED' },
          ]}
          className="w-48"
        />
      </PageHeader>

      <DataTable columns={columns} data={payments} loading={loading} />
    </div>
  );
};

export default PaymentList;
