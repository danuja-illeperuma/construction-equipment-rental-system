import React, { useState, useEffect } from 'react';
import { returnsApi } from '../api/returnsApi';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import { PageHeader } from '../../../components/common/PageHeader';
import { Button } from '../../../components/common/Button';
import { DataTable } from '../../../components/common/DataTable';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { AlertTriangle, Plus } from 'lucide-react';

export const DamageReports = () => {
  const [reports, setReports] = useState([]);
  const [returnsList, setReturnsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { error, success } = useToast();

  const [form, setForm] = useState({
    returnId: '',
    description: '',
    damageCharge: '0.00',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dmgRes, retRes] = await Promise.all([
        returnsApi.getAllDamageReports(),
        returnsApi.getAllReturns(),
      ]);
      if (dmgRes.success) setReports(dmgRes.data);
      if (retRes.success) {
        // filter damaged returns
        setReturnsList(retRes.data.filter((r) => r.condition === 'DAMAGED'));
      }
    } catch (err) {
      error(err.message || 'Failed to fetch damage reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await returnsApi.createDamageReport({
        returnId: Number(form.returnId),
        description: form.description,
        damageCharge: Number(form.damageCharge),
      });
      success('Damage report filed successfully');
      setModalOpen(false);
      setForm({ returnId: '', description: '', damageCharge: '0.00' });
      fetchData();
    } catch (err) {
      error(err.message || 'Failed to file damage report');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { header: 'ID', accessor: 'damageId' },
    { header: 'Return Ref ID', accessor: 'returnId' },
    { header: 'Damage Description', accessor: 'description' },
    {
      header: 'Assessed Charge',
      render: (row) => (
        <span className="font-bold text-rose-600">{formatCurrency(row.damageCharge)}</span>
      ),
    },
    { header: 'Reported By', accessor: 'reportedByName' },
    {
      header: 'Reported At',
      render: (row) => formatDateTime(row.createdAt),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Equipment Damage Reports & Claims"
        subtitle="Log equipment breakages, broken hydraulic lines, structural wear, and repair liability"
      >
        <Button variant="primary" icon={Plus} onClick={() => setModalOpen(true)}>
          File Damage Report
        </Button>
      </PageHeader>

      <DataTable columns={columns} data={reports} loading={loading} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="File Machinery Damage Report"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Damaged Equipment Return Event"
            value={form.returnId}
            onChange={(e) => setForm({ ...form, returnId: e.target.value })}
            options={returnsList.map((r) => ({
              value: r.returnId,
              label: `Return #${r.returnId} — ${r.equipmentCode} (${r.equipmentName})`,
            }))}
            placeholder="Select damaged return record..."
            required
          />

          <Input
            label="Damage Assessment Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="e.g. Cracked boom cylinder seal, bent outrigger..."
            required
          />

          <Input
            label="Estimated Repair / Penalty Charge (LKR)"
            type="number"
            step="0.01"
            value={form.damageCharge}
            onChange={(e) => setForm({ ...form, damageCharge: e.target.value })}
            required
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" type="submit" loading={submitting}>
              Submit Damage Claim
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
