import { useEffect, useState } from 'react';
import { PackageCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { orderApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import type { Order } from '../../types/order';
import { formatDate, formatPrice, resolveImageUrl } from '../../utils/format';

export function OrdersPage() {
  const member = useAuthStore((state) => state.member);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!member) {
      return;
    }

    const loadOrders = async () => {
      try {
        const nextOrders = await orderApi.getOrders(1, 10);
        setOrders(nextOrders);
      } catch {
        setOrders([]);
      }
    };

    void loadOrders();
  }, [member]);

  if (!member) {
    return (
      <div className="rounded-[28px] bg-white p-10 text-center shadow-sm ring-1 ring-stone-200">
        <h2 className="text-3xl font-black tracking-[-0.04em] text-stone-900">Log in to view your orders</h2>
        <Link to="/login" className="mt-6 inline-flex rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white">
          Go to login
        </Link>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="rounded-[28px] bg-white p-10 text-center shadow-sm ring-1 ring-stone-200">
        <PackageCheck className="mx-auto h-12 w-12 text-stone-400" />
        <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-stone-900">No orders yet</h2>
        <p className="mt-3 text-stone-600">Your latest purchases will appear here after checkout.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <article key={order._id} className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-stone-200">
          <div className="flex flex-col gap-3 border-b border-stone-200 pb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-stone-500">Order #{order._id.slice(-6)}</p>
              <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-stone-900">{formatPrice(order.orderTotal)}</h3>
            </div>
            <div className="text-sm text-stone-600">
              <span className="rounded-full bg-stone-100 px-3 py-1.5 font-medium text-stone-700">{order.orderStatus}</span>
              <p className="mt-2">Placed {formatDate(order.createdAt)}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {order.productData?.map((product, index) => (
              <div key={`${order._id}-${product._id}`} className="flex items-center gap-4 rounded-[20px] border border-stone-200 p-3">
                <img src={resolveImageUrl(product.productImages?.[0])} alt={product.productName} className="h-20 w-20 rounded-[16px] object-cover" />
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">{product.productBrand}</p>
                  <h4 className="mt-2 text-lg font-semibold text-stone-900">{product.productName}</h4>
                  <p className="mt-1 text-sm text-stone-600">
                    {order.orderItems?.[index]?.itemQuantity ?? 1} item(s)
                  </p>
                </div>
                <p className="font-semibold text-stone-900">{formatPrice(product.productPrice)}</p>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
