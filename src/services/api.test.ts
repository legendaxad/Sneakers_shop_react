import { AxiosError, AxiosHeaders } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError, getApiErrorMessage, orderApi, productApi, toApiError } from './api';
import { useAuthStore } from '../app/store';

const axiosError = (status: number, data: unknown, url = '/x') =>
  new AxiosError('fail', 'ERR', { url, headers: new AxiosHeaders() }, null, {
    status,
    data,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });

afterEach(() => vi.restoreAllMocks());

describe('API error handling', () => {
  it('sends credentials so the httpOnly cookie is included', () => {
    expect(api.defaults.withCredentials).toBe(true);
  });

  it('normalises backend error bodies including detail', () => {
    const error = toApiError(axiosError(409, { code: 409, message: 'Not enough stock for an item in your cart.', detail: 'Court King' }));
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(409);
    expect(getApiErrorMessage(error)).toBe('Not enough stock for an item in your cart. (Court King)');
  });

  it('reports network failures clearly', () => {
    const error = toApiError(new AxiosError('Network Error', 'ERR_NETWORK'));
    expect(error.status).toBe(0);
    expect(error.message).toMatch(/Cannot reach the shop server/);
  });

  it('treats "No data found" as an empty product list but rethrows other errors', async () => {
    vi.spyOn(api, 'get').mockRejectedValueOnce(toApiError(axiosError(404, { code: 404, message: 'No data found!' })));
    await expect(productApi.getProducts({ search: 'zzz' })).resolves.toEqual([]);

    vi.spyOn(api, 'get').mockRejectedValueOnce(toApiError(axiosError(500, { code: 500, message: 'Something went wrong!' })));
    await expect(productApi.getProducts()).rejects.toMatchObject({ status: 500 });
  });

  it('treats "No data found" as an empty order list', async () => {
    vi.spyOn(api, 'get').mockRejectedValueOnce(toApiError(axiosError(404, { code: 404, message: 'No data found!' })));
    await expect(orderApi.getOrders()).resolves.toEqual([]);
  });

  it('clears the local session when an authenticated call returns 401', async () => {
    useAuthStore.setState({ member: { _id: 'm' } as never, status: 'authenticated' });
    const rejected = api.interceptors.response as unknown as {
      handlers: { rejected: (error: unknown) => Promise<unknown> }[];
    };
    await expect(rejected.handlers[0].rejected(axiosError(401, { message: 'You are not authenticated!' }, '/order/all'))).rejects.toBeInstanceOf(ApiError);
    expect(useAuthStore.getState().status).toBe('guest');
  });
});
