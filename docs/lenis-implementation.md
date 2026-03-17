# Lenis Smooth Scrolling Implementation Guide

This document outlines the "Premium Minimalist" smooth scrolling setup used in the Siddhivinayak project. This configuration is designed for an ultra-smooth, high-end editorial feel (similar to Aesop or luxury brand sites).

## 1. Core Configuration (`LenisProvider.tsx`)

The implementation uses `lenis/react`. The values below are tuned for a balance between responsiveness and silkiness, with a focus on controlled scroll distance.

```typescript
// src/components/providers/LenisProvider.tsx
options={{ 
  lerp: 0.1,             // Linear interpolation (snappy but smooth)
  duration: 1.2,         // The duration of the scroll animation in seconds
  smoothWheel: true,     // Enable smooth scrolling for mouse wheel
  smoothTouch: true,     // Enable smooth scrolling for touch devices
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  wheelMultiplier: 0.7,  // REFINED: Balanced sensitivity for mouse wheel (silky response)
  touchMultiplier: 0.8,  // REFINED: Natural sensitivity for touch gestures
  infinite: false,
  // Custom Easing: Exponential out for a premium, weighted feel
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
}}
```

## 2. Global CSS Requirements (`globals.css`)

Lenis requires specific CSS to prevent layout shifts and handle fixed elements during scrolling.

```css
/* Lenis Recommended CSS */
html.lenis,
html.lenis body {
  height: auto;
}

.lenis.lenis-smooth {
  scroll-behavior: auto !important;
}

.lenis.lenis-smooth [data-lenis-prevent] {
  overscroll-behavior: contain;
}

.lenis.lenis-stopped {
  overflow: hidden;
}

.lenis.lenis-scrolling iframe {
  pointer-events: none;
}

/* Premium Scrollbar Styling */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  @apply bg-background;
}
::-webkit-scrollbar-thumb {
  @apply bg-muted-foreground/20;
}
::-webkit-scrollbar-thumb:hover {
  @apply bg-muted-foreground/40;
}
```

## 3. Implementation Strategy (`AppLayout.tsx`)

To avoid issues with functional UI (like Admin Panels or Dashboards), Lenis is conditionally applied only to the storefront.

```tsx
// src/components/layout/AppLayout.tsx
export function AppLayout({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    // Return standard scrolling for administrative tools
    return <div className="flex-grow flex flex-col">{children}</div>;
  }

  // Wrap the storefront in the smooth scroller
  return (
    <LenisProvider>
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </LenisProvider>
  );
}
```

## 4. Why these values?

- **Lerp (0.1)**: Most defaults use `0.05`. We bumped it to `0.1` to ensure that even though it's smooth, it doesn't feel "laggy" to users who want to move quickly.
- **Custom Easing**: The `Math.pow(2, -10 * t)` function creates a "soft landing" effect where the scroll starts fast and glides to a stop, mimicking physical momentum.
- **Wheel Multiplier (0.7)**: Provides a silky response that covers enough distance to be "easy" while still feeling high-end and weighted.
- **Touch Multiplier (0.8)**: Provides a natural feel on touch devices, maintaining the "luxury" weight without requiring excessive swiping.
