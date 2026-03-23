
"use client";

import { useState, useEffect, useCallback } from "react";
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
import SkeletonCard from "@/components/shop/SkeletonCard";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  mrp: number;
  category: string;
  stock: number;
  images: string[];
  description?: string;
  sareeDetails?: {
    material: string;
    craft: string;
    color: string;
  };
  silverDetails?: {
    purity: string;
    weight: string;
    finish: string;
  };
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [category, setCategory] = useState<string>("All");
  const [sort, setSort] = useState<string>("newest");
  const [pagination, setPagination] = useState<ProductsResponse['pagination'] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  // Fetch products from API
  const fetchProducts = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '12');
      
      if (category && category !== "All") {
        params.set('category', category);
      }
      
      if (sort) {
        params.set('sort', sort);
      }

      const res = await fetch(`/api/products?${params.toString()}`);
      
      if (!res.ok) {
        throw new Error("Failed to fetch products");
      }
      
      const data: ProductsResponse = await res.json();
      setProducts(data.products);
      setPagination(data.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load products. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [category, sort, toast]);

  // Fetch on category or sort change
  useEffect(() => {
    fetchProducts(1);
  }, [category, sort, fetchProducts]);

  // Handle filter application
  const handleApplyFilters = () => {
    fetchProducts(1);
    setActiveFilters([category]);
  };

  return (
    <div className="container mx-auto px-4 pt-16 pb-8 md:px-8">
      {/* Header */}
      <div className="mb-6 mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Our Creations</span>
          <p className="text-sm text-muted-foreground uppercase tracking-widest">{pagination?.totalItems || 0} Exceptional Pieces</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-8 rounded-none border-primary px-6 font-bold uppercase tracking-widest text-[10px]">
                <SlidersHorizontal className="mr-2 h-4 w-4" /> Filter
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[450px] rounded-none bg-background p-6">
              <SheetHeader className="mb-8">
                <SheetTitle className="font-headline text-xl uppercase font-bold tracking-tight">Refine Selection</SheetTitle>
              </SheetHeader>
              <div className="space-y-8">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest mb-4 text-muted-foreground border-b pb-2">Category</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Sarees", "Silver Idols", "Silver Coins", "Gift Sets"].map((cat) => (
                      <button 
                        key={cat}
                        className="border border-muted px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest mb-4 text-muted-foreground border-b pb-2">Material</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Silk", "Chiffon", "Organza", "Sterling Silver"].map((mat) => (
                      <button 
                        key={mat}
                        className="border border-muted px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                      >
                        {mat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest mb-4 text-muted-foreground border-b pb-2">Investment Range</h4>
                  <div className="space-y-4 pt-2">
                    <input type="range" className="w-full accent-accent h-1 bg-muted appearance-none cursor-pointer" min="0" max="100000" />
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span>₹0</span>
                      <span>₹1,00,000+</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-6 left-6 right-6 flex gap-4">
                <Button className="flex-1 bg-primary text-white font-bold uppercase tracking-widest rounded-none h-12 text-[10px]">Show Results</Button>
                <Button variant="outline" className="flex-1 border-primary font-bold uppercase tracking-widest rounded-none h-12 text-[10px]">Clear</Button>
              </div>
            </SheetContent>
          </Sheet>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[180px] rounded-none border-primary h-8 font-bold uppercase tracking-widest text-[10px] bg-transparent">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="newest">Recent Arrivals</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Bar */}
      {activeFilters.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-3 items-center">
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
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              id={product.id}
              name={product.name}
              price={product.price}
              category={product.category}
              image={product.images?.[0] || "https://placehold.co/600x800"}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No products found</p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center gap-2">
          <Button 
            variant="outline" 
            className="h-12 w-12 p-0 rounded-none border-muted hover:border-primary hover:text-primary transition-all text-[10px] font-bold"
            disabled={!pagination.hasPrevPage}
            onClick={() => fetchProducts(currentPage - 1)}
          >
            ←
          </Button>
          {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <Button 
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                className="h-12 w-12 p-0 rounded-none border-muted hover:border-primary hover:text-primary transition-all text-[10px] font-bold"
                onClick={() => fetchProducts(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
          <Button 
            variant="outline" 
            className="h-12 w-12 p-0 rounded-none border-muted hover:border-primary hover:text-primary transition-all text-[10px] font-bold"
            disabled={!pagination.hasNextPage}
            onClick={() => fetchProducts(currentPage + 1)}
          >
            →
          </Button>
        </div>
      )}
    </div>
  );
}
