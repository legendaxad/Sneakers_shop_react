import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '../../../lib/types/product';
import type { ProductsPageState } from '../../../lib/types/screen';

export const RECENTLY_VIEWED_LIMIT = 8;

const initialState: ProductsPageState = {
  products: [],
  productTotal: 0,
  chosenProduct: null,
  recentlyViewedIds: [],
};

const productsPageSlice = createSlice({
  name: 'productsPage',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    setProductTotal: (state, action: PayloadAction<number>) => {
      state.productTotal = action.payload;
    },
    setChosenProduct: (state, action: PayloadAction<Product | null>) => {
      state.chosenProduct = action.payload;
    },
    /** Most recent first, no duplicates, capped at RECENTLY_VIEWED_LIMIT. */
    addRecentlyViewed: (state, action: PayloadAction<string>) => {
      state.recentlyViewedIds = [action.payload, ...state.recentlyViewedIds.filter((id) => id !== action.payload)].slice(
        0,
        RECENTLY_VIEWED_LIMIT,
      );
    },
    removeRecentlyViewed: (state, action: PayloadAction<string>) => {
      state.recentlyViewedIds = state.recentlyViewedIds.filter((id) => id !== action.payload);
    },
    clearRecentlyViewed: (state) => {
      state.recentlyViewedIds = [];
    },
  },
});

export const { setProducts, setProductTotal, setChosenProduct, addRecentlyViewed, removeRecentlyViewed, clearRecentlyViewed } =
  productsPageSlice.actions;
const ProductsPageReducer = productsPageSlice.reducer;
export default ProductsPageReducer;
