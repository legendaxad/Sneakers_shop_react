import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { formatPrice, resolveImageUrl } from '../../utils/format';
import { getApiErrorMessage, orderApi } from '../../services/api';

export function CheckoutPage() {
  const navigate = useNavigate();
  const member = useAuthStore((state) => state.member);
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal());
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    if (!member) {
      navigate('/login');
    }
  }, [member, navigate]);

  if (!member) {
    return null;
  }

  if (!items.length) {
    return (
      <div className="rounded-[28px] bg-white p-10 text-center shadow-sm ring-1 ring-stone-200">
        <h2 className="text-3xl font-black tracking-[-0.04em] text-stone-900">Checkout is empty</h2>
        <p className="mt-3 text-stone-600">Add a pair to your cart before placing an order.</p>
      </div>
    );
  }

  const shipping = subtotal >= 100 ? 0 : 5;
  const total = subtotal + shipping;

  const placeOrder = async () => {
    try {
      await orderApi.createOrder(
        items.map((item) => ({
          itemQuantity: item.quantity,
          itemPrice: item.productPrice,
          productId: item.productId,
        })),
      );

      clearCart();
      navigate('/orders');
    } catch (error) {
      alert(getApiErrorMessage(error));
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4 rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-stone-200">
        <p className="text-[10px] uppercase tracking-[0.28em] text-stone-500">Checkout</p>
        <h2 className="text-3xl font-black tracking-[-0.04em] text-stone-900">Delivery details</h2>

        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center gap-4 rounded-[20px] border border-stone-200 p-3">
              <img src={resolveImageUrl(item.productImages?.[0])} alt={item.productName} className="h-20 w-20 rounded-[16px] object-cover" />
              <div className="flex-1">
                <p className="text-sm uppercase tracking-[0.18em] text-stone-500">{item.productBrand}</p>
                <h3 className="mt-2 font-semibold text-stone-900">{item.productName}</h3>
                <p className="mt-1 text-sm text-stone-600">Qty {item.quantity}</p>
              </div>
              <p className="font-semibold text-stone-900">{formatPrice(item.productPrice * item.quantity)}</p>
            </div>
          ))}
        </div>
      </div>

      <aside className="rounded-[28px] bg-stone-900 p-6 text-white shadow-[0_30px_60px_rgba(24,24,27,0.28)]">
        <p className="text-[10px] uppercase tracking-[0.26em] text-stone-300">Order summary</p>
        <div className="mt-6 space-y-4 text-sm text-stone-200">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-stone-700 pt-4 text-base font-semibold text-white">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        <button type="button" onClick={() => void placeOrder()} className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-stone-900">
          Place order
        </button>
      </aside>
    </div>
  );
}
