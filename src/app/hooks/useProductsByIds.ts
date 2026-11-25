import { useCallback, useEffect, useState } from 'react';
import type { Product } from '../../lib/types/product';
import { getApiErrorMessage } from '../service/apiClient';
import ProductService from '../service/ProductService';

/**
 * Current data for a list of product ids (wishlist, recently viewed), in the
 * given order. Products that are no longer available are left out. The ids are
 * global (Redux); the fetched products are view data, so they stay local.
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
      setProducts(await new ProductService().getProductsByIds(list));
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
