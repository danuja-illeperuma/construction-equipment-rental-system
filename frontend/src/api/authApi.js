import axiosClient from './axiosClient';

export const authApi = {
  // Authentication
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  registerCustomer: (customerData) => axiosClient.post('/auth/register', customerData),

  // Customers
  getCurrentCustomer: () => axiosClient.get('/customers/me'),
  updateCurrentCustomer: (data) => axiosClient.put('/customers/me', data),
  getCustomers: () => axiosClient.get('/customers'),
  getCustomerById: (id) => axiosClient.get(`/customers/${id}`),

  // Internal users (Admin only)
  getUsers: () => axiosClient.get('/users'),
  getUserById: (id) => axiosClient.get(`/users/${id}`),
  createUser: (userData) => axiosClient.post('/users', userData),
  updateUser: (id, userData) => axiosClient.put(`/users/${id}`, userData),
};

export default authApi;
