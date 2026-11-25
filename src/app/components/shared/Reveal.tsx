import type { PropsWithChildren } from 'react';
import { motion } from 'framer-motion';

interface RevealProps {
  /** Delay in seconds, for gentle staggering of neighbouring sections. */
  delay?: number;
  className?: string;
  as?: 'section' | 'div';
  id?: string;
  'aria-labelledby'?: string;
}

/**
 * Fades a section in as it scrolls into view. Movement is skipped automatically
 * for visitors who prefer reduced motion (MotionConfig reducedMotion="user").
 */
export function Reveal({ children, delay = 0, className, as = 'section', ...rest }: PropsWithChildren<RevealProps>) {
  const Component = as === 'section' ? motion.section : motion.div;
  return (
    <Component
      {...rest}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </Component>
  );
}
