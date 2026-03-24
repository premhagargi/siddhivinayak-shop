"use client";

import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
}

/**
 * Skeleton loader for product cards
 * Matches exact layout of ProductCard component:
 * - Image aspect ratio: 3/4
 * - Text lines: category, title, price
 * - Grid behavior: 2-col mobile, 3-col sm, 4-col lg
 */
export default function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col border border-transparent",
        className
      )}
    >
      {/* Image placeholder - 1:1 aspect ratio matching ProductCard */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <div className="absolute inset-0 skeleton-shimmer" />
      </div>
      
      {/* Content placeholder - matches ProductCard p-2 padding */}
      <div className="flex flex-col p-2 space-y-2">
        {/* Category line - text-[9px] equivalent */}
        <div className="h-3 w-16 rounded skeleton-shimmer" />
        
        {/* Product name line - text-sm equivalent */}
        <div className="h-4 w-full rounded skeleton-shimmer" />
        
        {/* Price line - text-sm equivalent */}
        <div className="h-4 w-20 rounded skeleton-shimmer" />
      </div>
    </div>
  );
}