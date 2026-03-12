
"use client";

import { useState } from "react";
import ProductCard from "@/components/shop/ProductCard";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, X } from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";

const PRODUCTS = [
  { id: "1", name: "Royal Maroon Silk Banarasi", price: 24900, category: "Saree", image: "https://picsum.photos/seed/s1/600/800" },
  { id: "2", name: "Emerald Kanjeevaram Gold Zari", price: 32500, category: "Saree", image: "https://picsum.photos/seed/s2/600/800" },
  { id: "3", name: "Sterling Silver Lakshmi Idol", price: 12500, category: "Silver", image: "https://picsum.photos/seed/v1/600/600" },
  { id: "4", name: "Minimalist Geometric Saree", price: 15800, category: "Saree", image: "https://picsum.photos/seed/s3/600/800" },
  { id: "5", name: "Pure Silver Ganesha Frame", price: 8900, category: "Silver", image: "https://picsum.photos/seed/v2/600/600" },
  { id: "6", name: "Crimson Red Chiffon Drape", price: 12400, category: "Saree", image: "https://picsum.photos/seed/s4/600/800" },
  { id: "7", name: "999 Pure Silver Coin (50g)", price: 5500, category: "Silver", image: "https://picsum.photos/seed/v3/600/600" },
  { id: "8", name: "Handwoven Ivory Organza", price: 19200, category: "Saree", image: "https://picsum.photos/seed/s5/600/800" },
];

export default function ShopPage() {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  return (
    <div className="container mx-auto px-4 pt-40 pb-12 md:px-8">
      {/* Header */}
      <div className="mb-20 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div className="space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Our Creations</span>
          <h1 className="font-headline text-5xl font-bold tracking-tight uppercase">The Collection</h1>
          <p className="text-sm text-muted-foreground uppercase tracking-widest">{PRODUCTS.length} Exceptional Pieces</p>
        </div>
        
        <div className="flex items-center gap-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-14 rounded-none border-primary px-8 font-bold uppercase tracking-widest text-[10px]">
                <SlidersHorizontal className="mr-3 h-4 w-4" /> Filter Selection
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[450px] rounded-none bg-background p-10">
              <SheetHeader className="mb-12">
                <SheetTitle className="font-headline text-2xl uppercase font-bold tracking-tight">Refine Selection</SheetTitle>
              </SheetHeader>
              <div className="space-y-12">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest mb-6 text-muted-foreground border-b pb-2">Category</h4>
                  <div className="flex flex-wrap gap-3">
                    {["Sarees", "Silver Idols", "Silver Coins", "Gift Sets"].map((cat) => (
                      <button 
                        key={cat}
                        className="border border-muted px-5 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest mb-6 text-muted-foreground border-b pb-2">Material</h4>
                  <div className="flex flex-wrap gap-3">
                    {["Silk", "Chiffon", "Organza", "Sterling Silver"].map((mat) => (
                      <button 
                        key={mat}
                        className="border border-muted px-5 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                      >
                        {mat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest mb-6 text-muted-foreground border-b pb-2">Investment Range</h4>
                  <div className="space-y-6 pt-2">
                    <input type="range" className="w-full accent-accent h-1 bg-muted appearance-none cursor-pointer" min="0" max="100000" />
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span>₹0</span>
                      <span>₹1,00,000+</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-10 left-10 right-10 flex gap-4">
                <Button className="flex-1 bg-primary text-white font-bold uppercase tracking-widest rounded-none h-16 text-[10px]">Show Results</Button>
                <Button variant="outline" className="flex-1 border-primary font-bold uppercase tracking-widest rounded-none h-16 text-[10px]">Clear</Button>
              </div>
            </SheetContent>
          </Sheet>

          <Select defaultValue="popular">
            <SelectTrigger className="w-[200px] rounded-none border-primary h-14 font-bold uppercase tracking-widest text-[10px] bg-transparent">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="popular">Most Coveted</SelectItem>
              <SelectItem value="newest">Recent Arrivals</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Bar */}
      {activeFilters.length > 0 && (
        <div className="mb-12 flex flex-wrap gap-3 items-center">
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mr-2">Filtered By:</span>
          {activeFilters.map(f => (
            <span key={f} className="flex items-center gap-3 bg-secondary px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-muted/50">
              {f} <X className="h-3 w-3 cursor-pointer hover:text-accent transition-colors" />
            </span>
          ))}
          <button className="text-[10px] font-bold uppercase tracking-widest underline underline-offset-8 ml-4 hover:text-accent transition-colors">Clear All</button>
        </div>
      )}

      {/* Product Grid - Restore 3 columns for "Big Cards" */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
        {PRODUCTS.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-32 flex justify-center items-center gap-2">
        <Button variant="outline" className="h-12 w-12 p-0 rounded-none border-primary bg-primary text-white text-[10px] font-bold">1</Button>
        <Button variant="outline" className="h-12 w-12 p-0 rounded-none border-muted hover:border-primary hover:text-primary transition-all text-[10px] font-bold">2</Button>
        <Button variant="outline" className="h-12 w-12 p-0 rounded-none border-muted hover:border-primary hover:text-primary transition-all text-[10px] font-bold">3</Button>
        <span className="flex items-center px-4 text-muted-foreground opacity-50">...</span>
        <Button variant="outline" className="h-12 w-12 p-0 rounded-none border-muted hover:border-primary hover:text-primary transition-all text-[10px] font-bold">8</Button>
      </div>
    </div>
  );
}
