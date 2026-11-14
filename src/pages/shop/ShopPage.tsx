import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { ProductCard } from '../../components/common/ProductCard';
import { EmptyState, ErrorState } from '../../components/common/PageStatus';
import { useDebouncedValue, useDocumentTitle } from '../../app/hooks';
import { getApiErrorMessage, productApi } from '../../services/api';
import { PRODUCTS_PER_PAGE } from '../../constants';
import { ProductCollection, type Product, type ProductOrder } from '../../types/product';
import { titleCase } from '../../utils/format';
import '../../css/products.css';

const collections: { label: string; value: '' | ProductCollection }[] = [
  { label: 'All', value: '' },
  { label: 'Running', value: ProductCollection.RUNNING },
  { label: 'Casual', value: ProductCollection.CASUAL },
  { label: 'Basketball', value: ProductCollection.BASKETBALL },
  { label: 'Football', value: ProductCollection.FOOTBALL },
  { label: 'Training', value: ProductCollection.TRAINING },
  { label: 'Lifestyle', value: ProductCollection.LIFESTYLE },
  { label: 'Other', value: ProductCollection.OTHER },
];

const sortOptions: { label: string; value: ProductOrder }[] = [
  { label: 'Newest', value: 'createdAt' },
  { label: 'Price: low to high', value: 'productPrice' },
  { label: 'Most popular', value: 'productViews' },
];

const isCollection = (value: string): value is ProductCollection =>
  (Object.values(ProductCollection) as string[]).includes(value);

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const collectionParam = searchParams.get('collection') ?? '';
  const selectedCollection = isCollection(collectionParam) ? collectionParam : '';
  const orderParam = searchParams.get('order') as ProductOrder | null;
  const order: ProductOrder = sortOptions.some((option) => option.value === orderParam) ? orderParam! : 'createdAt';
  const page = Math.max(Number(searchParams.get('page')) || 1, 1);
  const searchParam = searchParams.get('search') ?? '';

  const [searchInput, setSearchInput] = useState(searchParam);
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 350);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useDocumentTitle(selectedCollection ? `${titleCase(selectedCollection)} sneakers` : 'Shop');

  const updateParams = useCallback(
    (updates: Record<string, string>, resetPage = true) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          Object.entries(updates).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
          if (resetPage) next.delete('page');
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // Push the debounced search term into the URL (one request per pause in typing).
  // Only reacts to the debounced value changing, so clearing filters is not undone
  // by a stale debounced term.
  const searchParamRef = useRef(searchParam);
  useEffect(() => {
    searchParamRef.current = searchParam;
  }, [searchParam]);
  const lastDebounced = useRef(debouncedSearch);
  useEffect(() => {
    if (debouncedSearch === lastDebounced.current) return;
    lastDebounced.current = debouncedSearch;
    if (debouncedSearch !== searchParamRef.current) updateParams({ search: debouncedSearch });
  }, [debouncedSearch, updateParams]);

  // Keep the input in sync with back/forward navigation.
  useEffect(() => {
    setSearchInput((current) => (current.trim() === searchParam ? current : searchParam));
  }, [searchParam]);

  useEffect(() => {
    let active = true;
    const filters = {
      productCollection: selectedCollection || undefined,
      search: searchParam || undefined,
    };
    setLoading(true);
    setError(null);
    Promise.all([
      productApi.getProducts({ ...filters, page, limit: PRODUCTS_PER_PAGE, order }),
      productApi.getProductCount(filters),
    ])
      .then(([list, count]) => {
        if (!active) return;
        setProducts(list);
        setTotal(count);
      })
      .catch((err) => active && setError(getApiErrorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [order, page, searchParam, selectedCollection, reloadKey]);

  const pageCount = Math.max(Math.ceil(total / PRODUCTS_PER_PAGE), 1);
  const summary = useMemo(
    () => (selectedCollection ? `${titleCase(selectedCollection)} collection` : 'All sneakers'),
    [selectedCollection],
  );

  return (
    <Stack spacing={4}>
      <section className="ms-surface ms-filter-bar">
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} sx={{ alignItems: { lg: 'center' }, justifyContent: 'space-between' }}>
          <div>
            <span className="ms-eyebrow">Collection overview</span>
            <Typography variant="h3" component="h1" sx={{ mt: 1.5 }}>
              {summary}
            </Typography>
            {!loading && !error && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {total} {total === 1 ? 'product' : 'products'}
                {searchParam ? ` matching “${searchParam}”` : ''}
              </Typography>
            )}
          </div>
          <div className="ms-filter-controls">
            <TextField
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search sneakers or brands"
              size="small"
              fullWidth
              slotProps={{
                htmlInput: { 'aria-label': 'Search products', maxLength: 100 },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 999 },
                },
              }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="sort-label">Sort by</InputLabel>
              <Select
                labelId="sort-label"
                label="Sort by"
                value={order}
                onChange={(event) => updateParams({ order: event.target.value === 'createdAt' ? '' : event.target.value })}
                sx={{ borderRadius: 999 }}
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </Stack>

        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mt: 3 }} role="group" aria-label="Collections">
          {collections.map((collection) => {
            const active = selectedCollection === collection.value;
            return (
              <Chip
                key={collection.label}
                label={collection.label}
                onClick={() => updateParams({ collection: collection.value })}
                color={active ? 'primary' : 'default'}
                variant={active ? 'filled' : 'outlined'}
                aria-pressed={active}
                sx={{ px: 1, height: 36, bgcolor: active ? undefined : '#fafaf9' }}
              />
            );
          })}
        </Stack>
      </section>

      {error ? (
        <ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} />
      ) : loading ? (
        <div className="ms-product-grid three">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={400} sx={{ borderRadius: '28px' }} />
          ))}
        </div>
      ) : products.length ? (
        <>
          <div className="ms-product-grid three">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          {pageCount > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={pageCount}
                page={Math.min(page, pageCount)}
                onChange={(_, value) => {
                  updateParams({ page: value > 1 ? String(value) : '' }, false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                shape="rounded"
                color="primary"
              />
            </Box>
          )}
        </>
      ) : (
        <EmptyState
          icon={SearchOffIcon}
          title="No products found"
          description="No products match your current filters."
          action={
            (selectedCollection || searchParam) && (
              <Button
                variant="contained"
                onClick={() => {
                  setSearchInput('');
                  updateParams({ collection: '', search: '' });
                }}
              >
                Clear filters
              </Button>
            )
          }
        />
      )}
    </Stack>
  );
}
