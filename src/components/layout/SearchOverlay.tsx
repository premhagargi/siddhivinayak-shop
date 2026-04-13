"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Search, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
}

const SUGGESTED_SEARCHES = [
  "Silk Banarasi",
  "Silver Ganesha",
  "Wedding Collection",
  "Minimalist Drapes",
  "Gift Sets"
];

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingRecommended, setLoadingRecommended] = useState(true);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Fetch recommended products on open
  useEffect(() => {
    if (!isOpen) return;
    const fetchRecommended = async () => {
      setLoadingRecommended(true);
      try {
        const res = await fetch("/api/products?limit=3&sort=newest");
        if (res.ok) {
          const data = await res.json();
          setRecommended(data.products || []);
        }
      } catch (error) {
        console.error("Error fetching recommended:", error);
      } finally {
        setLoadingRecommended(false);
      }
    };
    fetchRecommended();
  }, [isOpen]);

  // Search with debounce
  const searchProducts = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=6`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.products || []);
      }
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, searchProducts]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  const displayProducts = query.trim() ? results : recommended;
  const sectionTitle = query.trim()
    ? searching ? "Searching..." : `Results (${results.length})`
    : "Our Recommendations";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] bg-background overflow-y-auto"
        >
          <div className="container mx-auto px-4 md:px-8 min-h-full flex flex-col">
            {/* Top Bar: Search Input + Close */}
            <div className="flex items-center justify-between gap-6 py-8 md:py-12 border-b">
              <div className="relative flex-grow group max-w-4xl">
                {searching ? (
                  <Loader2 className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 md:h-6 md:w-6 text-muted-foreground animate-spin" />
                ) : (
                  <Search
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 md:h-6 md:w-6 text-muted-foreground group-focus-within:text-primary transition-colors"
                    strokeWidth={1.5}
                  />
                )}
                <Input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What are you looking for?"
                  className="w-full bg-transparent border-0 rounded-none h-12 md:h-16 pl-8 md:pl-12 text-xl md:text-2xl font-headline font-bold tracking-tight focus-visible:ring-0 focus-visible:ring-offset-0 outline-none transition-all placeholder:text-muted-foreground/30"
                />
              </div>
              <button
                onClick={onClose}
                className="p-3 hover:bg-secondary transition-colors shrink-0"
                aria-label="Close search"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content Area */}
            <div className="py-12 md:py-20 flex-grow">
              <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24">

                {/* Left: Suggested */}
                <div className="lg:col-span-4 space-y-10">
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-8">Suggested Searches</h3>
                    <div className="flex flex-col gap-6">
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

                {/* Right: Results / Recommendations */}
                <div className="lg:col-span-8 space-y-10">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{sectionTitle}</h3>
                  {loadingRecommended && !query.trim() ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse space-y-4">
                          <div className="aspect-[4/5] bg-muted rounded" />
                          <div className="space-y-2">
                            <div className="h-3 w-16 bg-muted rounded" />
                            <div className="h-3 w-full bg-muted rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : displayProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
                      {displayProducts.map((product) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.id}`}
                          onClick={onClose}
                          className="group space-y-4"
                        >
                          <div className="relative aspect-[4/5] bg-secondary overflow-hidden">
                            <Image
                              src={product.images?.[0] || "/assets/favicon.png"}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          </div>
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{product.category}</p>
                            <h4 className="text-xs font-bold uppercase tracking-tight group-hover:underline underline-offset-4 line-clamp-1">{product.name}</h4>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : query.trim() && !searching ? (
                    <p className="text-sm text-muted-foreground">No products found for &ldquo;{query}&rdquo;</p>
                  ) : null}
                </div>

              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
