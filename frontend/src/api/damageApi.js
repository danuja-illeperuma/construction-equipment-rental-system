import axiosClient from './axiosClient';

export const damageApi = {
  create: (data) => axiosClient.post('/damage-reports', data),
  getAll: (params) => axiosClient.get('/damage-reports', { params }),
  getById: (id) => axiosClient.get(`/damage-reports/${id}`),
};

export default damageApi;
