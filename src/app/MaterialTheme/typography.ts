import type { TypographyVariantsOptions } from '@mui/material/styles';

/** MULTI-SHOP type scale: heavy, tightly tracked headlines with uppercase eyebrow labels. */
const typography: TypographyVariantsOptions = {
  fontFamily: "'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  h1: { fontWeight: 900, fontSize: '3.75rem', letterSpacing: '-0.05em', lineHeight: 1.05 },
  h2: { fontWeight: 900, fontSize: '2.25rem', letterSpacing: '-0.04em', lineHeight: 1.1 },
  h3: { fontWeight: 900, fontSize: '1.875rem', letterSpacing: '-0.04em', lineHeight: 1.15 },
  h4: { fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.03em' },
  h5: { fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em' },
  h6: { fontWeight: 600, fontSize: '1.125rem', letterSpacing: '-0.01em' },
  subtitle1: { fontWeight: 600 },
  subtitle2: { fontWeight: 600, letterSpacing: '0.02em' },
  body1: { lineHeight: 1.6 },
  body2: { lineHeight: 1.6 },
  overline: { fontWeight: 600, fontSize: '0.625rem', letterSpacing: '0.28em', lineHeight: 1.6 },
  button: { fontWeight: 600, textTransform: 'none', letterSpacing: 0 },
};

export default typography;
