import { useCallback, useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { Reveal } from '../../components/shared/Reveal';
import { useAppDispatch } from '../../hooks';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getApiErrorMessage } from '../../service/apiClient';
import MemberService from '../../service/MemberService';
import ProductService from '../../service/ProductService';
import { CATEGORY_META } from '../../../lib/data/categories';
import type { RequestState } from '../../../lib/types/common';
import type { HomePageState } from '../../../lib/types/screen';
import { FREE_SHIPPING_THRESHOLD } from '../../../lib/config';
import { formatPrice } from '../../../lib/utils/format';
import { CategorySection } from './CategorySection';
import { HeroSection } from './HeroSection';
import { JournalSection } from './JournalSection';
import { MostViewedSection, NewArrivalsSection, RecentlyViewedSection } from './ProductSections';
import { PromoSection } from './PromoSection';
import { setCategoryCounts, setMostViewed, setNewArrivals, setProductTotal, setTopUsers } from './slice';
import { TopCustomersSection } from './TopCustomersSection';
import '../../../css/home.css';
import '../../../css/products.css';
import '../../../css/blog.css';

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

type SectionKey = 'newArrivals' | 'mostViewed' | 'topUsers';

const LOADING: RequestState = { loading: true, error: null };

/**
 * Homepage parent: fetches every homepage block from the backend and stores it
 * in the homePage slice; sections read it back through selectors. Request
 * status per section stays local (it only matters while this screen is open).
 */
export default function HomePage() {
  useDocumentTitle('');
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<Record<SectionKey, RequestState>>({
    newArrivals: LOADING,
    mostViewed: LOADING,
    topUsers: LOADING,
  });

  /** Runs one section request, tracking its loading/error state. */
  const runSection = useCallback(async (key: SectionKey, request: () => Promise<void>) => {
    setStatus((current) => (current[key].loading ? current : { ...current, [key]: LOADING }));
    try {
      await request();
      setStatus((current) => ({ ...current, [key]: { loading: false, error: null } }));
    } catch (err) {
      setStatus((current) => ({ ...current, [key]: { loading: false, error: getApiErrorMessage(err) } }));
    }
  }, []);

  const loadNewArrivals = useCallback(
    () =>
      runSection('newArrivals', async () => {
        const products = await new ProductService().getProducts({ page: 1, limit: 4, order: 'createdAt' });
        dispatch(setNewArrivals(products));
      }),
    [dispatch, runSection],
  );

  // Ranked by the backend's real `productViews`; never-viewed products are not "most viewed".
  const loadMostViewed = useCallback(
    () =>
      runSection('mostViewed', async () => {
        const products = await new ProductService().getProducts({ page: 1, limit: 8, order: 'productViews' });
        dispatch(setMostViewed(products.filter((product) => product.productViews > 0).slice(0, 4)));
      }),
    [dispatch, runSection],
  );

  const loadTopUsers = useCallback(
    () =>
      runSection('topUsers', async () => {
        dispatch(setTopUsers(await new MemberService().getTopUsers()));
      }),
    [dispatch, runSection],
  );

  // Hero stat and category counts are decorative: failures are hidden, not shown as errors.
  const loadCounts = useCallback(async () => {
    const productService = new ProductService();
    const [total, ...perCategory] = await Promise.allSettled([
      productService.getProductCount(),
      ...CATEGORY_META.map((meta) => productService.getProductCount({ productCollection: meta.value })),
    ]);
    dispatch(setProductTotal(total.status === 'fulfilled' ? total.value : null));
    const counts: NonNullable<HomePageState['categoryCounts']> = {};
    CATEGORY_META.forEach((meta, index) => {
      const result = perCategory[index];
      counts[meta.value] = result.status === 'fulfilled' ? result.value : null;
    });
    dispatch(setCategoryCounts(counts));
  }, [dispatch]);

  useEffect(() => {
    void loadNewArrivals();
    void loadMostViewed();
    void loadTopUsers();
    void loadCounts();
  }, [loadNewArrivals, loadMostViewed, loadTopUsers, loadCounts]);

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
      <NewArrivalsSection {...status.newArrivals} onRetry={() => void loadNewArrivals()} />
      <MostViewedSection {...status.mostViewed} onRetry={() => void loadMostViewed()} />
      <RecentlyViewedSection />
      <TopCustomersSection {...status.topUsers} onRetry={() => void loadTopUsers()} />
      <JournalSection />
      <PromoSection />
    </div>
  );
}
