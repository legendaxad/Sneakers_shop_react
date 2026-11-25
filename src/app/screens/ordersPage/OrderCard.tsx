import { Link } from "react-router-dom";
import { Box, Button, Chip, Divider, Stack, Typography } from "@mui/material";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { SafeImage } from "../../components/shared/SafeImage";
import { OrderStatus } from "../../../lib/enums/order.enum";
import type { Order } from "../../../lib/types/order";
import {
  formatAddress,
  formatDate,
  formatPrice,
} from "../../../lib/utils/format";
import {
  buildOrderLines,
  orderActions,
  orderStatusLabel,
} from "../../../lib/utils/order";

const statusColor: Record<
  OrderStatus,
  "default" | "warning" | "info" | "success"
> = {
  [OrderStatus.PAUSE]: "warning",
  [OrderStatus.PROCESS]: "info",
  [OrderStatus.FINISH]: "success",
  [OrderStatus.DELETED]: "default",
};

export type OrderAction = (typeof orderActions)[OrderStatus][number];

interface OrderCardProps {
  order: Order;
  /** Called with the chosen status change; the parent confirms and sends it. */
  onAction: (action: OrderAction) => void;
}

/** One order with its purchased lines, address snapshot and the actions its status allows. */
export default function OrderCard({ order, onAction }: OrderCardProps) {
  const lines = buildOrderLines(order);
  const itemsTotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const address = formatAddress(order.orderAddress);

  return (
    <article
      className="ms-surface ms-order-card"
      aria-label={`Order ${order._id.slice(-6)}`}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", pb: 2 }}
      >
        <div>
          <span className="ms-eyebrow">Order #{order._id.slice(-6)}</span>
          <Typography variant="h4" component="p" sx={{ mt: 1 }}>
            {formatPrice(order.orderTotal)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Items {formatPrice(itemsTotal)} · Delivery{" "}
            {order.orderDelivery ? formatPrice(order.orderDelivery) : "Free"}
          </Typography>
        </div>
        <Stack spacing={1} sx={{ alignItems: { md: "flex-end" } }}>
          <Chip
            label={orderStatusLabel[order.orderStatus] ?? order.orderStatus}
            color={statusColor[order.orderStatus] ?? "default"}
          />
          <Typography variant="body2" color="text.secondary">
            Placed {formatDate(order.createdAt)}
          </Typography>
        </Stack>
      </Stack>
      <Divider />

      <div className="ms-order-lines" style={{ marginTop: 24 }}>
        {lines.map(({ item, product, lineTotal }) => (
          <div key={item._id} className="ms-mini-line">
            <SafeImage
              src={product?.productImages?.[0]}
              alt={product?.productName ?? "Product"}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {product?.productBrand && (
                <span
                  className="ms-eyebrow"
                  style={{ letterSpacing: "0.18em" }}
                >
                  {product.productBrand}
                </span>
              )}
              {product ? (
                <Typography
                  component={Link}
                  to={`/product/${product._id}`}
                  sx={{
                    mt: 0.5,
                    fontWeight: 600,
                    display: "block",
                    color: "inherit",
                    textDecoration: "none",
                  }}
                  noWrap
                >
                  {product.productName}
                </Typography>
              ) : (
                <Typography sx={{ mt: 0.5, fontWeight: 600 }}>
                  Product no longer available
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                {item.itemSize ? `Size EU ${item.itemSize} · ` : ""}
                {item.itemQuantity} × {formatPrice(item.itemPrice)}
              </Typography>
            </Box>
            <Typography sx={{ fontWeight: 600 }}>
              {formatPrice(lineTotal)}
            </Typography>
          </div>
        ))}
      </div>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{
          alignItems: { md: "flex-end" },
          justifyContent: "space-between",
          mt: 3,
        }}
      >
        <div className="ms-order-address">
          <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
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
              variant={action.tone === "primary" ? "contained" : "outlined"}
              onClick={() => onAction(action)}
            >
              {action.label}
            </Button>
          ))}
        </Stack>
      </Stack>
    </article>
  );
}
