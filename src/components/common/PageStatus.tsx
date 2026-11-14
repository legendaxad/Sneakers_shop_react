import type { ReactNode } from 'react';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <Stack className="ms-surface ms-state" spacing={2} role="status" aria-live="polite" sx={{ alignItems: 'center' }}>
      <CircularProgress color="primary" size={32} />
      <Typography color="text.secondary">{label}</Typography>
    </Stack>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Box className="ms-surface ms-state">
      <Alert
        severity="error"
        sx={{ justifyContent: 'center', textAlign: 'left', maxWidth: 560, mx: 'auto' }}
        action={
          onRetry ? (
            <Button color="inherit" size="small" onClick={onRetry}>
              Try again
            </Button>
          ) : undefined
        }
      >
        {message}
      </Alert>
    </Box>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: SvgIconComponent;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon: Icon, action }: EmptyStateProps) {
  return (
    <Stack className="ms-surface ms-state" spacing={1.5} sx={{ alignItems: 'center' }}>
      {Icon && <Icon className="ms-state-icon" />}
      <Typography variant="h3" component="h2">
        {title}
      </Typography>
      {description && <Typography color="text.secondary">{description}</Typography>}
      {action && <Box sx={{ pt: 1.5 }}>{action}</Box>}
    </Stack>
  );
}
