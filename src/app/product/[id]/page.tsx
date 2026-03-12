
"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  Heart, 
  ChevronRight, 
  ShieldCheck, 
  Truck, 
  RefreshCw,
  Plus,
  Minus,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard from "@/components/shop/ProductCard";
import StylingAssistant from "@/components/shop/StylingAssistant";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";

export default function ProductPage() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Mock data - in real app fetch based on ID
  const product = {
    id: "1",
    name: "Royal Maroon Silk Banarasi",
    price: 24900,
    mrp: 32000,
    category: "Saree",
    description: "Exquisite hand-woven Banarasi silk saree featuring traditional floral motifs and a sophisticated deep maroon hue. This masterpiece reflects centuries of craftsmanship, blending timeless elegance with a modern aesthetic sensibility.",
    images: [
      "https://picsum.photos/seed/p1/1200/1500",
      "https://picsum.photos/seed/p2/1200/1500",
      "https://picsum.photos/seed/p3/1200/1500",
      "https://picsum.photos/seed/p4/1200/1500",
      "https://picsum.photos/seed/p5/1200/1500",
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

  const [mainViewportRef, emblaMainApi] = useEmblaCarousel({ 
    loop: true,
    duration: 30,
    dragFree: false
  });
  
  const [thumbViewportRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaMainApi) return;
      emblaMainApi.scrollTo(index);
    },
    [emblaMainApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) return;
    const index = emblaMainApi.selectedScrollSnap();
    setSelectedIndex(index);
    emblaThumbsApi.scrollTo(index);
  }, [emblaMainApi, emblaThumbsApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaMainApi) return;
    onSelect();
    emblaMainApi.on("select", onSelect);
    emblaMainApi.on("reInit", onSelect);
  }, [emblaMainApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaMainApi) emblaMainApi.scrollPrev();
  }, [emblaMainApi]);

  const scrollNext = useCallback(() => {
    if (emblaMainApi) emblaMainApi.scrollNext();
  }, [emblaMainApi]);

  return (
    <div className="container mx-auto px-4 pt-40 pb-12 md:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link> <ChevronRight className="h-3 w-3" />
        <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link> <ChevronRight className="h-3 w-3" />
        <span className="text-primary">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
        {/* Gallery Column */}
        <div className="lg:col-span-7 flex flex-col gap-12">
          {/* Main Carousel */}
          <div className="relative group overflow-hidden">
            <div className="overflow-hidden bg-muted" ref={mainViewportRef}>
              <div className="flex touch-pan-y">
                {product.images.map((img, index) => (
                  <div key={index} className="relative flex-[0_0_100%] min-w-0 aspect-[4/5]">
                    <Image
                      src={img}
                      alt={`${product.name} - image ${index + 1}`}
                      fill
                      className="object-cover cursor-grab active:cursor-grabbing"
                      priority={index === 0}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Heart Overlay - Top Right */}
            <button 
              className="absolute top-6 right-6 z-10 p-3 bg-white/40 backdrop-blur-md rounded-full border border-white/20 transition-all hover:bg-white/60 hover:scale-105 active:scale-95"
              aria-label="Add to wishlist"
            >
              <Heart className="h-5 w-5 text-primary" strokeWidth={1.5} />
            </button>
          </div>

          {/* Thumbnail Navigation Strip */}
          <div className="flex items-center gap-4 px-4">
            <button 
              onClick={scrollPrev}
              className="p-2 hover:bg-secondary transition-colors shrink-0"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className="overflow-hidden flex-grow" ref={thumbViewportRef}>
              <div className="flex gap-4">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => onThumbClick(index)}
                    className={cn(
                      "relative flex-[0_0_80px] sm:flex-[0_0_100px] aspect-square transition-all duration-300 border-2",
                      index === selectedIndex ? "border-primary opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <Image src={img} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={scrollNext}
              className="p-2 hover:bg-secondary transition-colors shrink-0"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Info Column */}
        <div className="lg:col-span-5 flex flex-col pt-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent mb-3">
            {product.category}
          </span>
          <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight uppercase text-primary mb-6">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-6 mb-10">
            <span className="text-2xl font-bold tracking-tight">₹{product.price.toLocaleString('en-IN')}</span>
            <span className="text-lg text-muted-foreground line-through opacity-50">₹{product.mrp.toLocaleString('en-IN')}</span>
          </div>

          <div className="space-y-6 text-muted-foreground leading-relaxed mb-12 text-sm max-w-lg">
            <p>{product.description}</p>
          </div>

          <div className="space-y-6 max-w-md">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-muted h-14 bg-secondary/20">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-6 py-2 hover:text-accent transition-colors"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-8 text-center font-bold text-xs">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-6 py-2 hover:text-accent transition-colors"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              <Button className="flex-grow h-14 rounded-none bg-primary text-white font-bold uppercase tracking-widest text-[10px]">
                Add to Bag
              </Button>
            </div>
            
            <Button variant="outline" className="w-full h-14 rounded-none border-primary text-primary hover:bg-primary hover:text-white font-bold uppercase tracking-widest text-[10px] transition-all">
              Buy It Now
            </Button>
          </div>

          {/* Trust points */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12 border-t pt-12">
            <div className="flex items-center gap-4">
              <Truck className="h-5 w-5 text-accent/70" strokeWidth={1.5} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Express Premium Shipping</span>
            </div>
            <div className="flex items-center gap-4">
              <RefreshCw className="h-5 w-5 text-accent/70" strokeWidth={1.5} />
              <span className="text-[9px] font-bold uppercase tracking-widest">30-Day Bespoke Exchanges</span>
            </div>
            <div className="flex items-center gap-4">
              <ShieldCheck className="h-5 w-5 text-accent/70" strokeWidth={1.5} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Certified 999 Hallmark Purity</span>
            </div>
          </div>

          {/* AI Styling Assistant */}
          <div className="mt-12">
            <StylingAssistant productType="saree" description={product.description} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-32 border-t pt-20">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0 gap-12">
            <TabsTrigger 
              value="details" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-0 py-6 text-[10px] font-bold uppercase tracking-widest"
            >
              Product Details
            </TabsTrigger>
            <TabsTrigger 
              value="delivery" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-0 py-6 text-[10px] font-bold uppercase tracking-widest"
            >
              Shipping & Returns
            </TabsTrigger>
            <TabsTrigger 
              value="reviews" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-0 py-6 text-[10px] font-bold uppercase tracking-widest"
            >
              Reviews (12)
            </TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="pt-12 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
              <div className="space-y-6 max-w-xl">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  This Banarasi Silk saree is hand-woven by master craftsmen using techniques passed down through generations. The intricate zari work and the premium silk texture make it a must-have for any bridal trousseau.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-y-10 gap-x-16 bg-secondary/10 p-10">
                {Object.entries(product.details).map(([key, val]) => (
                  <div key={key}>
                    <h5 className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">{key}</h5>
                    <p className="text-xs font-bold uppercase tracking-tight">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="delivery" className="pt-12">
            <div className="max-w-2xl text-sm text-muted-foreground leading-relaxed space-y-4">
              <p>We offer free express shipping on all domestic orders above ₹10,000. For international orders, shipping rates are calculated at checkout based on destination and weight.</p>
              <p>Standard delivery time for domestic orders is 3-7 business days. Custom tailored products may take up to 15-20 business days.</p>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="pt-12">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {[1, 2].map(r => (
                  <div key={r} className="border-b pb-12">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-10 w-10 bg-secondary flex items-center justify-center font-bold text-[10px]">AK</div>
                      <div>
                        <h6 className="text-[10px] font-bold uppercase tracking-widest">Anjali K.</h6>
                        <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Verified Buyer • 2 days ago</span>
                      </div>
                    </div>
                    <p className="text-sm text-primary italic font-medium leading-relaxed">"The quality of the silk is beyond expectations. The maroon is exactly as pictured - deep and rich. A perfect wedding piece."</p>
                  </div>
                ))}
             </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      <div className="mt-40">
        <div className="flex items-center justify-between mb-16">
          <h2 className="font-headline text-3xl font-bold tracking-tight uppercase">Related Creations</h2>
          <Link href="/shop" className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:text-accent transition-colors">
            Explore All <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      </div>
    </div>
  );
}
