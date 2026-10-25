import axiosClient from '../../../api/axiosClient';

export const rentalApi = {
  checkAvailability: (data) => axiosClient.post('/rentals/check-availability', data),
  calculateQuote: (data) => axiosClient.post('/rentals/calculate-quote', data),
  create: (data) => axiosClient.post('/rentals', data),
  getById: (id) => axiosClient.get(`/rentals/${id}`),
  getByBookingReference: (ref) => axiosClient.get(`/rentals/reference/${ref}`),
  getMyRentals: () => axiosClient.get('/rentals/my-rentals'),
  getAll: (status) => axiosClient.get('/rentals', { params: { status } }),
  cancel: (id) => axiosClient.post(`/rentals/${id}/cancel`),
  recordPickup: (id) => axiosClient.patch(`/rentals/${id}/pickup`),
};
