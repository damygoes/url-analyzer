import { AppErrorBoundary } from '@/components/errors/AppErrorBoundary';
import { RootLayout } from '@/components/layout/RootLayout';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { AuthPage } from '@/features/auth/pages/AuthPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { HealthPage } from '@/features/system/pages/HealthPage';
import { URLDetailsPage } from '@/features/url-details/pages/URLDetailsPage';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
} from 'react-router-dom';

export const routerConfig = createBrowserRouter(
  createRoutesFromElements(
    <Route errorElement={<AppErrorBoundary />}>
      <Route path="/auth" element={<AuthPage />} />
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
    </Route>
  )
);
