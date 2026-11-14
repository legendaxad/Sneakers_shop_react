import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../app/store';
import { LoadingState } from './PageStatus';

/**
 * Protects customer-only routes. While the session is being restored after a
 * refresh it shows a loader instead of redirecting, so logged-in customers
 * are never bounced to the login page.
 */
export function RequireAuth({ children }: PropsWithChildren) {
  const status = useAuthStore((state) => state.status);
  const location = useLocation();

  if (status === 'checking') return <LoadingState label="Restoring your session…" />;
  if (status === 'guest') {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }
  return <>{children}</>;
}
