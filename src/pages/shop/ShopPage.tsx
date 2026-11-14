import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../../components/common/ProductCard';
import { productApi } from '../../services/api';
import { ProductCollection, type Product } from '../../types/product';

const collections = [
  { label: 'All', value: '' },
  { label: 'Running', value: ProductCollection.RUNNING },
  { label: 'Casual', value: ProductCollection.CASUAL },
  { label: 'Basketball', value: ProductCollection.BASKETBALL },
  { label: 'Football', value: ProductCollection.FOOTBALL },
  { label: 'Training', value: ProductCollection.TRAINING },
  { label: 'Lifestyle', value: ProductCollection.LIFESTYLE },
];

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedCollection = searchParams.get('collection') ?? '';
  const order = searchParams.get('order') ?? 'createdAt';
  const search = searchParams.get('search') ?? '';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productApi.getProducts({
          page: 1,
          limit: 12,
          order: order === 'productPrice' ? 'productPrice' : 'createdAt',
          productCollection: selectedCollection ? (selectedCollection as ProductCollection) : undefined,
          search: search || undefined,
        });
        setProducts(data);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchProducts();
  }, [order, search, selectedCollection]);

  const collectionSummary = useMemo(() => {
    if (!selectedCollection) return 'All sneakers';
    return `${selectedCollection} collection`;
  }, [selectedCollection]);

  const updateFilters = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });

    setSearchParams(next);
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-stone-200">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-stone-500">Collection overview</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-stone-900">{collectionSummary}</h2>
          </div>
          <div className="flex w-full max-w-xl flex-col gap-3 md:flex-row">
            <label className="flex flex-1 items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
              <Search className="h-4 w-4" />
              <input
                value={search}
                onChange={(event) => updateFilters({ search: event.target.value })}
                placeholder="Search sneakers"
                className="w-full bg-transparent outline-none placeholder:text-stone-400"
              />
            </label>
            <select
              value={order}
              onChange={(event) => updateFilters({ order: event.target.value })}
              className="rounded-full border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 outline-none"
            >
              <option value="createdAt">Newest</option>
              <option value="productPrice">Price: low to high</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {collections.map((collection) => {
            const active = selectedCollection === collection.value;
            return (
              <button
                key={collection.label}
                type="button"
                onClick={() => updateFilters({ collection: collection.value })}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  active ? 'bg-stone-900 text-white' : 'border border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300'
                }`}
              >
                {collection.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-80 animate-pulse rounded-[28px] bg-stone-200" />
          ))
        ) : products.length > 0 ? (
          products.map((product) => <ProductCard key={product._id} product={product} />)
        ) : (
          <p className="col-span-full rounded-[28px] border border-dashed border-stone-300 bg-white p-10 text-center text-stone-500">
            No products match your current filters.
          </p>
        )}
      </section>
    </div>
  );
}
