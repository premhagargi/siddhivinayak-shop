"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Search, MoreVertical, Edit, Trash2, Filter } from "lucide-react";
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
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    toast({
      title: "Product Removed",
      description: "The item has been successfully removed from the catalog.",
    });
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b pb-8">
        <div className="space-y-2">
          <h1 className="font-headline text-3xl font-bold uppercase tracking-tight">Product Catalog</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Manage your inventory and product details.</p>
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button className="h-14 px-8 rounded-none bg-primary text-white font-bold uppercase tracking-widest text-[10px]">
              <Plus className="h-4 w-4 mr-2" /> Add New Creation
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-[540px] p-10 bg-background rounded-none">
            <SheetHeader className="mb-12">
              <SheetTitle className="font-headline text-2xl uppercase font-bold tracking-tight">New Product Entry</SheetTitle>
            </SheetHeader>
            <form className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Product Name</label>
                  <Input className="rounded-none h-14 border-muted" placeholder="e.g. Royal Silk Banarasi" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</label>
                    <Input className="rounded-none h-14 border-muted" placeholder="Saree / Silver" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Price (₹)</label>
                    <Input className="rounded-none h-14 border-muted" type="number" placeholder="24900" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stock Quantity</label>
                  <Input className="rounded-none h-14 border-muted" type="number" placeholder="10" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description</label>
                  <textarea className="w-full h-32 p-4 bg-background border border-muted focus:border-primary outline-none transition-all text-sm resize-none" placeholder="Enter product heritage and details..." />
                </div>
              </div>
              <Button className="w-full h-16 rounded-none bg-primary text-white font-bold uppercase tracking-widest text-[10px]">
                List Product
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {/* Filters & Tools */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-none h-12 pl-12 border-muted bg-secondary/10" 
            placeholder="Search catalog..." 
          />
        </div>
        <Button variant="outline" className="h-12 rounded-none border-muted px-6 text-[10px] font-bold uppercase tracking-widest">
          <Filter className="h-3 w-3 mr-2" /> Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="border border-muted">
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow className="border-muted hover:bg-transparent">
              <TableHead className="text-[10px] font-bold uppercase tracking-widest h-16">Item</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest h-16">Category</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest h-16">Price</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest h-16">Stock</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest h-16 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((p) => (
              <TableRow key={p.id} className="border-muted hover:bg-secondary/10 transition-colors">
                <TableCell className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 bg-muted overflow-hidden">
                      <Image src={p.image} alt={p.name} fill className="object-cover" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-tight">{p.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{p.category}</span>
                </TableCell>
                <TableCell className="text-xs font-medium">₹{p.price.toLocaleString('en-IN')}</TableCell>
                <TableCell>
                  <span className={cn(
                    "px-3 py-1 text-[9px] font-bold uppercase tracking-widest",
                    p.stock < 10 ? "bg-accent/10 text-accent" : "bg-primary/5 text-primary"
                  )}>
                    {p.stock} Units
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-primary/5">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 text-destructive hover:bg-destructive/5"
                      onClick={() => deleteProduct(p.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
