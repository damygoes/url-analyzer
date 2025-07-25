import { activeCrawlStatuses } from '@/features/url-analysis/constants';
import apiClient from '@/shared/api/client';
import type {
  CrawlJobStatus,
  CrawlStatusResponse,
  CreateURLApiResponse,
  CreateURLRequest,
  DeleteURLsRequest,
  MessageResponse,
  URLDetailsResponse,
  URLFilter,
  URLListApiResponse,
} from '@/shared/types/api';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';

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
      const res = await apiClient.get<URLDetailsResponse>(`/urls/${id}`);
      return res.data;
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

export function useStartCrawlingURLs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.put<MessageResponse>(
        `/urls/${id}/start`
      );
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: urlKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: urlKeys.lists() });
    },
  });
}

export function useRestartCrawlingURLs() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const promises = ids.map((id) =>
        apiClient.put<MessageResponse>(`/urls/${id}/restart`)
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: urlKeys.lists() });
    },
  });

  return mutation;
}
export function useStopCrawlingURLs() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const promises = ids.map((id) =>
        apiClient.put<MessageResponse>(`/urls/${id}/stop`)
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
  return useQuery<CrawlJobStatus, Error>({
    queryKey: urlKeys.crawlStatus(id),
    queryFn: async () => {
      const { data } = await apiClient.get<CrawlStatusResponse>(
        `/urls/${id}/status`
      );
      return data.job_status;
    },
    enabled: !!id && enabled,
    refetchInterval: (query) => {
      if (query.state.status === 'error') {
        return false;
      }
      const data = query.state.data;
      if (!data) return 1000;
      return activeCrawlStatuses.has(data.status) ? 1000 : false;
    },
    retry: false,
    onError: (error: Error) => {
      console.error('Failed to fetch crawl status:', error.message);
    },
  } as UseQueryOptions<CrawlJobStatus, Error>);
}
