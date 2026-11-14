import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  FormHelperText,
  Skeleton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { EmptyState, ErrorState } from '../../components/common/PageStatus';
import { QuantityStepper } from '../../components/common/QuantityStepper';
import { SafeImage } from '../../components/common/SafeImage';
import { useDocumentTitle } from '../../app/hooks';
import { productQuantityInCart, useCartStore, useNoticeStore } from '../../app/store';
import { MAX_ITEM_QUANTITY } from '../../constants';
import { productApi, toApiError } from '../../services/api';
import type { Product } from '../../types/product';
import { formatPrice, titleCase } from '../../utils/format';
import '../../css/products.css';

type LoadState = { status: 'loading' } | { status: 'error'; message: string } | { status: 'not-found' } | { status: 'ready'; product: Product };

export function ProductDetailPage() {
  const { id = '' } = useParams();
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const notify = useNoticeStore((state) => state.notify);
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const product = state.status === 'ready' ? state.product : null;
  useDocumentTitle(product?.productName ?? 'Product');

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    setSelectedSize(null);
    setSizeError(false);
    setQuantity(1);
    setActiveImage(0);
    try {
      setState({ status: 'ready', product: await productApi.getProduct(id) });
    } catch (error) {
      const apiError = toApiError(error);
      if (apiError.status === 404 || apiError.status === 400) setState({ status: 'not-found' });
      else setState({ status: 'error', message: apiError.message });
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (state.status === 'loading') {
    return (
      <div className="ms-detail-grid" aria-busy="true">
        <Skeleton variant="rounded" height={540} sx={{ borderRadius: '30px' }} />
        <Skeleton variant="rounded" height={540} sx={{ borderRadius: '30px' }} />
      </div>
    );
  }

  if (state.status === 'not-found') {
    return (
      <EmptyState
        icon={SearchOffIcon}
        title="Product not found"
        description="This product does not exist or is no longer available."
        action={
          <Button component={Link} to="/shop" variant="contained">
            Back to the shop
          </Button>
        }
      />
    );
  }

  if (state.status === 'error') return <ErrorState message={state.message} onRetry={() => void load()} />;

  const { product: item } = state;
  const sizes = [...(item.productSizes ?? [])].sort((a, b) => a - b);
  const needsSize = sizes.length > 0;
  const inCart = productQuantityInCart(cartItems, item._id);
  const available = Math.max(Math.min(item.productLeftCount - inCart, MAX_ITEM_QUANTITY), 0);
  const soldOut = item.productLeftCount <= 0;
  const images = item.productImages?.length ? item.productImages : [undefined];

  const handleAdd = () => {
    if (needsSize && selectedSize === null) {
      setSizeError(true);
      return;
    }
    addItem(item, needsSize ? selectedSize : null, Math.min(quantity, available));
    notify(`${item.productName}${needsSize ? ` (EU ${selectedSize})` : ''} added to your cart.`, 'success');
    setQuantity(1);
  };

  return (
    <Stack spacing={3}>
      <Breadcrumbs aria-label="breadcrumb">
        <Link to="/shop" style={{ textDecoration: 'none' }}>
          Shop
        </Link>
        <Link to={`/shop?collection=${item.productCategory}`} style={{ textDecoration: 'none' }}>
          {titleCase(item.productCategory)}
        </Link>
        <Typography color="text.primary">{item.productName}</Typography>
      </Breadcrumbs>

      <div className="ms-detail-grid">
        <Stack spacing={2}>
          <Box className="ms-surface" sx={{ p: 2, overflow: 'hidden' }}>
            <SafeImage src={images[activeImage]} alt={item.productName} className="ms-detail-main-image" loading="eager" />
          </Box>
          {images.length > 1 && (
            <div className="ms-detail-thumbs">
              {images.slice(0, 5).map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  className={`ms-detail-thumb${index === activeImage ? ' selected' : ''}`}
                  onClick={() => setActiveImage(index)}
                  aria-label={`Show image ${index + 1}`}
                  aria-pressed={index === activeImage}
                >
                  <SafeImage src={image} alt="" />
                </button>
              ))}
            </div>
          )}
        </Stack>

        <Box className="ms-surface" sx={{ p: { xs: 3, md: 4 } }}>
          <span className="ms-eyebrow">{item.productBrand}</span>
          <Typography variant="h2" component="h1" sx={{ mt: 2 }}>
            {item.productName}
          </Typography>
          <Typography sx={{ mt: 2, fontSize: 30, fontWeight: 700 }}>{formatPrice(item.productPrice)}</Typography>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 3 }}>
            {soldOut ? (
              <Chip label="Sold out" />
            ) : (
              <Chip label={`${item.productLeftCount} left`} sx={{ bgcolor: '#ecfdf5', color: '#047857' }} size="small" />
            )}
            <Typography variant="body2" color="text.secondary">
              {item.productViews} views
            </Typography>
          </Stack>

          {needsSize && (
            <Box sx={{ mt: 4 }}>
              <Typography id="size-label" sx={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'text.secondary' }}>
                Size
              </Typography>
              <ToggleButtonGroup
                exclusive
                value={selectedSize}
                onChange={(_, value: number | null) => {
                  setSelectedSize(value);
                  if (value !== null) setSizeError(false);
                }}
                aria-labelledby="size-label"
                className="ms-size-grid"
                sx={{ mt: 1.5, '& .MuiToggleButton-root': { borderRadius: '999px !important', border: '1px solid #e7e5e4 !important', px: 2, fontWeight: 600 } }}
              >
                {sizes.map((size) => (
                  <ToggleButton
                    key={size}
                    value={size}
                    disabled={soldOut}
                    sx={{ '&.Mui-selected, &.Mui-selected:hover': { bgcolor: 'primary.main', color: '#fff' } }}
                  >
                    EU {size}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              {sizeError && <FormHelperText error>Please select a size.</FormHelperText>}
            </Box>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' }, mt: 4 }}>
            <QuantityStepper value={Math.min(quantity, Math.max(available, 1))} max={Math.max(available, 1)} onChange={setQuantity} />
            <Button
              variant="contained"
              size="large"
              startIcon={<AddShoppingCartIcon />}
              onClick={handleAdd}
              disabled={soldOut || available <= 0}
              sx={{ flex: 1 }}
            >
              {soldOut ? 'Sold out' : 'Add to cart'}
            </Button>
          </Stack>
          {!soldOut && available <= 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              You already have all available stock of this product in your cart.
            </Alert>
          )}

          <Box sx={{ mt: 4, p: 2, borderRadius: '22px', bgcolor: '#fafaf9' }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'text.secondary' }}>
              Description
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.9, whiteSpace: 'pre-line' }}>
              {item.productDesc}
            </Typography>
          </Box>
        </Box>
      </div>
    </Stack>
  );
}
