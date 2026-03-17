'use client';

import { ReactLenis } from 'lenis/react';
import { ReactNode } from 'react';

/**
 * LenisProvider component to enable smooth scrolling across the application.
 * Configured with refined parameters for an ultra-smooth, premium feel.
 * The multipliers have been tuned to be "silky" but responsive, ensuring 
 * that the scroll feels easy but controlled.
 */
export default function LenisProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis 
      root 
      options={{ 
        lerp: 0.1, 
        duration: 1.2, 
        smoothWheel: true,
        smoothTouch: true,
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        wheelMultiplier: 0.7, // Balanced: responsive but silky
        touchMultiplier: 0.8, // Balanced: provides a natural feel on mobile
        infinite: false,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      }}
    >
      {children}
    </ReactLenis>
  );
}
