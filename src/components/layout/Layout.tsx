import type { PropsWithChildren } from 'react';
import { Footer } from './Footer';
import { Header } from './Header';

export function Layout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[#f7f3ef] text-stone-800">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      <Footer />
    </div>
  );
}
