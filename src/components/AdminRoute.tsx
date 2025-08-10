import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAdminAuth();
  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }
  return <>{children}</>;
}

