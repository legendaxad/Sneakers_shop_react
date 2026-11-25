import { MAX_ITEM_QUANTITY } from '../config';
import type { CartItem } from '../types/cart';

export const cartItemKey = (productId: string, size: number | null): string => `${productId}:${size ?? 'one-size'}`;

/** Total quantity of a product across all of its sizes (stock is shared). */
export const productQuantityInCart = (items: CartItem[], productId: string, exceptKey?: string): number =>
  items
    .filter((item) => item.productId === productId && item.key !== exceptKey)
    .reduce((total, item) => total + item.quantity, 0);

/** Clamp a requested line quantity to [0, min(MAX_ITEM_QUANTITY, stock left after other sizes)]. */
export const clampQuantity = (items: CartItem[], item: CartItem, requested: number): number => {
  const otherSizes = productQuantityInCart(items, item.productId, item.key);
  const limit = Math.max(Math.min(MAX_ITEM_QUANTITY, item.stock - otherSizes), 0);
  return Math.min(Math.max(Math.floor(requested), 0), limit);
};

/** Runtime check for cart lines read back from localStorage. */
export const isCartItem = (value: unknown): value is CartItem => {
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

const OBJECT_ID = /^[a-f\d]{24}$/i;

/** Keep only unique, well-formed product ids from persisted storage. */
export const sanitizeIds = (value: unknown, limit: number): string[] =>
  Array.isArray(value)
    ? [...new Set(value.filter((id): id is string => typeof id === 'string' && OBJECT_ID.test(id)))].slice(0, limit)
    : [];
