import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/auth-store';
import { LoadingScreen } from '@/shared/components/feedback/loading-spinner';
import type { UserRole } from '@/shared/types/common.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Roles được phép truy cập */
  allowedRoles?: UserRole[];
  /** Redirect về đây nếu chưa đăng nhập */
  redirectTo?: string;
}

/** Route guard: yêu cầu đăng nhập */
export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.vaiTro)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
}

/** Route chỉ dành cho khách (chưa đăng nhập) */
export function GuestRoute({
  children,
  redirectTo = '/',
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    // Admin/Manager redirect về /admin
    if (user?.vaiTro === 'ADMIN' || user?.vaiTro === 'MANAGER') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

/** Loading state cho route */
export function RouteLoading() {
  return <LoadingScreen />;
}
