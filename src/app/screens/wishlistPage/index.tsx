import { Link } from 'react-router-dom';
import { Alert, Button, Skeleton, Stack, Typography } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { ProductCard } from '../../components/shared/ProductCard';
import { EmptyState, ErrorState } from '../../components/shared/PageStatus';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useProductsByIds } from '../../hooks/useProductsByIds';
import { retrieveWishlistIds } from './selector';
import { clearWishlist as clearWishlistAction, removeFromWishlist as removeFromWishlistAction } from './slice';
import '../../../css/products.css';

/** Products saved with the heart button. Stored in this browser (works for guests and members). */
export default function WishlistPage() {
  useDocumentTitle('Wishlist');
  const dispatch = useAppDispatch();
  const ids = useAppSelector(retrieveWishlistIds);
  const removeFromWishlist = (id: string) => dispatch(removeFromWishlistAction(id));
  const clearWishlist = () => dispatch(clearWishlistAction());
  const { products, loading, error, reload } = useProductsByIds(ids);

  const availableIds = new Set(products.map((product) => product._id));
  const unavailable = loading || error ? [] : ids.filter((id) => !availableIds.has(id));
  // Keep the order the shopper saved them in, and hide items removed since loading.
  const visible = products.filter((product) => ids.includes(product._id));

  return (
    <Stack spacing={4}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-end' } }}>
        <div>
          <span className="ms-eyebrow">Saved for later</span>
          <Typography variant="h3" component="h1" sx={{ mt: 1 }}>
            Your wishlist
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {ids.length} saved {ids.length === 1 ? 'item' : 'items'} · stored on this device
          </Typography>
        </div>
        {ids.length > 0 && (
          <Button variant="outlined" onClick={clearWishlist}>
            Clear wishlist
          </Button>
        )}
      </Stack>

      {ids.length === 0 ? (
        <EmptyState
          icon={FavoriteBorderIcon}
          title="Your wishlist is empty"
          description="Tap the heart on any product to save it here."
          action={
            <Button component={Link} to="/shop" variant="contained">
              Discover sneakers
            </Button>
          }
        />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void reload()} />
      ) : loading ? (
        <div className="ms-product-grid four">
          {ids.slice(0, 4).map((id) => (
            <Skeleton key={id} variant="rounded" height={420} sx={{ borderRadius: '28px' }} />
          ))}
        </div>
      ) : (
        <>
          {unavailable.length > 0 && (
            <Alert
              severity="info"
              action={
                <Button color="inherit" size="small" onClick={() => unavailable.forEach(removeFromWishlist)}>
                  Remove
                </Button>
              }
            >
              {unavailable.length} saved {unavailable.length === 1 ? 'product is' : 'products are'} no longer available.
            </Alert>
          )}
          {visible.length > 0 && (
            <div className="ms-product-grid four">
              {visible.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </>
      )}
    </Stack>
  );
}
