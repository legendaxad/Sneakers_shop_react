import type { OrderStatus } from '../enums/order.enum';
import type { DeliveryAddress } from './member';
import type { Product } from './product';

export interface OrderItem {
  _id: string;
  itemPrice: number;
  itemQuantity: number;
  itemSize?: number;
  orderId: string;
  productId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  _id: string;
  memberId: string;
  orderTotal: number;
  orderDelivery: number;
  orderStatus: OrderStatus;
  orderAddress?: DeliveryAddress;
  createdAt?: string;
  updatedAt?: string;
  orderItems?: OrderItem[];
  productData?: Product[];
}

/* ---------------------------- API inputs ---------------------------- */

/** Item sent to POST /order/create. Prices are calculated by the backend. */
export interface OrderItemInput {
  productId: string;
  itemQuantity: number;
  itemSize?: number;
}

/** POST /order/create */
export interface OrderInput {
  items: OrderItemInput[];
  deliveryAddress: DeliveryAddress;
  saveAddress?: boolean;
}

/** GET /order/all */
export interface OrderInquiry {
  page: number;
  limit: number;
  orderStatus?: OrderStatus;
}

/** POST /order/update */
export interface OrderUpdateInput {
  orderId: string;
  orderStatus: OrderStatus;
}
