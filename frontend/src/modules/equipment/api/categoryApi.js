import axiosClient from '../../../api/axiosClient';

export const categoryApi = {
  getAll: () => axiosClient.get('/categories'),
  getById: (id) => axiosClient.get(`/categories/${id}`),
  create: (data) => axiosClient.post('/categories', data),
  update: (id, data) => axiosClient.put(`/categories/${id}`, data),
  updateStatus: (id, isActive) => axiosClient.patch(`/categories/${id}/status`, { isActive }),
  delete: (id) => axiosClient.delete(`/categories/${id}`),
};
