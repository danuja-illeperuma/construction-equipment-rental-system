import React, { useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { formatDateTime } from '../../../utils/formatters';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';

export const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.getAllCustomers()
      .then((res) => {
        if (res.success) setCustomers(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { header: 'ID', accessor: 'customerId' },
    { header: 'Type', accessor: 'customerType' },
    { header: 'Name', accessor: 'name' },
    { header: 'NIC / BR No', accessor: 'nicOrBrNumber' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Email', accessor: 'email' },
    { header: 'Address', accessor: 'address' },
    {
      header: 'Registered',
      render: (row) => formatDateTime(row.createdAt),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Registered Clients & Contractors"
        subtitle="Customer profiles, verification records, and corporate contractor entities"
      />
      <DataTable columns={columns} data={customers} loading={loading} />
    </div>
  );
};
