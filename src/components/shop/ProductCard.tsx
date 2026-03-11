
"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        <button 
          className="absolute right-4 top-4 z-10 p-2 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-accent"
          aria-label="Add to wishlist"
        >
          <Heart className="h-4 w-4" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Button className="w-full bg-primary text-white font-bold uppercase text-xs tracking-widest rounded-none h-12">
            Quick Add
          </Button>
        </div>
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
