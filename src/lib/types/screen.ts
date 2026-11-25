import type { NoticeSeverity } from './common';
import type { CartItem } from './cart';
import type { TopMember } from './member';
import type { Order } from './order';
import type { Product } from './product';
import type { ProductCollection } from '../enums/product.enum';

/** REACT APP STATE — one entry per Redux slice. */
export interface AppRootState {
  homePage: HomePageState;
  productsPage: ProductsPageState;
  cartPage: CartPageState;
  ordersPage: OrdersPageState;
  wishlistPage: WishlistPageState;
  notice: NoticeState;
}

/** HOMEPAGE */
export interface HomePageState {
  newArrivals: Product[];
  mostViewed: Product[];
  topUsers: TopMember[];
  /** Total number of active products (hero stat); null when unknown. */
  productTotal: number | null;
  /** Product count per collection; null entries could not be loaded. Null until loaded. */
  categoryCounts: Partial<Record<ProductCollection, number | null>> | null;
}

/** PRODUCTS PAGE (shop listing + product detail) */
export interface ProductsPageState {
  products: Product[];
  productTotal: number;
  chosenProduct: Product | null;
  /** Product ids this visitor opened, newest first (persisted in this browser). */
  recentlyViewedIds: string[];
}

/** CART PAGE (persisted in this browser) */
export interface CartPageState {
  cartItems: CartItem[];
}

/** ORDERS PAGE */
export interface OrdersPageState {
  orders: Order[];
}

/** WISHLIST PAGE (persisted in this browser) */
export interface WishlistPageState {
  wishlistIds: string[];
}

/** Global snackbar notice */
export interface NoticeState {
  open: boolean;
  message: string;
  severity: NoticeSeverity;
}
