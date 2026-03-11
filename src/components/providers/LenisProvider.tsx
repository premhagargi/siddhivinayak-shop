'use client';

import { ReactLenis } from 'lenis/react';
import { ReactNode } from 'react';

/**
 * LenisProvider component to enable smooth scrolling across the application.
 * Configured with refined parameters for an ultra-smooth, premium feel.
 */
export default function LenisProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis 
      root 
      options={{ 
        lerp: 0.05, // Slower catch-up for a more weighted, smooth feel
        duration: 1.5, // Longer easing duration
        smoothWheel: true,
        smoothTouch: true,
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        infinite: false,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom premium easing
      }}
    >
      {children}
    </ReactLenis>
  );
}
