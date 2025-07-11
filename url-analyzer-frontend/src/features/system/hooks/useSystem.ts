import apiClient from '@/shared/api/client';
import type { SystemHealth, SystemStats } from '@/shared/types/api';
import { useQuery } from '@tanstack/react-query';

export const systemKeys = {
  all: ['system'] as const,
  health: () => [...systemKeys.all, 'health'] as const,
  stats: () => [...systemKeys.all, 'stats'] as const,
};

export function useHealth() {
  return useQuery({
    queryKey: systemKeys.health(),
    queryFn: async () => {
      const { data } = await apiClient.get<SystemHealth>('/health');
      return data;
    },
    refetchInterval: 30000,
  });
}

export function useStats() {
  return useQuery({
    queryKey: systemKeys.stats(),
    queryFn: async () => {
      const { data } = await apiClient.get<SystemStats>('/stats');
      return data;
    },
    refetchInterval: 5000, 
  });
}