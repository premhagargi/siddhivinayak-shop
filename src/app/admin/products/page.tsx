"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Search, Edit, Trash2, Filter } from "lucide-react";
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

const INITIAL_PRODUCTS = [
  { id: "1", name: "Royal Maroon Silk Banarasi", price: 24900, category: "Saree", stock: 12, image: "https://picsum.photos/seed/s1/100/100" },
  { id: "2", name: "Emerald Kanjeevaram Gold Zari", price: 32500, category: "Saree", stock: 8, image: "https://picsum.photos/seed/s2/100/100" },
  { id: "3", name: "Sterling Silver Lakshmi Idol", price: 12500, category: "Silver", stock: 15, image: "https://picsum.photos/seed/v1/100/100" },
  { id: "4", name: "Minimalist Geometric Saree", price: 15800, category: "Saree", stock: 22, image: "https://picsum.photos/seed/s3/100/100" },
  { id: "5", name: "999 Pure Silver Coin", price: 5500, category: "Silver", stock: 50, image: "https://picsum.photos/seed/v2/100/100" },
  { id: "6", name: "Crimson Red Chiffon Drape", price: 12400, category: "Saree", stock: 5, image: "https://picsum.photos/seed/s4/100/100" },
  { id: "7", name: "999 Pure Silver Coin (50g)", price: 5500, category: "Silver", stock: 30, image: "https://picsum.photos/seed/v3/100/100" },
  { id: "8", name: "Handwoven Ivory Organza", price: 19200, category: "Saree", stock: 18, image: "https://picsum.photos/seed/s5/100/100" },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const { toast } = useToast();

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.category.toLowerCase().includes(search.toLowerCase());
    
    if (activeTab === "All") return matchesSearch;
    if (activeTab === "Sarees") return matchesSearch && p.category === "Saree";
    if (activeTab === "Silver") return matchesSearch && p.category === "Silver";
    
    return matchesSearch;
  });

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    toast({
      title: "Product Removed",
      description: "The item has been successfully removed from the catalog.",
    });
  };

  return (
    <div className="space-y-4">
      {/* Header - More compact */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div className="space-y-1">
          <h1 className="font-headline text-2xl font-bold uppercase tracking-tight">Product Catalog</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Manage inventory and details.</p>
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button className="h-10 px-6 rounded-none bg-primary text-white font-bold uppercase tracking-widest text-[10px]">
              <Plus className="h-4 w-4 mr-2" /> New Creation
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-[450px] p-6 bg-background rounded-none">
            <SheetHeader className="mb-8">
              <SheetTitle className="font-headline text-xl uppercase font-bold tracking-tight">New Product Entry</SheetTitle>
            </SheetHeader>
            <form className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Product Name</label>
                  <Input className="rounded-none h-12 border-muted" placeholder="e.g. Royal Silk Banarasi" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</label>
                    <Input className="rounded-none h-12 border-muted" placeholder="Saree / Silver" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Price (₹)</label>
                    <Input className="rounded-none h-12 border-muted" type="number" placeholder="24900" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stock Quantity</label>
                  <Input className="rounded-none h-12 border-muted" type="number" placeholder="10" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description</label>
                  <textarea className="w-full h-24 p-3 bg-background border border-muted focus:border-primary outline-none transition-all text-xs resize-none" placeholder="Enter product heritage and details..." />
                </div>
              </div>
              <Button className="w-full h-12 rounded-none bg-primary text-white font-bold uppercase tracking-widest text-[10px]">
                List Product
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {/* View Tabs & Search - High Density */}
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
          <Button variant="outline" className="h-9 rounded-none border-muted px-4 text-[10px] font-bold uppercase tracking-widest">
            <Filter className="h-3 w-3 mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* Table - Tight Paddings */}
      <div className="border border-muted overflow-hidden">
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
                      <Image src={p.image} alt={p.name} fill className="object-cover" />
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
            {filteredProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-[10px] text-muted-foreground uppercase tracking-widest">
                  No matches found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination - Compact */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          {filteredProducts.length} items
        </p>
        <div className="flex gap-1">
          <Button variant="outline" className="h-8 rounded-none border-muted text-[9px] font-bold uppercase tracking-widest px-3" disabled>
            Prev
          </Button>
          <Button variant="outline" className="h-8 rounded-none border-muted text-[9px] font-bold uppercase tracking-widest px-3">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
