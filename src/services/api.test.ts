import { AxiosError, AxiosHeaders } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError, getApiErrorMessage, memberApi, orderApi, productApi, toApiError } from './api';
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

describe('new API helpers', () => {
  it('sends signup as multipart/form-data when a photo is attached', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: { member: { memberNick: 'x' } } });
    const photo = new File(['png'], 'me.png', { type: 'image/png' });
    await memberApi.signup({ memberNick: 'x', memberPhone: '01012345678', memberPassword: 'secret12', memberAddress: '' }, photo);
    const [url, body] = post.mock.calls[0];
    expect(url).toBe('/member/signup');
    expect(body).toBeInstanceOf(FormData);
    const form = body as FormData;
    expect(form.get('memberImage')).toBe(photo);
    expect(form.get('memberNick')).toBe('x');
    expect(form.has('memberAddress')).toBe(false);
  });

  it('sends JSON signup without a photo', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: { member: { memberNick: 'x' } } });
    await memberApi.signup({ memberNick: 'x', memberPhone: '01012345678', memberPassword: 'secret12' });
    expect(post.mock.calls[0][1]).not.toBeInstanceOf(FormData);
  });

  it('loads products by id in the requested order via /product/all (no view tracking)', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: [{ _id: 'b' }, { _id: 'a' }] });
    const products = await productApi.getProductsByIds(['a', 'b', 'gone', 'a']);
    expect(get).toHaveBeenCalledWith('/product/all', { params: { ids: 'a,b,gone', page: 1, limit: 50 } });
    expect(products.map((p) => p._id)).toEqual(['a', 'b']);
  });

  it('skips the request when there are no ids', async () => {
    const get = vi.spyOn(api, 'get');
    await expect(productApi.getProductsByIds([])).resolves.toEqual([]);
    expect(get).not.toHaveBeenCalled();
  });
});
