import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '../constants';
import type { Order, OrderItem } from '../types/order';
import { OrderStatus } from '../types/order';
import type { Product } from '../types/product';

/** Estimated shipping shown in the cart; the backend calculates the final amount. */
export const calculateShipping = (subtotal: number): number =>
  subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD ? SHIPPING_FEE : 0;

export interface OrderLine {
  item: OrderItem;
  product?: Product;
  lineTotal: number;
}

/**
 * Pair each purchased item with its product using the stable product id.
 * (The aggregation's `productData` order is not related to `orderItems`.)
 */
export const buildOrderLines = (order: Order): OrderLine[] => {
  const products = new Map((order.productData ?? []).map((product) => [String(product._id), product]));
  return (order.orderItems ?? []).map((item) => ({
    item,
    product: products.get(String(item.productId)),
    lineTotal: item.itemPrice * item.itemQuantity,
  }));
};

export const orderStatusLabel: Record<OrderStatus, string> = {
  [OrderStatus.PAUSE]: 'Awaiting confirmation',
  [OrderStatus.PROCESS]: 'Processing',
  [OrderStatus.FINISH]: 'Completed',
  [OrderStatus.DELETED]: 'Cancelled',
};

/** Customer actions supported by the backend workflow (PAUSE → PROCESS | DELETED, PROCESS → FINISH). */
export const orderActions: Record<OrderStatus, { status: OrderStatus; label: string; tone: 'primary' | 'secondary' }[]> = {
  [OrderStatus.PAUSE]: [
    { status: OrderStatus.PROCESS, label: 'Confirm order', tone: 'primary' },
    { status: OrderStatus.DELETED, label: 'Cancel order', tone: 'secondary' },
  ],
  [OrderStatus.PROCESS]: [{ status: OrderStatus.FINISH, label: 'Mark as received', tone: 'primary' }],
  [OrderStatus.FINISH]: [],
  [OrderStatus.DELETED]: [],
};
