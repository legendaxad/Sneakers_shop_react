import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MAX_ITEM_QUANTITY } from '../constants';
import type { Member } from '../types/member';
import type { Product } from '../types/product';

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

/** `checking` until the first GET /member/detail completes after page load. */
export type AuthStatus = 'checking' | 'authenticated' | 'guest';

interface AuthState {
  member: Member | null;
  status: AuthStatus;
  setMember: (member: Member) => void;
  clearMember: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  member: null,
  status: 'checking',
  setMember: (member) => set({ member, status: 'authenticated' }),
  clearMember: () => set({ member: null, status: 'guest' }),
}));

/* ------------------------------------------------------------------ */
/* Cart                                                                */
/* ------------------------------------------------------------------ */

export interface CartItem {
  /** `${productId}:${size}` — the same product in another size is a separate line. */
  key: string;
  productId: string;
  productName: string;
  productBrand: string;
  /** Price at the time of adding; the backend recalculates on checkout. */
  productPrice: number;
  productImage?: string;
  size: number | null;
  quantity: number;
  /** Stock known when the item was added (shared across sizes). */
  stock: number;
}

export const cartItemKey = (productId: string, size: number | null): string => `${productId}:${size ?? 'one-size'}`;

interface CartState {
  items: CartItem[];
  addItem: (product: Product, size: number | null, quantity?: number) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
}

/** Total quantity of a product across all of its sizes (stock is shared). */
export const productQuantityInCart = (items: CartItem[], productId: string, exceptKey?: string): number =>
  items
    .filter((item) => item.productId === productId && item.key !== exceptKey)
    .reduce((total, item) => total + item.quantity, 0);

const clampQuantity = (items: CartItem[], item: CartItem, requested: number): number => {
  const otherSizes = productQuantityInCart(items, item.productId, item.key);
  const limit = Math.max(Math.min(MAX_ITEM_QUANTITY, item.stock - otherSizes), 0);
  return Math.min(Math.max(Math.floor(requested), 0), limit);
};

const isCartItem = (value: unknown): value is CartItem => {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.key === 'string' &&
    typeof item.productId === 'string' &&
    typeof item.productName === 'string' &&
    typeof item.productPrice === 'number' &&
    typeof item.quantity === 'number' &&
    item.quantity > 0 &&
    typeof item.stock === 'number' &&
    (item.size === null || typeof item.size === 'number')
  );
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product, size, quantity = 1) =>
        set((state) => {
          const key = cartItemKey(product._id, size);
          const existing = state.items.find((item) => item.key === key);
          const base: CartItem = existing
            ? { ...existing, productPrice: product.productPrice, stock: product.productLeftCount }
            : {
                key,
                productId: product._id,
                productName: product.productName,
                productBrand: product.productBrand,
                productPrice: product.productPrice,
                productImage: product.productImages?.[0],
                size,
                quantity: 0,
                stock: product.productLeftCount,
              };
          const nextQuantity = clampQuantity(state.items, base, base.quantity + quantity);
          if (nextQuantity <= 0) return state;
          const updated = { ...base, quantity: nextQuantity };
          return {
            items: existing
              ? state.items.map((item) => (item.key === key ? updated : item))
              : [...state.items, updated],
          };
        }),
      updateQuantity: (key, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) => (item.key === key ? { ...item, quantity: clampQuantity(state.items, item, quantity) } : item))
            .filter((item) => item.quantity > 0),
        })),
      removeItem: (key) => set((state) => ({ items: state.items.filter((item) => item.key !== key) })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'multi-shop-cart',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      // v0 carts (before sizes) cannot be checked out safely; start fresh.
      migrate: (persisted, version) => (version < 2 ? { items: [] } : (persisted as { items: CartItem[] })),
      // Ignore malformed or tampered storage instead of crashing.
      merge: (persisted, current) => {
        const items = (persisted as { items?: unknown } | undefined)?.items;
        return { ...current, items: Array.isArray(items) ? items.filter(isCartItem) : [] };
      },
    },
  ),
);

export const selectCartCount = (state: CartState): number =>
  state.items.reduce((total, item) => total + item.quantity, 0);

export const selectCartSubtotal = (state: CartState): number =>
  state.items.reduce((total, item) => total + item.productPrice * item.quantity, 0);

/* ------------------------------------------------------------------ */
/* Notifications (MUI Snackbar)                                        */
/* ------------------------------------------------------------------ */

export type NoticeSeverity = 'success' | 'error' | 'info' | 'warning';

interface NoticeState {
  open: boolean;
  message: string;
  severity: NoticeSeverity;
  notify: (message: string, severity?: NoticeSeverity) => void;
  close: () => void;
}

export const useNoticeStore = create<NoticeState>((set) => ({
  open: false,
  message: '',
  severity: 'info',
  notify: (message, severity = 'info') => set({ open: true, message, severity }),
  close: () => set({ open: false }),
}));
