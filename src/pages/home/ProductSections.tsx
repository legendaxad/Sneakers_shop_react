import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Skeleton } from '@mui/material';
import { ProductCard } from '../../components/common/ProductCard';
import { EmptyState, ErrorState } from '../../components/common/PageStatus';
import { Reveal } from '../../components/common/Reveal';
import { SectionHeader } from '../../components/common/SectionHeader';
import { useProductsByIds } from '../../app/hooks';
import { useRecentlyViewedStore } from '../../app/store';
import { getApiErrorMessage, productApi } from '../../services/api';
import type { Product, ProductFilters } from '../../types/product';

function useProductList(filters: ProductFilters) {
  const key = JSON.stringify(filters);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProducts(await productApi.getProducts(JSON.parse(key) as ProductFilters));
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

function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="ms-product-grid four">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} variant="rounded" height={420} sx={{ borderRadius: '28px' }} />
      ))}
    </div>
  );
}

/** Newest products (the original "Editor's picks" section). */
export function NewArrivalsSection() {
  const { products, loading, error, reload } = useProductList({ page: 1, limit: 4, order: 'createdAt' });

  return (
    <Reveal className="ms-featured-section" aria-labelledby="new-arrivals-heading">
      <SectionHeader
        id="new-arrivals-heading"
        eyebrow="Featured drops"
        title="Editor’s picks"
        description="The newest arrivals, fresh from the studio."
        action={{ label: 'Shop new arrivals', to: '/shop' }}
      />
      {error ? (
        <ErrorState message={error} onRetry={() => void reload()} />
      ) : loading ? (
        <ProductGridSkeleton />
      ) : products.length ? (
        <div className="ms-product-grid four">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState title="New drops are on the way" description="Check back soon for the latest releases." />
      )}
    </Reveal>
  );
}

/**
 * Ranked by the backend's real `productViews` (GET /product/all?order=productViews).
 * Products that have never been viewed are not shown as "most viewed".
 */
export function MostViewedSection() {
  const { products, loading, error, reload } = useProductList({ page: 1, limit: 8, order: 'productViews' });
  const ranked = products.filter((product) => product.productViews > 0).slice(0, 4);

  return (
    <Reveal aria-labelledby="most-viewed-heading">
      <SectionHeader
        id="most-viewed-heading"
        eyebrow="Trending now"
        title="Most viewed"
        description="What the MULTI-SHOP community is looking at — ranked by real product views."
        action={{ label: 'See all popular', to: '/shop?order=productViews' }}
      />
      {error ? (
        <ErrorState message={error} onRetry={() => void reload()} />
      ) : loading ? (
        <ProductGridSkeleton />
      ) : ranked.length ? (
        <div className="ms-product-grid four">
          {ranked.map((product, index) => (
            <ProductCard key={product._id} product={product} rank={index + 1} showViews action="view" />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No trending products yet"
          description="Rankings appear once members start viewing products."
          action={
            <Button component={Link} to="/shop" variant="contained">
              Start exploring
            </Button>
          }
        />
      )}
    </Reveal>
  );
}

/** Products this visitor opened recently (stored in this browser). */
export function RecentlyViewedSection() {
  const ids = useRecentlyViewedStore((state) => state.ids);
  const clearViewed = useRecentlyViewedStore((state) => state.clearViewed);
  const { products, loading, error } = useProductsByIds(ids);

  // Nothing viewed yet, or none of the viewed products is still available.
  if (!ids.length || (!loading && !error && products.length === 0)) return null;
  if (error) return null; // a non-essential section: fail quietly

  return (
    <Reveal aria-labelledby="recently-viewed-heading">
      <SectionHeader
        id="recently-viewed-heading"
        eyebrow="Pick up where you left off"
        title="Recently viewed"
        description="Saved on this device only."
      />
      {loading ? (
        <ProductGridSkeleton count={Math.min(ids.length, 4)} />
      ) : (
        <>
          <div className="ms-rail" role="list">
            {products.map((product) => (
              <div key={product._id} className="ms-rail-item" role="listitem">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          <Button onClick={clearViewed} size="small" sx={{ mt: 2, color: 'text.secondary' }}>
            Clear history
          </Button>
        </>
      )}
    </Reveal>
  );
}
