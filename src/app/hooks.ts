import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getApiErrorMessage, productApi } from '../services/api';
import type { Product } from '../types/product';

/**
 * Current data for a list of product ids (wishlist, recently viewed), in the
 * given order. Products that are no longer available are left out.
 */
export function useProductsByIds(ids: string[]) {
  const key = ids.join(',');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(ids.length > 0);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const list = key ? key.split(',') : [];
    if (!list.length) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setProducts(await productApi.getProductsByIds(list));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    void load();
  }, [load]);

  return { products, loading, error, reload: load };
}

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
