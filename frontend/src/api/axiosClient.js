import axios from 'axios';

/**
 * Global Axios Client configured with base URL from environment,
 * JWT authentication interceptor, and unified error handling.
 */
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor: Attach JWT bearer token from localStorage
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format error messages & handle 401 unauthenticated
axiosClient.interceptors.response.use(
  (response) => {
    // Unpack standardized ApiResponse { success, message, data }
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        const publicPaths = ['/', '/login', '/register', '/equipment'];
        const currentPath = window.location.pathname;
        const isPublicPath = publicPaths.includes(currentPath) || currentPath.startsWith('/equipment/');
        
        if (!isPublicPath) {
          window.location.href = '/login';
        }
      }
      const message = data?.message || data?.error || 'A server error occurred';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      return Promise.reject(new Error('Network error: Unable to connect to server'));
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
