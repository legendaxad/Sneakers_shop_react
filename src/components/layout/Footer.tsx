export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 text-sm text-stone-600 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">MULTI-SHOP</p>
          <p className="mt-4 max-w-xs text-stone-600">
            Premium sneaker essentials designed for movement, style, and daily performance.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-900">Shop</p>
          <ul className="mt-4 space-y-2">
            <li>Running</li>
            <li>Training</li>
            <li>Basketball</li>
            <li>Lifestyle</li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-900">Company</p>
          <ul className="mt-4 space-y-2">
            <li>About</li>
            <li>Journal</li>
            <li>Support</li>
            <li>Contact</li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-900">Need help?</p>
          <ul className="mt-4 space-y-2">
            <li>Order status</li>
            <li>Shipping</li>
            <li>Returns</li>
            <li>Privacy</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-stone-200 px-4 py-5 text-center text-xs uppercase tracking-[0.18em] text-stone-500 sm:px-6 lg:px-8">
        © 2026 MULTI-SHOP — Crafted for everyday motion.
      </div>
    </footer>
  );
}
