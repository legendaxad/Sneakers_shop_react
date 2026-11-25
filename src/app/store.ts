import { combineReducers, configureStore, type Action, type ThunkAction } from '@reduxjs/toolkit';
import type { AppRootState } from '../lib/types/screen';
import NoticeReducer from './components/notifier/slice';
import { createPersistListener, loadPersistedState } from './persistence';
import CartPageReducer from './screens/cartPage/slice';
import HomePageReducer from './screens/homePage/slice';
import OrdersPageReducer from './screens/ordersPage/slice';
import ProductsPageReducer from './screens/productsPage/slice';
import WishlistPageReducer from './screens/wishlistPage/slice';

const rootReducer = combineReducers({
  homePage: HomePageReducer,
  productsPage: ProductsPageReducer,
  cartPage: CartPageReducer,
  ordersPage: OrdersPageReducer,
  wishlistPage: WishlistPageReducer,
  notice: NoticeReducer,
});

/**
 * Creates a store hydrated from localStorage (cart, wishlist, recently viewed)
 * that writes those parts back whenever they change. Tests call it to get a
 * fresh, isolated store per render.
 */
export const makeStore = (preloadedState: Partial<AppRootState> = loadPersistedState()) => {
  const store = configureStore({ reducer: rootReducer, preloadedState });
  store.subscribe(createPersistListener(store.getState));
  return store;
};

export const store = makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
/** Same shape as `AppRootState` in lib/types/screen.ts (checked below). */
export type RootState = ReturnType<typeof rootReducer>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;

// Compile-time guard: the reducer map and the documented AppRootState must not drift apart.
type Exact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
export const ROOT_STATE_MATCHES: Exact<RootState, AppRootState> = true;
