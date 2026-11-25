import type { Order, OrderInput, OrderInquiry, OrderUpdateInput } from '../../lib/types/order';
import { api, isNoData, toApiError } from './apiClient';

/** Order endpoints (/order/*); all require the session cookie. */
class OrderService {
  public async createOrder(input: OrderInput): Promise<Order> {
    const { data } = await api.post<Order>('/order/create', input);
    return data;
  }

  /** The member's orders; an empty list when there are none (matching). */
  public async getMyOrders(input: OrderInquiry): Promise<Order[]> {
    try {
      const { data } = await api.get<Order[]>('/order/all', { params: input });
      return data;
    } catch (err) {
      const error = toApiError(err);
      if (isNoData(error)) return [];
      throw error;
    }
  }

  public async updateOrder(input: OrderUpdateInput): Promise<Order> {
    const { data } = await api.post<Order>('/order/update', input);
    return data;
  }
}

export default OrderService;
