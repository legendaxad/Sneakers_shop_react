import { AxiosError, AxiosHeaders } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError, getApiErrorMessage, setUnauthorizedHandler, toApiError } from './apiClient';
import MemberService from './MemberService';
import OrderService from './OrderService';
import ProductService from './ProductService';
import { OrderStatus } from '../../lib/enums/order.enum';

const memberService = new MemberService();
const productService = new ProductService();
const orderService = new OrderService();

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
    await expect(productService.getProducts({ search: 'zzz' })).resolves.toEqual([]);

    vi.spyOn(api, 'get').mockRejectedValueOnce(toApiError(axiosError(500, { code: 500, message: 'Something went wrong!' })));
    await expect(productService.getProducts()).rejects.toMatchObject({ status: 500 });
  });

  it('treats "No data found" as an empty order list', async () => {
    vi.spyOn(api, 'get').mockRejectedValueOnce(toApiError(axiosError(404, { code: 404, message: 'No data found!' })));
    await expect(orderService.getMyOrders({ page: 1, limit: 10 })).resolves.toEqual([]);
  });

  it('ends the session when an authenticated call returns 401, but not for a failed login', async () => {
    const onUnauthorized = vi.fn();
    const unregister = setUnauthorizedHandler(onUnauthorized);
    const rejected = (api.interceptors.response as unknown as {
      handlers: { rejected: (error: unknown) => Promise<unknown> }[];
    }).handlers[0].rejected;

    await expect(rejected(axiosError(401, { message: 'Wrong password!' }, '/member/login'))).rejects.toBeInstanceOf(ApiError);
    expect(onUnauthorized).not.toHaveBeenCalled();

    await expect(rejected(axiosError(401, { message: 'You are not authenticated!' }, '/order/all'))).rejects.toBeInstanceOf(ApiError);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);

    unregister();
    await expect(rejected(axiosError(401, {}, '/order/all'))).rejects.toBeInstanceOf(ApiError);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });
});

describe('services', () => {
  it('sends signup as multipart/form-data when a photo is attached', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: { member: { memberNick: 'x' } } });
    const photo = new File(['png'], 'me.png', { type: 'image/png' });
    await memberService.signup({ memberNick: 'x', memberPhone: '01012345678', memberPassword: 'secret12', memberAddress: '' }, photo);
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
    await memberService.signup({ memberNick: 'x', memberPhone: '01012345678', memberPassword: 'secret12' });
    expect(post.mock.calls[0][1]).not.toBeInstanceOf(FormData);
  });

  it('keeps cleared fields and JSON-encodes the address when updating with a photo', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: { memberNick: 'x' } });
    const photo = new File(['png'], 'me.png', { type: 'image/png' });
    const address = { recipientName: 'A', phone: '1234567', addressLine1: 'L1', city: 'C', country: 'K' };
    await memberService.updateMember({ memberDesc: '', memberDeliveryAddress: address }, photo);
    const [url, body] = post.mock.calls[0];
    expect(url).toBe('/member/update');
    const form = body as FormData;
    expect(form.get('memberImage')).toBe(photo);
    expect(form.get('memberDesc')).toBe('');
    expect(JSON.parse(String(form.get('memberDeliveryAddress')))).toEqual(address);
  });

  it('sends order inquiries and updates in the backend format', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: [] });
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: {} });
    await orderService.getMyOrders({ page: 2, limit: 10, orderStatus: OrderStatus.PAUSE });
    expect(get).toHaveBeenCalledWith('/order/all', { params: { page: 2, limit: 10, orderStatus: 'PAUSE' } });
    await orderService.updateOrder({ orderId: 'o1', orderStatus: OrderStatus.DELETED });
    expect(post).toHaveBeenCalledWith('/order/update', { orderId: 'o1', orderStatus: 'DELETED' });
  });

  it('loads products by id in the requested order via /product/all (no view tracking)', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: [{ _id: 'b' }, { _id: 'a' }] });
    const products = await productService.getProductsByIds(['a', 'b', 'gone', 'a']);
    expect(get).toHaveBeenCalledWith('/product/all', { params: { ids: 'a,b,gone', page: 1, limit: 50 } });
    expect(products.map((p) => p._id)).toEqual(['a', 'b']);
  });

  it('skips the request when there are no ids', async () => {
    const get = vi.spyOn(api, 'get');
    await expect(productService.getProductsByIds([])).resolves.toEqual([]);
    expect(get).not.toHaveBeenCalled();
  });
});
