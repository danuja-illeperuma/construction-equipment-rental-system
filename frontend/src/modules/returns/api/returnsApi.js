import axiosClient from '../../../api/axiosClient';

export const returnsApi = {
  recordReturn: (data) => axiosClient.post('/returns', data),
  getAllReturns: () => axiosClient.get('/returns'),
  getReturnById: (id) => axiosClient.get(`/returns/${id}`),
  createDamageReport: (data) => axiosClient.post('/damage-reports', data),
  getAllDamageReports: () => axiosClient.get('/damage-reports'),
  getDamageReportById: (id) => axiosClient.get(`/damage-reports/${id}`),
};
