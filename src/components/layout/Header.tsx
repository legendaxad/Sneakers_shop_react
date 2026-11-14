import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { memberApi } from '../../services/api';
import { selectCartCount, useAuthStore, useCartStore, useNoticeStore, useWishlistStore } from '../../app/store';

const navItems = [
  { label: 'Home', path: '/', icon: HomeOutlinedIcon },
  { label: 'Shop', path: '/shop', icon: StorefrontOutlinedIcon },
  { label: 'Journal', path: '/blog', icon: ArticleOutlinedIcon },
  { label: 'Orders', path: '/orders', icon: ReceiptLongOutlinedIcon },
];

export function Header() {
  const member = useAuthStore((state) => state.member);
  const clearMember = useAuthStore((state) => state.clearMember);
  const cartCount = useCartStore(selectCartCount);
  const wishlistCount = useWishlistStore((state) => state.ids.length);
  const notify = useNoticeStore((state) => state.notify);
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const signOut = async () => {
    setDrawerOpen(false);
    try {
      await memberApi.logout();
    } catch {
      // The local session is cleared regardless; the cookie expires on its own.
    }
    clearMember();
    notify('You have been logged out.', 'info');
    navigate('/');
  };

  return (
    <AppBar position="sticky" elevation={0} className="ms-navbar">
      <Container maxWidth="lg">
        <Toolbar disableGutters className="ms-navbar-inner">
          <Link to="/" className="ms-logo" aria-label="MULTI-SHOP home">
            <span className="ms-logo-mark">MS</span>
            <span>
              <span className="ms-logo-tag">Premium</span>
              <Typography component="span" className="ms-logo-name" sx={{ display: 'block' }}>
                MULTI-SHOP
              </Typography>
            </span>
          </Link>

          <nav className="ms-nav-links" aria-label="Main">
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} end={item.path === '/'} className="ms-nav-link">
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Tooltip title="Wishlist">
              <IconButton
                component={Link}
                to="/wishlist"
                aria-label={`Wishlist, ${wishlistCount} saved`}
                sx={{ border: '1px solid', borderColor: 'divider', display: { xs: 'none', sm: 'inline-flex' } }}
              >
                <Badge badgeContent={wishlistCount} color="primary" max={99}>
                  <FavoriteBorderIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>
            <Button
              component={Link}
              to="/cart"
              variant="outlined"
              aria-label={`Cart, ${cartCount} items`}
              startIcon={
                <Badge badgeContent={cartCount} color="primary" max={99} showZero={false}>
                  <ShoppingBagOutlinedIcon fontSize="small" />
                </Badge>
              }
              sx={{ px: { xs: 1.5, sm: 2 } }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Cart
              </Box>
            </Button>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              {member ? (
                <>
                  <Button
                    component={Link}
                    to="/profile"
                    startIcon={<AccountCircleOutlinedIcon />}
                    sx={{ bgcolor: '#f5f5f4', color: 'text.primary', '&:hover': { bgcolor: '#e7e5e4' } }}
                  >
                    {member.memberNick}
                  </Button>
                  <Button variant="outlined" onClick={() => void signOut()}>
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button component={Link} to="/login" variant="outlined">
                    Login
                  </Button>
                  <Button component={Link} to="/signup" variant="contained">
                    Sign up
                  </Button>
                </>
              )}
            </Box>

            <IconButton
              sx={{ display: { md: 'none' }, border: '1px solid', borderColor: 'divider' }}
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <MenuIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Toolbar>
      </Container>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 290, pt: 1 }} role="navigation" aria-label="Mobile">
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1 }}>
            <Typography className="ms-logo-name">MULTI-SHOP</Typography>
            <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close menu">
              <CloseIcon />
            </IconButton>
          </Stack>
          {member && (
            <Typography sx={{ px: 2, pb: 1 }} color="text.secondary" variant="body2">
              Signed in as <strong>{member.memberNick}</strong>
            </Typography>
          )}
          <Divider />
          <List>
            {navItems.map((item) => (
              <ListItemButton
                key={item.path}
                component={NavLink}
                to={item.path}
                end={item.path === '/'}
                className="ms-drawer-link"
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemIcon>
                  <item.icon />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
            <ListItemButton component={NavLink} to="/cart" className="ms-drawer-link" onClick={() => setDrawerOpen(false)}>
              <ListItemIcon>
                <Badge badgeContent={cartCount} color="primary">
                  <ShoppingBagOutlinedIcon />
                </Badge>
              </ListItemIcon>
              <ListItemText primary="Cart" />
            </ListItemButton>
            <ListItemButton component={NavLink} to="/wishlist" className="ms-drawer-link" onClick={() => setDrawerOpen(false)}>
              <ListItemIcon>
                <Badge badgeContent={wishlistCount} color="primary">
                  <FavoriteBorderIcon />
                </Badge>
              </ListItemIcon>
              <ListItemText primary="Wishlist" />
            </ListItemButton>
          </List>
          <Divider />
          <List>
            {member ? (
              <>
                <ListItemButton component={NavLink} to="/profile" className="ms-drawer-link" onClick={() => setDrawerOpen(false)}>
                  <ListItemIcon>
                    <AccountCircleOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText primary="Profile" />
                </ListItemButton>
                <ListItemButton onClick={() => void signOut()}>
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText primary="Log out" />
                </ListItemButton>
              </>
            ) : (
              <>
                <ListItemButton component={NavLink} to="/login" className="ms-drawer-link" onClick={() => setDrawerOpen(false)}>
                  <ListItemIcon>
                    <LoginIcon />
                  </ListItemIcon>
                  <ListItemText primary="Login" />
                </ListItemButton>
                <ListItemButton component={NavLink} to="/signup" className="ms-drawer-link" onClick={() => setDrawerOpen(false)}>
                  <ListItemIcon>
                    <PersonAddAltIcon />
                  </ListItemIcon>
                  <ListItemText primary="Sign up" />
                </ListItemButton>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
