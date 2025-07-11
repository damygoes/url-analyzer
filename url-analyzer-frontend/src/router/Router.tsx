import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router-dom';
import { routerConfig } from './routerConfig';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function Router() {
  return (
    <TooltipProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={routerConfig} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </TooltipProvider>
  );
}
