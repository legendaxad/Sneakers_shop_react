import { Link } from 'react-router-dom';
import { Container, Typography } from '@mui/material';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '../../constants';
import { formatPrice } from '../../utils/format';

const CURRENT_YEAR = new Date().getFullYear();

const shopLinks = [
  { label: 'Running', to: '/shop?collection=RUNNING' },
  { label: 'Training', to: '/shop?collection=TRAINING' },
  { label: 'Basketball', to: '/shop?collection=BASKETBALL' },
  { label: 'Lifestyle', to: '/shop?collection=LIFESTYLE' },
];

const accountLinks = [
  { label: 'My profile', to: '/profile' },
  { label: 'Order status', to: '/orders' },
  { label: 'Cart', to: '/cart' },
  { label: 'Create account', to: '/signup' },
];

export function Footer() {
  return (
    <footer className="ms-footer">
      <Container maxWidth="lg" className="ms-footer-grid">
        <div>
          <span className="ms-eyebrow" style={{ letterSpacing: '0.3em' }}>
            MULTI-SHOP
          </span>
          <Typography sx={{ mt: 2, maxWidth: 280 }} variant="body2" color="text.secondary">
            Premium sneaker essentials designed for movement, style, and daily performance.
          </Typography>
        </div>
        <nav aria-label="Shop collections">
          <p className="ms-footer-title">Shop</p>
          <ul className="ms-footer-list">
            {shopLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Account">
          <p className="ms-footer-title">Account</p>
          <ul className="ms-footer-list">
            {accountLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="ms-footer-title">Shipping</p>
          <ul className="ms-footer-list">
            <li>Free shipping over {formatPrice(FREE_SHIPPING_THRESHOLD)}</li>
            <li>{formatPrice(SHIPPING_FEE)} delivery on smaller orders</li>
            <li>Cancel any order before it is confirmed</li>
          </ul>
        </div>
      </Container>
      <div className="ms-footer-bottom">© {CURRENT_YEAR} MULTI-SHOP — Crafted for everyday motion.</div>
    </footer>
  );
}
