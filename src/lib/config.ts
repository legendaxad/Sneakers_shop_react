export const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:3003';

/** Local fallback used when a product or profile image is missing or fails to load. */
export const PLACEHOLDER_IMAGE = '/img/placeholder-sneaker.svg';

/** Shown for customers without a profile photo. */
export const DEFAULT_AVATAR = '/icons/default-user.svg';

export const HERO_IMAGE =
  'https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=1200&q=80';

/** Mirrors the backend rule in Order.service: orders under $100 pay $5 delivery. */
export const FREE_SHIPPING_THRESHOLD = 100;
export const SHIPPING_FEE = 5;

export const PRODUCTS_PER_PAGE = 12;
export const ORDERS_PER_PAGE = 10;
export const MAX_ITEM_QUANTITY = 99;

/** Shared user-facing messages (BURAK `Messages` convention). */
export const Messages = {
  networkError: 'Cannot reach the shop server. Please check your connection and try again.',
  unexpectedError: 'Unexpected error. Please try again.',
  /** Backend `Message.NO_DATA_FOUND`: an empty result, not a failure. */
  noDataFound: 'No data found!',
} as const;
