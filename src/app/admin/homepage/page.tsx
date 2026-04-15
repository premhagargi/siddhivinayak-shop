"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Loader2, Save, ArrowRight, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/lib/upload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BannerConfig {
  imageUrl: string;
  title: string;
  subtitle: string;
}

interface CategoryConfig {
  id: string;
  label: string;
  subtitle: string;
  imageUrl: string;
  linkCategory: string;
}

interface HomepageConfig {
  banner: BannerConfig;
  categories: CategoryConfig[];
}

const DEFAULT_CONFIG: HomepageConfig = {
  banner: {
    imageUrl: "",
    title: "Timeless Sarees.\nMeaningful Silver Gifts.",
    subtitle: "Crafted for weddings, festivals, and your most cherished occasions.",
  },
  categories: [
    { id: "saree", label: "Sarees", subtitle: "Handcrafted elegance for every occasion", imageUrl: "", linkCategory: "Saree" },
    { id: "silver", label: "Silver Collection", subtitle: "", imageUrl: "", linkCategory: "Silver" },
    { id: "new-arrivals", label: "New Arrivals", subtitle: "", imageUrl: "", linkCategory: "" },
    { id: "silver-gifts", label: "Silver Gifts", subtitle: "Perfect for every celebration", imageUrl: "", linkCategory: "Silver" },
  ],
};

const CATEGORY_OPTIONS = [
  { value: "", label: "All (Shop)" },
  { value: "Saree", label: "Saree" },
  { value: "Silver", label: "Silver" },
];

export default function HomepageManagement() {
  const [config, setConfig] = useState<HomepageConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [editDialog, setEditDialog] = useState<{ type: "banner" | "category"; index?: number } | null>(null);
  const [editForm, setEditForm] = useState<{ label: string; subtitle: string; linkCategory: string }>({ label: "", subtitle: "", linkCategory: "" });
  const bannerFileRef = useRef<HTMLInputElement>(null);
  const categoryFileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/homepage");
      if (res.ok) {
        const data = await res.json();
        setConfig({
          banner: data.banner || DEFAULT_CONFIG.banner,
          categories: data.categories || DEFAULT_CONFIG.categories,
        });
      }
    } catch (error) {
      console.error("Error fetching homepage config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        toast({ title: "Saved", description: "Homepage content updated successfully." });
      } else {
        const err = await res.json();
        toast({ title: "Error", description: err.error || "Failed to save.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to save homepage content.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file: File, target: "banner" | string) => {
    setUploading(target);
    try {
      const url = await uploadImage(file);
      if (target === "banner") {
        setConfig(prev => ({ ...prev, banner: { ...prev.banner, imageUrl: url } }));
      } else {
        setConfig(prev => ({
          ...prev,
          categories: prev.categories.map(cat => cat.id === target ? { ...cat, imageUrl: url } : cat),
        }));
      }
      toast({ title: "Uploaded", description: "Image uploaded successfully." });
    } catch (error: any) {
      toast({ title: "Upload Failed", description: error.message || "Failed to upload image.", variant: "destructive" });
    } finally {
      setUploading(null);
    }
  };

  const openEditDialog = (type: "banner" | "category", index?: number) => {
    if (type === "banner") {
      setEditForm({ label: config.banner.title, subtitle: config.banner.subtitle, linkCategory: "" });
    } else if (index !== undefined) {
      const cat = config.categories[index];
      setEditForm({ label: cat.label, subtitle: cat.subtitle, linkCategory: cat.linkCategory });
    }
    setEditDialog({ type, index });
  };

  const saveEditDialog = () => {
    if (!editDialog) return;
    if (editDialog.type === "banner") {
      setConfig(prev => ({
        ...prev,
        banner: { ...prev.banner, title: editForm.label, subtitle: editForm.subtitle },
      }));
    } else if (editDialog.index !== undefined) {
      setConfig(prev => ({
        ...prev,
        categories: prev.categories.map((cat, i) =>
          i === editDialog.index ? { ...cat, label: editForm.label, subtitle: editForm.subtitle, linkCategory: editForm.linkCategory } : cat
        ),
      }));
    }
    setEditDialog(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Homepage Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage hero banner and featured categories. Click the pencil icon to edit images and text.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={bannerFileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file, "banner");
          e.target.value = "";
        }}
      />
      {config.categories.map(cat => (
        <input
          key={cat.id}
          ref={el => { categoryFileRefs.current[cat.id] = el; }}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file, cat.id);
            e.target.value = "";
          }}
        />
      ))}

      {/* ── HERO BANNER PREVIEW ── */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Hero Banner</h2>
        <div className="relative w-full aspect-[16/7] overflow-hidden bg-black rounded-lg border">
          {config.banner.imageUrl ? (
            <Image
              src={config.banner.imageUrl}
              alt="Hero Banner"
              fill
              className="object-cover opacity-80"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
              <div className="text-center text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No banner image set</p>
              </div>
            </div>
          )}

          {/* Banner overlay text - mirrors homepage */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 px-4 text-center">
            <h1 className="max-w-4xl font-headline text-xl md:text-3xl lg:text-4xl font-bold tracking-tight text-white whitespace-pre-line">
              {config.banner.title}
            </h1>
            <p className="mt-4 max-w-xl text-xs md:text-sm font-medium text-white/90">
              {config.banner.subtitle}
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <div className="h-8 w-36 md:h-10 md:w-48 bg-white/90 flex items-center justify-center text-black text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
                Shop Sarees
              </div>
              <div className="h-8 w-36 md:h-10 md:w-48 bg-accent/90 flex items-center justify-center text-white text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
                Explore Silver
              </div>
            </div>
          </div>

          {/* Pencil icons */}
          <button
            onClick={() => bannerFileRef.current?.click()}
            disabled={uploading === "banner"}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-black rounded-full p-2.5 shadow-lg transition-all hover:scale-110 z-10"
            title="Change banner image"
          >
            {uploading === "banner" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
          </button>
          <button
            onClick={() => openEditDialog("banner")}
            className="absolute top-4 right-16 bg-white/90 hover:bg-white text-black rounded-full p-2.5 shadow-lg transition-all hover:scale-110 z-10 text-[10px] font-bold"
            title="Edit banner text"
          >
            Aa
          </button>
        </div>
      </div>

      {/* ── FEATURED CATEGORIES PREVIEW ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Featured Categories</h2>
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            View All <ArrowRight className="h-3 w-3" />
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Sarees - Left tall column */}
          <CategoryCard
            category={config.categories[0]}
            aspectClass="aspect-[4/5]"
            labelSize="text-lg md:text-2xl"
            showSubtitle
            uploading={uploading}
            onUpload={() => categoryFileRefs.current[config.categories[0].id]?.click()}
            onEdit={() => openEditDialog("category", 0)}
          />

          {/* Center column - two stacked */}
          <div className="grid grid-cols-1 gap-4">
            <CategoryCard
              category={config.categories[1]}
              aspectClass="aspect-[4/2.4]"
              labelSize="text-base md:text-xl"
              showSubtitle={false}
              uploading={uploading}
              onUpload={() => categoryFileRefs.current[config.categories[1].id]?.click()}
              onEdit={() => openEditDialog("category", 1)}
            />
            <CategoryCard
              category={config.categories[2]}
              aspectClass="aspect-[4/2.4]"
              labelSize="text-base md:text-xl"
              showSubtitle={false}
              uploading={uploading}
              onUpload={() => categoryFileRefs.current[config.categories[2].id]?.click()}
              onEdit={() => openEditDialog("category", 2)}
            />
          </div>

          {/* Silver Gifts - Right tall column */}
          <CategoryCard
            category={config.categories[3]}
            aspectClass="aspect-[4/5]"
            labelSize="text-lg md:text-2xl"
            showSubtitle
            uploading={uploading}
            onUpload={() => categoryFileRefs.current[config.categories[3].id]?.click()}
            onEdit={() => openEditDialog("category", 3)}
          />
        </div>
      </div>

      {/* ── EDIT DIALOG ── */}
      <Dialog open={!!editDialog} onOpenChange={(open) => !open && setEditDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editDialog?.type === "banner" ? "Edit Banner Text" : "Edit Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>{editDialog?.type === "banner" ? "Title" : "Label"}</Label>
              <Input
                value={editForm.label}
                onChange={(e) => setEditForm(prev => ({ ...prev, label: e.target.value }))}
                placeholder={editDialog?.type === "banner" ? "Banner title..." : "Category label..."}
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input
                value={editForm.subtitle}
                onChange={(e) => setEditForm(prev => ({ ...prev, subtitle: e.target.value }))}
                placeholder="Subtitle text..."
              />
            </div>
            {editDialog?.type === "category" && (
              <div>
                <Label>Link to Category</Label>
                <Select
                  value={editForm.linkCategory}
                  onValueChange={(val) => setEditForm(prev => ({ ...prev, linkCategory: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value || "all"}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Clicking this card on the homepage will navigate to the shop filtered by this category.
                </p>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditDialog(null)}>Cancel</Button>
              <Button onClick={saveEditDialog}>Apply</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── Category Card Component ── */
function CategoryCard({
  category,
  aspectClass,
  labelSize,
  showSubtitle,
  uploading,
  onUpload,
  onEdit,
}: {
  category: CategoryConfig;
  aspectClass: string;
  labelSize: string;
  showSubtitle: boolean;
  uploading: string | null;
  onUpload: () => void;
  onEdit: () => void;
}) {
  const isUploading = uploading === category.id;

  return (
    <div className={`group relative ${aspectClass} overflow-hidden bg-muted rounded-lg border`}>
      {category.imageUrl ? (
        <Image
          src={category.imageUrl}
          alt={category.label}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="text-center text-muted-foreground">
            <ImageIcon className="h-8 w-8 mx-auto mb-1 opacity-40" />
            <p className="text-xs">No image</p>
          </div>
        </div>
      )}
      <div className="absolute inset-0 bg-black/20" />

      {/* Label overlay */}
      <div className={showSubtitle ? "absolute bottom-6 left-6" : "absolute bottom-4 left-4"}>
        <h3 className={`${labelSize} font-bold text-white uppercase tracking-wider`}>
          {category.label}
        </h3>
        {showSubtitle && category.subtitle && (
          <p className="text-white/80 text-xs mt-1">{category.subtitle}</p>
        )}
        {category.linkCategory && (
          <span className="inline-block mt-1.5 text-[9px] font-bold uppercase tracking-widest text-accent bg-black/40 px-2 py-0.5 rounded">
            {category.linkCategory === "all" ? "Shop" : category.linkCategory}
          </span>
        )}
      </div>

      {/* Pencil icons */}
      <button
        onClick={onUpload}
        disabled={isUploading}
        className="absolute top-3 right-3 bg-white/90 hover:bg-white text-black rounded-full p-2 shadow-lg transition-all hover:scale-110 z-10"
        title="Change image"
      >
        {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Pencil className="h-3.5 w-3.5" />}
      </button>
      <button
        onClick={onEdit}
        className="absolute top-3 right-12 bg-white/90 hover:bg-white text-black rounded-full p-2 shadow-lg transition-all hover:scale-110 z-10 text-[9px] font-bold"
        title="Edit category details"
      >
        Aa
      </button>
    </div>
  );
}
