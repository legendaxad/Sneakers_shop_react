import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/** Delay a fast-changing value (e.g. search input) before it triggers requests. */
export function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

/** Scroll to the top whenever the route path changes. */
export function useScrollToTopOnNavigate(): void {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
}

/** Set the browser tab title for a page. */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title ? `${title} · MULTI-SHOP` : 'MULTI-SHOP — Premium Sneakers';
  }, [title]);
}
