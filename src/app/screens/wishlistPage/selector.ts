import { createSelector } from '@reduxjs/toolkit';
import type { AppRootState } from '../../../lib/types/screen';

const selectWishlistPage = (state: AppRootState) => state.wishlistPage;

export const retrieveWishlistIds = createSelector(selectWishlistPage, (wishlistPage) => wishlistPage.wishlistIds);
export const retrieveWishlistCount = createSelector(retrieveWishlistIds, (ids) => ids.length);
