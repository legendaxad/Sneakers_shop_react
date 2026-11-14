import { Link, useNavigate } from 'react-router-dom';
import { Box, Button, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { EmptyState } from '../../components/common/PageStatus';
import { QuantityStepper } from '../../components/common/QuantityStepper';
import { SafeImage } from '../../components/common/SafeImage';
import { useDocumentTitle } from '../../app/hooks';
import { productQuantityInCart, selectCartCount, selectCartSubtotal, useCartStore } from '../../app/store';
import { FREE_SHIPPING_THRESHOLD, MAX_ITEM_QUANTITY } from '../../constants';
import { formatPrice } from '../../utils/format';
import { calculateShipping } from '../../utils/order';
import '../../css/order.css';

export function CartPage() {
  useDocumentTitle('Cart');
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useCartStore(selectCartSubtotal);
  const totalItems = useCartStore(selectCartCount);
  const shipping = calculateShipping(subtotal);

  if (!items.length) {
    return (
      <EmptyState
        icon={ShoppingBagOutlinedIcon}
        title="Your cart is empty"
        description="Browse the collection to add your next pair."
        action={
          <Button component={Link} to="/shop" variant="contained">
            Explore sneakers
          </Button>
        }
      />
    );
  }

  return (
    <div className="ms-two-column">
      <Stack spacing={2.5} component="section" aria-label="Cart items">
        <Typography variant="h3" component="h1">
          Your cart
        </Typography>
        {items.map((item) => {
          const maxForLine = Math.max(Math.min(item.stock - productQuantityInCart(items, item.productId, item.key), MAX_ITEM_QUANTITY), 1);
          return (
            <article key={item.key} className="ms-surface ms-line-item">
              <Link to={`/product/${item.productId}`}>
                <SafeImage src={item.productImage} alt={item.productName} className="ms-line-item-image" />
              </Link>
              <Stack sx={{ justifyContent: 'space-between', flex: 1 }} spacing={2}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <span className="ms-eyebrow" style={{ letterSpacing: '0.2em' }}>
                      {item.productBrand}
                    </span>
                    <Typography
                      component={Link}
                      to={`/product/${item.productId}`}
                      variant="h5"
                      sx={{ mt: 1, display: 'block', color: 'inherit', textDecoration: 'none' }}
                    >
                      {item.productName}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      {item.size !== null && <Chip size="small" label={`Size EU ${item.size}`} />}
                      <Chip size="small" variant="outlined" label={`${formatPrice(item.productPrice)} each`} />
                    </Stack>
                  </div>
                  <Tooltip title="Remove">
                    <IconButton onClick={() => removeItem(item.key)} aria-label={`Remove ${item.productName}${item.size ? ` size ${item.size}` : ''}`}>
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <QuantityStepper
                    value={item.quantity}
                    max={maxForLine}
                    onChange={(value) => updateQuantity(item.key, value)}
                    label={`quantity of ${item.productName}`}
                  />
                  <Typography variant="h6" component="p">
                    {formatPrice(item.productPrice * item.quantity)}
                  </Typography>
                </Stack>
              </Stack>
            </article>
          );
        })}
      </Stack>

      <Box component="aside" className="ms-dark-panel ms-sticky" sx={{ p: 3 }} aria-label="Order summary">
        <span className="ms-eyebrow">Summary</span>
        <Typography variant="h3" component="p" sx={{ mt: 2 }}>
          {totalItems} item{totalItems === 1 ? '' : 's'}
        </Typography>
        <Stack spacing={2} sx={{ mt: 4 }}>
          <div className="ms-summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="ms-summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
          </div>
          <div className="ms-summary-row total">
            <span>Estimated total</span>
            <span>{formatPrice(subtotal + shipping)}</span>
          </div>
        </Stack>
        {shipping > 0 && (
          <Typography variant="body2" sx={{ mt: 2, color: '#d6d3d1' }}>
            Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping.
          </Typography>
        )}
        <Button
          fullWidth
          onClick={() => navigate('/checkout')}
          sx={{ mt: 4, bgcolor: '#fff', color: 'text.primary', '&:hover': { bgcolor: '#f5f5f4' } }}
        >
          Proceed to checkout
        </Button>
        <Typography variant="caption" component="p" sx={{ mt: 2, color: '#a8a29e' }}>
          Prices and availability are confirmed when you place your order.
        </Typography>
      </Box>
    </div>
  );
}
