import { IconButton, Tooltip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useNoticeStore, useWishlistStore } from '../../app/store';

interface WishlistButtonProps {
  productId: string;
  productName: string;
  /** `overlay` sits on product images; `outlined` sits next to buttons. */
  variant?: 'overlay' | 'outlined';
}

export function WishlistButton({ productId, productName, variant = 'overlay' }: WishlistButtonProps) {
  const saved = useWishlistStore((state) => state.ids.includes(productId));
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const notify = useNoticeStore((state) => state.notify);

  const label = saved ? `Remove ${productName} from wishlist` : `Save ${productName} to wishlist`;

  return (
    <Tooltip title={saved ? 'Saved to wishlist' : 'Save to wishlist'}>
      <IconButton
        className={`ms-wishlist-button ${variant}${saved ? ' saved' : ''}`}
        aria-label={label}
        aria-pressed={saved}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          const added = toggleWishlist(productId);
          notify(added ? `${productName} saved to your wishlist.` : `${productName} removed from your wishlist.`, added ? 'success' : 'info');
        }}
      >
        {saved ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}
