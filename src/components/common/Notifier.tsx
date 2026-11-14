import { Alert, Snackbar } from '@mui/material';
import { useNoticeStore } from '../../app/store';

/** Global toast for success/error feedback (replaces window.alert). */
export function Notifier() {
  const { open, message, severity, close } = useNoticeStore();

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
