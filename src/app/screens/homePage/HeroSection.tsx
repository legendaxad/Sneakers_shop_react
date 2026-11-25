import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Box, Button, Stack, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { SafeImage } from '../../components/shared/SafeImage';
import { HERO_IMAGE } from '../../../lib/config';
import { HOME_IMAGES } from '../../../lib/data/categories';
import { useAppSelector } from '../../hooks';
import { retrieveProductTotal } from './selector';

const FEATURED_COLLECTION = { label: 'Running collection', to: '/shop?collection=RUNNING' };

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  // Subtle parallax on the hero photo; disabled for reduced motion.
  const imageY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 60]);
  const styleCount = useAppSelector(retrieveProductTotal);

  return (
    <section ref={sectionRef} className="ms-hero" aria-labelledby="hero-heading">
      <div className="ms-hero-grid">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.span variants={item} className="ms-hero-kicker">
            New season · Performance energy
          </motion.span>
          <motion.div variants={item}>
            <Typography id="hero-heading" variant="h1" sx={{ mt: 2.5, maxWidth: 600, fontSize: { xs: '2.5rem', sm: '3.25rem', md: '4rem' } }}>
              Run louder. Train harder. Look sharper.
            </Typography>
          </motion.div>
          <motion.div variants={item}>
            <Typography sx={{ mt: 3, maxWidth: 520, color: '#d6d3d1', fontSize: { md: '1.125rem' } }}>
              Premium sneakers engineered for everyday motion — season-long comfort with statement-level presence. Free shipping on orders over
              $100.
            </Typography>
          </motion.div>
          <motion.div variants={item}>
            <Stack direction="row" sx={{ mt: 4, flexWrap: 'wrap', gap: 1.5 }}>
              <Button component={Link} to="/shop" size="large" endIcon={<ArrowForwardIcon />} className="ms-hero-primary">
                Shop now
              </Button>
              <Button component={Link} to={FEATURED_COLLECTION.to} size="large" variant="outlined" className="ms-hero-secondary">
                Explore collection
              </Button>
            </Stack>
          </motion.div>
          <motion.dl variants={item} className="ms-hero-stats">
            {styleCount !== null && styleCount > 0 && (
              <div>
                <dt>Styles available</dt>
                <dd>{styleCount}</dd>
              </div>
            )}
            <div>
              <dt>Free shipping</dt>
              <dd>$100+</dd>
            </div>
            <div>
              <dt>Sizes</dt>
              <dd>EU 38–45</dd>
            </div>
          </motion.dl>
        </motion.div>

        <motion.div
          className="ms-hero-media"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="ms-hero-glow" />
          <motion.div style={{ y: imageY }} className="ms-hero-image-wrap">
            <SafeImage src={HERO_IMAGE} alt="Premium sneaker in motion" className="ms-hero-image" loading="eager" />
          </motion.div>

          <Box component={Link} to={FEATURED_COLLECTION.to} className="ms-hero-feature" aria-label={`Featured: ${FEATURED_COLLECTION.label}`}>
            <SafeImage src={HOME_IMAGES.featuredCollection} alt="" />
            <div>
              <span>Featured</span>
              <strong>{FEATURED_COLLECTION.label}</strong>
              <em>
                Built for distance <ArrowForwardIcon sx={{ fontSize: 14 }} />
              </em>
            </div>
          </Box>
        </motion.div>
      </div>
    </section>
  );
}
