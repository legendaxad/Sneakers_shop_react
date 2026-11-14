import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { formatPrice, resolveImageUrl } from '../../utils/format';

export function CartPage() {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useCartStore((state) => state.subtotal());
  const totalItems = useCartStore((state) => state.totalItems());

  if (!items.length) {
    return (
      <div className="rounded-[28px] bg-white p-10 text-center shadow-sm ring-1 ring-stone-200">
        <h2 className="text-3xl font-black tracking-[-0.04em] text-stone-900">Your cart is empty</h2>
        <p className="mt-3 text-stone-600">Browse the collection to add your next pair.</p>
        <Link to="/shop" className="mt-6 inline-flex rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white">
          Explore sneakers
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-5">
        {items.map((item) => (
          <div key={item.productId} className="flex flex-col gap-4 rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-stone-200 sm:flex-row">
            <img src={resolveImageUrl(item.productImages?.[0])} alt={item.productName} className="h-32 w-full rounded-[18px] object-cover sm:w-40" />
            <div className="flex flex-1 flex-col justify-between gap-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">{item.productBrand}</p>
                  <h3 className="mt-2 text-xl font-semibold text-stone-900">{item.productName}</h3>
                </div>
                <button type="button" onClick={() => removeItem(item.productId)} className="rounded-full p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 p-1">
                  <button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-2 text-stone-700">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-8 text-center text-sm font-medium text-stone-900">{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-2 text-stone-700">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-lg font-semibold text-stone-900">{formatPrice(item.productPrice * item.quantity)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <aside className="rounded-[28px] bg-stone-900 p-6 text-white shadow-[0_30px_60px_rgba(24,24,27,0.28)]">
        <p className="text-[10px] uppercase tracking-[0.26em] text-stone-300">Summary</p>
        <h3 className="mt-4 text-3xl font-black tracking-[-0.04em]">{totalItems} item{totalItems > 1 ? 's' : ''}</h3>

        <div className="mt-8 space-y-4 text-sm text-stone-200">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Shipping</span>
            <span>{subtotal >= 100 ? 'Free' : formatPrice(5)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-stone-700 pt-4 text-base font-semibold text-white">
            <span>Total</span>
            <span>{formatPrice(subtotal >= 100 ? subtotal : subtotal + 5)}</span>
          </div>
        </div>

        <button type="button" onClick={() => navigate('/checkout')} className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-stone-900">
          Proceed to checkout
        </button>
      </aside>
    </div>
  );
}
