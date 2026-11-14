import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/home/HomePage';
import { ShopPage } from './pages/shop/ShopPage';
import { ProductDetailPage } from './pages/product/ProductDetailPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { CartPage } from './pages/cart/CartPage';
import { CheckoutPage } from './pages/checkout/CheckoutPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { OrdersPage } from './pages/orders/OrdersPage';
import { NotFoundPage } from './pages/not-found/NotFoundPage';
import { memberApi } from './services/api';
import { useAuthStore } from './store/authStore';

function App() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    const hydrateSession = async () => {
      try {
        const member = await memberApi.getProfile();
        setAuth(member);
      } catch {
        clearAuth();
      }
    };

    void hydrateSession();
  }, [clearAuth, setAuth]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
