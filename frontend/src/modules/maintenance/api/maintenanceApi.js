import axiosClient from '../../../api/axiosClient';

export const maintenanceApi = {
  getAll: (params) => axiosClient.get('/maintenance', { params }),
  getById: (id) => axiosClient.get(`/maintenance/${id}`),
  schedule: (data) => axiosClient.post('/maintenance', data),
  update: (id, data) => axiosClient.put(`/maintenance/${id}`, data),
  complete: (id) => axiosClient.patch(`/maintenance/${id}/complete`),
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
