import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '../constants';
import { useAuthStore } from '../app/store';
import type { ApiErrorShape } from '../types/api';
import type { AuthResponse, LoginInput, Member, ProfileUpdateInput, SignupInput, TopMember } from '../types/member';
import type { Order, OrderCreateInput, OrderStatus } from '../types/order';
import type { Product, ProductFilters } from '../types/product';

/** Customer auth uses the httpOnly `accessToken` cookie, so every request sends credentials. */
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

/** Normalised error used throughout the UI. */
export class ApiError extends Error {
  readonly status: number;
  readonly detail?: string;

  constructor(message: string, status: number, detail?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

const NO_DATA_MESSAGE = 'No data found!';

export const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorShape>;
    const status = axiosError.response?.status ?? 0;
    const data = axiosError.response?.data;
    if (!axiosError.response) {
      return new ApiError('Cannot reach the shop server. Please check your connection and try again.', 0);
    }
    const message =
      typeof data === 'object' && data?.message ? data.message : `Request failed with status ${status}.`;
    return new ApiError(message, status, typeof data === 'object' ? data?.detail : undefined);
  }
  return new ApiError('Unexpected error. Please try again.', 0);
};

/** Human-readable message, including the backend detail (e.g. which product is out of stock). */
export const getApiErrorMessage = (error: unknown): string => {
  const apiError = toApiError(error);
  return apiError.detail ? `${apiError.message} (${apiError.detail})` : apiError.message;
};

const isNoData = (error: ApiError) => error.status === 404 && error.message === NO_DATA_MESSAGE;

// A 401 on an authenticated call means the cookie expired or the account was blocked.
api.interceptors.response.use(undefined, (error: unknown) => {
  const apiError = toApiError(error);
  const url = axios.isAxiosError(error) ? (error.config?.url ?? '') : '';
  if (apiError.status === 401 && !url.includes('/member/login')) {
    if (useAuthStore.getState().member) useAuthStore.getState().clearMember();
  }
  return Promise.reject(apiError);
});

export const memberApi = {
  login: async (input: LoginInput): Promise<Member> => {
    const { data } = await api.post<AuthResponse>('/member/login', input);
    return data.member;
  },
  /** Sends multipart/form-data when a profile image is attached, JSON otherwise. */
  signup: async (input: SignupInput, file?: File): Promise<Member> => {
    if (file) {
      const form = new FormData();
      Object.entries(input).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') form.append(key, String(value));
      });
      form.append('memberImage', file);
      const { data } = await api.post<AuthResponse>('/member/signup', form);
      return data.member;
    }
    const { data } = await api.post<AuthResponse>('/member/signup', input);
    return data.member;
  },
  getTopUsers: async (): Promise<TopMember[]> => {
    const { data } = await api.get<TopMember[]>('/member/top-users');
    return data;
  },
  logout: async (): Promise<void> => {
    await api.post('/member/logout');
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
        if (value === undefined || value === null) return;
        form.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      });
      const { data } = await api.post<Member>('/member/update', form);
      return data;
    }
    const { data } = await api.post<Member>('/member/update', payload);
    return data;
  },
};

export const productApi = {
  /** Returns an empty list when nothing matches (backend answers 404 "No data found!"). */
  getProducts: async (filters: ProductFilters = {}): Promise<Product[]> => {
    try {
      const { data } = await api.get<Product[]>('/product/all', { params: filters });
      return data;
    } catch (error) {
      const apiError = toApiError(error);
      if (isNoData(apiError)) return [];
      throw apiError;
    }
  },
  getProductCount: async (filters: Omit<ProductFilters, 'page' | 'limit' | 'order'> = {}): Promise<number> => {
    const { data } = await api.get<{ total: number }>('/product/count', { params: filters });
    return data.total;
  },
  /**
   * Load specific products (wishlist, recently viewed) in the given order.
   * Uses /product/all?ids=… so no product views are recorded. Unavailable
   * products are simply absent from the result.
   */
  getProductsByIds: async (ids: string[]): Promise<Product[]> => {
    const unique = [...new Set(ids)].slice(0, 50);
    if (!unique.length) return [];
    const list = await productApi.getProducts({ ids: unique.join(','), page: 1, limit: 50 });
    const byId = new Map(list.map((product) => [product._id, product]));
    return unique.map((id) => byId.get(id)).filter((product): product is Product => !!product);
  },
  getProduct: async (id: string): Promise<Product> => {
    const { data } = await api.get<Product>(`/product/${encodeURIComponent(id)}`);
    return data;
  },
};

export const orderApi = {
  createOrder: async (input: OrderCreateInput): Promise<Order> => {
    const { data } = await api.post<Order>('/order/create', input);
    return data;
  },
  /** Returns an empty list when the customer has no (matching) orders. */
  getOrders: async (page = 1, limit = 10, orderStatus?: OrderStatus): Promise<Order[]> => {
    try {
      const { data } = await api.get<Order[]>('/order/all', { params: { page, limit, orderStatus } });
      return data;
    } catch (error) {
      const apiError = toApiError(error);
      if (isNoData(apiError)) return [];
      throw apiError;
    }
  },
  updateOrder: async (orderId: string, orderStatus: OrderStatus): Promise<Order> => {
    const { data } = await api.post<Order>('/order/update', { orderId, orderStatus });
    return data;
  },
};
