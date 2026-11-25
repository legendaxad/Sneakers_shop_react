import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '../../../lib/types/cart';
import type { Product } from '../../../lib/types/product';
import type { CartPageState } from '../../../lib/types/screen';
import { cartItemKey, clampQuantity } from '../../../lib/utils/cart';

const initialState: CartPageState = {
  cartItems: [],
};

interface AddToCartPayload {
  product: Product;
  size: number | null;
  quantity?: number;
}

const cartPageSlice = createSlice({
  name: 'cartPage',
  initialState,
  reducers: {
    /** Adds (or increases) a line, never exceeding the stock shared across sizes. */
    addToCart: (state, action: PayloadAction<AddToCartPayload>) => {
      const { product, size, quantity = 1 } = action.payload;
      const key = cartItemKey(product._id, size);
      const existing = state.cartItems.find((item) => item.key === key);
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
      const nextQuantity = clampQuantity(state.cartItems, base, base.quantity + quantity);
      if (nextQuantity <= 0) return;
      const updated = { ...base, quantity: nextQuantity };
      state.cartItems = existing
        ? state.cartItems.map((item) => (item.key === key ? updated : item))
        : [...state.cartItems, updated];
    },
    /** Sets a line quantity (clamped to stock); a quantity of 0 removes the line. */
    updateCartQuantity: (state, action: PayloadAction<{ key: string; quantity: number }>) => {
      const { key, quantity } = action.payload;
      const items = state.cartItems;
      state.cartItems = items
        .map((item) => (item.key === key ? { ...item, quantity: clampQuantity(items, item, quantity) } : item))
        .filter((item) => item.quantity > 0);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cartItems = state.cartItems.filter((item) => item.key !== action.payload);
    },
    clearCart: (state) => {
      state.cartItems = [];
    },
  },
});

export const { addToCart, updateCartQuantity, removeFromCart, clearCart } = cartPageSlice.actions;
const CartPageReducer = cartPageSlice.reducer;
export default CartPageReducer;
