
"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/shop/ProductCard";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowRight } from "lucide-react";
import SectionFadeIn from "@/components/animations/SectionFadeIn";
import { motion } from "framer-motion";

const FEATURED_PRODUCTS = [
  { id: "1", name: "Royal Maroon Silk Banarasi", price: 24900, category: "Saree", image: "https://picsum.photos/seed/saree2/600/800" },
  { id: "2", name: "Emerald Kanjeevaram Gold Zari", price: 32500, category: "Saree", image: "https://picsum.photos/seed/saree3/600/800" },
  { id: "3", name: "Sterling Silver Lakshmi Idol", price: 12500, category: "Silver", image: "https://picsum.photos/seed/silver2/600/600" },
  { id: "4", name: "Minimalist Geometric Saree", price: 15800, category: "Saree", image: "https://picsum.photos/seed/saree4/600/800" },
];

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === "hero-saree");

  return (
    <div className="flex flex-col gap-20">
      {/* Hero Section */}
      <section className="relative h-[100vh] w-full overflow-hidden bg-black">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.8 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src={heroImage?.imageUrl || "https://images.unsplash.com/photo-1616756351484-798f37bdffa0?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
            alt="Hero Saree"
            fill
            className="object-cover"
            priority
          />
        </motion.div>
        {/* Added pt-32 to push content below the fixed transparent navbar */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 px-4 text-center pt-32">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="max-w-4xl font-headline text-5xl font-bold tracking-tight text-white md:text-7xl lg:text-8xl"
          >
            Timeless Sarees.<br />Meaningful Silver Gifts.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-8 max-w-xl text-lg font-medium text-white/90"
          >
            Crafted for weddings, festivals, and your most cherished occasions.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-12 flex flex-col gap-4 sm:flex-row"
          >
            <Link href="/shop?category=saree">
              <Button size="lg" className="h-12 w-60 rounded-none bg-white text-black hover:bg-white/90 font-bold uppercase tracking-widest">
                Shop Sarees
              </Button>
            </Link>
            <Link href="/shop?category=silver">
              <Button size="lg" className="h-12 w-60 rounded-none bg-accent text-white hover:bg-accent/90 font-bold uppercase tracking-widest">
                Explore Silver
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      <SectionFadeIn className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-12">
          <h2 className="font-headline text-3xl font-bold tracking-tight uppercase">Featured Categories</h2>
          <Link href="/shop" className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-accent transition-colors">
            View All <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link href="/shop?category=wedding" className="group relative aspect-[4/5] overflow-hidden bg-muted">
            <Image src="https://picsum.photos/seed/cat1/800/1000" alt="Wedding" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/30" />
            <div className="absolute bottom-8 left-8">
              <h3 className="text-2xl font-bold text-white uppercase tracking-wider">Wedding Sarees</h3>
              <p className="text-white/80 text-sm mt-1">Opulent handlooms for the bride</p>
            </div>
          </Link>
          <div className="grid grid-cols-1 gap-4">
            <Link href="/shop?category=silver-idols" className="group relative aspect-[4/2.4] overflow-hidden bg-muted">
              <Image src="https://picsum.photos/seed/cat2/800/600" alt="Silver" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/30" />
              <div className="absolute bottom-6 left-6">
                <h3 className="text-xl font-bold text-white uppercase tracking-wider">Silver Idols</h3>
              </div>
            </Link>
            <Link href="/shop?category=designer" className="group relative aspect-[4/2.4] overflow-hidden bg-muted">
              <Image src="https://picsum.photos/seed/cat3/800/600" alt="Designer" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/30" />
              <div className="absolute bottom-6 left-6">
                <h3 className="text-xl font-bold text-white uppercase tracking-wider">Designer Wear</h3>
              </div>
            </Link>
          </div>
          <Link href="/shop?category=gift-sets" className="group relative aspect-[4/5] overflow-hidden bg-muted">
            <Image src="https://picsum.photos/seed/cat4/800/1000" alt="Gifts" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/30" />
            <div className="absolute bottom-8 left-8">
              <h3 className="text-2xl font-bold text-white uppercase tracking-wider">Silver Gift Sets</h3>
              <p className="text-white/80 text-sm mt-1">Perfect for every celebration</p>
            </div>
          </Link>
        </div>
      </SectionFadeIn>

      {/* Best Sellers */}
      <section className="bg-secondary/50 py-24">
        <SectionFadeIn className="container mx-auto px-4 md:px-8">
          <div className="mb-16 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Curated Selections</span>
            <h2 className="mt-4 font-headline text-4xl font-bold tracking-tight uppercase">Best Sellers</h2>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4 lg:gap-x-8">
            {FEATURED_PRODUCTS.map((product, idx) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
          <div className="mt-16 text-center">
            <Link href="/shop">
              <Button variant="outline" className="h-14 w-56 rounded-none border-primary font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                View Entire Shop
              </Button>
            </Link>
          </div>
        </SectionFadeIn>
      </section>

      {/* Why Siddhivinayak */}
      <SectionFadeIn className="container mx-auto px-4 md:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="flex flex-col gap-4 border-l-2 border-accent pl-8">
            <h3 className="text-xl font-bold uppercase tracking-tight">Authentic Craftsmanship</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Every saree is a masterpiece of traditional Indian weaving, sourced directly from master artisans across the country.
            </p>
          </div>
          <div className="flex flex-col gap-4 border-l-2 border-accent pl-8">
            <h3 className="text-xl font-bold uppercase tracking-tight">Purity Guaranteed</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Our silver items come with a certificate of authenticity, ensuring 999 or 925 purity for every gift you choose.
            </p>
          </div>
          <div className="flex flex-col gap-4 border-l-2 border-accent pl-8">
            <h3 className="text-xl font-bold uppercase tracking-tight">Worldwide Elegance</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Based in India, we bring the finest of Indian heritage to homes across the globe with secure, premium shipping.
            </p>
          </div>
        </div>
      </SectionFadeIn>

      {/* Newsletter */}
      <SectionFadeIn className="border-y bg-background py-24">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="font-headline text-3xl font-bold tracking-tight uppercase">Join the Inner Circle</h2>
          <p className="mt-4 text-muted-foreground font-medium">
            Be the first to discover new arrivals, exclusive collections, and styling notes.
          </p>
          <form className="mt-10 flex flex-col sm:flex-row gap-0">
            <input 
              type="email" 
              placeholder="Email address" 
              className="flex-grow h-14 bg-muted/30 border-2 border-r-0 border-muted focus:border-primary outline-none px-6 font-medium text-sm transition-colors"
              required
            />
            <Button className="h-14 rounded-none bg-primary text-white font-bold uppercase tracking-widest px-10">
              Subscribe
            </Button>
          </form>
          <p className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground">
            By subscribing, you agree to our Privacy Policy
          </p>
        </div>
      </SectionFadeIn>
    </div>
  );
}
