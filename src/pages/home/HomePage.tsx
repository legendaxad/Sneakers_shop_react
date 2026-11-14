import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Box, Button, Skeleton, Stack, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { ProductCard } from '../../components/common/ProductCard';
import { EmptyState, ErrorState } from '../../components/common/PageStatus';
import { SafeImage } from '../../components/common/SafeImage';
import { getApiErrorMessage, productApi } from '../../services/api';
import { useDocumentTitle } from '../../app/hooks';
import { useAuthStore } from '../../app/store';
import { FREE_SHIPPING_THRESHOLD, HERO_IMAGE } from '../../constants';
import type { Product } from '../../types/product';
import { formatPrice } from '../../utils/format';
import '../../css/home.css';
import '../../css/products.css';

const features = [
  {
    icon: LocalShippingOutlinedIcon,
    title: `Free shipping over ${formatPrice(FREE_SHIPPING_THRESHOLD)}`,
    text: 'Fast dispatch on every order and attentive post-purchase care.',
  },
  {
    icon: VerifiedUserOutlinedIcon,
    title: 'Authenticity guarantee',
    text: 'Only verified products and curated collections from trusted sources.',
  },
  {
    icon: AutoAwesomeOutlinedIcon,
    title: 'Performance-driven design',
    text: 'Built to support training, everyday wear, and elevated street style.',
  },
];

export function HomePage() {
  useDocumentTitle('');
  const member = useAuthStore((state) => state.member);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeatured = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setFeatured(await productApi.getProducts({ page: 1, limit: 4, order: 'createdAt' }));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFeatured();
  }, [loadFeatured]);

  return (
    <Stack spacing={6} sx={{ pb: 6 }}>
      <section className="ms-hero">
        <div className="ms-hero-grid">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Typography component="p" sx={{ fontSize: 12, letterSpacing: '0.38em', textTransform: 'uppercase', color: '#d6d3d1' }}>
              Performance energy
            </Typography>
            <Typography variant="h1" sx={{ mt: 2, maxWidth: 560, fontSize: { xs: '2.25rem', md: '3.75rem' } }}>
              Run louder. Train harder. Look sharper.
            </Typography>
            <Typography sx={{ mt: 3, maxWidth: 520, color: '#d6d3d1' }}>
              Discover premium sneakers built for everyday motion, crafted for season-long comfort and statement-level presence.
            </Typography>
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2, mt: 4 }}>
              <Button
                component={Link}
                to="/shop"
                endIcon={<ArrowForwardIcon />}
                sx={{ bgcolor: '#fff', color: 'text.primary', px: 3, '&:hover': { bgcolor: '#f5f5f4' } }}
              >
                Shop collection
              </Button>
              {!member && (
                <Button
                  component={Link}
                  to="/signup"
                  variant="outlined"
                  sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', px: 3, '&:hover': { borderColor: 'rgba(255,255,255,0.6)' } }}
                >
                  Join the club
                </Button>
              )}
            </Stack>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="ms-hero-media"
          >
            <div className="ms-hero-glow" />
            <SafeImage src={HERO_IMAGE} alt="Premium sneaker" className="ms-hero-image" loading="eager" />
          </motion.div>
        </div>
      </section>

      <Box component="section" sx={{ display: 'grid', gap: 2, gridTemplateColumns: { md: 'repeat(3, 1fr)' } }}>
        {features.map(({ icon: Icon, title, text }) => (
          <div key={title} className="ms-feature-card">
            <Icon sx={{ fontSize: 32 }} />
            <Typography variant="h5" component="h3" sx={{ mt: 2 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {text}
            </Typography>
          </div>
        ))}
      </Box>

      <section className="ms-featured-section" aria-labelledby="featured-heading">
        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <Typography component="p" sx={{ fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'text.secondary' }}>
              Featured drops
            </Typography>
            <Typography id="featured-heading" variant="h3" component="h2" sx={{ mt: 1.5 }}>
              Editor’s picks
            </Typography>
          </div>
          <Button component={Link} to="/shop" endIcon={<ArrowForwardIcon />} sx={{ display: { xs: 'none', md: 'inline-flex' }, color: 'text.primary' }}>
            View all products
          </Button>
        </Stack>

        <Box sx={{ mt: 4 }}>
          {error ? (
            <ErrorState message={error} onRetry={() => void loadFeatured()} />
          ) : loading ? (
            <div className="ms-product-grid four">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} variant="rounded" height={400} sx={{ borderRadius: '28px' }} />
              ))}
            </div>
          ) : featured.length ? (
            <div className="ms-product-grid four">
              {featured.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState title="New drops are on the way" description="Check back soon for the latest releases." />
          )}
        </Box>
        <Button component={Link} to="/shop" fullWidth endIcon={<ArrowForwardIcon />} sx={{ mt: 3, display: { md: 'none' }, color: 'text.primary' }}>
          View all products
        </Button>
      </section>
    </Stack>
  );
}
