import { createSelector } from '@reduxjs/toolkit';
import type { AppRootState } from '../../../lib/types/screen';

const selectCartPage = (state: AppRootState) => state.cartPage;

export const retrieveCartItems = createSelector(selectCartPage, (cartPage) => cartPage.cartItems);

/** Number of pairs in the cart (sum of quantities). */
export const retrieveCartCount = createSelector(retrieveCartItems, (items) =>
  items.reduce((total, item) => total + item.quantity, 0),
);

export const retrieveCartSubtotal = createSelector(retrieveCartItems, (items) =>
  items.reduce((total, item) => total + item.productPrice * item.quantity, 0),
);
