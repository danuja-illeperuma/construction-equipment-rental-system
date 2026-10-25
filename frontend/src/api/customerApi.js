import axiosClient from './axiosClient';

export const customerApi = {
  getAll: () => axiosClient.get('/customers'),
  getById: (id) => axiosClient.get(`/customers/${id}`),
  getMe: () => axiosClient.get('/customers/me'),
  updateProfile: (data) => axiosClient.put('/customers/me', data),
  updateStatus: (id, isActive) => axiosClient.patch(`/customers/${id}/status`, { isActive }),
};

export default customerApi;
