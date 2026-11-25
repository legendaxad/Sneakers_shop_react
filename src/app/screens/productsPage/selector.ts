import { createSelector } from '@reduxjs/toolkit';
import type { AppRootState } from '../../../lib/types/screen';

const selectProductsPage = (state: AppRootState) => state.productsPage;

export const retrieveProducts = createSelector(selectProductsPage, (productsPage) => productsPage.products);
export const retrieveProductTotal = createSelector(selectProductsPage, (productsPage) => productsPage.productTotal);
export const retrieveChosenProduct = createSelector(selectProductsPage, (productsPage) => productsPage.chosenProduct);
export const retrieveRecentlyViewedIds = createSelector(selectProductsPage, (productsPage) => productsPage.recentlyViewedIds);
