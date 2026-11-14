import { Menu, ShoppingBag, UserCircle2 } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { memberApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Shop', path: '/shop' },
  { label: 'Orders', path: '/orders' },
];

export function Header() {
  const member = useAuthStore((state) => state.member);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const totalItems = useCartStore((state) => state.totalItems());

  const signOut = async () => {
    try {
      await memberApi.logout();
    } catch {
      // Ignore logout API errors and clear local session state.
    }

    clearAuth();
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-white">
            MS
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.26em] text-stone-500">Premium</p>
            <h1 className="text-lg font-black tracking-[0.16em] text-stone-900">MULTI-SHOP</h1>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `text-sm font-medium transition ${isActive ? 'text-stone-950' : 'text-stone-600 hover:text-stone-900'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button type="button" className="inline-flex items-center justify-center rounded-full border border-stone-200 p-2.5 md:hidden">
            <Menu className="h-4 w-4 text-stone-700" />
          </button>

          <Link to="/cart" className="relative inline-flex items-center gap-2 rounded-full border border-stone-200 px-3 py-2 text-sm font-medium text-stone-700 hover:border-stone-300 hover:text-stone-900">
            <ShoppingBag className="h-4 w-4" />
            Cart
            <span className="rounded-full bg-stone-900 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {totalItems}
            </span>
          </Link>

          {member ? (
            <div className="flex items-center gap-2">
              <Link to="/profile" className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-2 text-sm font-medium text-stone-900">
                <UserCircle2 className="h-4 w-4" />
                {member.memberNick}
              </Link>
              <button type="button" onClick={signOut} className="rounded-full border border-stone-200 px-3 py-2 text-sm font-medium text-stone-700">
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="rounded-full border border-stone-200 px-3 py-2 text-sm font-medium text-stone-700">
                Login
              </Link>
              <Link to="/signup" className="rounded-full bg-stone-900 px-3 py-2 text-sm font-medium text-white">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
