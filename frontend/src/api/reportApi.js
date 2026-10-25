import axiosClient from './axiosClient';

export const reportApi = {
  getRentalReport: () => axiosClient.get('/reports/rentals'),
  getRevenueReport: () => axiosClient.get('/reports/revenue'),
  getEquipmentReport: () => axiosClient.get('/reports/equipment'),
  getMaintenanceReport: () => axiosClient.get('/reports/maintenance'),
};

export default reportApi;
