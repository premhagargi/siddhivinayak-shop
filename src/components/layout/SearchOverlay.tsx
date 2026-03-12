"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Search, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTED_SEARCHES = [
  "Silk Banarasi",
  "Silver Ganesha",
  "Wedding Collection",
  "Minimalist Drapes",
  "Gift Sets"
];

const RECOMMENDED_PRODUCTS = [
  { id: "1", name: "Royal Maroon Silk Banarasi", price: 24900, category: "Saree", image: "https://picsum.photos/seed/s1/400/500" },
  { id: "3", name: "Sterling Silver Lakshmi Idol", price: 12500, category: "Silver", image: "https://picsum.photos/seed/v1/400/400" },
  { id: "4", name: "Minimalist Geometric Saree", price: 15800, category: "Saree", image: "https://picsum.photos/seed/s3/400/500" },
];

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] bg-background flex flex-col"
        >
          {/* Header */}
          <div className="container mx-auto px-4 md:px-8 h-24 flex items-center justify-between border-b">
            <span className="font-headline text-lg font-bold tracking-[0.25em] uppercase">
              SIDDHIVINAYAK
            </span>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-secondary transition-colors"
              aria-label="Close search"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Search Input Area */}
          <div className="container mx-auto px-4 md:px-8 pt-20">
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="relative group">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground group-focus-within:text-primary transition-colors" strokeWidth={1} />
                <Input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What are you looking for?"
                  className="w-full bg-transparent border-0 border-b-2 border-muted rounded-none h-20 pl-12 pr-4 text-3xl md:text-5xl font-headline font-bold tracking-tight focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-muted outline-none transition-all placeholder:text-muted-foreground/30"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                {/* Left: Suggested */}
                <div className="lg:col-span-4 space-y-8">
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-6">Suggested Searches</h3>
                    <div className="flex flex-col gap-4">
                      {SUGGESTED_SEARCHES.map((term) => (
                        <button
                          key={term}
                          onClick={() => setQuery(term)}
                          className="text-left text-lg font-medium hover:text-accent transition-colors flex items-center justify-between group"
                        >
                          {term}
                          <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Recommendations */}
                <div className="lg:col-span-8 space-y-8">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Our Recommendations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {RECOMMENDED_PRODUCTS.map((product) => (
                      <Link 
                        key={product.id} 
                        href={`/product/${product.id}`}
                        onClick={onClose}
                        className="group space-y-4"
                      >
                        <div className="relative aspect-[4/5] bg-secondary overflow-hidden">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{product.category}</p>
                          <h4 className="text-xs font-bold uppercase tracking-tight group-hover:underline underline-offset-4">{product.name}</h4>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}