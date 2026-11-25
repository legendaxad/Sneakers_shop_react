import { beforeEach, describe, expect, it } from 'vitest';
import { ProductCollection, ProductStatus } from '../lib/enums/product.enum';
import type { Product } from '../lib/types/product';
import { cartItemKey } from '../lib/utils/cart';
import { retrieveCartCount, retrieveCartItems, retrieveCartSubtotal } from './screens/cartPage/selector';
import { addToCart, clearCart, removeFromCart, updateCartQuantity } from './screens/cartPage/slice';
import { retrieveRecentlyViewedIds } from './screens/productsPage/selector';
import { addRecentlyViewed, RECENTLY_VIEWED_LIMIT } from './screens/productsPage/slice';
import { retrieveWishlistIds } from './screens/wishlistPage/selector';
import { toggleWishlist } from './screens/wishlistPage/slice';
import { makeStore, type AppStore } from './store';

const product = (overrides: Partial<Product> = {}): Product => ({
  _id: 'p1',
  productName: 'Velocity Runner',
  productBrand: 'Stride',
  productCategory: ProductCollection.RUNNING,
  productPrice: 60,
  productDesc: '',
  productImages: ['uploads/products/a.jpg'],
  productSizes: [40, 41, 42],
  productLeftCount: 5,
  productStatus: ProductStatus.PROCESS,
  productViews: 0,
  ...overrides,
});

const oid = (n: number) => n.toString(16).padStart(24, '0');

let store: AppStore;
beforeEach(() => {
  localStorage.clear();
  store = makeStore();
});

describe('cartPage slice', () => {
  const items = () => retrieveCartItems(store.getState());

  it('adds a product and increases quantity for the same size', () => {
    store.dispatch(addToCart({ product: product(), size: 41, quantity: 1 }));
    store.dispatch(addToCart({ product: product(), size: 41, quantity: 2 }));
    expect(items()).toHaveLength(1);
    expect(items()[0]).toMatchObject({ key: cartItemKey('p1', 41), size: 41, quantity: 3 });
  });

  it('keeps the same product in different sizes as separate lines', () => {
    store.dispatch(addToCart({ product: product(), size: 41 }));
    store.dispatch(addToCart({ product: product(), size: 42 }));
    expect(items().map((item) => item.size)).toEqual([41, 42]);
    expect(retrieveCartCount(store.getState())).toBe(2);
    expect(retrieveCartSubtotal(store.getState())).toBe(120);
  });

  it('never exceeds the shared stock across sizes', () => {
    store.dispatch(addToCart({ product: product(), size: 41, quantity: 4 }));
    store.dispatch(addToCart({ product: product(), size: 42, quantity: 4 })); // only 1 left
    expect(items().find((item) => item.size === 42)?.quantity).toBe(1);
    store.dispatch(updateCartQuantity({ key: cartItemKey('p1', 41), quantity: 10 }));
    expect(items().find((item) => item.size === 41)?.quantity).toBe(4);
  });

  it('does not add sold-out products', () => {
    store.dispatch(addToCart({ product: product({ productLeftCount: 0 }), size: 41 }));
    expect(items()).toHaveLength(0);
  });

  it('updates quantity, removes at zero, removes and clears items', () => {
    store.dispatch(addToCart({ product: product(), size: 41, quantity: 2 }));
    store.dispatch(addToCart({ product: product({ _id: 'p2', productSizes: [] }), size: null }));
    store.dispatch(updateCartQuantity({ key: cartItemKey('p1', 41), quantity: 1 }));
    expect(items()[0].quantity).toBe(1);
    store.dispatch(updateCartQuantity({ key: cartItemKey('p1', 41), quantity: 0 }));
    expect(items().map((item) => item.productId)).toEqual(['p2']);
    store.dispatch(removeFromCart(cartItemKey('p2', null)));
    expect(items()).toHaveLength(0);
    store.dispatch(addToCart({ product: product(), size: 40 }));
    store.dispatch(clearCart());
    expect(items()).toHaveLength(0);
  });

  it('persists to localStorage and restores after a refresh', () => {
    store.dispatch(addToCart({ product: product(), size: 40, quantity: 2 }));
    const stored = JSON.parse(localStorage.getItem('multi-shop-cart') ?? '{}');
    expect(stored.version).toBe(2);
    expect(stored.state.items[0]).toMatchObject({ productId: 'p1', size: 40, quantity: 2 });

    // A refresh creates a new store that hydrates from storage.
    const refreshed = makeStore();
    expect(retrieveCartItems(refreshed.getState())[0]).toMatchObject({ size: 40, quantity: 2 });
  });

  it('restores carts saved by the previous (Zustand) version of the app', () => {
    // Exact format written by zustand/persist before the Redux migration.
    localStorage.setItem(
      'multi-shop-cart',
      JSON.stringify({
        state: {
          items: [
            { key: 'p1:41', productId: 'p1', productName: 'Old', productBrand: 'B', productPrice: 50, size: 41, quantity: 2, stock: 5 },
          ],
        },
        version: 2,
      }),
    );
    expect(retrieveCartItems(makeStore().getState())).toHaveLength(1);
  });

  it('ignores malformed or legacy stored carts', () => {
    localStorage.setItem('multi-shop-cart', JSON.stringify({ version: 2, state: { items: [{ productId: 'x' }, 'junk', null] } }));
    expect(retrieveCartItems(makeStore().getState())).toEqual([]);

    localStorage.setItem(
      'multi-shop-cart',
      JSON.stringify({ version: 0, state: { items: [{ productId: 'p1', productName: 'Old', productPrice: 1, quantity: 1 }] } }),
    );
    expect(retrieveCartItems(makeStore().getState())).toEqual([]);

    localStorage.setItem('multi-shop-cart', '{not json');
    expect(retrieveCartItems(makeStore().getState())).toEqual([]);
  });
});

describe('recently viewed (productsPage slice)', () => {
  const ids = () => retrieveRecentlyViewedIds(store.getState());

  it('keeps the most recent first without duplicates', () => {
    store.dispatch(addRecentlyViewed(oid(1)));
    store.dispatch(addRecentlyViewed(oid(2)));
    store.dispatch(addRecentlyViewed(oid(1)));
    expect(ids()).toEqual([oid(1), oid(2)]);
  });

  it('is capped at the limit', () => {
    for (let n = 1; n <= RECENTLY_VIEWED_LIMIT + 3; n += 1) store.dispatch(addRecentlyViewed(oid(n)));
    expect(ids()).toHaveLength(RECENTLY_VIEWED_LIMIT);
    expect(ids()[0]).toBe(oid(RECENTLY_VIEWED_LIMIT + 3));
  });

  it('persists across a refresh and drops malformed ids', () => {
    store.dispatch(addRecentlyViewed(oid(7)));
    expect(retrieveRecentlyViewedIds(makeStore().getState())).toEqual([oid(7)]);

    localStorage.setItem('multi-shop-recently-viewed', JSON.stringify({ version: 1, state: { ids: ['<script>', 42, oid(3), oid(3)] } }));
    expect(retrieveRecentlyViewedIds(makeStore().getState())).toEqual([oid(3)]);
  });
});

describe('wishlistPage slice', () => {
  const ids = () => retrieveWishlistIds(store.getState());

  it('toggles products on and off', () => {
    store.dispatch(toggleWishlist(oid(1)));
    store.dispatch(toggleWishlist(oid(2)));
    expect(ids()).toEqual([oid(2), oid(1)]);
    store.dispatch(toggleWishlist(oid(1)));
    expect(ids()).toEqual([oid(2)]);
  });

  it('survives a refresh', () => {
    store.dispatch(toggleWishlist(oid(5)));
    expect(retrieveWishlistIds(makeStore().getState())).toEqual([oid(5)]);
  });
});
