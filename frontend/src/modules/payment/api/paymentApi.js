import axiosClient from '../../../api/axiosClient';

export const paymentApi = {
  getAll: (params) => axiosClient.get('/payments', { params }),
  getMy: () => axiosClient.get('/payments/my'),
  initiate: (data) => axiosClient.post('/payments', data),
  getById: (id) => axiosClient.get(`/payments/${id}`),
  getByRentalId: (rentalId) => axiosClient.get(`/payments/rental/${rentalId}`),
  getByBookingReference: (ref) => axiosClient.get(`/payments/reference/${ref}`),
  getStatus: (id) => axiosClient.get(`/payments/${id}/status`),
  simulate: (data) => {
    if (typeof data === 'number') {
      return axiosClient.post('/payments/simulate', { rentalId: data, status: 'SUCCESS' });
    }
    return axiosClient.post('/payments/simulate', data);
  },
  simulateById: (id, status = 'SUCCESS') => axiosClient.post(`/payments/${id}/simulate`, null, { params: { status } }),
  simulateByBookingReference: (ref, status = 'SUCCESS') =>
    axiosClient.post(`/payments/reference/${ref}/simulate`, null, { params: { status } }),
};

export default paymentApi;
