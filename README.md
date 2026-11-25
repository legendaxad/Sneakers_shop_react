# MULTI-SHOP — Customer Storefront

React 19 + TypeScript + Vite + Material UI storefront for the MultiShop Express/MongoDB backend (`../multi_shop`).

## Run locally

1. Start the backend (in `../multi_shop`): `npm run dev` — listens on `PORT` (3003 by default in this setup).
2. Start the shop (here): `npm install` then `npm start`.
3. Open **http://localhost:5173** — use exactly this origin. The backend's CORS allows only `CLIENT_ORIGIN`
   (default `http://localhost:5173`), so `127.0.0.1` or a LAN address will be blocked.

## Environment variables (names only)

| Variable | Where | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | frontend (optional) | Backend base URL, default `http://localhost:3003` |
| `MONGO_URL`, `PORT`, `SESSION_SECRET`, `SECRET_TOKEN` | backend | Database, port, admin session and customer JWT secrets |
| `CLIENT_ORIGIN` | backend (optional) | Allowed shop origin for CORS, default `http://localhost:5173` |
| `NODE_ENV` | backend (optional) | `production` adds `Secure` to the customer cookie (requires HTTPS) |

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Vite dev server |
| `npm run typecheck` | TypeScript project check |
| `npm run lint` | Oxlint |
| `npm test` | Vitest + Testing Library |
| `npm run build` | Typecheck and production build to `dist/` |

## Structure

Follows the BURAK React architecture: screen-based Redux Toolkit slices, a global session Context,
class-based API services and domain types in `lib/`.

```text
src/
  index.tsx                 providers: Redux → ContextProvider → MUI theme → MotionConfig → Router
  app/
    App.tsx                 navbar, routes (lazy screens, RequireAuth guards), footer, notifier
    store.ts                configureStore + makeStore(); hooks.ts = typed useAppDispatch/useAppSelector
    persistence.ts          cart / wishlist / recently viewed ⇄ localStorage
    context/                ContextProvider: session member, restore via GET /member/detail, 401 handling
    hooks/                  useGlobals (GlobalContext), useNotify, useProductsByIds, useDebouncedValue, ...
    service/                apiClient (axios, ApiError, interceptor) + MemberService, ProductService, OrderService
    auth/                   LoginPage, SignupPage, RequireAuth
    components/             headers/, footers/, notifier/ (slice + selector), shared/ (ProductCard, AddressForm, ...)
    screens/<name>Page/     index.tsx (+ screen components), slice.ts, selector.ts
                            homePage, productsPage (list + ChosenProduct), cartPage, checkoutPage,
                            ordersPage, userPage, wishlistPage, blogPage, notFoundPage
    MaterialTheme/
  lib/
    config.ts               API URL, shop constants, Messages
    enums/                  member, product, order (mirror the backend enums)
    types/                  member, product, order, cart, common, screen (Redux state shapes)
    data/                   local content: category presentation, Journal articles (not from a CMS)
    utils/                  formatting, cart, order and address helpers
  css/                      page-level stylesheets
public/                     icons/, img/, robots.txt
```

### State: where things live

| State | Where | Why |
| --- | --- | --- |
| Signed-in member, session status | `GlobalContext` (`useGlobals`) | App-wide session, needed by guards and the navbar |
| Server data per screen (products, orders, homepage blocks) | Redux screen slices, read via `selector.ts` | Shared across components of a screen and kept between visits |
| Cart, wishlist, recently viewed | Redux slices, persisted to localStorage | Browser-only (no backend cart); used across many screens |
| Loading/error flags, form fields, dialogs, tabs | local `useState` | Temporary UI state of one screen |

## How it talks to the backend

- Customer auth uses the backend's httpOnly `accessToken` cookie; the app never stores tokens.
- Prices, stock and shipping are calculated by the backend when an order is placed; the cart only shows estimates.
- Shoe sizes travel with each cart line and order item; stock (`productLeftCount`) is shared across sizes.
- Homepage data is live: category counts (`/product/count`), most viewed (`/product/all?order=productViews`,
  real view counts recorded once per logged-in member), top customers (`/member/top-users`, public fields only).
- Wishlist and recently viewed are stored in this browser (localStorage) and loaded with `/product/all?ids=…`,
  which does not record product views.
- Signup accepts an optional profile photo (`multipart/form-data`, JPG/PNG/WebP/GIF up to 5 MB).
- Animations use framer-motion with `MotionConfig reducedMotion="user"`; CSS transitions are disabled for
  `prefers-reduced-motion: reduce`.
