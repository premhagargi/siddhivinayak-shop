"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface MinimalNavbarProps {
  title?: string;
  showBackButton?: boolean;
  backHref?: string;
  className?: string;
}

/**
 * MinimalNavbar - A clean, app-like navigation header for focus layouts
 * Used on: Account pages, Cart, Checkout, Wishlist (mobile)
 * 
 * Features:
 * - Optional back button (left aligned)
 * - Optional title (centered or left of back button)
 * - No branding, search, or extra icons
 * - Minimal height for maximum content space
 */
export default function MinimalNavbar({
  title,
  showBackButton = true,
  backHref,
  className = "",
}: MinimalNavbarProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-background/95 backdrop-blur border-b supports-[backdrop-filter]:bg-background/60 ${className}`}
    >
      <div className="flex items-center h-14 px-4">
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-9 w-9 -ml-2 mr-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        {title && (
          <h1 className="text-lg font-semibold">{title}</h1>
        )}
      </div>
    </header>
  );
}
