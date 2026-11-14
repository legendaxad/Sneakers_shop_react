import { Link } from 'react-router-dom';
import { Plus, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '../../store/cartStore';
import type { Product } from '../../types/product';
import { formatPrice, resolveImageUrl } from '../../utils/format';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35 }}
      className="group overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-[0_18px_40px_rgba(24,24,27,0.05)]"
    >
      <Link to={`/product/${product._id}`} className="block">
        <div className="relative overflow-hidden">
          <img
            src={resolveImageUrl(product.productImages?.[0])}
            alt={product.productName}
            className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-700">
            {product.productBrand}
          </span>
        </div>
      </Link>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{product.productCategory}</p>
            <h3 className="mt-2 text-lg font-semibold text-stone-900">{product.productName}</h3>
          </div>
          <span className="text-lg font-semibold text-stone-900">{formatPrice(product.productPrice)}</span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-stone-500">{product.productLeftCount} left</p>
          <button
            type="button"
            onClick={() => addItem(product, 1)}
            className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-stone-800"
          >
            <Plus className="h-4 w-4" />
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
