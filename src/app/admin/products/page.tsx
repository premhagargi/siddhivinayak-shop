
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Plus, Search, Edit, Trash2, Loader2, X, Upload } from "lucide-react";
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
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { uploadImages, optimizeImage } from "@/lib/upload";

interface Product {
  id: string;
  name: string;
  price: number;
  mrp: number;
  category: string;
  stock: number;
  images: string[];
  description: string;
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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("Saree");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit mode
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Image upload states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sync Error",
        description: "Could not load the product catalog.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection for image upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file size (max 1MB)
    const validFiles = files.filter(file => {
      if (file.size > 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: `${file.name} exceeds 1MB limit`,
        });
        return false;
      }
      if (!file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: `${file.name} is not an image`,
        });
        return false;
      }
      return true;
    });

    setSelectedFiles(validFiles);
    
    // Generate previews
    const previews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  // Handle image upload
  const handleImageUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsUploading(true);
    try {
      const urls = await uploadImages(selectedFiles);
      setUploadedUrls(urls);
      toast({
        title: "Upload Complete",
        description: `${urls.length} image(s) uploaded successfully`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Failed to upload images",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Remove selected image
  const removeImage = (index: number) => {
    const newFiles = [...selectedFiles];
    const newPreviews = [...imagePreviews];
    const newUrls = [...uploadedUrls];
    
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    newUrls.splice(index, 1);
    
    setSelectedFiles(newFiles);
    setImagePreviews(newPreviews);
    setUploadedUrls(newUrls);
  };

  // Reset form state
  const resetFormState = () => {
    setEditingProduct(null);
    setExistingImages([]);
    setSelectedFiles([]);
    setImagePreviews([]);
    setUploadedUrls([]);
    setIsUploading(false);
    setSelectedCategory("Saree");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Open sheet in edit mode with the product's data pre-loaded
  const startEditing = (product: Product) => {
    setEditingProduct(product);
    setSelectedCategory(product.category || "Saree");
    setExistingImages(product.images || []);
    setSelectedFiles([]);
    setImagePreviews([]);
    setUploadedUrls([]);
    setIsSheetOpen(true);
  };

  // Remove an already-saved image (existing Cloudinary URL)
  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      
      setProducts(products.filter(p => p.id !== id));
      toast({
        title: "Item Removed",
        description: "Product successfully deleted from the database.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: "Could not delete the product.",
      });
    }
  };

  const handleSubmitProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    const priceStr = formData.get("price") as string;
    const mrpStr = formData.get("mrp") as string;
    const stockStr = formData.get("stock") as string;

    // Upload any newly selected files
    let newImageUrls = uploadedUrls;
    if (selectedFiles.length > 0 && uploadedUrls.length === 0) {
      try {
        newImageUrls = await uploadImages(selectedFiles);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: error.message || "Failed to upload images. Please try again.",
        });
        setIsSubmitting(false);
        return;
      }
    }

    // Merge existing images (edit mode) with newly uploaded ones
    const allImages = [...existingImages, ...newImageUrls];
    const productImages =
      allImages.length > 0
        ? allImages
        : editingProduct
          ? editingProduct.images
          : ["https://picsum.photos/seed/" + Math.floor(Math.random() * 1000) + "/600/800"];

    const baseData = {
      name: (formData.get("name") as string) || "",
      category: selectedCategory,
      price: parseFloat(priceStr) || 0,
      mrp: parseFloat(mrpStr) || parseFloat(priceStr) || 0,
      stock: parseInt(stockStr, 10) || 0,
      description: (formData.get("description") as string) || "",
      images: productImages,
    };

    const extraDetails =
      selectedCategory === "Saree"
        ? {
            sareeDetails: {
              material: (formData.get("material") as string) || "",
              craft: (formData.get("craft") as string) || "",
              color: (formData.get("color") as string) || "",
            },
            silverDetails: null,
          }
        : {
            silverDetails: {
              purity: (formData.get("purity") as string) || "",
              weight: (formData.get("weight") as string) || "",
              finish: (formData.get("finish") as string) || "",
            },
            sareeDetails: null,
          };

    const isEditing = !!editingProduct;
    const url = isEditing
      ? `/api/admin/products/${editingProduct!.id}`
      : "/api/admin/products";
    const method = isEditing ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...baseData, ...extraDetails }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || (isEditing ? "Update failed" : "Create failed"));
      }

      toast({
        title: isEditing ? "Product Updated" : "Inventory Updated",
        description: isEditing
          ? "Product changes saved successfully."
          : "New creation added to the catalog.",
      });
      setIsSheetOpen(false);
      resetFormState();
      fetchProducts();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Save Error",
        description: error.message || "Failed to save the product.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || 
                          p.category?.toLowerCase().includes(search.toLowerCase());
    if (activeTab === "All") return matchesSearch;
    if (activeTab === "Sarees") return matchesSearch && p.category === "Saree";
    if (activeTab === "Silver") return matchesSearch && p.category === "Silver";
    return matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div className="space-y-1">
          <h1 className="font-headline text-2xl font-bold uppercase tracking-tight">Product Catalog</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Manage live inventory across India.</p>
        </div>
        
        <Button
          onClick={() => { resetFormState(); setIsSheetOpen(true); }}
          className="h-10 px-6 rounded-none bg-primary text-white font-bold uppercase tracking-widest text-[10px]"
        >
          <Plus className="h-4 w-4 mr-2" /> New Entry
        </Button>

        <Sheet open={isSheetOpen} onOpenChange={(open) => {
          if (!open) resetFormState();
          setIsSheetOpen(open);
        }}>
          <SheetContent side="right" className="w-full sm:w-[500px] p-6 bg-background rounded-none overflow-y-auto">
            <SheetHeader className="mb-8 border-b pb-4">
              <SheetTitle className="font-headline text-xl uppercase font-bold tracking-tight">
                {editingProduct ? "Edit Product" : "Product Registration"}
              </SheetTitle>
            </SheetHeader>
            {/* key forces React to re-mount the form with fresh defaultValues when switching products */}
            <form key={editingProduct?.id || "new"} onSubmit={handleSubmitProduct} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category Selection</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="rounded-none h-12 border-muted">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                      <SelectItem value="Saree">Saree / Clothing</SelectItem>
                      <SelectItem value="Silver">Silver Gifting Item</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Product Name</label>
                  <Input name="name" required defaultValue={editingProduct?.name || ""} className="rounded-none h-12 border-muted" placeholder="e.g. Royal Silk Banarasi" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Selling Price (₹)</label>
                    <Input name="price" required type="number" step="0.01" defaultValue={editingProduct?.price || ""} className="rounded-none h-12 border-muted" placeholder="24900" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">MRP (Optional)</label>
                    <Input name="mrp" type="number" step="0.01" defaultValue={editingProduct?.mrp || ""} className="rounded-none h-12 border-muted" placeholder="29900" />
                  </div>
                </div>

                {selectedCategory === "Saree" ? (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Material</label>
                      <Input name="material" defaultValue={editingProduct?.sareeDetails?.material || ""} className="rounded-none h-12 border-muted" placeholder="e.g. Pure Silk" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Craft</label>
                      <Input name="craft" defaultValue={editingProduct?.sareeDetails?.craft || ""} className="rounded-none h-12 border-muted" placeholder="e.g. Handloom Weave" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Purity</label>
                      <Input name="purity" defaultValue={editingProduct?.silverDetails?.purity || ""} className="rounded-none h-12 border-muted" placeholder="e.g. 999 Hallmark" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Weight (g)</label>
                      <Input name="weight" defaultValue={editingProduct?.silverDetails?.weight || ""} className="rounded-none h-12 border-muted" placeholder="e.g. 50g" />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stock Units</label>
                  <Input name="stock" required type="number" defaultValue={editingProduct?.stock ?? ""} className="rounded-none h-12 border-muted" placeholder="10" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description</label>
                  <textarea name="description" defaultValue={editingProduct?.description || ""} className="w-full h-24 p-3 bg-background border border-muted focus:border-primary outline-none transition-all text-xs resize-none" placeholder="Enter heritage and styling notes..." />
                </div>

                {/* Image Section */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Product Images</label>

                  {/* Existing images (edit mode) */}
                  {existingImages.length > 0 && (
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Current Images</p>
                      <div className="grid grid-cols-4 gap-2">
                        {existingImages.map((url, index) => (
                          <div key={url} className="relative aspect-square bg-muted rounded-md overflow-hidden group">
                            <img src={optimizeImage(url, 200)} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(index)}
                              className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* File Input for new uploads */}
                  <div className="border-2 border-dashed border-muted p-4 text-center hover:border-primary/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground">
                      {editingProduct ? "Add more images" : "Images will be uploaded when you save"}
                    </p>
                    <p className="text-xs text-muted-foreground">Click to select images (max 5MB each)</p>
                  </div>

                  {/* New image previews */}
                  {imagePreviews.length > 0 && (
                    <div>
                      {existingImages.length > 0 && (
                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">New Images</p>
                      )}
                      <div className="grid grid-cols-4 gap-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative aspect-square bg-muted rounded-md overflow-hidden group">
                            <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            {uploadedUrls[index] && (
                              <div className="absolute bottom-1 left-1 right-1">
                                <span className="text-[8px] bg-green-500 text-white px-1 rounded">Uploaded</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="flex items-center justify-center gap-2 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-xs text-muted-foreground">Uploading images...</span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="w-full h-14 rounded-none bg-primary text-white font-bold uppercase tracking-widest text-[10px]"
              >
                {isSubmitting ? "Processing..." : editingProduct ? "Update Product" : "Save Product"}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="space-y-3">
        <div className="flex border-b">
          {["All", "Sarees", "Silver"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all relative",
                activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              {tab === "Silver" ? "Silver Items" : tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
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
              placeholder="Search database..." 
            />
          </div>
          <Button onClick={fetchProducts} variant="outline" className="h-9 rounded-none border-muted px-4 text-[10px] font-bold uppercase tracking-widest">
             Refresh Sync
          </Button>
        </div>
      </div>

      <div className="border border-muted overflow-hidden relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow className="border-muted hover:bg-transparent">
              <TableHead className="text-[9px] font-bold uppercase tracking-widest h-10 px-3">Product</TableHead>
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
                      <Image src={p.images?.[0] || "https://placehold.co/100x100"} alt={p.name} fill className="object-cover" />
                    </div>
                    <div className="flex flex-col max-w-[250px]">
                      <span className="text-[11px] font-bold uppercase tracking-tight truncate">{p.name}</span>
                      {p.sareeDetails && <span className="text-[8px] text-muted-foreground uppercase">{p.sareeDetails.material} • {p.sareeDetails.craft}</span>}
                      {p.silverDetails && <span className="text-[8px] text-muted-foreground uppercase">{p.silverDetails.purity} • {p.silverDetails.weight}</span>}
                    </div>
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
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/5" onClick={() => startEditing(p)}>
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
                  No products synced from Firestore.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          {filteredProducts.length} Items Indexed
        </p>
      </div>
    </div>
  );
}
