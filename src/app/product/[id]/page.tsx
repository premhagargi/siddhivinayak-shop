
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  Heart, 
  Share2, 
  ChevronRight, 
  ShieldCheck, 
  Truck, 
  RefreshCw,
  Plus,
  Minus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard from "@/components/shop/ProductCard";
import StylingAssistant from "@/components/shop/StylingAssistant";

export default function ProductPage() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Mock data - in real app fetch based on ID
  const product = {
    id: "1",
    name: "Royal Maroon Silk Banarasi",
    price: 24900,
    mrp: 32000,
    category: "Saree",
    description: "Exquisite hand-woven Banarasi silk saree featuring traditional floral motifs and a sophisticated deep maroon hue. This masterpiece reflects centuries of craftsmanship, blending timeless elegance with a modern aesthetic sensibility.",
    images: [
      "https://picsum.photos/seed/p1/800/1000",
      "https://picsum.photos/seed/p2/800/1000",
      "https://picsum.photos/seed/p3/800/1000",
    ],
    details: {
      material: "Pure Silk",
      color: "Deep Maroon",
      length: "6.2 meters with blouse",
      craft: "Banarasi Handloom",
      occasion: "Weddings, Festivals",
    }
  };

  const relatedProducts = [
    { id: "2", name: "Emerald Kanjeevaram", price: 32500, category: "Saree", image: "https://picsum.photos/seed/r1/600/800" },
    { id: "3", name: "Ivory Organza Drape", price: 19200, category: "Saree", image: "https://picsum.photos/seed/r2/600/800" },
    { id: "4", name: "Silver Lakshmi Idol", price: 12500, category: "Silver", image: "https://picsum.photos/seed/r3/600/600" },
  ];

  return (
    <div className="container mx-auto px-4 pt-40 pb-12 md:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link> <ChevronRight className="h-3 w-3" />
        <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link> <ChevronRight className="h-3 w-3" />
        <span className="text-primary">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-[4/5] overflow-hidden bg-muted">
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`relative aspect-[4/5] overflow-hidden border-2 transition-all ${
                  selectedImage === idx ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={img} alt={`Preview ${idx}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent mb-2">
            {product.category}
          </span>
          <h1 className="font-headline text-4xl font-bold tracking-tight uppercase text-primary mb-4">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-4 mb-8">
            <span className="text-2xl font-bold tracking-tight">₹{product.price.toLocaleString('en-IN')}</span>
            <span className="text-lg text-muted-foreground line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
            <span className="bg-accent px-2 py-1 text-[10px] font-bold text-white uppercase tracking-widest">
              22% OFF
            </span>
          </div>

          <p className="text-muted-foreground leading-relaxed mb-10 text-sm">
            {product.description}
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-primary h-14">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 py-2 hover:text-accent transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-bold">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-4 py-2 hover:text-accent transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button className="flex-grow h-14 rounded-none bg-primary text-white font-bold uppercase tracking-widest">
                Add to Bag
              </Button>
              <Button variant="outline" className="h-14 w-14 p-0 rounded-none border-primary">
                <Heart className="h-5 w-5" />
              </Button>
            </div>
            
            <Button variant="outline" className="w-full h-14 rounded-none border-accent text-accent hover:bg-accent hover:text-white font-bold uppercase tracking-widest transition-all">
              Buy Now
            </Button>
          </div>

          {/* Trust points */}
          <div className="mt-12 grid grid-cols-2 gap-6 border-t pt-10">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-accent" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Express Shipping</span>
            </div>
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-accent" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Easy Exchanges</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-accent" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Certified Quality</span>
            </div>
            <div className="flex items-center gap-3">
              <Share2 className="h-5 w-5 text-accent" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Gift Wrapping</span>
            </div>
          </div>

          {/* AI Styling Assistant Integrated Here */}
          <StylingAssistant productType="saree" description={product.description} />
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-24 border-t pt-16">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0 gap-8">
            <TabsTrigger 
              value="details" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-0 py-4 text-xs font-bold uppercase tracking-widest"
            >
              Product Details
            </TabsTrigger>
            <TabsTrigger 
              value="delivery" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-0 py-4 text-xs font-bold uppercase tracking-widest"
            >
              Shipping & Delivery
            </TabsTrigger>
            <TabsTrigger 
              value="reviews" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-0 py-4 text-xs font-bold uppercase tracking-widest"
            >
              Reviews (12)
            </TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="pt-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  This Banarasi Silk saree is hand-woven by master craftsmen using techniques passed down through generations. The intricate zari work and the premium silk texture make it a must-have for any bridal trousseau.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                {Object.entries(product.details).map(([key, val]) => (
                  <div key={key}>
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{key}</h5>
                    <p className="text-sm font-semibold">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="delivery" className="pt-8">
            <div className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
              <p className="mb-4">We offer free express shipping on all domestic orders above ₹10,000. For international orders, shipping rates are calculated at checkout based on destination and weight.</p>
              <p>Standard delivery time for domestic orders is 3-7 business days. Custom tailored products may take up to 15-20 business days.</p>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="pt-8">
             <div className="space-y-8">
                {[1, 2].map(r => (
                  <div key={r} className="border-b pb-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-10 w-10 bg-muted flex items-center justify-center font-bold text-xs">AK</div>
                      <div>
                        <h6 className="text-sm font-bold uppercase">Anjali K.</h6>
                        <span className="text-[10px] text-muted-foreground">Verified Buyer • 2 days ago</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground italic leading-relaxed">"The quality of the silk is beyond expectations. The maroon is exactly as pictured - deep and rich. A perfect wedding piece."</p>
                  </div>
                ))}
             </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      <div className="mt-32">
        <h2 className="font-headline text-3xl font-bold tracking-tight uppercase mb-12">Related Creations</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4 lg:gap-x-8">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      </div>
    </div>
  );
}
