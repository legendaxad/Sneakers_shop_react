import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import ExploreOffOutlinedIcon from '@mui/icons-material/ExploreOffOutlined';
import { EmptyState } from '../../components/shared/PageStatus';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <EmptyState
      icon={ExploreOffOutlinedIcon}
      title="Page not found"
      description="The page you are looking for does not exist."
      action={
        <Button component={Link} to="/" variant="contained">
          Back to home
        </Button>
      }
    />
  );
}
