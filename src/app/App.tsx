import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Container } from '@mui/material';
import Footer from './components/footers';
import Navbar from './components/headers/Navbar';
import Notifier from './components/notifier';
import { LoadingState } from './components/shared/PageStatus';
import RequireAuth from './auth/RequireAuth';
import { useScrollToTopOnNavigate } from './hooks/useScrollToTop';
import HomePage from './screens/homePage';
import '../css/app.css';
import '../css/navbar.css';
import '../css/footer.css';

// Route-level code splitting: each screen loads on first visit.
const ProductsPage = lazy(() => import('./screens/productsPage'));
const ChosenProduct = lazy(() => import('./screens/productsPage/ChosenProduct'));
const CartPage = lazy(() => import('./screens/cartPage'));
const CheckoutPage = lazy(() => import('./screens/checkoutPage'));
const OrdersPage = lazy(() => import('./screens/ordersPage'));
const UserPage = lazy(() => import('./screens/userPage'));
const WishlistPage = lazy(() => import('./screens/wishlistPage'));
const BlogPage = lazy(() => import('./screens/blogPage'));
const ArticlePage = lazy(() => import('./screens/blogPage/ArticlePage'));
const NotFoundPage = lazy(() => import('./screens/notFoundPage'));
const LoginPage = lazy(() => import('./auth/LoginPage'));
const SignupPage = lazy(() => import('./auth/SignupPage'));

function App() {
  useScrollToTopOnNavigate();

  return (
    <div className="ms-shell">
      <Navbar />
      <Container component="main" maxWidth="lg" className="ms-main">
        <Suspense fallback={<LoadingState />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ChosenProduct />} />
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
                  <UserPage />
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
      </Container>
      <Footer />
      <Notifier />
    </div>
  );
}

export default App;
