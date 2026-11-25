import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Order } from '../../../lib/types/order';
import type { OrdersPageState } from '../../../lib/types/screen';

const initialState: OrdersPageState = {
  orders: [],
};

const ordersPageSlice = createSlice({
  name: 'ordersPage',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    /** Appends the next page, skipping orders already in the list. */
    appendOrders: (state, action: PayloadAction<Order[]>) => {
      const known = new Set(state.orders.map((order) => order._id));
      state.orders.push(...action.payload.filter((order) => !known.has(order._id)));
    },
  },
});

export const { setOrders, appendOrders } = ordersPageSlice.actions;
const OrdersPageReducer = ordersPageSlice.reducer;
export default OrdersPageReducer;
