import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Checkbox, CircularProgress, FormControlLabel, Stack, Typography } from '@mui/material';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { AddressForm } from '../../components/shared/AddressForm';
import { cleanAddress, emptyAddress, hasAddress, validateAddress, type AddressErrors } from '../../../lib/utils/address';
import { EmptyState } from '../../components/shared/PageStatus';
import { SafeImage } from '../../components/shared/SafeImage';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useGlobals } from '../../hooks/useGlobal';
import { useNotify } from '../../hooks/useNotify';
import { getApiErrorMessage } from '../../service/apiClient';
import MemberService from '../../service/MemberService';
import OrderService from '../../service/OrderService';
import { retrieveCartItems, retrieveCartSubtotal } from '../cartPage/selector';
import { clearCart } from '../cartPage/slice';
import type { DeliveryAddress } from '../../../lib/types/member';
import { formatPrice } from '../../../lib/utils/format';
import { calculateShipping } from '../../../lib/utils/order';
import '../../../css/order.css';
import '../../../css/userPage.css';

export default function CheckoutPage() {
  useDocumentTitle('Checkout');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { authMember: member, setAuthMember } = useGlobals();
  const notify = useNotify();
  const items = useAppSelector(retrieveCartItems);
  const subtotal = useAppSelector(retrieveCartSubtotal);

  const savedAddress = member?.memberDeliveryAddress;
  const [address, setAddress] = useState<DeliveryAddress>(() =>
    hasAddress(savedAddress)
      ? { ...emptyAddress, ...savedAddress }
      : { ...emptyAddress, recipientName: member?.memberNick ?? '', phone: member?.memberPhone ?? '', addressLine1: member?.memberAddress ?? '' },
  );
  const [errors, setErrors] = useState<AddressErrors>({});
  const [saveAddress, setSaveAddress] = useState(!hasAddress(savedAddress));
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const inFlight = useRef(false);

  if (!items.length) {
    return (
      <EmptyState
        icon={ShoppingBagOutlinedIcon}
        title="Checkout is empty"
        description="Add a pair to your cart before placing an order."
        action={
          <Button component={Link} to="/shop" variant="contained">
            Explore sneakers
          </Button>
        }
      />
    );
  }

  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;

  const placeOrder = async () => {
    if (inFlight.current) return; // guard against double clicks / repeated submits
    const validation = validateAddress(address);
    setErrors(validation);
    if (Object.keys(validation).length) {
      setServerError('Please complete the delivery address.');
      return;
    }
    inFlight.current = true;
    setSubmitting(true);
    setServerError(null);
    try {
      const order = await new OrderService().createOrder({
        items: items.map((item) => ({
          productId: item.productId,
          itemQuantity: item.quantity,
          ...(item.size !== null ? { itemSize: item.size } : {}),
        })),
        deliveryAddress: cleanAddress(address),
        saveAddress,
      });
      dispatch(clearCart());
      if (saveAddress) {
        // Refresh the session member so the saved address pre-fills next time (best effort).
        new MemberService()
          .getMemberDetail()
          .then(setAuthMember)
          .catch(() => undefined);
      }
      notify(`Order placed — total ${formatPrice(order.orderTotal)}.`, 'success');
      navigate('/orders', { replace: true, state: { placedOrderId: order._id } });
    } catch (error) {
      setServerError(getApiErrorMessage(error));
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className="ms-two-column">
      <Stack spacing={3}>
        <Box component="section" className="ms-surface ms-profile-section" aria-labelledby="delivery-heading">
          <span className="ms-eyebrow">Checkout</span>
          <Typography id="delivery-heading" variant="h3" component="h1" sx={{ mt: 1.5, mb: 3 }}>
            Delivery details
          </Typography>
          {hasAddress(savedAddress) && (
            <Alert severity="info" sx={{ mb: 3 }}>
              We filled in your saved delivery address. You can change it for this order.
            </Alert>
          )}
          <AddressForm value={address} errors={errors} onChange={setAddress} disabled={submitting} />
          <FormControlLabel
            sx={{ mt: 2 }}
            control={<Checkbox checked={saveAddress} onChange={(event) => setSaveAddress(event.target.checked)} disabled={submitting} />}
            label="Save as my default delivery address"
          />
        </Box>

        <Box component="section" className="ms-surface ms-profile-section" aria-labelledby="items-heading">
          <Typography id="items-heading" variant="h5" component="h2">
            Items ({items.length})
          </Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {items.map((item) => (
              <div key={item.key} className="ms-mini-line">
                <SafeImage src={item.productImage} alt={item.productName} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <span className="ms-eyebrow" style={{ letterSpacing: '0.18em' }}>
                    {item.productBrand}
                  </span>
                  <Typography sx={{ mt: 0.5, fontWeight: 600 }} noWrap>
                    {item.productName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.size !== null ? `Size EU ${item.size} · ` : ''}Qty {item.quantity}
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: 600 }}>{formatPrice(item.productPrice * item.quantity)}</Typography>
              </div>
            ))}
          </Stack>
          <Button component={Link} to="/cart" sx={{ mt: 2 }} disabled={submitting}>
            Edit cart
          </Button>
        </Box>
      </Stack>

      <Box component="aside" className="ms-dark-panel ms-sticky" sx={{ p: 3 }} aria-label="Order summary">
        <span className="ms-eyebrow">Order summary</span>
        <Stack spacing={2} sx={{ mt: 3 }}>
          <div className="ms-summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="ms-summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
          </div>
          <div className="ms-summary-row total">
            <span>Estimated total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </Stack>
        {serverError && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {serverError}
          </Alert>
        )}
        <Button
          fullWidth
          onClick={() => void placeOrder()}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} /> : undefined}
          sx={{ mt: 4, bgcolor: '#fff', color: 'text.primary', '&:hover': { bgcolor: '#f5f5f4' }, '&.Mui-disabled': { bgcolor: '#d6d3d1' } }}
        >
          {submitting ? 'Placing order…' : 'Place order'}
        </Button>
        <Typography variant="caption" component="p" sx={{ mt: 2, color: '#a8a29e' }}>
          Final prices, stock and shipping are confirmed by the store when you place the order.
        </Typography>
      </Box>
    </div>
  );
}
