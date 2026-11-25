import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { addRecentlyViewed } from './screens/productsPage/slice';
import { toggleWishlist } from './screens/wishlistPage/slice';
import { ApiError } from './service/apiClient';
import MemberService from './service/MemberService';
import ProductService from './service/ProductService';
import { makeStore } from './store';
import { renderApp } from './testUtils';
import { DEFAULT_AVATAR } from '../lib/config';
import { BLOG_ARTICLES } from '../lib/data/blog';
import { MemberStatus, MemberType } from '../lib/enums/member.enum';
import { ProductCollection, ProductStatus } from '../lib/enums/product.enum';
import type { Member, TopMember } from '../lib/types/member';
import type { Product } from '../lib/types/product';

vi.mock('./service/MemberService');
vi.mock('./service/ProductService');
vi.mock('./service/OrderService');
const memberService = vi.mocked(MemberService.prototype);
const productService = vi.mocked(ProductService.prototype);

const oid = (n: number) => n.toString(16).padStart(24, '0');

const makeProduct = (n: number, overrides: Partial<Product> = {}): Product => ({
  _id: oid(n),
  productName: `Product ${n}`,
  productBrand: 'Stride',
  productCategory: ProductCollection.RUNNING,
  productPrice: 50 + n,
  productDesc: '',
  productImages: [],
  productSizes: [40, 41],
  productLeftCount: 5,
  productStatus: ProductStatus.PROCESS,
  productViews: 0,
  ...overrides,
});

const leaders: TopMember[] = [
  { _id: 'a', memberNick: 'sneakerhead', memberPoint: 12, memberImage: 'uploads/members/a.png' },
  { _id: 'b', memberNick: 'runner_kim', memberPoint: 7 },
];

/** Store with recently viewed ids (newest first, as given). */
const storeWithHistory = (ids: string[]) => {
  const store = makeStore();
  [...ids].reverse().forEach((id) => store.dispatch(addRecentlyViewed(id)));
  return store;
};

/** Store with wishlist ids (newest first, as given). */
const storeWithWishlist = (ids: string[]) => {
  const store = makeStore();
  [...ids].reverse().forEach((id) => store.dispatch(toggleWishlist(id)));
  return store;
};

beforeEach(() => {
  vi.clearAllMocks();
  memberService.getMemberDetail.mockRejectedValue(new ApiError('You are not authenticated!', 401));
  memberService.getTopUsers.mockResolvedValue(leaders);
  productService.getProductCount.mockImplementation(async (filters = {}) =>
    filters.productCollection === ProductCollection.RUNNING ? 3 : filters.productCollection === ProductCollection.BASKETBALL ? 1 : filters.productCollection ? 0 : 4,
  );
  productService.getProducts.mockImplementation(async (filters = {}) => {
    if (filters.order === 'productViews') {
      // Backend order: most viewed first; includes never-viewed products at the end.
      return [makeProduct(1, { productViews: 42 }), makeProduct(2, { productViews: 9 }), makeProduct(3, { productViews: 0 })];
    }
    return [makeProduct(10), makeProduct(11)];
  });
  productService.getProductsByIds.mockImplementation(async (ids) => ids.map((id) => makeProduct(parseInt(id, 16))));
  productService.getProduct.mockImplementation(async (id) => makeProduct(parseInt(id, 16)));
});

describe('homepage', () => {
  it('renders the hero with working calls to action', async () => {
    renderApp('/');
    expect(await screen.findByRole('heading', { level: 1, name: /run louder/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /shop now/i })).toHaveAttribute('href', '/shop');
    expect(screen.getByRole('link', { name: /explore collection/i })).toHaveAttribute('href', '/shop?collection=RUNNING');
    expect(await screen.findByText('Styles available')).toBeInTheDocument();
  });

  it('shows only categories that have products, linking to the filtered shop', async () => {
    renderApp('/');
    const section = (await screen.findByRole('heading', { name: /find your next pair/i })).closest('section')!;
    const running = await within(section).findByRole('link', { name: /running, 3 styles/i });
    expect(running).toHaveAttribute('href', '/shop?collection=RUNNING');
    expect(within(section).getByRole('link', { name: /basketball, 1 styles/i })).toHaveAttribute('href', '/shop?collection=BASKETBALL');
    expect(within(section).queryByRole('link', { name: /football/i })).not.toBeInTheDocument();
  });

  it('ranks most viewed products by real view counts and hides never-viewed products', async () => {
    renderApp('/');
    const section = (await screen.findByRole('heading', { name: /most viewed/i })).closest('section')!;
    const cards = await within(section).findAllByRole('article');
    expect(cards).toHaveLength(2);
    expect(within(cards[0]).getByText('#1')).toBeInTheDocument();
    expect(within(cards[0]).getByText('42 views')).toBeInTheDocument();
    expect(within(cards[1]).getByText('9 views')).toBeInTheDocument();
    expect(within(cards[0]).getByRole('link', { name: /view product/i })).toHaveAttribute('href', `/product/${oid(1)}`);
    expect(within(section).queryByText('Product 3')).not.toBeInTheDocument();
    expect(productService.getProducts).toHaveBeenCalledWith(expect.objectContaining({ order: 'productViews' }));
  });

  it('shows the top customers leaderboard with a default avatar fallback', async () => {
    renderApp('/');
    const list = await screen.findByRole('list', { name: /top customers by points/i });
    const rows = within(list).getAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText('sneakerhead')).toBeInTheDocument();
    expect(within(rows[0]).getByText('12')).toBeInTheDocument();
    expect(within(rows[1]).getByText('runner_kim')).toBeInTheDocument();
    expect(rows[1].querySelector('img')).toHaveAttribute('src', DEFAULT_AVATAR);
  });

  it('shows an empty state when no customer has points yet', async () => {
    memberService.getTopUsers.mockResolvedValue([]);
    renderApp('/');
    expect(await screen.findByText(/no leaders yet/i)).toBeInTheDocument();
  });

  it('lists recently viewed products from local history using current product data', async () => {
    renderApp('/', storeWithHistory([oid(21), oid(20)]));
    const section = (await screen.findByRole('heading', { name: /recently viewed/i })).closest('section')!;
    expect(await within(section).findByText('Product 21')).toBeInTheDocument();
    expect(productService.getProductsByIds).toHaveBeenCalledWith([oid(21), oid(20)]);
  });

  it('hides the recently viewed section when there is no history', async () => {
    renderApp('/');
    await screen.findByRole('heading', { name: /most viewed/i });
    expect(screen.queryByRole('heading', { name: /recently viewed/i })).not.toBeInTheDocument();
  });

  it('links journal cards to working article pages', async () => {
    renderApp('/');
    const user = userEvent.setup();
    const article = BLOG_ARTICLES[1];
    await user.click(await screen.findByRole('link', { name: `Read article: ${article.title}` }));
    expect(await screen.findByRole('heading', { level: 1, name: article.title })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: article.shopLink.label })).toHaveAttribute('href', article.shopLink.to);
  });
});

describe('recently viewed tracking', () => {
  it('records a product when its page loads', async () => {
    const { store } = renderApp(`/product/${oid(30)}`);
    await screen.findByRole('heading', { level: 1, name: 'Product 30' });
    await waitFor(() => expect(store.getState().productsPage.recentlyViewedIds[0]).toBe(oid(30)));
  });
});

describe('journal', () => {
  it('lists every article on /blog', async () => {
    renderApp('/blog');
    for (const article of BLOG_ARTICLES) {
      expect(await screen.findByRole('link', { name: `Read article: ${article.title}` })).toHaveAttribute('href', `/blog/${article.slug}`);
    }
  });

  it('shows a not-found state for unknown articles', async () => {
    renderApp('/blog/does-not-exist');
    expect(await screen.findByRole('heading', { name: /article not found/i })).toBeInTheDocument();
  });
});

describe('wishlist', () => {
  it('saves from the product page and lists the product on the wishlist page', async () => {
    const { store } = renderApp(`/product/${oid(40)}`);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: /save product 40 to wishlist/i }));
    expect(store.getState().wishlistPage.wishlistIds).toEqual([oid(40)]);
    expect(screen.getByRole('button', { name: /remove product 40 from wishlist/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows saved products and removes them', async () => {
    const { store } = renderApp('/wishlist', storeWithWishlist([oid(50), oid(51)]));
    const user = userEvent.setup();
    expect(await screen.findByText('Product 50')).toBeInTheDocument();
    expect(screen.getByText('Product 51')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /remove product 50 from wishlist/i }));
    expect(store.getState().wishlistPage.wishlistIds).toEqual([oid(51)]);
    await waitFor(() => expect(screen.queryByText('Product 50')).not.toBeInTheDocument());
  });

  it('flags saved products that are no longer available', async () => {
    productService.getProductsByIds.mockResolvedValue([makeProduct(60)]);
    const { store } = renderApp('/wishlist', storeWithWishlist([oid(60), oid(61)]));
    const user = userEvent.setup();
    expect(await screen.findByText(/1 saved product is no longer available/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^remove$/i }));
    expect(store.getState().wishlistPage.wishlistIds).toEqual([oid(60)]);
  });

  it('shows an empty state', async () => {
    renderApp('/wishlist');
    expect(await screen.findByRole('heading', { name: /your wishlist is empty/i })).toBeInTheDocument();
  });
});

describe('signup profile photo', () => {
  const member: Member = {
    _id: 'm1',
    memberType: MemberType.USER,
    memberStatus: MemberStatus.ACTIVE,
    memberNick: 'new_user',
    memberPhone: '01012345678',
    memberPoint: 0,
  };

  const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.type(await screen.findByLabelText(/nickname/i), 'new_user');
    await user.type(screen.getByLabelText(/phone number/i), '01012345678');
    await user.type(screen.getByLabelText(/^password/i), 'secret12');
  };

  it('previews, validates and uploads the selected photo', async () => {
    memberService.signup.mockResolvedValue({ ...member, memberImage: 'uploads/members/x.png' });
    renderApp('/signup');
    const user = userEvent.setup({ applyAccept: false });
    const input = await screen.findByLabelText(/profile photo$/i);

    await user.upload(input, new File(['%PDF'], 'doc.pdf', { type: 'application/pdf' }));
    expect(screen.getByText(/please choose a jpg, png, webp or gif image/i)).toBeInTheDocument();
    expect(screen.getByAltText(/default profile avatar/i)).toBeInTheDocument();

    const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big.png', { type: 'image/png' });
    await user.upload(input, big);
    expect(screen.getByText(/smaller than 5 mb/i)).toBeInTheDocument();

    const photo = new File(['png'], 'me.png', { type: 'image/png' });
    await user.upload(input, photo);
    expect(screen.getByAltText(/selected profile photo preview/i)).toHaveAttribute('src', 'blob:preview');
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() =>
      expect(memberService.signup).toHaveBeenCalledWith(
        expect.objectContaining({ memberNick: 'new_user', memberPhone: '01012345678', memberPassword: 'secret12' }),
        photo,
      ),
    );
    const sentFields = memberService.signup.mock.calls[0][0] as unknown as Record<string, unknown>;
    expect(sentFields).not.toHaveProperty('memberType');
    expect(sentFields).not.toHaveProperty('memberStatus');
    expect(sentFields).not.toHaveProperty('memberPoint');
  });

  it('signs up without a photo and allows removing a selected one', async () => {
    memberService.signup.mockResolvedValue(member);
    renderApp('/signup');
    const user = userEvent.setup();
    expect(await screen.findByAltText(/default profile avatar/i)).toHaveAttribute('src', DEFAULT_AVATAR);
    await user.upload(screen.getByLabelText(/profile photo$/i), new File(['png'], 'me.png', { type: 'image/png' }));
    await user.click(screen.getByRole('button', { name: /remove/i }));
    expect(screen.getByAltText(/default profile avatar/i)).toBeInTheDocument();

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => expect(memberService.signup).toHaveBeenCalledWith(expect.any(Object), undefined));
  });
});
