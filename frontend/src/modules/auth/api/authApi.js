import axiosClient from '../../../api/axiosClient';

export const authApi = {
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  registerCustomer: (customerData) => axiosClient.post('/auth/register', customerData),
  getCurrentCustomer: () => axiosClient.get('/customers/me'),
  updateCurrentCustomer: (data) => axiosClient.put('/customers/me', data),
  getAllCustomers: () => axiosClient.get('/customers'),
  getCustomers: () => axiosClient.get('/customers'),
  getCustomerById: (id) => axiosClient.get(`/customers/${id}`),

  // Internal users (ADMIN only)
  getUsers: () => axiosClient.get('/users'),
  getUserById: (id) => axiosClient.get(`/users/${id}`),
  createUser: (userData) => axiosClient.post('/users', userData),
  updateUser: (id, userData) => axiosClient.put(`/users/${id}`, userData),
  updateUserStatus: (id, isActive) => axiosClient.patch(`/users/${id}/status`, { isActive }),
};

export default authApi;
