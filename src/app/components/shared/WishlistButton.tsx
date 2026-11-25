import { IconButton, Tooltip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { useNotify } from '../../hooks/useNotify';
import { retrieveWishlistIds } from '../../screens/wishlistPage/selector';
import { toggleWishlist } from '../../screens/wishlistPage/slice';

interface WishlistButtonProps {
  productId: string;
  productName: string;
  /** `overlay` sits on product images; `outlined` sits next to buttons. */
  variant?: 'overlay' | 'outlined';
}

export function WishlistButton({ productId, productName, variant = 'overlay' }: WishlistButtonProps) {
  const dispatch = useAppDispatch();
  const saved = useAppSelector(retrieveWishlistIds).includes(productId);
  const notify = useNotify();

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
          const added = !saved;
          dispatch(toggleWishlist(productId));
          notify(added ? `${productName} saved to your wishlist.` : `${productName} removed from your wishlist.`, added ? 'success' : 'info');
        }}
      >
        {saved ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}
