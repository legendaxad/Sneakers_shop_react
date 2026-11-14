import type { DeliveryAddress } from './member';
import type { Product } from './product';

export enum OrderStatus {
  PAUSE = 'PAUSE',
  DELETED = 'DELETED',
  FINISH = 'FINISH',
  PROCESS = 'PROCESS',
}

/** Item sent to POST /order/create. Prices are calculated by the backend. */
export interface OrderItemInput {
  productId: string;
  itemQuantity: number;
  itemSize?: number;
}

export interface OrderCreateInput {
  items: OrderItemInput[];
  deliveryAddress: DeliveryAddress;
  saveAddress?: boolean;
}

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
