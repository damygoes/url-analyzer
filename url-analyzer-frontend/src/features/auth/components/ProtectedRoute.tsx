import { useAuthStore } from '@/features/auth/store/authStore';
import { Navigate, Outlet } from 'react-router-dom';

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
