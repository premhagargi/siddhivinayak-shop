
"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingBag, ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionFadeIn from "@/components/animations/SectionFadeIn";

const WISHLIST_ITEMS = [
  {
    id: "1",
    name: "Royal Maroon Silk Banarasi",
    price: 24900,
    image: "https://picsum.photos/seed/s1/600/800",
    category: "Saree",
    inStock: true
  },
  {
    id: "3",
    name: "Sterling Silver Lakshmi Idol",
    price: 12500,
    image: "https://picsum.photos/seed/v1/600/600",
    category: "Silver",
    inStock: true
  }
];

export default function WishlistPage() {
  return (
    <div className="container mx-auto px-4 pt-40 pb-24 md:px-8">
      <SectionFadeIn className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.4em] text-accent">Personal Gallery</span>
            <h1 className="font-headline text-4xl font-bold tracking-tight uppercase mt-2">My Wishlist</h1>
          </div>
          <p className="text-sm text-muted-foreground uppercase tracking-widest">
            {WISHLIST_ITEMS.length} Saved Items
          </p>
        </div>

        {WISHLIST_ITEMS.length > 0 ? (
          <div className="grid grid-cols-1 gap-12">
            <div className="flex flex-col border-t">
              {WISHLIST_ITEMS.map((item) => (
                <div key={item.id} className="flex flex-col md:flex-row gap-8 py-10 border-b group">
                  {/* Image */}
                  <Link href={`/product/${item.id}`} className="relative aspect-[3/4] w-full md:w-48 overflow-hidden bg-muted flex-shrink-0 block">
                    <Image 
                      src={item.image} 
                      alt={item.name} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                  </Link>

                  {/* Content */}
                  <div className="flex flex-col flex-grow justify-between py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.category}</span>
                        <Link href={`/product/${item.id}`} className="hover:underline underline-offset-4 block mt-1">
                          <h3 className="text-xl font-bold uppercase tracking-tight">{item.name}</h3>
                        </Link>
                        <p className="text-sm font-bold mt-2">₹{item.price.toLocaleString('en-IN')}</p>
                      </div>
                      <button className="text-muted-foreground hover:text-destructive transition-colors p-2" aria-label="Remove from wishlist">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                      <Button className="h-14 rounded-none bg-primary text-white font-bold uppercase tracking-widest text-[10px] flex-grow sm:flex-initial px-10">
                        <ShoppingBag className="h-4 w-4 mr-2" /> Add to Bag
                      </Button>
                      <Link href={`/product/${item.id}`}>
                        <Button variant="outline" className="h-14 rounded-none border-primary font-bold uppercase tracking-widest text-[10px] w-full sm:w-auto px-10">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-8">
              <Link href="/shop">
                <Button variant="link" className="group text-sm font-bold uppercase tracking-widest flex items-center gap-2 transition-colors hover:text-accent">
                  Continue Shopping <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="relative mb-8">
               <Heart className="h-20 w-20 text-muted/30" strokeWidth={1} />
               <Heart className="h-10 w-10 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h3 className="text-2xl font-bold uppercase tracking-tight mb-4">Your wishlist is empty</h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-10 leading-relaxed">
              Explore our collection of timeless sarees and meaningful silver gifts to find pieces you love.
            </p>
            <Link href="/shop">
              <Button className="h-16 w-64 rounded-none bg-primary text-white font-bold uppercase tracking-widest text-xs">
                Browse Collection
              </Button>
            </Link>
          </div>
        )}
      </SectionFadeIn>
    </div>
  );
}
