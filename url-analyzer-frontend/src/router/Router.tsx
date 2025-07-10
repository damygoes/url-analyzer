import { RootLayout } from '@/components/layout/RootLayout';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { AuthPage } from '@/features/auth/pages/AuthPage';
import { useAuthStore } from '@/features/auth/store/authStore';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { HealthPage } from '@/features/system/pages/HealthPage';
import { URLDetailsPage } from '@/features/urls/pages/URLDetailsPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function Router() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route 
            path="/auth" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthPage />
            } 
          />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RootLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/urls/:id" element={<URLDetailsPage />} />
              <Route path="/health" element={<HealthPage />} />
            </Route>
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}