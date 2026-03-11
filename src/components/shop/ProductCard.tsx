"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

export default function ProductCard({ id, name, price, category, image }: ProductCardProps) {
  return (
    <div className="group relative flex flex-col border border-transparent hover:border-border transition-all duration-300">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <Link href={`/product/${id}`} className="block h-full w-full">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </Link>
        <button 
          className="absolute right-4 top-4 z-10 p-2 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-accent"
          aria-label="Add to wishlist"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-col p-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">
          {category}
        </span>
        <Link href={`/product/${id}`} className="hover:underline underline-offset-4">
          <h3 className="font-headline text-sm font-semibold tracking-tight text-primary truncate">
            {name}
          </h3>
        </Link>
        <p className="mt-1 text-sm font-medium tracking-tight text-primary">
          ₹{price.toLocaleString('en-IN')}
        </p>
      </div>
    </div>
  );
}
