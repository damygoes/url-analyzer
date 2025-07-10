import { useAuthStore } from '@/features/auth/store/authStore';
import apiClient from '@/shared/api/client';
import { useState } from 'react';

type UseAuthSubmitResult = {
  isLoading: boolean;
  authenticate: (apiKey: string) => Promise<boolean>;
};

export function useAuthSubmit(): UseAuthSubmitResult {
  const [isLoading, setIsLoading] = useState(false);
  const setApiKey = useAuthStore((state) => state.setApiKey);

  const authenticate = async (apiKey: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const response = await apiClient.get('/auth/verify', {
        headers: {
          Authorization: apiKey, // apiKey passed here to avoid stale key from store
        },
      });

      if (response.status === 200) {
        setApiKey(apiKey); // only set after successful verification
        return true;
      }

      return false;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, authenticate };
}
