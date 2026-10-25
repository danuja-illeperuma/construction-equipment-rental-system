import React, { useState, useEffect, useRef } from 'react';
import { equipmentApi } from '../api/equipmentApi';
import { categoryApi } from '../api/categoryApi';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency } from '../../../utils/formatters';
import { getEquipmentImage, handleImageError } from '../../../utils/equipmentImages';
import { uploadImageFile } from '../../../utils/cloudinaryUpload';
import { PageHeader } from '../../../components/common/PageHeader';
import { Button } from '../../../components/common/Button';
import { DataTable } from '../../../components/common/DataTable';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { StatusBadge } from '../../../components/common/StatusBadge';
import {
  Plus,
  Edit3,
  UploadCloud,
  Image as ImageIcon,
  X,
  Trash2,
  Star,
  Check,
  Link as LinkIcon,
  AlertCircle,
} from 'lucide-react';

export const EquipmentManagement = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const { success, error } = useToast();

  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [images, setImages] = useState([]); // Array of { id, file, previewUrl, isPrimary, name, isNew }
  const [urlInput, setUrlInput] = useState('');

  const [form, setForm] = useState({
    equipmentCode: '',
    equipmentName: '',
    categoryId: '',
    brand: '',
    model: '',
    hourlyRate: '',
    dailyRate: '',
    monthlyRate: '',
    status: 'AVAILABLE',
    location: '',
    isActive: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [equipRes, catRes] = await Promise.all([
        equipmentApi.getAll(),
        categoryApi.getAll(),
      ]);
      if (equipRes.success || equipRes.data) {
        setEquipmentList(equipRes.data || equipRes);
      }
      if (catRes.success || catRes.data) {
        setCategories(catRes.data || catRes);
      }
    } catch (err) {
      error(err.message || 'Failed to fetch equipment data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      equipmentCode: '',
      equipmentName: '',
      categoryId: categories.length > 0 ? categories[0].categoryId : '',
      brand: '',
      model: '',
      hourlyRate: '',
      dailyRate: '',
      monthlyRate: '',
      status: 'AVAILABLE',
      location: 'Central Depot',
      isActive: true,
    });
    setImages([]);
    setUrlInput('');
    setModalOpen(true);
  };

  const openEditModal = async (eq) => {
    setEditingId(eq.equipmentId);
    setForm({
      equipmentCode: eq.equipmentCode,
      equipmentName: eq.equipmentName,
      categoryId: eq.categoryId,
      brand: eq.brand || '',
      model: eq.model || '',
      hourlyRate: eq.hourlyRate || '',
      dailyRate: eq.dailyRate || '',
      monthlyRate: eq.monthlyRate || '',
      status: eq.status,
      location: eq.location || '',
      isActive: eq.isActive,
    });

    setImages([]);
    setUrlInput('');
    setModalOpen(true);

    // Fetch full equipment record with images
    try {
      const res = await equipmentApi.getById(eq.equipmentId);
      const data = res.data || res || eq;
      const loaded = [];

      if (Array.isArray(data.images) && data.images.length > 0) {
        data.images.forEach((img, idx) => {
          loaded.push({
            id: img.imageId || `existing-${idx}`,
            previewUrl: img.imageUrl,
            isPrimary: Boolean(img.isPrimary) || data.primaryImageUrl === img.imageUrl,
            name: `Photo #${idx + 1}`,
            isNew: false,
          });
        });
      } else if (data.primaryImageUrl) {
        loaded.push({
          id: 'existing-primary',
          previewUrl: data.primaryImageUrl,
          isPrimary: true,
          name: 'Cover Photo',
          isNew: false,
        });
      }

      // If none marked as primary, set the first one
      if (loaded.length > 0 && !loaded.some((img) => img.isPrimary)) {
        loaded[0].isPrimary = true;
      }

      setImages(loaded);
    } catch {
      if (eq.primaryImageUrl) {
        setImages([
          {
            id: 'existing-primary',
            previewUrl: eq.primaryImageUrl,
            isPrimary: true,
            name: 'Cover Photo',
            isNew: false,
          },
        ]);
      }
    }
  };

  // Image File Handling (Single & Multiple)
  const processFiles = (fileList) => {
    const validFiles = Array.from(fileList).filter((file) => {
      const isImg = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      if (!isImg) error(`${file.name} is not an image file`);
      if (!isValidSize) error(`${file.name} exceeds maximum 10MB limit`);
      return isImg && isValidSize;
    });

    if (validFiles.length === 0) return;

    const newImageItems = validFiles.map((file, idx) => ({
      id: `new-${Date.now()}-${idx}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      isPrimary: false,
      name: file.name,
      isNew: true,
    }));

    setImages((prev) => {
      const combined = [...prev, ...newImageItems];
      // If no image is marked primary, make the first one primary
      if (!combined.some((img) => img.isPrimary)) {
        combined[0].isPrimary = true;
      }
      return combined;
    });
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = ''; // Reset input to allow re-selecting same files
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    const url = urlInput.trim();

    const newItem = {
      id: `url-${Date.now()}`,
      previewUrl: url,
      isPrimary: images.length === 0,
      name: 'External Image URL',
      isNew: false,
    };

    setImages((prev) => {
      const combined = [...prev, newItem];
      if (!combined.some((img) => img.isPrimary)) {
        combined[0].isPrimary = true;
      }
      return combined;
    });
    setUrlInput('');
  };

  const handleSetPrimary = (indexToPrimary) => {
    setImages((prev) =>
      prev.map((img, idx) => ({
        ...img,
        isPrimary: idx === indexToPrimary,
      }))
    );
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => {
      const target = prev[indexToRemove];
      // Revoke object URL to avoid memory leaks
      if (target.file && target.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(target.previewUrl);
      }

      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      // If we removed the primary image, make the first remaining image primary
      if (target.isPrimary && updated.length > 0) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Upload new files (Cloudinary with local server fallback)
      const uploadPromises = images.map(async (img) => {
        if (img.file instanceof File) {
          const uploadedUrl = await uploadImageFile(img.file);
          return { ...img, resolvedUrl: uploadedUrl };
        }
        return { ...img, resolvedUrl: img.previewUrl };
      });

      const processedImages = await Promise.all(uploadPromises);

      // 2. Assemble final image URLs
      const finalImageUrls = [];
      let finalPrimaryUrl = null;

      processedImages.forEach((img) => {
        if (img.resolvedUrl) {
          finalImageUrls.push(img.resolvedUrl);
          if (img.isPrimary) {
            finalPrimaryUrl = img.resolvedUrl;
          }
        }
      });

      if (!finalPrimaryUrl && finalImageUrls.length > 0) {
        finalPrimaryUrl = finalImageUrls[0];
      }

      const payload = {
        ...form,
        categoryId: Number(form.categoryId),
        hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : null,
        dailyRate: form.dailyRate ? Number(form.dailyRate) : null,
        monthlyRate: form.monthlyRate ? Number(form.monthlyRate) : null,
        primaryImageUrl: finalPrimaryUrl,
        imageUrls: finalImageUrls,
      };

      if (editingId) {
        await equipmentApi.update(editingId, payload);
        success('Equipment asset and photos updated successfully');
      } else {
        await equipmentApi.create(payload);
        success('Equipment asset created with photos successfully');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      error(err.message || 'Failed to save equipment asset');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await equipmentApi.updateStatus(id, !currentStatus);
      success(`Equipment ${!currentStatus ? 'activated' : 'retired'} successfully`);
      fetchData();
    } catch (err) {
      error(err.message || 'Failed to update equipment status');
    }
  };

  const columns = [
    {
      header: 'Asset',
      render: (row) => {
        const thumb = getEquipmentImage(row);
        return (
          <div className="flex items-center gap-3">
            <div className="w-12 h-10 rounded-lg overflow-hidden bg-[#F5F9FC] border border-[#DFE8F0] shrink-0">
              <img
                src={thumb}
                alt={row.equipmentName}
                onError={(e) => handleImageError(e, thumb)}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="font-heading font-semibold text-[#263746] text-xs leading-tight">
                {row.equipmentName}
              </div>
              <div className="font-mono text-3xs text-[#657786]">
                {row.brand || 'Commercial'} {row.model ? `• ${row.model}` : ''}
              </div>
            </div>
          </div>
        );
      },
    },
    { header: 'Code', accessor: 'equipmentCode' },
    { header: 'Category', accessor: 'categoryName' },
    { header: 'Daily Rate', render: (row) => formatCurrency(row.dailyRate) },
    {
      header: 'Op Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Lifecycle',
      render: (row) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
            row.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {row.isActive ? 'Active' : 'Retired'}
        </span>
      ),
    },
    { header: 'Location', accessor: 'location' },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={Edit3} onClick={() => openEditModal(row)}>
            Edit
          </Button>
          <Button
            variant={row.isActive ? 'outline' : 'primary'}
            size="sm"
            onClick={() => toggleStatus(row.equipmentId, row.isActive)}
          >
            {row.isActive ? 'Retire' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Fleet Assets & Rates Management"
        subtitle="Maintain equipment assets, rental rate cards, and physical operational status"
      >
        <Button variant="primary" icon={Plus} onClick={openCreateModal}>
          Add Fleet Asset
        </Button>
      </PageHeader>

      <DataTable columns={columns} data={equipmentList} loading={loading} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Equipment Asset' : 'Register New Equipment Asset'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Equipment Code"
              value={form.equipmentCode}
              onChange={(e) => setForm({ ...form, equipmentCode: e.target.value })}
              placeholder="e.g. EX-001"
              required
            />
            <Input
              label="Equipment Name"
              value={form.equipmentName}
              onChange={(e) => setForm({ ...form, equipmentName: e.target.value })}
              placeholder="e.g. CAT 320 Hydraulic Excavator"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Category"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              options={categories.map((c) => ({ value: c.categoryId, label: c.categoryName }))}
              required
            />
            <Input
              label="Brand"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              placeholder="Caterpillar, Komatsu..."
            />
            <Input
              label="Model"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              placeholder="320 GC, PC200..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Hourly Rate (LKR)"
              type="number"
              step="0.01"
              value={form.hourlyRate}
              onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
              placeholder="0.00"
            />
            <Input
              label="Daily Rate (LKR)"
              type="number"
              step="0.01"
              value={form.dailyRate}
              onChange={(e) => setForm({ ...form, dailyRate: e.target.value })}
              placeholder="0.00"
              required
            />
            <Input
              label="Monthly Rate (LKR)"
              type="number"
              step="0.01"
              value={form.monthlyRate}
              onChange={(e) => setForm({ ...form, monthlyRate: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Equipment Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={[
                { value: 'AVAILABLE', label: 'AVAILABLE' },
                { value: 'RENTED', label: 'RENTED' },
                { value: 'MAINTENANCE', label: 'MAINTENANCE' },
              ]}
              required
            />
            <Input
              label="Yard Depot Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Colombo Main Depot"
            />
          </div>

          {/* ============================================================ */}
          {/* EQUIPMENT IMAGES UPLOAD (SINGLE & MULTIPLE)                  */}
          {/* ============================================================ */}
          <div className="space-y-3 pt-3 border-t border-[#DFE8F0]">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-[#263746]">
                  Equipment Machinery Photos
                </label>
                <p className="text-2xs text-[#657786]">
                  Select single or multiple photos (PNG, JPG, WEBP up to 10MB). Designate one photo as the primary cover.
                </p>
              </div>
              {images.length > 0 && (
                <span className="text-2xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E8F2FA] text-[#368BD1] border border-[#A4D0F2]">
                  {images.length} {images.length === 1 ? 'Photo' : 'Photos'} Attached
                </span>
              )}
            </div>

            {/* Drag & Drop File Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors cursor-pointer ${
                isDragging
                  ? 'border-[#368BD1] bg-[#E8F2FA]/50'
                  : 'border-[#DFE8F0] hover:border-[#368BD1] bg-[#F5F9FC]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center gap-1.5">
                <div className="p-2.5 bg-white rounded-full border border-[#DFE8F0] text-[#368BD1] shadow-2xs">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <div className="text-xs text-[#263746]">
                  <span className="font-heading font-bold text-[#368BD1] hover:underline">
                    Click to browse photos
                  </span>{' '}
                  or drag and drop here
                </div>
                <div className="text-3xs text-[#657786]">
                  Supports single & multiple images simultaneously (PNG, JPG, WEBP)
                </div>
              </div>
            </div>

            {/* Optional URL Input */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#657786]">
                  <LinkIcon className="h-3.5 w-3.5" />
                </div>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Or paste external image URL (https://...)"
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#DFE8F0] rounded-lg text-[#263746] placeholder-[#657786] focus:outline-none focus:border-[#368BD1]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddUrl();
                    }
                  }}
                />
              </div>
              <Button variant="outline" size="sm" type="button" onClick={handleAddUrl}>
                Add URL
              </Button>
            </div>

            {/* Live Gallery Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {images.map((item, index) => (
                  <div
                    key={item.id || index}
                    className={`relative group rounded-xl border overflow-hidden bg-white shadow-2xs flex flex-col transition-all ${
                      item.isPrimary
                        ? 'border-[#368BD1] ring-2 ring-[#368BD1]/30'
                        : 'border-[#DFE8F0] hover:border-slate-400'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative h-24 bg-[#F5F9FC] overflow-hidden">
                      <img
                        src={item.previewUrl}
                        alt="Equipment preview"
                        className="w-full h-full object-cover object-center"
                        onError={(e) => handleImageError(e)}
                      />
                      {/* Primary Cover Badge */}
                      {item.isPrimary && (
                        <span className="absolute top-1.5 left-1.5 bg-[#368BD1] text-white text-3xs font-heading font-bold px-2 py-0.5 rounded shadow-2xs flex items-center gap-1">
                          <Star className="h-2.5 w-2.5 fill-current" /> Cover
                        </span>
                      )}
                      {/* Delete / Remove Action */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(index);
                        }}
                        className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-rose-600 text-white p-1 rounded-full opacity-90 group-hover:opacity-100 transition-colors shadow-2xs cursor-pointer"
                        title="Remove photo"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Metadata & Switcher */}
                    <div className="p-1.5 bg-white border-t border-[#DFE8F0] flex items-center justify-between text-3xs">
                      <span className="text-[#657786] truncate max-w-[80px]" title={item.name}>
                        {item.name || `Photo #${index + 1}`}
                      </span>
                      {!item.isPrimary ? (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(index)}
                          className="text-[#368BD1] hover:text-[#2473B5] font-semibold cursor-pointer underline"
                        >
                          Set Cover
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                          <Check className="h-2.5 w-2.5" /> Primary
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>


          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={saving}>
              {editingId ? 'Save Changes' : 'Register Asset'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
