import { Typography } from '@mui/material';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { Reveal } from '../../components/common/Reveal';
import { useDocumentTitle } from '../../app/hooks';
import { FREE_SHIPPING_THRESHOLD } from '../../constants';
import { formatPrice } from '../../utils/format';
import { CategorySection } from './CategorySection';
import { HeroSection } from './HeroSection';
import { JournalSection } from './JournalSection';
import { MostViewedSection, NewArrivalsSection, RecentlyViewedSection } from './ProductSections';
import { PromoSection } from './PromoSection';
import { TopCustomersSection } from './TopCustomersSection';
import '../../css/home.css';
import '../../css/products.css';
import '../../css/blog.css';

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

  return (
    <div className="ms-home">
      <HeroSection />

      <Reveal as="div" className="ms-feature-strip" aria-label="Why shop with us">
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
      </Reveal>

      <CategorySection />
      <NewArrivalsSection />
      <MostViewedSection />
      <RecentlyViewedSection />
      <TopCustomersSection />
      <JournalSection />
      <PromoSection />
    </div>
  );
}
