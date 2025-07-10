import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  apiKey: string | null;
  isAuthenticated: boolean;
  setApiKey: (apiKey: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      apiKey: null,
      isAuthenticated: false,

      setApiKey: (apiKey: string) => {
        set({
          apiKey,
          isAuthenticated: !!apiKey,
        });
      },

      clearAuth: () => {
        set({
          apiKey: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        apiKey: state.apiKey,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
