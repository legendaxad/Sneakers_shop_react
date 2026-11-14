import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Truck, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ProductCard } from '../../components/common/ProductCard';
import { productApi } from '../../services/api';
import type { Product } from '../../types/product';

export function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const products = await productApi.getProducts({ page: 1, limit: 4, order: 'createdAt' });
        setFeatured(products);
      } catch {
        setFeatured([]);
      }
    };

    void loadFeatured();
  }, []);

  return (
    <div className="space-y-12 pb-12">
      <section className="rounded-[32px] bg-stone-900 px-6 py-10 text-white shadow-[0_35px_80px_rgba(24,24,27,0.26)] lg:px-10 lg:py-14">
        <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <p className="text-xs uppercase tracking-[0.38em] text-stone-300">Performance energy</p>
            <h2 className="mt-4 max-w-xl text-4xl font-black tracking-[-0.05em] text-white md:text-6xl">
              Run louder. Train harder. Look sharper.
            </h2>
            <p className="mt-6 max-w-lg text-base text-stone-300">
              Discover premium sneakers built for everyday motion, crafted for season-long comfort and statement-level presence.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/shop" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-stone-900 transition hover:bg-stone-100">
                Shop collection
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/signup" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:border-white/60">
                Join the club
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="relative"
          >
            <div className="absolute -inset-6 rounded-[40px] bg-[#e7d9cb]/20 blur-2xl" />
            <img
              src="https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=1200&q=80"
              alt="Premium sneaker"
              className="relative h-[480px] w-full rounded-[28px] object-cover"
            />
          </motion.div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-stone-200 bg-white p-6">
          <Truck className="h-8 w-8 text-stone-900" />
          <h3 className="mt-4 text-xl font-semibold text-stone-900">Free shipping over $100</h3>
          <p className="mt-2 text-sm text-stone-600">Fast dispatch on every order and attentive post-purchase care.</p>
        </div>
        <div className="rounded-[28px] border border-stone-200 bg-white p-6">
          <ShieldCheck className="h-8 w-8 text-stone-900" />
          <h3 className="mt-4 text-xl font-semibold text-stone-900">Authenticity guarantee</h3>
          <p className="mt-2 text-sm text-stone-600">Only verified products and curated collections from trusted sources.</p>
        </div>
        <div className="rounded-[28px] border border-stone-200 bg-white p-6">
          <Sparkles className="h-8 w-8 text-stone-900" />
          <h3 className="mt-4 text-xl font-semibold text-stone-900">Performance-driven design</h3>
          <p className="mt-2 text-sm text-stone-600">Built to support training, everyday wear, and elevated street style.</p>
        </div>
      </section>

      <section className="rounded-[30px] border border-stone-200 bg-[#f3efe9] p-6 md:p-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Featured drops</p>
            <h3 className="mt-3 text-3xl font-black tracking-[-0.04em] text-stone-900">Editor’s picks</h3>
          </div>
          <Link to="/shop" className="hidden text-sm font-semibold text-stone-800 md:inline-flex">
            View all products →
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featured.length > 0 ? (
            featured.map((product) => <ProductCard key={product._id} product={product} />)
          ) : (
            <p className="text-stone-500">Featured products are unavailable right now.</p>
          )}
        </div>
      </section>
    </div>
  );
}
