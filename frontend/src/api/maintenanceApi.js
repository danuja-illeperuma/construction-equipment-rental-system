import axiosClient from './axiosClient';

export const maintenanceApi = {
  getAll: (params) => axiosClient.get('/maintenance', { params }),
  getById: (id) => axiosClient.get(`/maintenance/${id}`),
  schedule: (data) => axiosClient.post('/maintenance', data),
  update: (id, data) => axiosClient.put(`/maintenance/${id}`, data),
  complete: (id) => axiosClient.patch(`/maintenance/${id}/complete`),
  markPaid: (id) => axiosClient.patch(`/maintenance/${id}/mark-paid`),
  getMyCharges: () => axiosClient.get('/maintenance/my-charges'),
  getByCustomer: (customerId) => axiosClient.get(`/maintenance/customer/${customerId}`),
};

export default maintenanceApi;
