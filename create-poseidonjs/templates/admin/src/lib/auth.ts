import api from './api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'vendor' | 'user';
  avatar?: string;
  isActive?: boolean;
  isVerified?: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  avatar?: string;
  role: 'admin' | 'vendor';
  vendorInfo?: {
    businessName?: string;
    businessAddress?: string;
    taxId?: string;
    commissionRate?: number;
  };
}

/**
 * Login user
 */
export const login = async (data: LoginData) => {
  try {
    const response = await api.post('/auth/login', data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Login failed');
    }
    
    const { token, user } = response.data.data;
    
    if (!token || !user) {
      throw new Error('Invalid response from server');
    }
    
    // Save to localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { token, user };
  } catch (error: any) {
    // Re-throw with better error message
    if (error.response) {
      throw error;
    } else if (error.request) {
      throw new Error('Cannot connect to server. Please make sure the backend is running.');
    } else {
      throw error;
    }
  }
};

/**
 * Register new user
 */
export const register = async (data: RegisterData) => {
  const response = await api.post('/auth/register', data);
  const { token, user } = response.data.data;
  
  // Save to localStorage
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  return { token, user };
};

/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * Get token from localStorage
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

/**
 * Check if user is admin
 */
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};

