import { Navigate, Outlet } from 'react-router';
import { useProviderAuth } from '../context/ProviderAuthContext';

export function ProtectedRoute() {
  const { session, isLoading } = useProviderAuth();

  if (isLoading) return null;
  if (!session) return <Navigate to="/login" replace />;
  if (session.user.verificationStatus !== 'approved') {
    return <Navigate to="/provider/verification-pending" replace />;
  }

  return <Outlet />;
}
