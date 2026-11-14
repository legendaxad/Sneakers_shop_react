import type { Product } from './product';

export enum OrderStatus {
  PAUSE = 'PAUSE',
  DELETED = 'DELETED',
  FINISH = 'FINISH',
  PROCESS = 'PROCESS',
}

export interface OrderItemInput {
  itemQuantity: number;
  itemPrice: number;
  productId: string;
  orderId?: string;
}

export interface OrderItem {
  _id: string;
  itemPrice: number;
  itemQuantity: number;
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
  createdAt?: string;
  updatedAt?: string;
  orderItems?: OrderItem[];
  productData?: Product[];
}
