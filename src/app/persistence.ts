import type { AppRootState } from '../lib/types/screen';
import { isCartItem, sanitizeIds } from '../lib/utils/cart';
import { RECENTLY_VIEWED_LIMIT } from './screens/productsPage/slice';
import { WISHLIST_LIMIT } from './screens/wishlistPage/slice';

/**
 * Browser-only state that must survive a refresh (cart, wishlist, recently viewed).
 * Keys and the `{ state, version }` envelope match what the app stored before the
 * Redux migration, so carts and wishlists already saved in a browser are kept.
 */
const STORAGE = {
  cart: { key: 'multi-shop-cart', version: 2 },
  wishlist: { key: 'multi-shop-wishlist', version: 1 },
  recentlyViewed: { key: 'multi-shop-recently-viewed', version: 1 },
} as const;

export type PersistedState = Pick<AppRootState, 'cartPage' | 'wishlistPage' | 'productsPage'>;

interface Envelope {
  state?: Record<string, unknown>;
  version?: number;
}

const read = (key: string): Envelope | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Envelope) : null;
  } catch {
    return null; // malformed JSON or storage unavailable
  }
};

const write = (key: string, version: number, state: Record<string, unknown>) => {
  try {
    localStorage.setItem(key, JSON.stringify({ state, version }));
  } catch {
    // Storage full or blocked (private mode): the app keeps working in memory.
  }
};

/** Persisted slices for `configureStore({ preloadedState })`; malformed or legacy data is dropped. */
export const loadPersistedState = (): Partial<PersistedState> => {
  const cart = read(STORAGE.cart.key);
  // v0 carts (before sizes) cannot be checked out safely; start fresh.
  const cartItems =
    cart && (cart.version ?? 0) >= STORAGE.cart.version && Array.isArray(cart.state?.items)
      ? (cart.state.items as unknown[]).filter(isCartItem)
      : [];
  const wishlistIds = sanitizeIds(read(STORAGE.wishlist.key)?.state?.ids, WISHLIST_LIMIT);
  const recentlyViewedIds = sanitizeIds(read(STORAGE.recentlyViewed.key)?.state?.ids, RECENTLY_VIEWED_LIMIT);

  return {
    cartPage: { cartItems },
    wishlistPage: { wishlistIds },
    productsPage: { products: [], productTotal: 0, chosenProduct: null, recentlyViewedIds },
  };
};

/** Returns a store listener that writes each persisted part only when it changed. */
export const createPersistListener = (getState: () => AppRootState) => {
  let previous = getState();
  return () => {
    const next = getState();
    if (next.cartPage.cartItems !== previous.cartPage.cartItems) {
      write(STORAGE.cart.key, STORAGE.cart.version, { items: next.cartPage.cartItems });
    }
    if (next.wishlistPage.wishlistIds !== previous.wishlistPage.wishlistIds) {
      write(STORAGE.wishlist.key, STORAGE.wishlist.version, { ids: next.wishlistPage.wishlistIds });
    }
    if (next.productsPage.recentlyViewedIds !== previous.productsPage.recentlyViewedIds) {
      write(STORAGE.recentlyViewed.key, STORAGE.recentlyViewed.version, { ids: next.productsPage.recentlyViewedIds });
    }
    previous = next;
  };
};
