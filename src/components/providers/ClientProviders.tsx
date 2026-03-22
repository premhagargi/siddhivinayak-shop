"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { CartProvider } from "@/components/providers/CartProvider";
import { WishlistProvider } from "@/components/providers/WishlistProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import { Toaster } from "@/components/ui/toaster";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <AppLayout>
            {children}
          </AppLayout>
          <Toaster />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
