import axiosClient from '../../../api/axiosClient';

export const equipmentApi = {
  getAll: (params) => axiosClient.get('/equipment', { params }),
  getById: (id) => axiosClient.get(`/equipment/${id}`),
  create: (data) => axiosClient.post('/equipment', data),
  update: (id, data) => axiosClient.put(`/equipment/${id}`, data),
  updateStatus: (id, isActive) => axiosClient.patch(`/equipment/${id}/status`, { isActive }),
  uploadImages: (formData) =>
    axiosClient.post('/equipment/upload-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  addImages: (id, formData, makePrimary = false) =>
    axiosClient.post(`/equipment/${id}/images?makePrimary=${makePrimary}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteImage: (equipmentId, imageId) =>
    axiosClient.delete(`/equipment/${equipmentId}/images/${imageId}`),
  setPrimaryImage: (equipmentId, imageId) =>
    axiosClient.patch(`/equipment/${equipmentId}/images/${imageId}/primary`),
};
