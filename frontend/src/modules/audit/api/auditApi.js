import axiosClient from '../../../api/axiosClient';

export const auditApi = {
  getLogs: (params) => axiosClient.get('/audit-logs', { params }),
};
