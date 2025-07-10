import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function LogoutButton({ className }: { className?: string }) {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = () => {
    clearAuth();
    navigate('/auth');
  };

  return (
    <Button
      variant="destructive"
      onClick={handleLogout}
      icon="logout"
      className={className}
    >
      Logout
    </Button>
  );
}
