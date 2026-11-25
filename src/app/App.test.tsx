import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { addToCart } from './screens/cartPage/slice';
import { ApiError } from './service/apiClient';
import MemberService from './service/MemberService';
import OrderService from './service/OrderService';
import ProductService from './service/ProductService';
import { makeStore } from './store';
import { renderApp } from './testUtils';
import { MemberStatus, MemberType } from '../lib/enums/member.enum';
import { OrderStatus } from '../lib/enums/order.enum';
import { ProductCollection, ProductStatus } from '../lib/enums/product.enum';
import type { Member } from '../lib/types/member';
import type { Order } from '../lib/types/order';
import type { Product } from '../lib/types/product';

// Automock the service classes: every prototype method becomes a vi.fn().
vi.mock('./service/MemberService');
vi.mock('./service/ProductService');
vi.mock('./service/OrderService');
const memberService = vi.mocked(MemberService.prototype);
const productService = vi.mocked(ProductService.prototype);
const orderService = vi.mocked(OrderService.prototype);

const member: Member = {
  _id: 'm1',
  memberType: MemberType.USER,
  memberStatus: MemberStatus.ACTIVE,
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

const loggedIn = () => memberService.getMemberDetail.mockResolvedValue(member);
const loggedOut = () => memberService.getMemberDetail.mockRejectedValue(new ApiError('You are not authenticated!', 401));

/** A store whose cart already holds the given lines. */
const storeWithCart = (...lines: [Product, number, number][]) => {
  const store = makeStore();
  lines.forEach(([product, size, quantity]) => store.dispatch(addToCart({ product, size, quantity })));
  return store;
};

beforeEach(() => {
  vi.clearAllMocks();
  memberService.getTopUsers.mockResolvedValue([]);
  productService.getProducts.mockResolvedValue([runner]);
  productService.getProductCount.mockResolvedValue(1);
  productService.getProduct.mockResolvedValue(runner);
  productService.getProductsByIds.mockResolvedValue([]);
  orderService.getMyOrders.mockResolvedValue([]);
});

describe('authentication', () => {
  it('submits the login form to the API and signs the customer in', async () => {
    loggedOut();
    memberService.login.mockResolvedValue(member);
    renderApp('/login');
    const user = userEvent.setup();

    await user.type(await screen.findByLabelText(/nickname or phone/i), 'jordan88');
    await user.type(screen.getByLabelText(/^password/i), 'secret12');
    await user.click(screen.getByRole('button', { name: /^login$/i }));

    await waitFor(() => expect(memberService.login).toHaveBeenCalledWith({ memberIdentity: 'jordan88', memberPassword: 'secret12' }));
    // The session member (GlobalContext) is shown in the navbar.
    expect(await screen.findByRole('link', { name: 'jordan88' })).toHaveAttribute('href', '/profile');
  });

  it('shows the backend error for invalid credentials', async () => {
    loggedOut();
    memberService.login.mockRejectedValue(new ApiError('Wrong password!', 401));
    renderApp('/login');
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText(/nickname or phone/i), 'jordan88');
    await user.type(screen.getByLabelText(/^password/i), 'badpass1');
    await user.click(screen.getByRole('button', { name: /^login$/i }));
    expect(await screen.findByText('Wrong password!')).toBeInTheDocument();
  });

  it('validates signup fields before calling the API', async () => {
    loggedOut();
    renderApp('/signup');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: /create account/i }));
    expect(await screen.findByText(/nickname must be at least 2 characters/i)).toBeInTheDocument();
    expect(memberService.signup).not.toHaveBeenCalled();
  });

  it('restores the session on refresh instead of redirecting a protected page to login', async () => {
    let resolveProfile: (value: Member) => void = () => {};
    memberService.getMemberDetail.mockReturnValue(new Promise((resolve) => (resolveProfile = resolve)));
    renderApp('/orders');
    expect(screen.getByText(/restoring your session/i)).toBeInTheDocument();
    resolveProfile(member);
    expect(await screen.findByRole('heading', { name: /your orders/i })).toBeInTheDocument();
  });

  it('redirects guests from protected pages to login', async () => {
    loggedOut();
    renderApp('/checkout');
    expect(await screen.findByRole('heading', { name: /login to multi-shop/i })).toBeInTheDocument();
  });
});

describe('product detail and cart', () => {
  it('requires a size, then adds the chosen size to the cart', async () => {
    loggedOut();
    const { store } = renderApp('/product/p1');
    const user = userEvent.setup();

    const addButton = await screen.findByRole('button', { name: /add to cart/i });
    await user.click(addButton);
    expect(screen.getByText(/please select a size/i)).toBeInTheDocument();
    expect(store.getState().cartPage.cartItems).toHaveLength(0);

    const sizes = within(screen.getByRole('group', { name: /size/i })).getAllByRole('button');
    expect(sizes.map((button) => button.textContent)).toEqual(['EU 40', 'EU 41', 'EU 42']);
    await user.click(screen.getByRole('button', { name: 'EU 41' }));
    await user.click(addButton);
    expect(store.getState().cartPage.cartItems[0]).toMatchObject({ productId: 'p1', size: 41, quantity: 1 });
  });

  it('shows a not-found state for missing products', async () => {
    loggedOut();
    productService.getProduct.mockRejectedValue(new ApiError('Product not found!', 404));
    renderApp('/product/missing');
    expect(await screen.findByRole('heading', { name: /product not found/i })).toBeInTheDocument();
  });

  it('shows selected sizes in the cart', async () => {
    loggedOut();
    renderApp('/cart', storeWithCart([runner, 40, 1], [runner, 42, 2]));
    expect(await screen.findByText('Size EU 40')).toBeInTheDocument();
    expect(screen.getByText('Size EU 42')).toBeInTheDocument();
    expect(screen.getByText('3 items')).toBeInTheDocument();
  });
});

describe('checkout', () => {
  it('sends items with sizes and the address (no prices) and prevents duplicate submission', async () => {
    loggedIn();
    let resolveOrder: (order: Order) => void = () => {};
    orderService.createOrder.mockReturnValue(new Promise((resolve) => (resolveOrder = resolve)));
    const { store } = renderApp('/checkout', storeWithCart([runner, 41, 2]));
    // pointerEventsCheck: 0 lets the second click reach the (now disabled) button,
    // exercising the in-flight guard as well as the disabled state.
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    const placeOrder = await screen.findByRole('button', { name: /place order/i });
    expect(screen.getByLabelText(/street address/i)).toHaveValue('12 Market Street');
    await user.click(placeOrder);
    expect(screen.getByRole('button', { name: /placing order/i })).toBeDisabled();
    await user.click(placeOrder);
    expect(orderService.createOrder).toHaveBeenCalledTimes(1);
    expect(orderService.createOrder).toHaveBeenCalledWith({
      items: [{ productId: 'p1', itemQuantity: 2, itemSize: 41 }],
      deliveryAddress: member.memberDeliveryAddress,
      saveAddress: false,
    });

    resolveOrder({ _id: 'o123456', memberId: 'm1', orderTotal: 120, orderDelivery: 0, orderStatus: OrderStatus.PAUSE });
    expect(await screen.findByText(/your order #123456 was placed/i)).toBeInTheDocument();
    expect(store.getState().cartPage.cartItems).toHaveLength(0);
  });

  it('validates the delivery address before submitting', async () => {
    loggedIn();
    memberService.getMemberDetail.mockResolvedValue({ ...member, memberDeliveryAddress: undefined, memberAddress: '' });
    renderApp('/checkout', storeWithCart([runner, 41, 1]));
    const user = userEvent.setup();
    await user.clear(await screen.findByLabelText(/full name/i));
    await user.click(screen.getByRole('button', { name: /place order/i }));
    expect(await screen.findByText(/please complete the delivery address/i)).toBeInTheDocument();
    expect(orderService.createOrder).not.toHaveBeenCalled();
  });

  it('shows stock errors returned by the backend and allows retrying', async () => {
    loggedIn();
    orderService.createOrder.mockRejectedValue(new ApiError('Not enough stock for an item in your cart.', 409, 'Velocity Runner'));
    const { store } = renderApp('/checkout', storeWithCart([runner, 41, 1]));
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: /place order/i }));
    expect(await screen.findByText('Not enough stock for an item in your cart. (Velocity Runner)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /place order/i })).toBeEnabled();
    expect(store.getState().cartPage.cartItems).toHaveLength(1);
  });
});

describe('order history', () => {
  it('shows purchased price, size, quantity, status and the address snapshot', async () => {
    loggedIn();
    orderService.getMyOrders.mockResolvedValue([
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
    renderApp('/orders');
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
    orderService.getMyOrders.mockResolvedValue([
      { _id: 'order1', memberId: 'm1', orderTotal: 65, orderDelivery: 5, orderStatus: OrderStatus.PAUSE, orderItems: [], productData: [] },
    ]);
    orderService.updateOrder.mockResolvedValue({} as Order);
    renderApp('/orders');
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: /cancel order/i }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /cancel order/i }));
    await waitFor(() => expect(orderService.updateOrder).toHaveBeenCalledWith({ orderId: 'order1', orderStatus: OrderStatus.DELETED }));
    expect(await screen.findByRole('tab', { name: /cancelled/i })).toHaveAttribute('aria-selected', 'true');
  });

  it('switches to the tab of the new status after an action', async () => {
    loggedIn();
    orderService.getMyOrders.mockResolvedValue([
      { _id: 'order2', memberId: 'm1', orderTotal: 65, orderDelivery: 5, orderStatus: OrderStatus.PAUSE, orderItems: [], productData: [] },
    ]);
    orderService.updateOrder.mockResolvedValue({} as Order);
    renderApp('/orders');
    const user = userEvent.setup();
    expect(await screen.findByRole('tab', { name: /^all$/i })).toHaveAttribute('aria-selected', 'true');

    await user.click(await screen.findByRole('button', { name: /confirm order/i }));
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: /confirm order/i }));

    expect(await screen.findByRole('tab', { name: /processing/i })).toHaveAttribute('aria-selected', 'true');
    await waitFor(() =>
      expect(orderService.getMyOrders).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, orderStatus: OrderStatus.PROCESS })),
    );
  });
});
