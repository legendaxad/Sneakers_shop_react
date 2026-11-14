# MULTI-SHOP — Customer Storefront

React 19 + TypeScript + Vite + Material UI storefront for the MultiShop Express/MongoDB backend (`../multi_shop`).

## Run locally

1. Start the backend (in `../multi_shop`): `npm run dev` — listens on `PORT` (3003 by default in this setup).
2. Start the shop (here): `npm install` then `npm run dev`.
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
| `npm run dev` | Vite dev server |
| `npm run typecheck` | TypeScript project check |
| `npm run lint` | Oxlint |
| `npm test` | Vitest + Testing Library |
| `npm run build` | Typecheck and production build to `dist/` |

## Structure

```text
src/
  index.tsx            entry: ThemeProvider, CssBaseline, router
  app/                 App (routes, session restore), store (auth, cart, wishlist, recently viewed, notices), hooks, MaterialTheme
  components/          layout (Header, Footer, Layout) and common UI (ProductCard, AddressForm, Reveal, ...)
  data/                local content: categories presentation, Journal articles (not from a CMS)
  pages/               home (sections), shop, product, auth, cart, checkout, profile, orders, wishlist, blog, not-found
  services/api.ts      all HTTP calls (axios, withCredentials) and error normalisation
  types/               API data types
  utils/               formatting, order and address helpers
  css/                 page-level stylesheets
public/                icons/, img/, robots.txt
```

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
