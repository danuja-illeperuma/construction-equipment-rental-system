import React, { useState, useEffect } from 'react';
import { categoryApi } from '../api/categoryApi';
import { useToast } from '../../../context/ToastContext';
import { PageHeader } from '../../../components/common/PageHeader';
import { Button } from '../../../components/common/Button';
import { DataTable } from '../../../components/common/DataTable';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Plus, Edit2 } from 'lucide-react';

export const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ categoryName: '', description: '', isActive: true });
  const [saving, setSaving] = useState(false);
  const { success, error } = useToast();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryApi.getAll();
      if (res.success) setCategories(res.data);
    } catch (err) {
      error(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ categoryName: '', description: '', isActive: true });
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingId(cat.categoryId);
    setForm({ categoryName: cat.categoryName, description: cat.description || '', isActive: cat.isActive });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await categoryApi.update(editingId, form);
        success('Category updated successfully');
      } else {
        await categoryApi.create(form);
        success('Category created successfully');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      error(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await categoryApi.updateStatus(id, !currentStatus);
      success(`Category ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchCategories();
    } catch (err) {
      error(err.message || 'Failed to update category status');
    }
  };

  const columns = [
    { header: 'ID', accessor: 'categoryId' },
    { header: 'Category Name', accessor: 'categoryName' },
    { header: 'Description', accessor: 'description' },
    {
      header: 'Status',
      render: (row) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
            row.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={Edit2} onClick={() => openEditModal(row)}>
            Edit
          </Button>
          <Button 
            variant={row.isActive ? 'outline' : 'primary'} 
            size="sm" 
            onClick={() => toggleStatus(row.categoryId, row.isActive)}
          >
            {row.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Equipment Classifications & Categories"
        subtitle="Manage machinery groupings, earthmoving, compaction, and concrete types"
      >
        <Button variant="primary" icon={Plus} onClick={openCreateModal}>
          Add Category
        </Button>
      </PageHeader>

      <DataTable columns={columns} data={categories} loading={loading} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Category' : 'Create New Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Category Name"
            value={form.categoryName}
            onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
            placeholder="e.g. Earthmoving Equipment"
            required
          />

          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Bulldozers, excavators, backhoes..."
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={saving}>
              {editingId ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
