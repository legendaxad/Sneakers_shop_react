import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { RequireAuth } from '../components/common/RequireAuth';
import { LoadingState } from '../components/common/PageStatus';
import { HomePage } from '../pages/home/HomePage';
import { memberApi } from '../services/api';
import { useScrollToTopOnNavigate } from './hooks';
import { useAuthStore } from './store';
import '../css/app.css';
import '../css/navbar.css';
import '../css/footer.css';

// Route-level code splitting: each page loads on first visit.
const ShopPage = lazy(() => import('../pages/shop/ShopPage').then((m) => ({ default: m.ShopPage })));
const ProductDetailPage = lazy(() => import('../pages/product/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })));
const LoginPage = lazy(() => import('../pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('../pages/auth/SignupPage').then((m) => ({ default: m.SignupPage })));
const CartPage = lazy(() => import('../pages/cart/CartPage').then((m) => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('../pages/checkout/CheckoutPage').then((m) => ({ default: m.CheckoutPage })));
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const OrdersPage = lazy(() => import('../pages/orders/OrdersPage').then((m) => ({ default: m.OrdersPage })));
const NotFoundPage = lazy(() => import('../pages/not-found/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
const WishlistPage = lazy(() => import('../pages/wishlist/WishlistPage').then((m) => ({ default: m.WishlistPage })));
const BlogPage = lazy(() => import('../pages/blog/BlogPage').then((m) => ({ default: m.BlogPage })));
const ArticlePage = lazy(() => import('../pages/blog/ArticlePage').then((m) => ({ default: m.ArticlePage })));

function App() {
  const setMember = useAuthStore((state) => state.setMember);
  const clearMember = useAuthStore((state) => state.clearMember);
  useScrollToTopOnNavigate();

  // Restore the customer session from the httpOnly cookie on page load.
  useEffect(() => {
    let active = true;
    memberApi
      .getProfile()
      .then((member) => active && setMember(member))
      .catch(() => active && clearMember());
    return () => {
      active = false;
    };
  }, [clearMember, setMember]);

  return (
    <Layout>
      <Suspense fallback={<LoadingState />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<ArticlePage />} />
        <Route
          path="/checkout"
          element={
            <RequireAuth>
              <CheckoutPage />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route
          path="/orders"
          element={
            <RequireAuth>
              <OrdersPage />
            </RequireAuth>
          }
        />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;
