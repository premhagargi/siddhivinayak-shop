
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Search, Edit, Trash2, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
  mrp: number;
  category: string;
  stock: number;
  images: string[];
  description: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { toast } = useToast();

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load the product catalog.",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      
      setProducts(products.filter(p => p.id !== id));
      toast({
        title: "Product Removed",
        description: "The item has been successfully removed from the catalog.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete the product.",
      });
    }
  };

  const handleCreateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      category: formData.get("category"),
      price: formData.get("price"),
      stock: formData.get("stock"),
      description: formData.get("description"),
      images: ["https://picsum.photos/seed/" + Math.random() + "/400/500"] // Default placeholder
    };

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Create failed");

      toast({
        title: "Success",
        description: "Product listed successfully.",
      });
      setIsSheetOpen(false);
      fetchProducts(); // Refresh list
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to list the product.",
      });
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.category.toLowerCase().includes(search.toLowerCase());
    
    if (activeTab === "All") return matchesSearch;
    if (activeTab === "Sarees") return matchesSearch && p.category === "Saree";
    if (activeTab === "Silver") return matchesSearch && p.category === "Silver";
    
    return matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div className="space-y-1">
          <h1 className="font-headline text-2xl font-bold uppercase tracking-tight">Product Catalog</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Manage real-time inventory.</p>
        </div>
        
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="h-10 px-6 rounded-none bg-primary text-white font-bold uppercase tracking-widest text-[10px]">
              <Plus className="h-4 w-4 mr-2" /> New Creation
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-[450px] p-6 bg-background rounded-none">
            <SheetHeader className="mb-8">
              <SheetTitle className="font-headline text-xl uppercase font-bold tracking-tight">New Product Entry</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleCreateProduct} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Product Name</label>
                  <Input name="name" required className="rounded-none h-12 border-muted" placeholder="e.g. Royal Silk Banarasi" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</label>
                    <Input name="category" required className="rounded-none h-12 border-muted" placeholder="Saree / Silver" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Price (₹)</label>
                    <Input name="price" required type="number" className="rounded-none h-12 border-muted" placeholder="24900" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stock Quantity</label>
                  <Input name="stock" required type="number" className="rounded-none h-12 border-muted" placeholder="10" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description</label>
                  <textarea name="description" className="w-full h-24 p-3 bg-background border border-muted focus:border-primary outline-none transition-all text-xs resize-none" placeholder="Enter product heritage and details..." />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-none bg-primary text-white font-bold uppercase tracking-widest text-[10px]">
                List Product
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {/* View Tabs & Search */}
      <div className="space-y-3">
        <div className="flex border-b">
          {["All", "Sarees", "Silver"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all relative",
                activeTab === tab 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              {tab === "Silver" ? "Silver Items" : tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-none h-9 pl-10 border-muted bg-secondary/10 text-xs" 
              placeholder="Search catalog..." 
            />
          </div>
          <Button onClick={fetchProducts} variant="outline" className="h-9 rounded-none border-muted px-4 text-[10px] font-bold uppercase tracking-widest">
             Refresh Data
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-muted overflow-hidden relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : null}
        
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow className="border-muted hover:bg-transparent">
              <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-3">Item</TableHead>
              <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-3">Category</TableHead>
              <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-3">Price</TableHead>
              <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-3">Stock</TableHead>
              <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-3 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((p) => (
              <TableRow key={p.id} className="border-muted hover:bg-secondary/10 transition-colors">
                <TableCell className="py-2 px-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-8 w-8 bg-muted overflow-hidden shrink-0">
                      <Image 
                        src={p.images?.[0] || "https://placehold.co/100x100"} 
                        alt={p.name} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-tight truncate max-w-[200px]">{p.name}</span>
                  </div>
                </TableCell>
                <TableCell className="py-2 px-3">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{p.category}</span>
                </TableCell>
                <TableCell className="py-2 px-3 text-[11px] font-medium whitespace-nowrap">₹{p.price.toLocaleString('en-IN')}</TableCell>
                <TableCell className="py-2 px-3">
                  <span className={cn(
                    "px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-full",
                    p.stock < 10 ? "bg-accent/10 text-accent" : "bg-primary/5 text-primary"
                  )}>
                    {p.stock} Units
                  </span>
                </TableCell>
                <TableCell className="py-2 px-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/5">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-destructive hover:bg-destructive/5"
                      onClick={() => deleteProduct(p.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!loading && filteredProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-[10px] text-muted-foreground uppercase tracking-widest">
                  No products found in the database.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          {filteredProducts.length} items synced
        </p>
      </div>
    </div>
  );
}
