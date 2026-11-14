import { beforeEach, describe, expect, it } from 'vitest';
import {
  cartItemKey,
  RECENTLY_VIEWED_LIMIT,
  selectCartCount,
  selectCartSubtotal,
  useCartStore,
  useRecentlyViewedStore,
  useWishlistStore,
} from './store';
import { ProductCollection, ProductStatus, type Product } from '../types/product';

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

describe('cart store', () => {
  beforeEach(() => useCartStore.setState({ items: [] }));

  it('adds a product and increases quantity for the same size', () => {
    useCartStore.getState().addItem(product(), 41, 1);
    useCartStore.getState().addItem(product(), 41, 2);
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ key: cartItemKey('p1', 41), size: 41, quantity: 3 });
  });

  it('keeps the same product in different sizes as separate lines', () => {
    useCartStore.getState().addItem(product(), 41, 1);
    useCartStore.getState().addItem(product(), 42, 1);
    const { items } = useCartStore.getState();
    expect(items.map((item) => item.size)).toEqual([41, 42]);
    expect(selectCartCount(useCartStore.getState())).toBe(2);
    expect(selectCartSubtotal(useCartStore.getState())).toBe(120);
  });

  it('never exceeds the shared stock across sizes', () => {
    useCartStore.getState().addItem(product(), 41, 4);
    useCartStore.getState().addItem(product(), 42, 4); // only 1 left
    const { items } = useCartStore.getState();
    expect(items.find((item) => item.size === 42)?.quantity).toBe(1);
    useCartStore.getState().updateQuantity(cartItemKey('p1', 41), 10);
    expect(useCartStore.getState().items.find((item) => item.size === 41)?.quantity).toBe(4);
  });

  it('does not add sold-out products', () => {
    useCartStore.getState().addItem(product({ productLeftCount: 0 }), 41, 1);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('updates quantity, removes at zero and removes items', () => {
    useCartStore.getState().addItem(product(), 41, 2);
    useCartStore.getState().addItem(product({ _id: 'p2', productSizes: [] }), null, 1);
    useCartStore.getState().updateQuantity(cartItemKey('p1', 41), 1);
    expect(useCartStore.getState().items[0].quantity).toBe(1);
    useCartStore.getState().updateQuantity(cartItemKey('p1', 41), 0);
    expect(useCartStore.getState().items.map((item) => item.productId)).toEqual(['p2']);
    useCartStore.getState().removeItem(cartItemKey('p2', null));
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('persists to localStorage and restores after a refresh', async () => {
    useCartStore.getState().addItem(product(), 40, 2);
    const stored = JSON.parse(localStorage.getItem('multi-shop-cart') ?? '{}');
    expect(stored.version).toBe(2);
    expect(stored.state.items[0]).toMatchObject({ productId: 'p1', size: 40, quantity: 2 });

    // Simulate a refresh: in-memory state is gone, storage still holds the cart.
    const raw = localStorage.getItem('multi-shop-cart')!;
    useCartStore.setState({ items: [] });
    localStorage.setItem('multi-shop-cart', raw);
    await useCartStore.persist.rehydrate();
    expect(useCartStore.getState().items[0]).toMatchObject({ size: 40, quantity: 2 });
  });

  it('ignores malformed or legacy stored carts', async () => {
    localStorage.setItem(
      'multi-shop-cart',
      JSON.stringify({ version: 2, state: { items: [{ productId: 'x' }, 'junk', null] } }),
    );
    await useCartStore.persist.rehydrate();
    expect(useCartStore.getState().items).toEqual([]);

    localStorage.setItem(
      'multi-shop-cart',
      JSON.stringify({ version: 0, state: { items: [{ productId: 'p1', productName: 'Old', productPrice: 1, quantity: 1 }] } }),
    );
    await useCartStore.persist.rehydrate();
    expect(useCartStore.getState().items).toEqual([]);
  });
});

const oid = (n: number) => n.toString(16).padStart(24, '0');

describe('recently viewed store', () => {
  beforeEach(() => useRecentlyViewedStore.setState({ ids: [] }));

  it('keeps the most recent first without duplicates', () => {
    const { addViewed } = useRecentlyViewedStore.getState();
    addViewed(oid(1));
    addViewed(oid(2));
    addViewed(oid(1));
    expect(useRecentlyViewedStore.getState().ids).toEqual([oid(1), oid(2)]);
  });

  it('is capped at the limit', () => {
    for (let n = 1; n <= RECENTLY_VIEWED_LIMIT + 3; n += 1) useRecentlyViewedStore.getState().addViewed(oid(n));
    const { ids } = useRecentlyViewedStore.getState();
    expect(ids).toHaveLength(RECENTLY_VIEWED_LIMIT);
    expect(ids[0]).toBe(oid(RECENTLY_VIEWED_LIMIT + 3));
  });

  it('persists across a refresh and drops malformed ids', async () => {
    useRecentlyViewedStore.getState().addViewed(oid(7));
    const raw = localStorage.getItem('multi-shop-recently-viewed')!;
    useRecentlyViewedStore.setState({ ids: [] });
    localStorage.setItem('multi-shop-recently-viewed', raw);
    await useRecentlyViewedStore.persist.rehydrate();
    expect(useRecentlyViewedStore.getState().ids).toEqual([oid(7)]);

    localStorage.setItem('multi-shop-recently-viewed', JSON.stringify({ version: 1, state: { ids: ['<script>', 42, oid(3), oid(3)] } }));
    await useRecentlyViewedStore.persist.rehydrate();
    expect(useRecentlyViewedStore.getState().ids).toEqual([oid(3)]);
  });
});

describe('wishlist store', () => {
  beforeEach(() => useWishlistStore.setState({ ids: [] }));

  it('toggles products on and off', () => {
    const { toggleWishlist } = useWishlistStore.getState();
    expect(toggleWishlist(oid(1))).toBe(true);
    expect(toggleWishlist(oid(2))).toBe(true);
    expect(useWishlistStore.getState().ids).toEqual([oid(2), oid(1)]);
    expect(toggleWishlist(oid(1))).toBe(false);
    expect(useWishlistStore.getState().ids).toEqual([oid(2)]);
  });

  it('survives a refresh', async () => {
    useWishlistStore.getState().toggleWishlist(oid(5));
    const raw = localStorage.getItem('multi-shop-wishlist')!;
    useWishlistStore.setState({ ids: [] });
    localStorage.setItem('multi-shop-wishlist', raw);
    await useWishlistStore.persist.rehydrate();
    expect(useWishlistStore.getState().ids).toEqual([oid(5)]);
  });
});
