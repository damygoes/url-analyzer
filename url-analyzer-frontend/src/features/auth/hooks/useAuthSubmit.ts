import { useAuthStore } from '@/features/auth/store/authStore';
import apiClient from '@/shared/api/client';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type UseAuthSubmitResult = {
  isLoading: boolean;
  error: string;
  authenticate: (apiKey: string) => Promise<void>;
};

export function useAuthSubmit(): UseAuthSubmitResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setApiKey = useAuthStore((state) => state.setApiKey);

  const authenticate = async (apiKey: string) => {
    setError('');
    setIsLoading(true);

    try {
      const response = await apiClient.get('/health', {
        headers: { Authorization: apiKey },
      });

      if (response.status === 200) {
        setApiKey(apiKey);
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const error = err as { response?: { status: number } };
      if (error.response?.status === 401) {
        setError('Invalid API key. Please check and try again.');
      } else {
        setError('Failed to authenticate. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, authenticate };
}
