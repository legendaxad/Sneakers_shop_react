import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { EmptyState, ErrorState } from '../../components/shared/PageStatus';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useNotify } from '../../hooks/useNotify';
import { getApiErrorMessage } from '../../service/apiClient';
import OrderService from '../../service/OrderService';
import { ORDERS_PER_PAGE } from '../../../lib/config';
import { OrderStatus } from '../../../lib/enums/order.enum';
import type { Order } from '../../../lib/types/order';
import { orderStatusLabel } from '../../../lib/utils/order';
import OrderCard from './OrderCard';
import { retrieveOrders } from './selector';
import { appendOrders, setOrders } from './slice';
import '../../../css/order.css';

const tabs: { label: string; value: OrderStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Awaiting confirmation', value: OrderStatus.PAUSE },
  { label: 'Processing', value: OrderStatus.PROCESS },
  { label: 'Completed', value: OrderStatus.FINISH },
  { label: 'Cancelled', value: OrderStatus.DELETED },
];

interface PendingAction {
  order: Order;
  status: OrderStatus;
  label: string;
}

/** Order history (/orders): orders live in the ordersPage slice; tab and paging are local UI state. */
export default function OrdersPage() {
  useDocumentTitle('Orders');
  const location = useLocation();
  const placedOrderId = (location.state as { placedOrderId?: string } | null)?.placedOrderId;
  const dispatch = useAppDispatch();
  const orders = useAppSelector(retrieveOrders);
  const notify = useNotify();
  const [tab, setTab] = useState<OrderStatus | 'ALL'>('ALL');
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
      const list = await new OrderService().getMyOrders({ page: nextPage, limit: ORDERS_PER_PAGE, orderStatus: status });
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
      dispatch(setOrders(await fetchPage(1)));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [dispatch, fetchPage]);

  useEffect(() => {
    void loadFirstPage();
  }, [loadFirstPage]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const next = await fetchPage(page + 1);
      dispatch(appendOrders(next));
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
      await new OrderService().updateOrder({ orderId: pending.order._id, orderStatus: pending.status });
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
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onAction={(action) => setPending({ order, status: action.status, label: action.label })}
            />
          ))}
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
