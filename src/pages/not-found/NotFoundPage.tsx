import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="rounded-[28px] bg-white p-10 text-center shadow-sm ring-1 ring-stone-200">
      <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">404</p>
      <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-stone-900">Page not found</h2>
      <p className="mt-3 text-stone-600">The page you are looking for does not exist.</p>
      <Link to="/" className="mt-6 inline-flex rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white">
        Back to home
      </Link>
    </div>
  );
}
