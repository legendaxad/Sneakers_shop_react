import { Alert, Snackbar } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { retrieveNotice } from './selector';
import { closeNotice } from './slice';

/** Global toast for success/error feedback (replaces window.alert). */
export default function Notifier() {
  const dispatch = useAppDispatch();
  const { open, message, severity } = useAppSelector(retrieveNotice);
  const close = () => dispatch(closeNotice());

  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={(_, reason) => reason !== 'clickaway' && close()}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={close} severity={severity} variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
