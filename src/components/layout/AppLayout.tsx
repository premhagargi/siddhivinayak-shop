'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/animations/PageTransition';
import LenisProvider from '@/components/providers/LenisProvider';

/**
 * AppLayout component that conditionally renders storefront or admin UI.
 * Prevents "leaking" shop elements like the Navbar/Footer into the Admin Panel.
 * Also selectively applies smooth scrolling only to storefront pages.
 */
export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  // For Admin routes, we render a clean container without shop UI elements or smooth scrolling.
  if (isAdmin) {
    return <div className="flex-grow flex flex-col">{children}</div>;
  }

  // For Storefront routes, we include the premium Navbar, Footer, PageTransitions, and Lenis smooth scrolling.
  return (
    <LenisProvider>
      <Navbar />
      <main className="flex-grow">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <Footer />
    </LenisProvider>
  );
}
