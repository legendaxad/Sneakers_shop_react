import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { EmptyState, ErrorState } from '../../components/common/PageStatus';
import { SafeImage } from '../../components/common/SafeImage';
import { useDocumentTitle } from '../../app/hooks';
import { useNoticeStore } from '../../app/store';
import { ORDERS_PER_PAGE } from '../../constants';
import { getApiErrorMessage, orderApi } from '../../services/api';
import { OrderStatus, type Order } from '../../types/order';
import { formatAddress, formatDate, formatPrice } from '../../utils/format';
import { buildOrderLines, orderActions, orderStatusLabel } from '../../utils/order';
import '../../css/order.css';

const tabs: { label: string; value: OrderStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Awaiting confirmation', value: OrderStatus.PAUSE },
  { label: 'Processing', value: OrderStatus.PROCESS },
  { label: 'Completed', value: OrderStatus.FINISH },
  { label: 'Cancelled', value: OrderStatus.DELETED },
];

const statusColor: Record<OrderStatus, 'default' | 'warning' | 'info' | 'success'> = {
  [OrderStatus.PAUSE]: 'warning',
  [OrderStatus.PROCESS]: 'info',
  [OrderStatus.FINISH]: 'success',
  [OrderStatus.DELETED]: 'default',
};

interface PendingAction {
  order: Order;
  status: OrderStatus;
  label: string;
}

export function OrdersPage() {
  useDocumentTitle('Orders');
  const location = useLocation();
  const placedOrderId = (location.state as { placedOrderId?: string } | null)?.placedOrderId;
  const notify = useNoticeStore((state) => state.notify);
  const [tab, setTab] = useState<OrderStatus | 'ALL'>('ALL');
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchPage = useCallback(
    async (nextPage: number) => {
      const status = tab === 'ALL' ? undefined : tab;
      const list = await orderApi.getOrders(nextPage, ORDERS_PER_PAGE, status);
      setHasMore(list.length === ORDERS_PER_PAGE);
      setPage(nextPage);
      return list;
    },
    [tab],
  );

  const loadFirstPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOrders(await fetchPage(1));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [fetchPage]);

  useEffect(() => {
    void loadFirstPage();
  }, [loadFirstPage]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const next = await fetchPage(page + 1);
      setOrders((current) => [...current, ...next.filter((order) => !current.some((existing) => existing._id === order._id))]);
    } catch (err) {
      notify(getApiErrorMessage(err), 'error');
    } finally {
      setLoadingMore(false);
    }
  };

  const confirmAction = async () => {
    if (!pending) return;
    setUpdating(true);
    try {
      await orderApi.updateOrder(pending.order._id, pending.status);
      notify(`Order #${pending.order._id.slice(-6)} updated: ${orderStatusLabel[pending.status]}.`, 'success');
      setPending(null);
      await loadFirstPage();
    } catch (err) {
      notify(getApiErrorMessage(err), 'error');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Stack spacing={3}>
      <div>
        <span className="ms-eyebrow">Account</span>
        <Typography variant="h3" component="h1" sx={{ mt: 1 }}>
          Your orders
        </Typography>
      </div>

      {placedOrderId && (
        <Alert severity="success">
          Thank you! Your order #{placedOrderId.slice(-6)} was placed. Confirm it below once you are ready, or cancel it while it is awaiting
          confirmation.
        </Alert>
      )}

      <Box className="ms-surface" sx={{ px: 1 }}>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto" aria-label="Filter orders by status">
          {tabs.map((item) => (
            <Tab key={item.value} label={item.label} value={item.value} />
          ))}
        </Tabs>
      </Box>

      {error ? (
        <ErrorState message={error} onRetry={() => void loadFirstPage()} />
      ) : loading ? (
        <Stack spacing={3}>
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={240} sx={{ borderRadius: '28px' }} />
          ))}
        </Stack>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ReceiptLongOutlinedIcon}
          title={tab === 'ALL' ? 'No orders yet' : 'No orders here'}
          description={tab === 'ALL' ? 'Your latest purchases will appear here after checkout.' : 'No orders match this status.'}
          action={
            <Button component={Link} to="/shop" variant="contained">
              Start shopping
            </Button>
          }
        />
      ) : (
        <Stack spacing={3}>
          {orders.map((order) => {
            const lines = buildOrderLines(order);
            const itemsTotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
            const address = formatAddress(order.orderAddress);
            return (
              <article key={order._id} className="ms-surface ms-order-card" aria-label={`Order ${order._id.slice(-6)}`}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', pb: 2 }}>
                  <div>
                    <span className="ms-eyebrow">Order #{order._id.slice(-6)}</span>
                    <Typography variant="h4" component="p" sx={{ mt: 1 }}>
                      {formatPrice(order.orderTotal)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Items {formatPrice(itemsTotal)} · Delivery {order.orderDelivery ? formatPrice(order.orderDelivery) : 'Free'}
                    </Typography>
                  </div>
                  <Stack spacing={1} sx={{ alignItems: { md: 'flex-end' } }}>
                    <Chip label={orderStatusLabel[order.orderStatus] ?? order.orderStatus} color={statusColor[order.orderStatus] ?? 'default'} />
                    <Typography variant="body2" color="text.secondary">
                      Placed {formatDate(order.createdAt)}
                    </Typography>
                  </Stack>
                </Stack>
                <Divider />

                <div className="ms-order-lines" style={{ marginTop: 24 }}>
                  {lines.map(({ item, product, lineTotal }) => (
                    <div key={item._id} className="ms-mini-line">
                      <SafeImage src={product?.productImages?.[0]} alt={product?.productName ?? 'Product'} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        {product?.productBrand && (
                          <span className="ms-eyebrow" style={{ letterSpacing: '0.18em' }}>
                            {product.productBrand}
                          </span>
                        )}
                        {product ? (
                          <Typography
                            component={Link}
                            to={`/product/${product._id}`}
                            sx={{ mt: 0.5, fontWeight: 600, display: 'block', color: 'inherit', textDecoration: 'none' }}
                            noWrap
                          >
                            {product.productName}
                          </Typography>
                        ) : (
                          <Typography sx={{ mt: 0.5, fontWeight: 600 }}>Product no longer available</Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                          {item.itemSize ? `Size EU ${item.itemSize} · ` : ''}
                          {item.itemQuantity} × {formatPrice(item.itemPrice)}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 600 }}>{formatPrice(lineTotal)}</Typography>
                    </div>
                  ))}
                </div>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'flex-end' }, justifyContent: 'space-between', mt: 3 }}>
                  <div className="ms-order-address">
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                      <LocationOnOutlinedIcon fontSize="small" />
                      <div>
                        {address.length ? (
                          address.map((line) => <div key={line}>{line}</div>)
                        ) : (
                          <span>No delivery address recorded for this order.</span>
                        )}
                      </div>
                    </Stack>
                  </div>
                  <Stack direction="row" spacing={1}>
                    {orderActions[order.orderStatus]?.map((action) => (
                      <Button
                        key={action.status}
                        variant={action.tone === 'primary' ? 'contained' : 'outlined'}
                        onClick={() => setPending({ order, status: action.status, label: action.label })}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </Stack>
                </Stack>
              </article>
            );
          })}
          {hasMore && (
            <Button variant="outlined" onClick={() => void loadMore()} disabled={loadingMore} sx={{ alignSelf: 'center' }}>
              {loadingMore ? 'Loading…' : 'Load more orders'}
            </Button>
          )}
        </Stack>
      )}

      <Dialog open={!!pending} onClose={() => !updating && setPending(null)} aria-labelledby="order-action-title">
        <DialogTitle id="order-action-title">{pending?.label}?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pending?.status === OrderStatus.DELETED
              ? 'This cancels the order and returns the items to stock. This cannot be undone.'
              : pending?.status === OrderStatus.PROCESS
                ? 'Confirming sends the order for processing. After this it can no longer be cancelled.'
                : 'Mark this order as received to complete it.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPending(null)} disabled={updating}>
            Keep as is
          </Button>
          <Button variant="contained" onClick={() => void confirmAction()} disabled={updating}>
            {updating ? 'Updating…' : pending?.label}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
