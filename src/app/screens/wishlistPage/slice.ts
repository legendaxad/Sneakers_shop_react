import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { WishlistPageState } from '../../../lib/types/screen';

export const WISHLIST_LIMIT = 50;

const initialState: WishlistPageState = {
  wishlistIds: [],
};

const wishlistPageSlice = createSlice({
  name: 'wishlistPage',
  initialState,
  reducers: {
    /** Saves (newest first) or un-saves a product id. */
    toggleWishlist: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.wishlistIds = state.wishlistIds.includes(id)
        ? state.wishlistIds.filter((saved) => saved !== id)
        : [id, ...state.wishlistIds].slice(0, WISHLIST_LIMIT);
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.wishlistIds = state.wishlistIds.filter((id) => id !== action.payload);
    },
    clearWishlist: (state) => {
      state.wishlistIds = [];
    },
  },
});

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistPageSlice.actions;
const WishlistPageReducer = wishlistPageSlice.reducer;
export default WishlistPageReducer;
