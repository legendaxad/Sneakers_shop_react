import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Box, Card, CardContent, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { useCartStore, useNoticeStore } from '../../app/store';
import type { Product } from '../../types/product';
import { formatPrice, titleCase } from '../../utils/format';
import { SafeImage } from './SafeImage';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const notify = useNoticeStore((state) => state.notify);
  const navigate = useNavigate();
  const soldOut = product.productLeftCount <= 0;
  const needsSize = (product.productSizes?.length ?? 0) > 0;

  const handleAdd = () => {
    if (needsSize) {
      // Shoes need a size: send the customer to choose one.
      navigate(`/product/${product._id}`);
      return;
    }
    addItem(product, null, 1);
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
      <Card component="article" className="ms-product-card">
        <RouterLink to={`/product/${product._id}`} className="ms-product-card-media" aria-label={product.productName}>
          <SafeImage src={product.productImages?.[0]} alt={product.productName} />
          <span className="ms-product-card-brand">{product.productBrand}</span>
        </RouterLink>

        <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box>
              <Typography className="ms-eyebrow" component="p" sx={{ letterSpacing: '0.2em !important' }}>
                {titleCase(product.productCategory)}
              </Typography>
              <Typography
                component={RouterLink}
                to={`/product/${product._id}`}
                variant="h6"
                className="ms-product-card-title"
                sx={{ mt: 1, display: 'block' }}
              >
                {product.productName}
              </Typography>
            </Box>
            <Typography variant="h6" component="span" sx={{ whiteSpace: 'nowrap' }}>
              {formatPrice(product.productPrice)}
            </Typography>
          </Stack>

          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
            {soldOut ? (
              <Chip label="Sold out" size="small" />
            ) : (
              <Typography variant="body2" color="text.secondary">
                {product.productLeftCount} left
              </Typography>
            )}
            <Tooltip title={soldOut ? 'Sold out' : needsSize ? 'Choose a size' : 'Add to cart'}>
              <span>
                <IconButton
                  onClick={handleAdd}
                  disabled={soldOut}
                  aria-label={needsSize ? `Choose a size for ${product.productName}` : `Add ${product.productName} to cart`}
                  sx={{
                    bgcolor: 'primary.dark',
                    color: '#fff',
                    px: 1.5,
                    '&:hover': { bgcolor: '#292524' },
                    '&.Mui-disabled': { bgcolor: 'divider' },
                  }}
                >
                  <AddShoppingCartIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
}
