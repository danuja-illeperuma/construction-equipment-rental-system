import React, { useState, useEffect } from 'react';
import { auditApi } from '../api/auditApi';
import { formatDateTime } from '../../../utils/formatters';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable } from '../../../components/common/DataTable';
import { Select } from '../../../components/common/Select';
import { ShieldAlert } from 'lucide-react';

export const AuditLogList = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableFilter, setTableFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await auditApi.getLogs({ tableName: tableFilter || undefined });
      if (res.success) setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [tableFilter]);

  const columns = [
    { header: 'Audit ID', accessor: 'auditId' },
    {
      header: 'Action',
      render: (row) => (
        <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-800">
          {row.action}
        </span>
      ),
    },
    { header: 'Table', accessor: 'tableName' },
    { header: 'Record ID', accessor: 'recordId' },
    { header: 'Description', accessor: 'description' },
    { header: 'User', accessor: 'userName' },
    {
      header: 'Timestamp',
      render: (row) => formatDateTime(row.createdAt),
    },
  ];

  return (
    <div>
      <PageHeader
        title="System Audit Logs"
        subtitle="View system activity logs, record modifications, and user actions"
      >
        <Select
          placeholder="All Tables"
          value={tableFilter}
          onChange={(e) => setTableFilter(e.target.value)}
          options={[
            { value: 'rentals', label: 'rentals' },
            { value: 'payments', label: 'payments' },
            { value: 'equipment', label: 'equipment' },
            { value: 'equipment_returns', label: 'equipment_returns' },
            { value: 'maintenance_records', label: 'maintenance_records' },
          ]}
          className="w-48"
        />
      </PageHeader>

      <DataTable columns={columns} data={logs} loading={loading} />
    </div>
  );
};
