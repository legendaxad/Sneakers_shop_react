import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { NoticeSeverity } from '../../../lib/types/common';
import type { NoticeState } from '../../../lib/types/screen';

const initialState: NoticeState = {
  open: false,
  message: '',
  severity: 'info',
};

const noticeSlice = createSlice({
  name: 'notice',
  initialState,
  reducers: {
    showNotice: (state, action: PayloadAction<{ message: string; severity?: NoticeSeverity }>) => {
      state.open = true;
      state.message = action.payload.message;
      state.severity = action.payload.severity ?? 'info';
    },
    closeNotice: (state) => {
      state.open = false;
    },
  },
});

export const { showNotice, closeNotice } = noticeSlice.actions;
const NoticeReducer = noticeSlice.reducer;
export default NoticeReducer;
