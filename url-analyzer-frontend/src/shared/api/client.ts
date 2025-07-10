import { useAuthStore } from '@/features/auth/store/authStore';
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
  withCredentials: true,
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
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API] Response error:', error);

    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      console.warn('Unauthorized - user should login again');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
