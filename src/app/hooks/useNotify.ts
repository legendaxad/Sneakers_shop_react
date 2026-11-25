import { useCallback } from 'react';
import type { NoticeSeverity } from '../../lib/types/common';
import { showNotice } from '../components/notifier/slice';
import { useAppDispatch } from '../hooks';

/** Shows the global snackbar (rendered by <Notifier />). */
export const useNotify = () => {
  const dispatch = useAppDispatch();
  return useCallback(
    (message: string, severity: NoticeSeverity = 'info') => dispatch(showNotice({ message, severity })),
    [dispatch],
  );
};
