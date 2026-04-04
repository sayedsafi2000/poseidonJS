import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Axios instance with default configuration
 */
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Add authorization token to requests
 */
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  // Don't set Content-Type for FormData - let browser set it with boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  // Vendors: scope product reads to their inventory in the admin app only (storefront shares the same API without this).
  if (
    typeof window !== 'undefined' &&
    config.method?.toLowerCase() === 'get' &&
    typeof config.url === 'string' &&
    !config.url.includes('scope=')
  ) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (user?.role === 'vendor') {
        const u = config.url;
        if (u === '/products' || u.startsWith('/products?')) {
          config.url = `${u}${u.includes('?') ? '&' : '?'}scope=manage`;
        } else {
          const m = u.match(/^\/products\/([^/?]+)/);
          if (m && /^[0-9a-fA-F]{24}$/.test(m[1])) {
            config.url = `${u}${u.includes('?') ? '&' : '?'}scope=manage`;
          }
        }
      }
    } catch {
      /* ignore */
    }
  }

  return config;
});

/**
 * Handle response errors
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

