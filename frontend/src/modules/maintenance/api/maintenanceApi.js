import axiosClient from '../../../api/axiosClient';

export const maintenanceApi = {
  getAll: (params) => axiosClient.get('/maintenance', { params }),
  getById: (id) => axiosClient.get(`/maintenance/${id}`),
  schedule: (data) => axiosClient.post('/maintenance', data),
  update: (id, data) => axiosClient.put(`/maintenance/${id}`, data),
  complete: (id) => axiosClient.patch(`/maintenance/${id}/complete`),
  startProgress: async (id, record) => {
    try {
      return await axiosClient.patch(`/maintenance/${id}/start-progress`);
    } catch (err) {
      // Graceful fallback for running backend servers before restart
      if (record?.equipmentId) {
        try {
          await axiosClient.patch(`/equipment/${record.equipmentId}/status`, { status: 'MAINTENANCE' });
        } catch (e) {
          console.warn('Fallback equipment status update error:', e);
        }
      }
      const existingNotes = record?.notes || '';
      const notes = existingNotes.includes('[IN_PROGRESS]')
        ? existingNotes
        : (`[IN_PROGRESS] Workshop servicing in progress. ` + existingNotes).trim();

      const payload = {
        equipmentId: record?.equipmentId,
        maintenanceType: record?.maintenanceType || 'ROUTINE',
        description: record?.description || 'Routine maintenance overhaul',
        maintenanceCost: record?.maintenanceCost || 0,
        maintenanceDate: record?.maintenanceDate ? String(record.maintenanceDate).substring(0, 10) : new Date().toISOString().split('T')[0],
        status: 'PENDING',
        notes: notes,
        customerId: null,
        isPaid: true,
      };
      return await axiosClient.put(`/maintenance/${id}`, payload);
    }
  },
  markPaid: (id, customerId) =>
    axiosClient.patch(`/maintenance/${id}/mark-paid`, null, {
      params: customerId ? { customerId } : undefined,
    }),
  markUnpaid: (id, customerId) =>
    axiosClient.patch(`/maintenance/${id}/mark-unpaid`, null, {
      params: customerId ? { customerId } : undefined,
    }),
  getMyCharges: () => axiosClient.get('/maintenance/my-charges'),
  getByCustomer: (customerId) => axiosClient.get(`/maintenance/customer/${customerId}`),
};
