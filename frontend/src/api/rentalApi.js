import axiosClient from './axiosClient';

export const rentalApi = {
  // Check availability for equipment over a requested date range
  checkAvailability: (data) => axiosClient.post('/rentals/availability', data),

  // Create rental booking in PENDING_PAYMENT status
  createRental: (data) => axiosClient.post('/rentals', data),
  create: (data) => axiosClient.post('/rentals', data),

  // Get rental details by ID
  getRental: (id) => axiosClient.get(`/rentals/${id}`),
  getById: (id) => axiosClient.get(`/rentals/${id}`),
  getByBookingReference: (ref) => axiosClient.get(`/rentals/reference/${ref}`),

  // Customer's personal rentals
  getMyRentals: () => axiosClient.get('/rentals/my'),

  // Staff / Admin all rentals view
  getAllRentals: (params) => axiosClient.get('/rentals', { params }),
  getAll: (params) => axiosClient.get('/rentals', { params }),

  // Cancel an eligible rental
  cancelRental: (id) => axiosClient.post(`/rentals/${id}/cancel`),
  cancel: (id) => axiosClient.post(`/rentals/${id}/cancel`),

  // Operational status updates
  updateRentalStatus: (id, statusData) =>
    axiosClient.patch(`/rentals/${id}/status`, typeof statusData === 'string' ? { status: statusData } : statusData),
  recordPickup: (id) => axiosClient.patch(`/rentals/${id}/pickup`),
};

export default rentalApi;
