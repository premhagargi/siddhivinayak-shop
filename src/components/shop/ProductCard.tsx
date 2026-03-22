
"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  mrp?: number;
}

export default function ProductCard({ id, name, price, category, image, mrp }: ProductCardProps) {
  const { addItem, removeItem, isInWishlist } = useWishlist();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const inWishlist = isInWishlist(id);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    try {
      if (inWishlist) {
        await removeItem(id);
        toast({
          title: "Removed from wishlist",
          description: `${name} has been removed from your wishlist.`,
        });
      } else {
        await addItem({
          productId: id,
          name,
          price,
          category,
          image,
          mrp,
        });
        toast({
          title: "Added to wishlist",
          description: `${name} has been added to your wishlist.`,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative flex flex-col border border-transparent hover:border-border transition-all duration-300"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <Link href={`/product/${id}`} className="block h-full w-full">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </Link>
        <button 
          className="absolute right-2 top-2 z-10 p-1.5 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-accent disabled:opacity-50"
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          onClick={handleWishlistToggle}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Heart className={`h-3 w-3 ${inWishlist ? "fill-accent text-accent" : ""}`} />
          )}
        </button>
      </div>
      <div className="flex flex-col p-2">
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
          {category}
        </span>
        <Link href={`/product/${id}`} className="hover:underline underline-offset-2">
          <h3 className="font-headline text-sm font-semibold tracking-tight text-primary truncate">
            {name}
          </h3>
        </Link>
        <p className="text-sm font-medium tracking-tight text-primary">
          ₹{price.toLocaleString('en-IN')}
        </p>
      </div>
    </motion.div>
  );
}
