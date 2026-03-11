
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
    <div className="container mx-auto px-4 py-12 md:px-8">
      {/* Header */}
      <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight uppercase">The Collection</h1>
          <p className="mt-2 text-muted-foreground">8 products total</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-10 rounded-none border-primary px-6 font-bold uppercase tracking-widest">
                <SlidersHorizontal className="mr-2 h-4 w-4" /> Filter
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[350px] rounded-none">
              <SheetHeader>
                <SheetTitle className="font-headline text-xl uppercase font-bold">Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-8 space-y-10">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-4">Category</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Sarees", "Silver Idols", "Silver Coins", "Gift Sets"].map((cat) => (
                      <button 
                        key={cat}
                        className="border px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-colors"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-4">Material</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Silk", "Chiffon", "Organza", "Sterling Silver"].map((mat) => (
                      <button 
                        key={mat}
                        className="border px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-colors"
                      >
                        {mat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-4">Price Range</h4>
                  <div className="space-y-4">
                    <input type="range" className="w-full accent-accent" min="0" max="100000" />
                    <div className="flex justify-between text-xs font-bold uppercase">
                      <span>₹0</span>
                      <span>₹1,00,000+</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-8 left-6 right-6 flex gap-4">
                <Button className="flex-1 bg-primary text-white font-bold uppercase tracking-widest rounded-none h-14">Apply</Button>
                <Button variant="outline" className="flex-1 border-primary font-bold uppercase tracking-widest rounded-none h-14">Reset</Button>
              </div>
            </SheetContent>
          </Sheet>

          <Select defaultValue="popular">
            <SelectTrigger className="w-[180px] rounded-none border-primary h-10 font-bold uppercase tracking-widest text-xs">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="popular">Popularity</SelectItem>
              <SelectItem value="newest">New Arrivals</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Bar */}
      {activeFilters.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-3">
          {activeFilters.map(f => (
            <span key={f} className="flex items-center gap-2 bg-secondary px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest">
              {f} <X className="h-3 w-3 cursor-pointer" />
            </span>
          ))}
          <button className="text-[10px] font-bold uppercase tracking-widest underline underline-offset-4">Clear All</button>
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
        {PRODUCTS.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-20 flex justify-center gap-2">
        <Button variant="outline" className="h-10 w-10 p-0 rounded-none border-primary bg-primary text-white">1</Button>
        <Button variant="outline" className="h-10 w-10 p-0 rounded-none border-primary hover:bg-primary hover:text-white">2</Button>
        <Button variant="outline" className="h-10 w-10 p-0 rounded-none border-primary hover:bg-primary hover:text-white">3</Button>
        <span className="flex items-center px-2">...</span>
        <Button variant="outline" className="h-10 w-10 p-0 rounded-none border-primary hover:bg-primary hover:text-white">8</Button>
      </div>
    </div>
  );
}
