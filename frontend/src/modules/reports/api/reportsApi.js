import axiosClient from '../../../api/axiosClient';

export const reportsApi = {
  getRentalReport: () => axiosClient.get('/reports/rentals'),
  getRevenueReport: () => axiosClient.get('/reports/revenue'),
  getEquipmentUtilization: () => axiosClient.get('/reports/equipment'),
  getMaintenanceReport: () => axiosClient.get('/reports/maintenance'),
  getPaymentSummary: () => axiosClient.get('/reports/payment-summary'),
};
