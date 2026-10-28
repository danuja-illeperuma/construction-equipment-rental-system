import React, { useState, useEffect } from 'react';
import { maintenanceApi } from '../api/maintenanceApi';
import { equipmentApi } from '../../equipment/api/equipmentApi';
import { customerApi } from '../../../api/customerApi';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { PageHeader } from '../../../components/common/PageHeader';
import { Button } from '../../../components/common/Button';
import { DataTable } from '../../../components/common/DataTable';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { ActiveMaintenanceSection } from '../components/ActiveMaintenanceSection';
import { Wrench, Plus, CheckCircle2, DollarSign, UserCheck, Clock, AlertTriangle } from 'lucide-react';

export const MaintenanceList = () => {
  const [records, setRecords] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Customer Payment & Attribution Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [recordForPayment, setRecordForPayment] = useState(null);
  const [paymentCustomerId, setPaymentCustomerId] = useState('');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const { error, success } = useToast();

  const todayStr = new Date().toISOString().split('T')[0];
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };
  const minNextDueDate = getTomorrowStr();

  const [form, setForm] = useState({
    equipmentId: '',
    customerId: '',
    maintenanceType: 'ROUTINE',
    description: '',
    maintenanceCost: '0.00',
    maintenanceDate: getTomorrowStr(),
    notes: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [maintRes, equipRes, custRes] = await Promise.all([
        maintenanceApi.getAll({ status: statusFilter || undefined }),
        equipmentApi.getAll(),
        customerApi.getAll().catch(() => ({ data: [] })),
      ]);
      if (maintRes?.success) setRecords(maintRes.data);
      else if (Array.isArray(maintRes)) setRecords(maintRes);

      if (equipRes?.success) setEquipmentList(equipRes.data);
      else if (Array.isArray(equipRes)) setEquipmentList(equipRes);

      const custData = custRes?.data || (Array.isArray(custRes) ? custRes : []);
      setCustomerList(custData);
    } catch (err) {
      error(err.message || 'Failed to fetch maintenance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!form.equipmentId) {
      error('Please select equipment');
      return;
    }
    if (form.maintenanceDate <= todayStr) {
      error('Scheduled service date must be in the future (tomorrow or later). Routine maintenance is scheduled in advance so MySQL Event evt_daily_maintenance_status_check activates it at 02:00 AM on the scheduled date.');
      return;
    }
    setSubmitting(true);
    try {
      await maintenanceApi.schedule({
        equipmentId: Number(form.equipmentId),
        customerId: form.customerId ? Number(form.customerId) : null,
        maintenanceType: form.maintenanceType,
        description: form.description,
        maintenanceCost: Number(form.maintenanceCost),
        maintenanceDate: form.maintenanceDate,
        notes: form.notes,
      });
      success('Maintenance scheduled! Equipment remains AVAILABLE until the scheduled date when the 02:00 AM automated event activates it.');
      setModalOpen(false);
      setForm({
        equipmentId: '',
        customerId: '',
        maintenanceType: 'ROUTINE',
        description: '',
        maintenanceCost: '0.00',
        maintenanceDate: getTomorrowStr(),
        notes: '',
      });
      fetchData();
    } catch (err) {
      error(err.message || 'Failed to schedule maintenance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteMaintenance = async () => {
    setSubmitting(true);
    try {
      await maintenanceApi.complete(selectedRecordId);
      success('Maintenance completed! Equipment restored to AVAILABLE status.');
      setCompleteModalOpen(false);
      fetchData();
    } catch (err) {
      error(err.message || 'Failed to complete maintenance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenPaymentModal = (record, mode = 'paid') => {
    if (record.customerId) {
      handleMarkPaidDirect(record);
    } else {
      setRecordForPayment(record);
      setPaymentCustomerId(customerList.length > 0 ? String(customerList[0].customerId) : '');
      setPaymentModalOpen(true);
    }
  };

  const handleMarkPaidDirect = async (record) => {
    const custLabel = record.customerName ? `customer ${record.customerName}` : 'the customer';
    if (!window.confirm(`Confirm receipt of ${formatCurrency(record.maintenanceCost)} maintenance fee from ${custLabel}?`)) {
      return;
    }
    try {
      await maintenanceApi.markPaid(record.maintenanceId, record.customerId);
      success(`Maintenance #${record.maintenanceId} marked as PAID! Customer account updated.`);
      fetchData();
    } catch (err) {
      error(err.message || 'Failed to mark maintenance as paid');
    }
  };

  const handleConfirmCustomerPayment = async (markPaidImmediately = true) => {
    if (!paymentCustomerId) {
      error('Please select a customer');
      return;
    }
    setPaymentSubmitting(true);
    try {
      if (markPaidImmediately) {
        await maintenanceApi.markPaid(recordForPayment.maintenanceId, Number(paymentCustomerId));
        success(`Payment recorded! Maintenance #${recordForPayment.maintenanceId} marked as PAID.`);
      } else {
        await maintenanceApi.markUnpaid(recordForPayment.maintenanceId, Number(paymentCustomerId));
        success(`Maintenance #${recordForPayment.maintenanceId} billed to customer as UNPAID due. Their rental booking is locked until settled.`);
      }
      setPaymentModalOpen(false);
      setRecordForPayment(null);
      fetchData();
    } catch (err) {
      error(err.message || 'Failed to process maintenance payment');
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const handleMarkUnpaid = async (record) => {
    if (!window.confirm(`Revert Maintenance #${record.maintenanceId} to UNPAID? If billed to a customer, their equipment bookings will be restricted until paid.`)) {
      return;
    }
    try {
      await maintenanceApi.markUnpaid(record.maintenanceId, record.customerId);
      success(`Maintenance #${record.maintenanceId} set to UNPAID.`);
      fetchData();
    } catch (err) {
      error(err.message || 'Failed to update payment status');
    }
  };

  const columns = [
    { header: 'ID', accessor: 'maintenanceId' },
    { header: 'Equipment', accessor: 'equipmentName' },
    { header: 'Code', accessor: 'equipmentCode' },
    { header: 'Type', accessor: 'maintenanceType' },
    { header: 'Description', accessor: 'description' },
    {
      header: 'Billed Customer',
      render: (row) =>
        row.customerId ? (
          <div>
            <span className="font-semibold text-advantis-900 block text-xs">{row.customerName}</span>
            <span className="text-3xs text-slate-500 font-mono">{row.customerPhone || `Cust #${row.customerId}`}</span>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-2xs font-bold bg-blue-50 text-[#2473B5] border border-[#A4D0F2]">
            🏢 Company Fleet
          </span>
        ),
    },
    { header: 'Cost', render: (row) => formatCurrency(row.maintenanceCost) },
    {
      header: 'Payment Status',
      render: (row) => {
        if (!row.customerId) {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold bg-blue-50 text-[#2473B5] border border-[#A4D0F2]">
              🏢 Handled by Company
            </span>
          );
        }
        const isPaid = Boolean(row.isPaid);
        return isPaid ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" /> Paid (Customer)
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
            <Clock className="h-3 w-3" /> Unpaid / Due
          </span>
        );
      },
    },
    { header: 'Date', render: (row) => formatDate(row.maintenanceDate) },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Action',
      render: (row) => {
        const isPaid = Boolean(row.isPaid);
        return (
          <div className="flex items-center gap-1.5">
            {row.status === 'PENDING' && (
              <Button
                variant="success"
                size="sm"
                icon={CheckCircle2}
                onClick={() => {
                  setSelectedRecordId(row.maintenanceId);
                  setCompleteModalOpen(true);
                }}
                title="Complete maintenance job"
              >
                Complete
              </Button>
            )}
            {row.customerId && !isPaid && (
              <Button
                variant="primary"
                size="sm"
                icon={DollarSign}
                onClick={() => handleOpenPaymentModal(row, 'paid')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-2xs shadow-xs"
                title="Mark customer fee as paid"
              >
                Mark Paid
              </Button>
            )}
            {row.customerId && isPaid && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkUnpaid(row)}
                className="text-3xs text-slate-500 hover:text-rose-600 border-slate-200 hover:border-rose-300"
                title="Revert fee to unpaid status"
              >
                Mark Unpaid
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Fleet Maintenance & Service Workshop"
        subtitle="Schedule routine servicing, log engine repairs, and restore operational fleet availability"
      >
        <div className="flex gap-3">
          <Select
            placeholder="All Statuses"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'PENDING', label: 'Pending / In Progress' },
              { value: 'COMPLETED', label: 'Completed' },
            ]}
            className="w-44"
          />
          <Button variant="primary" icon={Plus} onClick={() => setModalOpen(true)}>
            Schedule Service
          </Button>
        </div>
      </PageHeader>

      {/* Active Workshop Bay Component */}
      <ActiveMaintenanceSection
        records={records}
        onComplete={(item) => {
          setSelectedRecordId(item.maintenanceId);
          setCompleteModalOpen(true);
        }}
        loading={loading}
      />

      <div className="bg-white rounded-xl border border-[#DFE8F0] p-4 shadow-xs mb-4">
        <h3 className="text-sm font-heading font-bold text-slate-800">
          All Service Records & Work Orders Archive
        </h3>
        <p className="text-xs text-slate-500">
          Historical log of routine servicing, contractor repairs, and completed overhauls
        </p>
      </div>

      <DataTable columns={columns} data={records} loading={loading} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Schedule Fleet Maintenance / Repair"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <Select
            label="Equipment Machine"
            value={form.equipmentId}
            onChange={(e) => setForm({ ...form, equipmentId: e.target.value })}
            options={equipmentList.map((eq) => ({
              value: eq.equipmentId,
              label: `${eq.equipmentCode} — ${eq.equipmentName} (${eq.status})`,
            }))}
            placeholder="Select equipment..."
            required
          />

          <Select
            label="Responsible / Billable Customer (Optional)"
            value={form.customerId}
            onChange={(e) => setForm({ ...form, customerId: e.target.value })}
            options={customerList.map((c) => ({
              value: c.customerId,
              label: `${c.name} (${c.phone || c.email || `ID: ${c.customerId}`})`,
            }))}
            placeholder="None — Internal Depot Routine Service"
            helperText="Select a contractor if this repair cost is charged to them. Unpaid fees will lock their booking access."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Maintenance Type"
              value={form.maintenanceType}
              onChange={(e) => setForm({ ...form, maintenanceType: e.target.value })}
              options={[
                { value: 'ROUTINE', label: 'ROUTINE (Periodic Servicing)' },
                { value: 'REPAIR', label: 'REPAIR (Breakdown / Component Fix)' },
              ]}
              required
            />
            <Input
              label="Estimated Cost (LKR)"
              type="number"
              step="0.01"
              value={form.maintenanceCost}
              onChange={(e) => setForm({ ...form, maintenanceCost: e.target.value })}
            />
          </div>

          <Input
            label="Service Work Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Hydraulic oil change, 250hr engine service, track tightening..."
            required
          />

          <Input
            label="Service Date"
            type="date"
            min={minNextDueDate}
            value={form.maintenanceDate}
            onChange={(e) => setForm({ ...form, maintenanceDate: e.target.value })}
            required
            helperText="Must be scheduled in advance (tomorrow or later)"
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Schedule Service
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        onConfirm={handleCompleteMaintenance}
        title="Complete Service & Release Machine"
        message="Mark this maintenance record as COMPLETED? This will restore the machine status to AVAILABLE in the active fleet catalog."
        confirmText="Complete & Restore to Available"
        variant="success"
        loading={submitting}
      />

      {/* Record Payment & Bill Customer Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setRecordForPayment(null);
        }}
        title="Record Maintenance Payment & Customer Attribution"
      >
        {recordForPayment && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Maintenance Job:</span>
                <span className="font-bold text-slate-800">
                  #{recordForPayment.maintenanceId} — {recordForPayment.equipmentName} ({recordForPayment.equipmentCode})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Work Description:</span>
                <span className="text-slate-700">{recordForPayment.description}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-700 font-bold">Maintenance Fee:</span>
                <span className="text-sm font-black text-advantis-800">
                  {formatCurrency(recordForPayment.maintenanceCost)}
                </span>
              </div>
            </div>

            <Select
              label="Select Contractor / Customer to Bill"
              value={paymentCustomerId}
              onChange={(e) => setPaymentCustomerId(e.target.value)}
              options={customerList.map((c) => ({
                value: c.customerId,
                label: `${c.name} (${c.phone || c.email || `ID: ${c.customerId}`})`,
              }))}
              placeholder="Select a customer..."
              required
              helperText="Assigning this fee links the maintenance charge to the customer's dashboard ledger."
            />

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-3xs flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Business Rule:</strong> If marked as UNPAID, the customer will be strictly restricted from renting any new equipment until this maintenance fee is settled.
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setPaymentModalOpen(false);
                  setRecordForPayment(null);
                }}
                disabled={paymentSubmitting}
              >
                Cancel
              </Button>

              <Button
                variant="secondary"
                type="button"
                onClick={() => handleConfirmCustomerPayment(false)}
                loading={paymentSubmitting}
                className="text-xs"
                title="Bill to customer as unpaid debt, locking equipment rentals"
              >
                Bill as Unpaid (Lock Rentals)
              </Button>

              <Button
                variant="primary"
                type="button"
                icon={CheckCircle2}
                onClick={() => handleConfirmCustomerPayment(true)}
                loading={paymentSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                title="Mark customer fee as paid immediately"
              >
                Confirm Paid (Settle Fee)
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
