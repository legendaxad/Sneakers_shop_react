import { createTheme } from '@mui/material/styles';
import type { Shadows } from '@mui/material/styles';
import shadow from './shadow';
import typography from './typography';

/**
 * MULTI-SHOP light theme. Colours come from the existing storefront:
 * warm sand background, stone neutrals, near-black primary.
 */
export const brand = {
  ink: '#1c1917', // stone-900
  inkDeep: '#0c0a09', // stone-950
  sand: '#f7f3ef',
  sandDeep: '#f3efe9',
  latte: '#e7d9cb',
  line: '#e7e5e4', // stone-200
  muted: '#78716c', // stone-500
  body: '#57534e', // stone-600
};

let theme = createTheme({
  palette: {
    mode: 'light',
    background: { default: brand.sand, paper: '#ffffff' },
    primary: { main: brand.ink, dark: brand.inkDeep, contrastText: '#ffffff' },
    secondary: { main: brand.latte, contrastText: brand.ink },
    text: { primary: brand.ink, secondary: brand.body },
    divider: brand.line,
    success: { main: '#047857' },
    error: { main: '#dc2626' },
  },
  shape: { borderRadius: 16 },
  shadows: shadow as Shadows,
  typography,
});

theme = createTheme(theme, {
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            'radial-gradient(circle at top, rgba(255,255,255,0.65) 0%, rgba(247,243,239,0.95) 35%, rgba(247,243,239,1) 100%)',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        maxWidthLg: {
          [theme.breakpoints.up('lg')]: { maxWidth: '1280px' },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 999, paddingInline: 20, minHeight: 44 },
        sizeSmall: { minHeight: 36, paddingInline: 14 },
        outlined: { borderColor: brand.line, color: brand.body, '&:hover': { borderColor: '#d6d3d1', background: 'transparent' } },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { borderRadius: 999 } },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { borderRadius: 28, border: `1px solid ${brand.line}` },
      },
    },
    MuiPaper: {
      styleOverrides: { rounded: { borderRadius: 28 } },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 999, fontWeight: 600 } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: '#fafaf9',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: brand.line },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#d6d3d1' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#a8a29e', borderWidth: 1 },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: { root: { '&.Mui-focused': { color: brand.body } } },
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: 16 } },
    },
    MuiTab: {
      styleOverrides: { root: { textTransform: 'none', fontWeight: 600, minHeight: 44 } },
    },
    MuiPaginationItem: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
  },
});

export default theme;
