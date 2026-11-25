import type { AppRootState } from '../../../lib/types/screen';

/** The notice is a small flat object read as a whole, so no memoised selector is needed. */
export const retrieveNotice = (state: AppRootState) => state.notice;
