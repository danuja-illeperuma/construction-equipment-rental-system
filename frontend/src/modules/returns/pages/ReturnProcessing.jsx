import React, { useState, useEffect } from 'react';
import { returnsApi } from '../api/returnsApi';
import { rentalApi } from '../../rental/api/rentalApi';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import { PageHeader } from '../../../components/common/PageHeader';
import { Button } from '../../../components/common/Button';
import { DataTable } from '../../../components/common/DataTable';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { RotateCcw, AlertTriangle, Plus } from 'lucide-react';

export const ReturnProcessing = () => {
  const [returnsList, setReturnsList] = useState([]);
  const [activeRentals, setActiveRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { error, success } = useToast();

  const [form, setForm] = useState({
    rentalItemId: '',
    condition: 'GOOD',
    notes: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [retRes, rentRes] = await Promise.all([
        returnsApi.getAllReturns(),
        rentalApi.getAll('ACTIVE'),
      ]);
      const retData = retRes?.data || (Array.isArray(retRes) ? retRes : []);
      const rentData = rentRes?.data || (Array.isArray(rentRes) ? rentRes : []);
      setReturnsList(retData);

      // Ensure active rentals have their machinery line items populated
      const populatedRentals = await Promise.all(
        rentData.map(async (rental) => {
          if (Array.isArray(rental.items) && rental.items.length > 0) {
            return rental;
          }
          try {
            const detailRes = await rentalApi.getById(rental.rentalId);
            const detail = detailRes?.data || detailRes;
            if (detail && Array.isArray(detail.items) && detail.items.length > 0) {
              return { ...rental, items: detail.items };
            }
          } catch (e) {
            // Keep rental as fallback
          }
          return rental;
        })
      );

      setActiveRentals(populatedRentals);
    } catch (err) {
      error(err.message || 'Failed to fetch returns data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Flatten unreturned items from active rentals
  const unreturnedItems = (activeRentals || []).flatMap((rental) =>
    (rental.items || [])
      .filter((item) => !item.isReturned)
      .map((item) => ({
        rentalItemId: item.rentalItemId,
        label: `Booking #${rental.bookingReference} — ${item.equipmentCode || `EQ-${item.equipmentId}`} (${item.equipmentName || 'Equipment'})`,
      }))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rentalItemId) {
      error('Please select an active machinery item');
      return;
    }
    setSubmitting(true);
    try {
      const res = await returnsApi.recordReturn({
        rentalItemId: Number(form.rentalItemId),
        condition: form.condition,
        notes: form.notes,
      });
      if (res.success) {
        success('Return processed! Late charge: ' + formatCurrency(res.data.lateCharge));
        setModalOpen(false);
        setForm({ rentalItemId: '', condition: 'GOOD', notes: '' });
        fetchData();
      }
    } catch (err) {
      error(err.message || 'Failed to record return');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { header: 'ID', accessor: 'returnId' },
    { header: 'Equipment', accessor: 'equipmentName' },
    { header: 'Code', accessor: 'equipmentCode' },
    {
      header: 'Returned At',
      render: (row) => formatDateTime(row.returnedAt),
    },
    {
      header: 'Physical Condition',
      render: (row) => <StatusBadge status={row.condition} />,
    },
    {
      header: 'Calculated Late Charge',
      render: (row) => (
        <span className={Number(row.lateCharge) > 0 ? 'text-rose-600 font-bold' : 'text-slate-700'}>
          {formatCurrency(row.lateCharge)}
        </span>
      ),
    },
    { header: 'Inspector', accessor: 'recordedByName' },
    { header: 'Notes', accessor: 'notes' },
  ];

  return (
    <div>
      <PageHeader
        title="Equipment Returns & Off-Hire Inspection"
        subtitle="Record equipment return times, calculate automated late charges, and assess physical condition"
      >
        <Button variant="primary" icon={Plus} onClick={() => setModalOpen(true)}>
          Process Machine Return
        </Button>
      </PageHeader>

      <DataTable columns={columns} data={returnsList} loading={loading} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Equipment Return"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {unreturnedItems.length === 0 ? (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-1">
              <p className="font-bold">No active machinery currently out on hire.</p>
              <p className="text-amber-700">
                Ensure the booking is in <span className="font-semibold text-emerald-800">ACTIVE</span> status by recording pickup on the Rentals board before processing returns.
              </p>
            </div>
          ) : (
            <Select
              label="Active Rental Machinery Item"
              value={form.rentalItemId}
              onChange={(e) => setForm({ ...form, rentalItemId: e.target.value })}
              options={unreturnedItems.map((item) => ({ value: item.rentalItemId, label: item.label }))}
              placeholder="Select machine on hire..."
              required
            />
          )}

          <Select
            label="Condition upon Return"
            value={form.condition}
            onChange={(e) => setForm({ ...form, condition: e.target.value })}
            options={[
              { value: 'GOOD', label: 'GOOD (Clean & Operational)' },
              { value: 'DAMAGED', label: 'DAMAGED (Requires Repair / Maintenance)' },
            ]}
            required
          />

          <Input
            label="Inspection Notes / Observations"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Hours clocked, fuel level, cosmetic/mechanical checks..."
          />

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600">
            Applicable late return charges are automatically calculated based on the scheduled return date and time.
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Confirm Return & Calculate
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
