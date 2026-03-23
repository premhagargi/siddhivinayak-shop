/**
 * Layout Type Definitions
 * 
 * Controls which UI elements (navbar, footer) are shown on each page type
 * following modern e-commerce best practices (Amazon, Myntra)
 */

export type LayoutType = "default" | "focus" | "immersive";

/**
 * Navbar Variant Types
 * Controls navbar appearance based on page context
 */
export type NavbarVariant = "full" | "minimal" | "centered";

/**
 * Layout configuration for different route types
 */
export interface LayoutConfig {
  layoutType: LayoutType;
  navbarVariant: NavbarVariant;
  showFooter: boolean;
  showGlobalNavbar: boolean;
  showMinimalNavbar: boolean;
  showBackButton?: boolean;
  pageTitle?: string;
}

/**
 * Default layout configuration (full UI with navbar + footer)
 * Used for: Home, Shop, Product, Static pages
 */
export const DEFAULT_LAYOUT: LayoutConfig = {
  layoutType: "default",
  navbarVariant: "full",
  showFooter: true,
  showGlobalNavbar: true,
  showMinimalNavbar: false,
};

/**
 * Focus layout (minimal UI - no footer, no global navbar)
 * Used for: Account, Cart, Checkout, Wishlist, Login
 */
export const FOCUS_LAYOUT: LayoutConfig = {
  layoutType: "focus",
  navbarVariant: "centered",
  showFooter: false,
  showGlobalNavbar: false,
  showMinimalNavbar: true,
};

/**
 * Immersive layout (full-screen, no chrome)
 * Reserved for future use: Video players, image galleries
 */
export const IMMERSIVE_LAYOUT: LayoutConfig = {
  layoutType: "immersive",
  navbarVariant: "minimal",
  showFooter: false,
  showGlobalNavbar: false,
  showMinimalNavbar: false,
};

/**
 * Route mapping to determine layout type
 * Add new routes here as the app grows
 */
export const LAYOUT_BY_ROUTE: Record<string, LayoutConfig> = {
  // Homepage - full UI
  "/": DEFAULT_LAYOUT,

  // Shop & Products - full UI (browsing/discovery)
  "/shop": DEFAULT_LAYOUT,
  "/product": DEFAULT_LAYOUT,

  // Static pages - full UI
  "/about": DEFAULT_LAYOUT,
  "/contact": DEFAULT_LAYOUT,

  // Account section - focus layout (mobile app-like)
  "/account": FOCUS_LAYOUT,
  "/account/orders": FOCUS_LAYOUT,
  "/account/addresses": FOCUS_LAYOUT,
  "/account/profile": FOCUS_LAYOUT,
  "/account/login": IMMERSIVE_LAYOUT,

  // Utility/Cart/Checkout - focus layout
  "/cart": FOCUS_LAYOUT,
  "/checkout": FOCUS_LAYOUT,

  // Wishlist - focus on mobile, default on desktop (handled in component)
  "/wishlist": FOCUS_LAYOUT,

  // Login - immersive layout (no navbar at all)
  "/login": IMMERSIVE_LAYOUT,
};

/**
 * Determines layout config based on pathname
 * Uses prefix matching for nested routes
 */
export function getLayoutConfig(pathname: string): LayoutConfig {
  // Exact match first
  if (LAYOUT_BY_ROUTE[pathname]) {
    return LAYOUT_BY_ROUTE[pathname];
  }

  // Check for nested routes (prefix matching)
  const routes = Object.keys(LAYOUT_BY_ROUTE).sort((a, b) => b.length - a.length);
  
  for (const route of routes) {
    if (pathname.startsWith(route)) {
      return LAYOUT_BY_ROUTE[route];
    }
  }

  // Default fallback - show full UI
  return DEFAULT_LAYOUT;
}

/**
 * Check if route should show footer
 */
export function shouldShowFooter(pathname: string): boolean {
  const config = getLayoutConfig(pathname);
  return config.showFooter;
}

/**
 * Check if route should show global navbar
 */
export function shouldShowGlobalNavbar(pathname: string): boolean {
  const config = getLayoutConfig(pathname);
  return config.showGlobalNavbar;
}

/**
 * Check if route should show minimal navbar
 */
export function shouldShowMinimalNavbar(pathname: string): boolean {
  const config = getLayoutConfig(pathname);
  return config.showMinimalNavbar;
}
