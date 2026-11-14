import { describe, expect, it } from 'vitest';
import { API_BASE_URL, PLACEHOLDER_IMAGE } from '../constants';
import { OrderStatus, type Order } from '../types/order';
import { ProductCollection, ProductStatus, type Product } from '../types/product';
import { cleanAddress, emptyAddress, validateAddress } from './address';
import { formatAddress, formatPrice, resolveImageUrl } from './format';
import { safeRedirect } from './navigation';
import { buildOrderLines, calculateShipping, orderActions } from './order';

const product = (id: string, name: string, price: number): Product => ({
  _id: id,
  productName: name,
  productBrand: 'Brand',
  productCategory: ProductCollection.RUNNING,
  productPrice: price,
  productDesc: '',
  productImages: [],
  productSizes: [40],
  productLeftCount: 3,
  productStatus: ProductStatus.PROCESS,
  productViews: 0,
});

describe('order helpers', () => {
  it('matches order items to products by id, not by array position', () => {
    const order: Order = {
      _id: 'o1',
      memberId: 'm1',
      orderTotal: 0,
      orderDelivery: 0,
      orderStatus: OrderStatus.PAUSE,
      orderItems: [
        { _id: 'i1', productId: 'a', itemPrice: 50, itemQuantity: 2, itemSize: 41, orderId: 'o1' },
        { _id: 'i2', productId: 'b', itemPrice: 20, itemQuantity: 1, orderId: 'o1' },
        { _id: 'i3', productId: 'a', itemPrice: 50, itemQuantity: 1, itemSize: 42, orderId: 'o1' },
      ],
      // Different order, deduplicated, and current prices differ from purchase prices
      productData: [product('b', 'Bravo', 999), product('a', 'Alpha', 999)],
    };
    const lines = buildOrderLines(order);
    expect(lines.map((line) => line.product?.productName)).toEqual(['Alpha', 'Bravo', 'Alpha']);
    expect(lines.map((line) => line.lineTotal)).toEqual([100, 20, 50]);
    expect(lines[2].item.itemSize).toBe(42);
  });

  it('handles missing products gracefully', () => {
    const lines = buildOrderLines({
      _id: 'o',
      memberId: 'm',
      orderTotal: 0,
      orderDelivery: 0,
      orderStatus: OrderStatus.FINISH,
      orderItems: [{ _id: 'i', productId: 'gone', itemPrice: 10, itemQuantity: 1, orderId: 'o' }],
      productData: [],
    });
    expect(lines[0].product).toBeUndefined();
  });

  it('mirrors the backend shipping rule', () => {
    expect(calculateShipping(0)).toBe(0);
    expect(calculateShipping(99.99)).toBe(5);
    expect(calculateShipping(100)).toBe(0);
  });

  it('only exposes the customer status transitions supported by the backend', () => {
    expect(orderActions[OrderStatus.PAUSE].map((a) => a.status)).toEqual([OrderStatus.PROCESS, OrderStatus.DELETED]);
    expect(orderActions[OrderStatus.PROCESS].map((a) => a.status)).toEqual([OrderStatus.FINISH]);
    expect(orderActions[OrderStatus.FINISH]).toEqual([]);
    expect(orderActions[OrderStatus.DELETED]).toEqual([]);
  });
});

describe('format helpers', () => {
  it('resolves backend upload paths and falls back to the placeholder', () => {
    expect(resolveImageUrl('uploads/products/a.jpg')).toBe(`${API_BASE_URL}/uploads/products/a.jpg`);
    expect(resolveImageUrl('./uploads\\members\\b.png')).toBe(`${API_BASE_URL}/uploads/members/b.png`);
    expect(resolveImageUrl('https://cdn.example.com/x.jpg')).toBe('https://cdn.example.com/x.jpg');
    expect(resolveImageUrl(undefined)).toBe(PLACEHOLDER_IMAGE);
  });

  it('formats prices with cents only when needed', () => {
    expect(formatPrice(60)).toBe('$60');
    expect(formatPrice(59.5)).toBe('$59.5');
  });

  it('formats addresses', () => {
    expect(
      formatAddress({ recipientName: 'Jo', phone: '+1 555', addressLine1: '1 Main', city: 'Seoul', country: 'KR', postalCode: '04524' }),
    ).toEqual(['Jo', '+1 555', '1 Main', 'Seoul, 04524', 'KR']);
  });

  it('only allows in-app redirects', () => {
    expect(safeRedirect('/checkout')).toBe('/checkout');
    expect(safeRedirect('//evil.example')).toBe('/');
    expect(safeRedirect('https://evil.example')).toBe('/');
    expect(safeRedirect(undefined)).toBe('/');
  });
});

describe('address validation', () => {
  it('requires the backend-required fields and a valid phone', () => {
    const errors = validateAddress({ ...emptyAddress, phone: 'abc' });
    expect(Object.keys(errors).sort()).toEqual(['addressLine1', 'city', 'country', 'phone', 'recipientName']);
  });

  it('accepts a complete address and strips empty optional fields', () => {
    const address = { ...emptyAddress, recipientName: ' Jo ', phone: '+82 10-1234-5678', addressLine1: '1 Main', city: 'Seoul', country: 'KR' };
    expect(validateAddress(address)).toEqual({});
    expect(cleanAddress(address)).toEqual({ recipientName: 'Jo', phone: '+82 10-1234-5678', addressLine1: '1 Main', city: 'Seoul', country: 'KR' });
  });
});
