import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Box, Button, Card, CardContent, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useAppDispatch } from '../../hooks';
import { useNotify } from '../../hooks/useNotify';
import { addToCart } from '../../screens/cartPage/slice';
import type { Product } from '../../../lib/types/product';
import { formatPrice, titleCase } from '../../../lib/utils/format';
import { SafeImage } from './SafeImage';
import { WishlistButton } from './WishlistButton';

interface ProductCardProps {
  product: Product;
  /** Ranking badge (e.g. most viewed position). */
  rank?: number;
  /** Show the product's real view count from the backend. */
  showViews?: boolean;
  /** `cart` (default) shows the quick add button; `view` shows a "View product" button. */
  action?: 'cart' | 'view';
}

export function ProductCard({ product, rank, showViews, action = 'cart' }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const notify = useNotify();
  const navigate = useNavigate();
  const soldOut = product.productLeftCount <= 0;
  const needsSize = (product.productSizes?.length ?? 0) > 0;
  const productUrl = `/product/${product._id}`;

  const handleAdd = () => {
    if (needsSize) {
      // Shoes need a size: send the customer to choose one.
      navigate(productUrl);
      return;
    }
    dispatch(addToCart({ product, size: null, quantity: 1 }));
    notify(`${product.productName} added to your cart.`, 'success');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35 }}
      style={{ height: '100%' }}
    >
      <Card component="article" className="ms-product-card" aria-label={product.productName}>
        <Box className="ms-product-card-media">
          <RouterLink to={productUrl} tabIndex={-1} aria-hidden="true">
            <SafeImage src={product.productImages?.[0]} alt="" />
          </RouterLink>
          <span className="ms-product-card-brand">{product.productBrand}</span>
          {rank !== undefined && <span className="ms-product-card-rank">#{rank}</span>}
          <WishlistButton productId={product._id} productName={product.productName} />
        </Box>

        <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography className="ms-eyebrow" component="p" sx={{ letterSpacing: '0.2em !important' }}>
                {titleCase(product.productCategory)}
              </Typography>
              <Typography component={RouterLink} to={productUrl} variant="h6" className="ms-product-card-title" sx={{ mt: 1 }}>
                {product.productName}
              </Typography>
            </Box>
            <Typography variant="h6" component="span" sx={{ whiteSpace: 'nowrap' }}>
              {formatPrice(product.productPrice)}
            </Typography>
          </Stack>

          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 'auto', gap: 1 }}>
            {showViews ? (
              <Chip
                size="small"
                icon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
                label={`${product.productViews.toLocaleString('en-US')} ${product.productViews === 1 ? 'view' : 'views'}`}
                sx={{ bgcolor: '#f3efe9' }}
              />
            ) : soldOut ? (
              <Chip label="Sold out" size="small" />
            ) : (
              <Typography variant="body2" color="text.secondary">
                {product.productLeftCount} left
              </Typography>
            )}

            {action === 'view' ? (
              <Button component={RouterLink} to={productUrl} size="small" variant="contained" endIcon={<ArrowForwardIcon />}>
                View product
              </Button>
            ) : (
              <Tooltip title={soldOut ? 'Sold out' : needsSize ? 'Choose a size' : 'Add to cart'}>
                <span>
                  <IconButton
                    onClick={handleAdd}
                    disabled={soldOut}
                    className="ms-quick-add"
                    aria-label={needsSize ? `Choose a size for ${product.productName}` : `Add ${product.productName} to cart`}
                  >
                    <AddShoppingCartIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
}
