/** One cart line. The cart lives in the browser only; the backend has no cart endpoints. */
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
