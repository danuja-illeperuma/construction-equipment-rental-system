import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { authApi } from '../api/authApi';
import { PageHeader } from '../../../components/common/PageHeader';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { User, Shield, Phone, Mail, MapPin } from 'lucide-react';

export const Profile = () => {
  const { user, role, isCustomer, setUser } = useAuth();
  const { success, error } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isCustomer) {
        // Exclusively updates the single customers.address field in the existing customers table
        await authApi.updateCurrentCustomer({
          name: form.name,
          phone: form.phone,
          address: form.address,
        });
        if (setUser) {
          setUser((prev) => ({ ...prev, name: form.name, phone: form.phone, address: form.address }));
        }
      }
      success('Profile preferences updated successfully');
      setEditing(false);
    } catch (err) {
      error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Account Profile & Credentials"
        subtitle={
          isCustomer
            ? 'Manage customer profile and billing address (stored directly in customers.address)'
            : 'Operational system credentials and assigned administrative role'
        }
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="h-16 w-16 rounded-full bg-slate-900 border-2 border-amber-500 text-amber-400 font-extrabold flex items-center justify-center text-xl shadow-xs">
            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{user?.name || 'Authorized User'}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="mt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                <Shield className="h-3 w-3" />
                {isCustomer ? `Customer (${user?.customerType || 'Individual'})` : role || 'Staff'}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full Legal Name / Business Entity"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={!editing}
            icon={User}
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={form.email}
            disabled
            icon={Mail}
          />

          {isCustomer && (
            <>
              <Input
                label="Direct Contact Number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                disabled={!editing}
                placeholder="+94 77 123 4567"
                icon={Phone}
                required
              />

              {/* Directly maps to the single existing customers.address column. No separate address entity exists. */}
              <Input
                label="Address (customers.address)"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                disabled={!editing}
                placeholder="No. 12, Industrial Road, Colombo"
                icon={MapPin}
              />
            </>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            {editing ? (
              <>
                <Button variant="outline" type="button" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" loading={saving}>
                  Save Changes
                </Button>
              </>
            ) : (
              <Button variant="outline" type="button" onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
