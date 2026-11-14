import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../types/product';

export interface CartItem {
  productId: string;
  productName: string;
  productBrand: string;
  productPrice: number;
  productImages: string[];
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.productId === product._id);

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.productId === product._id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                productId: product._id,
                productName: product.productName,
                productBrand: product.productBrand,
                productPrice: product.productPrice,
                productImages: product.productImages,
                quantity,
              },
            ],
          };
        });
      },
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items
            .map((item) =>
              item.productId === productId ? { ...item, quantity: Math.max(0, quantity) } : item,
            )
            .filter((item) => item.quantity > 0),
        }));
      },
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      subtotal: () => get().items.reduce((total, item) => total + item.productPrice * item.quantity, 0),
    }),
    { name: 'multi-shop-cart' },
  ),
);
