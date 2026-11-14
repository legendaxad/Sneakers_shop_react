import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import theme from './MaterialTheme';
import { useAuthStore, useCartStore } from './store';
import { ApiError, memberApi, orderApi, productApi } from '../services/api';
import type { Member } from '../types/member';
import { OrderStatus, type Order } from '../types/order';
import { ProductCollection, ProductStatus, type Product } from '../types/product';

vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/api')>();
  return {
    ...actual,
    memberApi: { login: vi.fn(), signup: vi.fn(), logout: vi.fn(), getProfile: vi.fn(), updateProfile: vi.fn() },
    productApi: { getProducts: vi.fn(), getProductCount: vi.fn(), getProduct: vi.fn() },
    orderApi: { createOrder: vi.fn(), getOrders: vi.fn(), updateOrder: vi.fn() },
  };
});

const member: Member = {
  _id: 'm1',
  memberType: 'USER',
  memberStatus: 'ACTIVE',
  memberNick: 'jordan88',
  memberPhone: '01012345678',
  memberPoint: 2,
  memberDeliveryAddress: {
    recipientName: 'Jordan Lee',
    phone: '+1 555 0100',
    addressLine1: '12 Market Street',
    city: 'Seoul',
    country: 'South Korea',
  },
};

const runner: Product = {
  _id: 'p1',
  productName: 'Velocity Runner',
  productBrand: 'Stride',
  productCategory: ProductCollection.RUNNING,
  productPrice: 60,
  productDesc: 'Light runner',
  productImages: [],
  productSizes: [42, 40, 41],
  productLeftCount: 5,
  productStatus: ProductStatus.PROCESS,
  productViews: 3,
};

const renderAt = (path: string) =>
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </ThemeProvider>,
  );

const loggedIn = () => vi.mocked(memberApi.getProfile).mockResolvedValue(member);
const loggedOut = () => vi.mocked(memberApi.getProfile).mockRejectedValue(new ApiError('You are not authenticated!', 401));

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({ member: null, status: 'checking' });
  useCartStore.setState({ items: [] });
  vi.mocked(productApi.getProducts).mockResolvedValue([runner]);
  vi.mocked(productApi.getProductCount).mockResolvedValue(1);
  vi.mocked(productApi.getProduct).mockResolvedValue(runner);
  vi.mocked(orderApi.getOrders).mockResolvedValue([]);
});

describe('authentication', () => {
  it('submits the login form to the API and signs the customer in', async () => {
    loggedOut();
    vi.mocked(memberApi.login).mockResolvedValue(member);
    renderAt('/login');
    const user = userEvent.setup();

    await user.type(await screen.findByLabelText(/nickname or phone/i), 'jordan88');
    await user.type(screen.getByLabelText(/^password/i), 'secret12');
    await user.click(screen.getByRole('button', { name: /^login$/i }));

    await waitFor(() => expect(memberApi.login).toHaveBeenCalledWith({ memberIdentity: 'jordan88', memberPassword: 'secret12' }));
    expect(useAuthStore.getState().member?.memberNick).toBe('jordan88');
  });

  it('shows the backend error for invalid credentials', async () => {
    loggedOut();
    vi.mocked(memberApi.login).mockRejectedValue(new ApiError('Wrong password!', 401));
    renderAt('/login');
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText(/nickname or phone/i), 'jordan88');
    await user.type(screen.getByLabelText(/^password/i), 'badpass1');
    await user.click(screen.getByRole('button', { name: /^login$/i }));
    expect(await screen.findByText('Wrong password!')).toBeInTheDocument();
  });

  it('validates signup fields before calling the API', async () => {
    loggedOut();
    renderAt('/signup');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: /create account/i }));
    expect(await screen.findByText(/nickname must be at least 2 characters/i)).toBeInTheDocument();
    expect(memberApi.signup).not.toHaveBeenCalled();
  });

  it('restores the session on refresh instead of redirecting a protected page to login', async () => {
    let resolveProfile: (value: Member) => void = () => {};
    vi.mocked(memberApi.getProfile).mockReturnValue(new Promise((resolve) => (resolveProfile = resolve)));
    renderAt('/orders');
    expect(screen.getByText(/restoring your session/i)).toBeInTheDocument();
    resolveProfile(member);
    expect(await screen.findByRole('heading', { name: /your orders/i })).toBeInTheDocument();
  });

  it('redirects guests from protected pages to login', async () => {
    loggedOut();
    renderAt('/checkout');
    expect(await screen.findByRole('heading', { name: /login to multi-shop/i })).toBeInTheDocument();
  });
});

describe('product detail and cart', () => {
  it('requires a size, then adds the chosen size to the cart', async () => {
    loggedOut();
    renderAt('/product/p1');
    const user = userEvent.setup();

    const addButton = await screen.findByRole('button', { name: /add to cart/i });
    await user.click(addButton);
    expect(screen.getByText(/please select a size/i)).toBeInTheDocument();
    expect(useCartStore.getState().items).toHaveLength(0);

    const sizes = within(screen.getByRole('group', { name: /size/i })).getAllByRole('button');
    expect(sizes.map((button) => button.textContent)).toEqual(['EU 40', 'EU 41', 'EU 42']);
    await user.click(screen.getByRole('button', { name: 'EU 41' }));
    await user.click(addButton);
    expect(useCartStore.getState().items[0]).toMatchObject({ productId: 'p1', size: 41, quantity: 1 });
  });

  it('shows a not-found state for missing products', async () => {
    loggedOut();
    vi.mocked(productApi.getProduct).mockRejectedValue(new ApiError('Product not found!', 404));
    renderAt('/product/missing');
    expect(await screen.findByRole('heading', { name: /product not found/i })).toBeInTheDocument();
  });

  it('shows selected sizes in the cart', async () => {
    loggedOut();
    useCartStore.getState().addItem(runner, 40, 1);
    useCartStore.getState().addItem(runner, 42, 2);
    renderAt('/cart');
    expect(await screen.findByText('Size EU 40')).toBeInTheDocument();
    expect(screen.getByText('Size EU 42')).toBeInTheDocument();
    expect(screen.getByText('3 items')).toBeInTheDocument();
  });
});

describe('checkout', () => {
  it('sends items with sizes and the address (no prices) and prevents duplicate submission', async () => {
    loggedIn();
    useCartStore.getState().addItem(runner, 41, 2);
    let resolveOrder: (order: Order) => void = () => {};
    vi.mocked(orderApi.createOrder).mockReturnValue(new Promise((resolve) => (resolveOrder = resolve)));
    renderAt('/checkout');
    // pointerEventsCheck: 0 lets the second click reach the (now disabled) button,
    // exercising the in-flight guard as well as the disabled state.
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    const placeOrder = await screen.findByRole('button', { name: /place order/i });
    expect(screen.getByLabelText(/street address/i)).toHaveValue('12 Market Street');
    await user.click(placeOrder);
    expect(screen.getByRole('button', { name: /placing order/i })).toBeDisabled();
    await user.click(placeOrder);
    expect(orderApi.createOrder).toHaveBeenCalledTimes(1);
    expect(orderApi.createOrder).toHaveBeenCalledWith({
      items: [{ productId: 'p1', itemQuantity: 2, itemSize: 41 }],
      deliveryAddress: member.memberDeliveryAddress,
      saveAddress: false,
    });

    resolveOrder({ _id: 'o123456', memberId: 'm1', orderTotal: 120, orderDelivery: 0, orderStatus: OrderStatus.PAUSE });
    expect(await screen.findByText(/your order #123456 was placed/i)).toBeInTheDocument();
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('validates the delivery address before submitting', async () => {
    loggedIn();
    vi.mocked(memberApi.getProfile).mockResolvedValue({ ...member, memberDeliveryAddress: undefined, memberAddress: '' });
    useCartStore.getState().addItem(runner, 41, 1);
    renderAt('/checkout');
    const user = userEvent.setup();
    await user.clear(await screen.findByLabelText(/full name/i));
    await user.click(screen.getByRole('button', { name: /place order/i }));
    expect(await screen.findByText(/please complete the delivery address/i)).toBeInTheDocument();
    expect(orderApi.createOrder).not.toHaveBeenCalled();
  });

  it('shows stock errors returned by the backend and allows retrying', async () => {
    loggedIn();
    useCartStore.getState().addItem(runner, 41, 1);
    vi.mocked(orderApi.createOrder).mockRejectedValue(new ApiError('Not enough stock for an item in your cart.', 409, 'Velocity Runner'));
    renderAt('/checkout');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: /place order/i }));
    expect(await screen.findByText('Not enough stock for an item in your cart. (Velocity Runner)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /place order/i })).toBeEnabled();
    expect(useCartStore.getState().items).toHaveLength(1);
  });
});

describe('order history', () => {
  it('shows purchased price, size, quantity, status and the address snapshot', async () => {
    loggedIn();
    vi.mocked(orderApi.getOrders).mockResolvedValue([
      {
        _id: 'order000abc123',
        memberId: 'm1',
        orderTotal: 125,
        orderDelivery: 5,
        orderStatus: OrderStatus.PAUSE,
        createdAt: '2026-11-01T10:00:00.000Z',
        orderAddress: { recipientName: 'Jordan Lee', phone: '+1 555 0100', addressLine1: '1 Old Road', city: 'Busan', country: 'South Korea' },
        orderItems: [{ _id: 'i1', productId: 'p1', itemPrice: 60, itemQuantity: 2, itemSize: 41, orderId: 'order000abc123' }],
        productData: [{ ...runner, productPrice: 99 }],
      },
    ]);
    renderAt('/orders');
    const card = await screen.findByRole('article', { name: /order abc123/i });
    expect(within(card).getByText('Velocity Runner')).toBeInTheDocument();
    expect(within(card).getByText(/Size EU 41 · 2 × \$60/)).toBeInTheDocument();
    expect(within(card).getByText('$120')).toBeInTheDocument(); // purchase price × qty, not current $99
    expect(within(card).getByText('Awaiting confirmation')).toBeInTheDocument();
    expect(within(card).getByText('1 Old Road')).toBeInTheDocument();
    expect(within(card).getByRole('button', { name: /cancel order/i })).toBeInTheDocument();
    expect(within(card).getByRole('button', { name: /confirm order/i })).toBeInTheDocument();
  });

  it('cancels an order after confirmation in a dialog', async () => {
    loggedIn();
    vi.mocked(orderApi.getOrders).mockResolvedValue([
      { _id: 'order1', memberId: 'm1', orderTotal: 65, orderDelivery: 5, orderStatus: OrderStatus.PAUSE, orderItems: [], productData: [] },
    ]);
    vi.mocked(orderApi.updateOrder).mockResolvedValue({} as Order);
    renderAt('/orders');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: /cancel order/i }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /cancel order/i }));
    await waitFor(() => expect(orderApi.updateOrder).toHaveBeenCalledWith('order1', OrderStatus.DELETED));
  });
});
