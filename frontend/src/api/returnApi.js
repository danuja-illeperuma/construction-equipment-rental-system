import axiosClient from './axiosClient';

export const returnApi = {
  recordReturn: (data) => axiosClient.post('/returns', data),
  getAll: (params) => axiosClient.get('/returns', { params }),
  getById: (id) => axiosClient.get(`/returns/${id}`),
};

export default returnApi;
