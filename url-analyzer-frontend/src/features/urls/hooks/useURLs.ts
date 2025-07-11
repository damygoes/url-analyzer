import apiClient from '@/shared/api/client';
import type {
  CrawlStatusResponse,
  CreateURLApiResponse,
  CreateURLRequest,
  DeleteURLsRequest,
  MessageResponse,
  URLDetailsApiResponse,
  URLFilter,
  URLListApiResponse,
} from '@/shared/types/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query Keys
export const urlKeys = {
  all: ['urls'] as const,
  lists: () => [...urlKeys.all, 'list'] as const,
  list: (filters: URLFilter) => [...urlKeys.lists(), filters] as const,
  details: () => [...urlKeys.all, 'detail'] as const,
  detail: (id: number) => [...urlKeys.details(), id] as const,
  crawlStatus: (id: number) => [...urlKeys.all, 'crawl-status', id] as const,
};

export function useURLs(filters: URLFilter) {
  return useQuery({
    queryKey: urlKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.page_size)
        params.append('page_size', filters.page_size.toString());
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.sort_order) params.append('sort_order', filters.sort_order);

      const res = await apiClient.get<URLListApiResponse>(`/urls?${params}`);

      const paginated = res.data;

      return {
        items: paginated.data,
        page: paginated.page,
        pageSize: paginated.page_size,
        total: paginated.total,
        totalPages: paginated.total_pages,
      };
    },
  });
}

export function useURLDetails(id: number) {
  return useQuery({
    queryKey: urlKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<URLDetailsApiResponse>(
        `/urls/${id}`
      );
      return data.data!;
    },
    enabled: !!id,
  });
}

export function useCreateURL() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateURLRequest) => {
      const { data } = await apiClient.post<CreateURLApiResponse>(
        '/urls',
        request
      );
      return data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: urlKeys.lists() });
    },
  });
}

export function useDeleteURLs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const request: DeleteURLsRequest = { ids };
      const { data } = await apiClient.delete<MessageResponse>('/urls', {
        data: request,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: urlKeys.lists() });
    },
  });
}

export function useRerunURL() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.post<MessageResponse>(
        `/urls/${id}/crawl`
      );
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: urlKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: urlKeys.lists() });
    },
  });
}

export function useRerunURLs() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const promises = ids.map((id) =>
        apiClient.post<MessageResponse>(`/urls/${id}/crawl`)
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: urlKeys.lists() });
    },
  });

  return mutation;
}

export function useCrawlStatus(id: number, enabled = false) {
  return useQuery({
    queryKey: urlKeys.crawlStatus(id),
    queryFn: async () => {
      const { data } = await apiClient.get<CrawlStatusResponse>(
        `/urls/${id}/status`
      );
      return data.job_status;
    },
    enabled: !!id && enabled,
    refetchInterval: 1000, // Poll every second
  });
}
