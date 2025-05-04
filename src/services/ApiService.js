// src/services/ApiService.js - Centralized API error handling
import axios from 'axios';
import { toast } from 'react-toastify';
import config from '../config/config';

// Base axios instance
const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 15000 // 15 seconds timeout
});

// Response interceptor for handling common errors
api.interceptors.response.use(
  response => response,
  error => {
    if (!error.response) {
      // Network error
      toast.error('Network error. Please check your connection.');
      return Promise.reject({ message: 'Network error. Please check your connection.' });
    }

    const { status, data } = error.response;

    switch (status) {
      case 401:
        // Unauthorized - Token expired or invalid
        localStorage.removeItem(config.storage.authToken);
        // Only show the toast if we're not on login page
        if (!window.location.pathname.includes('/') && 
            !window.location.pathname.includes('/verify-otp')) {
          toast.error('Your session has expired. Please login again.');
          // Redirect to login after a short delay
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        }
        break;
      case 403:
        // Forbidden
        toast.error('You do not have permission to perform this action.');
        break;
      case 404:
        // Not found
        toast.error('The requested resource was not found.');
        break;
      case 422:
        // Validation error - show first validation error
        if (data.errors && Object.keys(data.errors).length > 0) {
          const firstError = Object.values(data.errors)[0];
          toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
        } else {
          toast.error(data.message || 'Validation error.');
        }
        break;
      case 429:
        // Too many requests
        toast.error('Too many requests. Please try again later.');
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        // Server error
        toast.error('Server error. Please try again later.');
        break;
      default:
        // Other errors
        toast.error(data.message || 'An error occurred.');
    }

    return Promise.reject(data || { message: 'An error occurred.' });
  }
);

// Request interceptor to add auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem(config.storage.authToken);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Generic API call handler
export const apiCall = async (method, url, data = null, customConfig = {}) => {
  try {
    const response = await api({
      method,
      url,
      data: method !== 'get' ? data : null,
      params: method === 'get' ? data : null,
      ...customConfig
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export convenient methods
export default {
  get: (url, params, config) => apiCall('get', url, params, config),
  post: (url, data, config) => apiCall('post', url, data, config),
  put: (url, data, config) => apiCall('put', url, data, config),
  delete: (url, data, config) => apiCall('delete', url, data, config),
  patch: (url, data, config) => apiCall('patch', url, data, config)
};