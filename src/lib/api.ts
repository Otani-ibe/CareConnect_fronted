import axios from 'axios';

// Environment configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// API Configuration
const API_CONFIG = {
  development: {
    baseURL: '/api', // Use Vite proxy in development
    timeout: 15000,
    withCredentials: true,
  },
  production: {
    baseURL: 'https://careconnect-z20m.onrender.com/api', // Production server
    timeout: 10000,
    withCredentials: false,
  }
};

// Select configuration based on environment
const config = isDevelopment ? API_CONFIG.development : API_CONFIG.production;

// Create axios instance with environment-specific configuration
export const api = axios.create({
  baseURL: config.baseURL,
  timeout: config.timeout,
  withCredentials: config.withCredentials,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token and handle requests
api.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (isDevelopment) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        headers: config.headers,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle responses and errors
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (isDevelopment) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  (error) => {
    // Log error in development
    if (isDevelopment) {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }

    // Handle different types of errors
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      return Promise.reject(new Error('NETWORK_ERROR'));
    }

    if (error.code === 'ERR_CORS' || error.message?.includes('CORS')) {
      return Promise.reject(new Error('CORS_ERROR'));
    }

    if (error.code === 'ERR_CONNECTION_REFUSED') {
      return Promise.reject(new Error('CONNECTION_ERROR'));
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return Promise.reject(new Error('TIMEOUT_ERROR'));
    }

    // Handle HTTP status errors
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete api.defaults.headers.common['Authorization'];
          window.location.href = '/login';
          return Promise.reject(new Error('UNAUTHORIZED'));

        case 403:
          return Promise.reject(new Error('FORBIDDEN'));

        case 404:
          return Promise.reject(new Error('NOT_FOUND'));

        case 422:
          return Promise.reject(new Error('VALIDATION_ERROR'));

        case 429:
          return Promise.reject(new Error('RATE_LIMIT_ERROR'));

        case 500:
          return Promise.reject(new Error('SERVER_ERROR'));

        default:
          return Promise.reject(new Error(data?.message || `HTTP_${status}_ERROR`));
      }
    }

    // Handle request timeout
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('TIMEOUT_ERROR'));
    }

    // Generic error
    return Promise.reject(new Error(error.message || 'UNKNOWN_ERROR'));
  }
);

// Export environment info for debugging
export const apiConfig = {
  isDevelopment,
  isProduction,
  baseURL: config.baseURL,
  timeout: config.timeout,
};