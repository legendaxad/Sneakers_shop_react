import { createSelector } from '@reduxjs/toolkit';
import type { AppRootState } from '../../../lib/types/screen';

const selectHomePage = (state: AppRootState) => state.homePage;

export const retrieveNewArrivals = createSelector(selectHomePage, (homePage) => homePage.newArrivals);
export const retrieveMostViewed = createSelector(selectHomePage, (homePage) => homePage.mostViewed);
export const retrieveTopUsers = createSelector(selectHomePage, (homePage) => homePage.topUsers);
export const retrieveProductTotal = createSelector(selectHomePage, (homePage) => homePage.productTotal);
export const retrieveCategoryCounts = createSelector(selectHomePage, (homePage) => homePage.categoryCounts);
