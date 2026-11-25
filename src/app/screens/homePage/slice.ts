import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TopMember } from '../../../lib/types/member';
import type { Product } from '../../../lib/types/product';
import type { HomePageState } from '../../../lib/types/screen';

const initialState: HomePageState = {
  newArrivals: [],
  mostViewed: [],
  topUsers: [],
  productTotal: null,
  categoryCounts: null,
};

const homePageSlice = createSlice({
  name: 'homePage',
  initialState,
  reducers: {
    setNewArrivals: (state, action: PayloadAction<Product[]>) => {
      state.newArrivals = action.payload;
    },
    setMostViewed: (state, action: PayloadAction<Product[]>) => {
      state.mostViewed = action.payload;
    },
    setTopUsers: (state, action: PayloadAction<TopMember[]>) => {
      state.topUsers = action.payload;
    },
    setProductTotal: (state, action: PayloadAction<number | null>) => {
      state.productTotal = action.payload;
    },
    setCategoryCounts: (state, action: PayloadAction<HomePageState['categoryCounts']>) => {
      state.categoryCounts = action.payload;
    },
  },
});

export const { setNewArrivals, setMostViewed, setTopUsers, setProductTotal, setCategoryCounts } = homePageSlice.actions;
const HomePageReducer = homePageSlice.reducer;
export default HomePageReducer;
