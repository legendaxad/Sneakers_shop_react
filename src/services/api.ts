import axios from 'axios';
import type { Member, LoginInput, AuthResponse, SignupInput, ProfileUpdateInput } from '../types/member';
import type { Order, OrderItemInput } from '../types/order';
import type { Product, ProductFilters } from '../types/product';
import type { ApiErrorShape } from '../types/api';
import { API_BASE_URL } from '../constants';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const getApiErrorMessage = (error: unknown): string => {
  const detail = (error as { response?: { data?: ApiErrorShape } })?.response?.data;

  if (detail?.message) {
    return detail.message;
  }

  if (detail?.code) {
    return `Request failed with status ${detail.code}`;
  }

  return 'Unexpected error. Please try again.';
};

export const memberApi = {
  login: async (input: LoginInput): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/member/login', input);
    return data;
  },
  signup: async (input: SignupInput): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/member/signup', input);
    return data;
  },
  logout: async (): Promise<{ logout: boolean }> => {
    const { data } = await api.post<{ logout: boolean }>('/member/logout');
    return data;
  },
  getProfile: async (): Promise<Member> => {
    const { data } = await api.get<Member>('/member/detail');
    return data;
  },
  updateProfile: async (payload: ProfileUpdateInput, file?: File): Promise<Member> => {
    if (file) {
      const form = new FormData();
      form.append('memberImage', file);

      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          form.append(key, value);
        }
      });

      const { data } = await api.post<Member>('/member/update', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return data;
    }

    const { data } = await api.post<Member>('/member/update', payload);
    return data;
  },
};

export const productApi = {
  getProducts: async (filters: ProductFilters = {}): Promise<Product[]> => {
    const { data } = await api.get<Product[]>('/product/all', { params: filters });
    return data;
  },
  getProduct: async (id: string): Promise<Product> => {
    const { data } = await api.get<Product>(`/product/${id}`);
    return data;
  },
};

export const orderApi = {
  createOrder: async (items: OrderItemInput[]): Promise<Order> => {
    const { data } = await api.post<Order>('/order/create', items);
    return data;
  },
  getOrders: async (page = 1, limit = 10, orderStatus?: string): Promise<Order[]> => {
    const { data } = await api.get<Order[]>('/order/all', {
      params: { page, limit, orderStatus },
    });
    return data;
  },
  updateOrder: async (orderId: string, orderStatus: string): Promise<Order> => {
    const { data } = await api.post<Order>('/order/update', { orderId, orderStatus });
    return data;
  },
};
