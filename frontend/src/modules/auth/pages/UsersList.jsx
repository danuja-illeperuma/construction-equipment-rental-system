import React, { useState, useEffect, useMemo } from 'react';
import { authApi } from '../api/authApi';
import { customerApi } from '../../../api/customerApi';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { formatDateTime } from '../../../utils/formatters';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable } from '../../../components/common/DataTable';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import {
  UserPlus,
  Shield,
  CheckCircle,
  XCircle,
  Search,
  UserCheck,
  Wrench,
  User,
  Filter,
  Building,
} from 'lucide-react';

export const UsersList = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { error, success } = useToast();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'STAFF',
    isActive: true,
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [usersRes, custRes] = await Promise.all([
        authApi.getUsers().catch(() => ({ data: [] })),
        customerApi.getAll().catch(() => ({ data: [] })),
      ]);

      const internalRaw = usersRes?.success || Array.isArray(usersRes?.data)
        ? (usersRes.data || [])
        : (Array.isArray(usersRes) ? usersRes : []);

      const internalList = internalRaw
        // Exclude any legacy manager records if still lingering
        .filter((u) => u.role !== 'MANAGER')
        .map((u) => ({
          ...u,
          userCategory: 'INTERNAL',
        }));

      const customerRaw = custRes?.success || Array.isArray(custRes?.data)
        ? (custRes.data || [])
        : (Array.isArray(custRes) ? custRes : []);

      const customerList = customerRaw.map((c) => ({
        userId: c.customerId,
        name: c.name,
        email: c.email,
        phone: c.phone,
        role: 'CUSTOMER',
        customerType: c.customerType,
        nicOrBrNumber: c.nicOrBrNumber,
        address: c.address,
        isActive: c.isActive,
        createdAt: c.createdAt,
        totalBookings: c.totalBookings,
        userCategory: 'CUSTOMER',
      }));

      setUsers([...internalList, ...customerList]);
    } catch (err) {
      error(err.message || 'Failed to fetch user accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRowClick = async (row) => {
    if (row.userCategory === 'INTERNAL') {
      try {
        const res = await authApi.getUserById(row.userId);
        if (res.success && res.data) {
          setSelectedUser({ ...res.data, userCategory: 'INTERNAL' });
          return;
        }
      } catch (err) {
        // Fallback to row object
      }
    } else if (row.userCategory === 'CUSTOMER') {
      try {
        const res = await customerApi.getById(row.userId);
        if (res.success && res.data) {
          setSelectedUser({ ...res.data, role: 'CUSTOMER', userId: res.data.customerId, userCategory: 'CUSTOMER' });
          return;
        }
      } catch (err) {
        // Fallback to row object
      }
    }
    setSelectedUser(row);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await authApi.createUser({
        fullName: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        role: 'STAFF',
      });
      success('Staff user created successfully');
      setModalOpen(false);
      setForm({ name: '', email: '', password: '', phone: '', role: 'STAFF', isActive: true });
      fetchUsers();
    } catch (err) {
      error(err.message || 'Failed to register internal staff user');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleUserStatus = async (targetUser, e) => {
    if (e) e.stopPropagation();
    try {
      if (targetUser.role === 'CUSTOMER') {
        await customerApi.updateStatus(targetUser.userId, !targetUser.isActive);
      } else {
        await authApi.updateUserStatus(targetUser.userId, !targetUser.isActive);
      }
      success(`${targetUser.role} account ${!targetUser.isActive ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
      if (selectedUser && selectedUser.userId === targetUser.userId && selectedUser.role === targetUser.role) {
        setSelectedUser({ ...selectedUser, isActive: !targetUser.isActive });
      }
    } catch (err) {
      error(err.message || 'Failed to update user status');
    }
  };

  // Filtered dataset
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role filter
      if (roleFilter !== 'ALL' && u.role !== roleFilter) {
        return false;
      }
      // Status filter
      if (statusFilter === 'ACTIVE' && !u.isActive) return false;
      if (statusFilter === 'DISABLED' && u.isActive) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = u.name?.toLowerCase().includes(query);
        const matchEmail = u.email?.toLowerCase().includes(query);
        const matchPhone = u.phone?.toLowerCase().includes(query);
        const matchId = String(u.userId).includes(query);
        return matchName || matchEmail || matchPhone || matchId;
      }
      return true;
    });
  }, [users, roleFilter, statusFilter, searchQuery]);

  // Counts for role pills
  const counts = useMemo(() => {
    return {
      all: users.length,
      admin: users.filter((u) => u.role === 'ADMIN').length,
      staff: users.filter((u) => u.role === 'STAFF').length,
      customer: users.filter((u) => u.role === 'CUSTOMER').length,
    };
  }, [users]);

  const columns = [
    {
      header: 'ID',
      render: (row) => (
        <span className="font-mono text-2xs font-semibold text-slate-500">
          {row.role === 'CUSTOMER' ? `C-${row.userId}` : `U-${row.userId}`}
        </span>
      ),
    },
    {
      header: 'Account Name',
      render: (row) => (
        <div>
          <span className="font-bold text-advantis-950 text-xs block">{row.name}</span>
          {row.customerType && (
            <span className="inline-flex items-center gap-1 text-3xs font-mono uppercase text-slate-500">
              <Building className="h-2.5 w-2.5" />
              {row.customerType}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Email Address',
      render: (row) => <span className="text-xs text-slate-600 font-mono">{row.email}</span>,
    },
    {
      header: 'Phone',
      render: (row) => <span className="text-xs text-slate-500">{row.phone || '—'}</span>,
    },
    {
      header: 'Security Role',
      render: (row) => {
        if (row.role === 'ADMIN') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-extrabold uppercase bg-purple-50 text-purple-700 border border-purple-200">
              <Shield className="h-3 w-3" />
              ADMIN
            </span>
          );
        }
        if (row.role === 'STAFF') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-200">
              <Wrench className="h-3 w-3" />
              STAFF
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
            <UserCheck className="h-3 w-3" />
            CUSTOMER
          </span>
        );
      },
    },
    {
      header: 'Status',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold ${
            row.isActive ? 'text-emerald-600' : 'text-slate-400'
          }`}
        >
          {row.isActive ? (
            <>
              <CheckCircle className="h-3.5 w-3.5" /> Active
            </>
          ) : (
            <>
              <XCircle className="h-3.5 w-3.5" /> Disabled
            </>
          )}
        </span>
      ),
    },
    {
      header: 'Created At',
      render: (row) => (
        <span className="text-2xs text-slate-500">
          {row.createdAt ? formatDateTime(row.createdAt) : '—'}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => {
        const isSelf = row.role === 'ADMIN' && currentUser?.id === row.userId;
        return (
          <Button
            variant={row.isActive ? 'outline' : 'primary'}
            size="sm"
            onClick={(e) => toggleUserStatus(row, e)}
            disabled={isSelf}
            title={isSelf ? 'Cannot deactivate your own administrative account' : ''}
            className="text-xs"
          >
            {row.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User & Customer Account Management"
        subtitle="Manage administrative privileges, yard staff operations, and registered contractor accounts across CERMS"
      >
        <Button variant="primary" icon={UserPlus} onClick={() => setModalOpen(true)}>
          Add Internal Staff
        </Button>
      </PageHeader>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
        {/* Role Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setRoleFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                roleFilter === 'ALL'
                  ? 'bg-advantis-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Accounts ({counts.all})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('ADMIN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                roleFilter === 'ADMIN'
                  ? 'bg-purple-700 text-white'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              <Shield className="h-3 w-3" />
              ADMIN ({counts.admin})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('STAFF')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                roleFilter === 'STAFF'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Wrench className="h-3 w-3" />
              STAFF ({counts.staff})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('CUSTOMER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                roleFilter === 'CUSTOMER'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <UserCheck className="h-3 w-3" />
              CUSTOMER ({counts.customer})
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'ACTIVE', label: 'Active Only' },
                { value: 'DISABLED', label: 'Disabled Only' },
              ]}
              className="w-36 text-xs"
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search accounts by name, email, phone number, or ID..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-advantis-500 focus:border-advantis-500 outline-none transition-all"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredUsers}
        loading={loading}
        onRowClick={handleRowClick}
      />

      {/* Register Staff Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Register New Internal Staff Account"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Kasun Fernando"
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="k.fernando@cerms.lk"
            required
          />

          <Input
            label="Phone Number (Optional)"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="0771234567"
          />

          <Input
            label="Initial Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            required
            helperText="Minimum 6 characters. User can change this after signing in."
          />

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Assigned Role</label>
            <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold text-xs flex items-center gap-2">
              <Wrench className="h-4 w-4 text-amber-600" />
              STAFF (Operations, Machine Returns, Damage Reports & Fleet Maintenance)
            </div>
            <p className="text-3xs text-slate-500 mt-1">
              System contains 3 roles: ADMIN, STAFF, and CUSTOMER. Administrator creation is restricted to direct system commands.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Create Staff Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* User / Customer Details Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={`${selectedUser?.role || 'Account'} Details`}
      >
        {selectedUser && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-sm text-slate-900 block">{selectedUser.name}</span>
                <span className="text-3xs font-mono text-slate-500">{selectedUser.email}</span>
              </div>
              <div>
                {selectedUser.role === 'ADMIN' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-3xs font-extrabold uppercase bg-purple-100 text-purple-800">
                    ADMIN
                  </span>
                ) : selectedUser.role === 'STAFF' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-3xs font-extrabold uppercase bg-amber-100 text-amber-800">
                    STAFF
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-3xs font-extrabold uppercase bg-emerald-100 text-emerald-800">
                    CUSTOMER
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2.5 divide-y divide-slate-100">
              <div className="flex justify-between pt-2">
                <span className="text-slate-500 font-medium">Account ID</span>
                <span className="font-mono font-bold text-slate-800">
                  {selectedUser.role === 'CUSTOMER' ? `C-${selectedUser.userId}` : `U-${selectedUser.userId}`}
                </span>
              </div>

              <div className="flex justify-between pt-2">
                <span className="text-slate-500 font-medium">Contact Phone</span>
                <span className="text-slate-800 font-semibold">{selectedUser.phone || 'N/A'}</span>
              </div>

              {selectedUser.customerType && (
                <div className="flex justify-between pt-2">
                  <span className="text-slate-500 font-medium">Contractor Type</span>
                  <span className="font-bold text-advantis-800 uppercase">{selectedUser.customerType}</span>
                </div>
              )}

              {selectedUser.nicOrBrNumber && (
                <div className="flex justify-between pt-2">
                  <span className="text-slate-500 font-medium">NIC / BR Number</span>
                  <span className="font-mono text-slate-800">{selectedUser.nicOrBrNumber}</span>
                </div>
              )}

              {selectedUser.address && (
                <div className="flex justify-between pt-2">
                  <span className="text-slate-500 font-medium">Registered Address</span>
                  <span className="text-slate-800 text-right max-w-xs">{selectedUser.address}</span>
                </div>
              )}

              {selectedUser.role === 'CUSTOMER' && (
                <div className="flex justify-between pt-2">
                  <span className="text-slate-500 font-medium">Total Valid Bookings</span>
                  <span className="font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded font-mono text-xs border border-sky-200">
                    {selectedUser.totalBookings ?? 0} bookings
                  </span>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <span className="text-slate-500 font-medium">Access Status</span>
                <span
                  className={`font-extrabold ${
                    selectedUser.isActive ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  {selectedUser.isActive ? 'ACTIVE (Permitted)' : 'DISABLED (Blocked)'}
                </span>
              </div>

              <div className="flex justify-between pt-2">
                <span className="text-slate-500 font-medium">Registration Date</span>
                <span className="text-slate-700">
                  {selectedUser.createdAt ? formatDateTime(selectedUser.createdAt) : '—'}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100">
              <Button
                variant={selectedUser.isActive ? 'danger' : 'primary'}
                size="sm"
                onClick={(e) => toggleUserStatus(selectedUser, e)}
                disabled={selectedUser.role === 'ADMIN' && currentUser?.id === selectedUser.userId}
              >
                {selectedUser.isActive ? 'Deactivate Account' : 'Activate Account'}
              </Button>

              <Button variant="outline" size="sm" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UsersList;
