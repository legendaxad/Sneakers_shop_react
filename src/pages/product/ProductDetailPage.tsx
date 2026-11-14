import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { productApi } from '../../services/api';
import { useCartStore } from '../../store/cartStore';
import type { Product } from '../../types/product';
import { formatPrice, resolveImageUrl } from '../../utils/format';

export function ProductDetailPage() {
  const { id } = useParams();
  const addItem = useCartStore((state) => state.addItem);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const nextProduct = await productApi.getProduct(id);
        setProduct(nextProduct);
        setSelectedSize(nextProduct.productSizes[0] ?? null);
      } catch {
        setProduct(null);
      }
    };

    void fetchProduct();
  }, [id]);

  if (!product) {
    return <div className="rounded-[28px] bg-white p-10 text-center text-stone-500">Loading product...</div>;
  }

  const imageList = product.productImages?.length ? product.productImages : [undefined];

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <div className="overflow-hidden rounded-[30px] bg-white p-4 shadow-sm ring-1 ring-stone-200">
          <img src={resolveImageUrl(imageList[0])} alt={product.productName} className="h-[520px] w-full rounded-[22px] object-cover" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {imageList.slice(0, 3).map((image, index) => (
            <div key={index} className="overflow-hidden rounded-[22px] bg-white p-2 ring-1 ring-stone-200">
              <img
                src={resolveImageUrl(image)}
                alt={`${product.productName} thumbnail ${index + 1}`}
                className="h-28 w-full rounded-[16px] object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-stone-200 md:p-8">
        <p className="text-[10px] uppercase tracking-[0.28em] text-stone-500">{product.productBrand}</p>
        <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-stone-900">{product.productName}</h2>
        <p className="mt-4 text-3xl font-bold text-stone-900">{formatPrice(product.productPrice)}</p>

        <div className="mt-6 flex items-center gap-2 text-sm text-stone-600">
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">{product.productLeftCount} left</span>
          <span>{product.productViews} views</span>
        </div>

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Size</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.productSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`rounded-full border px-3 py-2 text-sm font-medium ${
                  selectedSize === size ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-700'
                }`}
              >
                EU {size}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center gap-4">
          <div className="flex items-center rounded-full border border-stone-200 bg-stone-50 p-1">
            <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="p-2 text-stone-700">
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-10 text-center text-sm font-medium text-stone-900">{quantity}</span>
            <button type="button" onClick={() => setQuantity((value) => value + 1)} className="p-2 text-stone-700">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (selectedSize) {
                addItem(product, quantity);
              }
            }}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            <ShoppingBag className="h-4 w-4" />
            Add to cart
          </button>
        </div>

        <div className="mt-8 rounded-[22px] bg-stone-50 p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Description</p>
          <p className="mt-3 text-sm leading-7 text-stone-600">{product.productDesc}</p>
        </div>
      </div>
    </div>
  );
}
