import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scroll to the top whenever the route path changes. */
export function useScrollToTopOnNavigate(): void {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
}
