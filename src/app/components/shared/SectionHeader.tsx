import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button, Stack, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface SectionHeaderProps {
  id?: string;
  eyebrow: string;
  title: string;
  description?: ReactNode;
  action?: { label: string; to: string };
  /** Light text for dark sections. */
  inverted?: boolean;
}

export function SectionHeader({ id, eyebrow, title, description, action, inverted }: SectionHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-end' }, mb: { xs: 3, md: 4 } }}
    >
      <div>
        <span className={`ms-eyebrow${inverted ? ' inverted' : ''}`}>{eyebrow}</span>
        <Typography id={id} variant="h2" component="h2" sx={{ mt: 1.5, fontSize: { xs: '1.75rem', md: '2.25rem' }, color: inverted ? '#fff' : undefined }}>
          {title}
        </Typography>
        {description && (
          <Typography sx={{ mt: 1, maxWidth: 560, color: inverted ? '#d6d3d1' : 'text.secondary' }}>{description}</Typography>
        )}
      </div>
      {action && (
        <Button
          component={Link}
          to={action.to}
          endIcon={<ArrowForwardIcon />}
          className="ms-link-button"
          sx={{ color: inverted ? '#fff' : 'text.primary', flexShrink: 0, alignSelf: { xs: 'flex-start', sm: 'auto' } }}
        >
          {action.label}
        </Button>
      )}
    </Stack>
  );
}
