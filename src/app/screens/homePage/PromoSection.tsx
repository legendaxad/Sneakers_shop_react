import { Link } from 'react-router-dom';
import { Button, Stack, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Reveal } from '../../components/shared/Reveal';
import { SafeImage } from '../../components/shared/SafeImage';
import { useGlobals } from '../../hooks/useGlobal';
import { FREE_SHIPPING_THRESHOLD } from '../../../lib/config';
import { HOME_IMAGES } from '../../../lib/data/categories';
import { formatPrice } from '../../../lib/utils/format';

/** Closing call-to-action above the footer. */
export function PromoSection() {
  const { authMember: member } = useGlobals();
  return (
    <Reveal className="ms-promo" aria-labelledby="promo-heading">
      <SafeImage src={HOME_IMAGES.promo} alt="" className="ms-promo-image" />
      <div className="ms-promo-content">
        <span className="ms-eyebrow inverted">Ready when you are</span>
        <Typography id="promo-heading" variant="h2" sx={{ mt: 2, color: '#fff', maxWidth: 560, fontSize: { xs: '2rem', md: '2.75rem' } }}>
          Your next favourite pair is one click away.
        </Typography>
        <Typography sx={{ mt: 2, color: '#e7e5e4', maxWidth: 480 }}>
          Free shipping on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}, and you can cancel any order until it is confirmed.
        </Typography>
        <Stack direction="row" sx={{ mt: 4, flexWrap: 'wrap', gap: 1.5 }}>
          <Button component={Link} to="/shop" size="large" endIcon={<ArrowForwardIcon />} className="ms-hero-primary">
            Shop the collection
          </Button>
          <Button component={Link} to={member ? '/wishlist' : '/signup'} size="large" variant="outlined" className="ms-hero-secondary">
            {member ? 'View your wishlist' : 'Create an account'}
          </Button>
        </Stack>
      </div>
    </Reveal>
  );
}
