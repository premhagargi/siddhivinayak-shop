'use client';

import { usePathname, usePathname as useNavigationPathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MinimalNavbar from '@/components/layout/MinimalNavbar';
import PageTransition from '@/components/animations/PageTransition';
import LenisProvider from '@/components/providers/LenisProvider';
import {
  getLayoutConfig,
  shouldShowFooter,
  shouldShowGlobalNavbar,
  shouldShowMinimalNavbar,
} from '@/lib/layout-config';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * AppLayout - Main layout component with route-based UI control
 * 
 * Architecture:
 * - Uses layout config system to determine which UI elements to show
 * - Supports: default (full UI), focus (minimal), immersive (no chrome)
 * - Mobile-first: Account pages get minimal navbar on mobile
 * 
 * Following Amazon/Myntra best practices:
 * - Discovery pages: Show full navbar + footer
 * - Task/conversion pages: Hide footer, show minimal navbar
 */
export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = useNavigationPathname();
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get layout configuration based on current route
  const layoutConfig = getLayoutConfig(pathname || '');
  const showFooter = shouldShowFooter(pathname || '');
  const showGlobalNavbar = shouldShowGlobalNavbar(pathname || '');
  const showMinimal = shouldShowMinimalNavbar(pathname || '');

  // Handle Admin routes
  const isAdmin = pathname?.startsWith('/admin');

  // Handle Login page (already handled by config, but kept for explicit check)
  const isLogin = pathname === '/login';

  // Get page title for minimal navbar
  const getPageTitle = () => {
    const path = pathname || '';
    if (path.includes('/orders')) return 'My Orders';
    if (path.includes('/addresses')) return 'Addresses';
    if (path.includes('/profile')) return 'Profile';
    if (path === '/wishlist') return 'My Wishlist';
    if (path === '/cart') return 'Shopping Bag';
    if (path.includes('/checkout')) return 'Checkout';
    if (path === '/account') return 'My Account';
    return 'My Account';
  };

  // For Admin routes: clean container without shop UI
  if (isAdmin) {
    return <div className="flex-grow flex flex-col">{children}</div>;
  }

  // Show loading while checking hydration
  if (!mounted) {
    return (
      <div className="flex-grow flex flex-col">
        <PageTransition>
          {children}
        </PageTransition>
      </div>
    );
  }

  // Determine which navbar to show
  const renderNavbar = () => {
    // Focus layout with minimal navbar (mobile app-like)
    if (showMinimal && isMobile) {
      // For /account page, go to shop, for other pages go to account
      const isMainAccount = pathname === '/account';
      return (
        <MinimalNavbar 
          title={getPageTitle()} 
          showBackButton={true}
          backHref={isMainAccount ? "/shop" : "/account"}
        />
      );
    }

    // For focus layouts on desktop: show centered navbar variant
    if (layoutConfig.layoutType === 'focus' && !isMobile) {
      return <Navbar variant="centered" />;
    }

    // Default layout with full global navbar
    if (showGlobalNavbar) {
      return <Navbar variant={layoutConfig.navbarVariant} />;
    }

    // Fallback: no navbar
    return null;
  };

  // Build the layout based on configuration
  if (layoutConfig.layoutType === 'focus' || layoutConfig.layoutType === 'immersive') {
    // Focus/Immersive layouts: No full-page transitions, controlled navbar
    // Mobile: Reduced padding for account sub-pages, orders, addresses, wishlist
    // Desktop: Standard padding
    // Note: Cart and checkout pages handle their own padding via page-level styles
    const isAccountSubPage = pathname?.startsWith('/account/') || pathname === '/wishlist';
    // No top padding for login page (immersive layout with no navbar)
    const isLoginPage = pathname === '/login';
    // Cart and checkout handle their own padding - use minimal layout padding
    const isCartOrCheckout = pathname === '/cart' || pathname === '/checkout';
    const mainPadding = isLoginPage 
      ? "" 
      : isCartOrCheckout 
        ? isMobile 
          ? "pt-14 md:pt-16"  // Minimal - pages handle their own padding
          : "pt-16"
        : isMobile && isAccountSubPage 
          ? "pt-14" 
          : isMobile 
            ? "pt-16" 
            : "pt-16";
    return (
      <>
        {renderNavbar()}
        <main className={`flex-grow ${mainPadding}`}>
          {children}
        </main>
        {showFooter && <Footer />}
      </>
    );
  }

  // Default layout: Full UI with Lenis smooth scrolling
  return (
    <LenisProvider>
      {renderNavbar()}
      <main className="flex-grow">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      {showFooter && <Footer />}
    </LenisProvider>
  );
}
