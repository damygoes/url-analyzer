import { useAuthStore } from '@/features/auth/store/authStore';
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000, // 30 seconds timeout
  withCredentials: true, // Include cookies in requests
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const apiKey = useAuthStore.getState().apiKey;
    if (apiKey) {
      config.headers.Authorization = apiKey;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // common errors
    if (error.response?.status === 401) {
      // Clear invalid API key
      useAuthStore.getState().clearAuth();
      window.location.href = '/auth';
    }
    
    // Extract error message
    const message = error.response?.data?.error || error.message || 'An error occurred';
    
    return Promise.reject({
      ...error,
      message,
      status: error.response?.status,
    });
  }
);

export default apiClient;