"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/shop/ProductCard";
import { ArrowRight } from "lucide-react";
import SectionFadeIn from "@/components/animations/SectionFadeIn";
import SkeletonCard from "@/components/shop/SkeletonCard";
import { motion } from "framer-motion";

interface Product {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  category: string;
  images: string[];
}

interface CategoryConfig {
  id: string;
  label: string;
  subtitle: string;
  imageUrl: string;
  linkCategory: string;
}

interface BannerConfig {
  imageUrl: string;
  title: string;
  subtitle: string;
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [bannerConfig, setBannerConfig] = useState<BannerConfig>({
    imageUrl: "",
    title: "Timeless Sarees.\nMeaningful Silver Gifts.",
    subtitle: "Crafted for weddings, festivals, and your most cherished occasions.",
  });
  const [categories, setCategories] = useState<CategoryConfig[]>([
    { id: "saree", label: "Sarees", subtitle: "Handcrafted elegance for every occasion", imageUrl: "", linkCategory: "Saree" },
    { id: "silver", label: "Silver Collection", subtitle: "", imageUrl: "", linkCategory: "Silver" },
    { id: "new-arrivals", label: "New Arrivals", subtitle: "", imageUrl: "", linkCategory: "" },
    { id: "silver-gifts", label: "Silver Gifts", subtitle: "Perfect for every celebration", imageUrl: "", linkCategory: "Silver" },
  ]);

  // Fetch homepage config from admin-managed data
  useEffect(() => {
    const fetchHomepageConfig = async () => {
      try {
        const res = await fetch("/api/homepage");
        if (res.ok) {
          const data = await res.json();
          if (data.banner) setBannerConfig(data.banner);
          if (data.categories) setCategories(data.categories);
        }
      } catch (error) {
        console.error("Error fetching homepage config:", error);
      }
    };
    fetchHomepageConfig();
  }, []);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch("/api/products?limit=4&sort=newest");
        if (res.ok) {
          const data = await res.json();
          setFeaturedProducts(data.products || []);
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchFeatured();
  }, []);

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
          {bannerConfig.imageUrl ? (
            <Image
              src={bannerConfig.imageUrl}
              alt="Hero Banner"
              fill
              className="object-cover"
              priority
            />
          ) : (
            <Image
              src="https://images.unsplash.com/photo-1616756351484-798f37bdffa0?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Hero Saree"
              fill
              className="object-cover"
              priority
            />
          )}
        </motion.div>
        {/* Added pt-32 to push content below the fixed transparent navbar */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 px-4 text-center pt-32">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="max-w-4xl font-headline text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl whitespace-pre-line"
          >
            {bannerConfig.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-8 max-w-xl text-lg font-medium text-white/90"
          >
            {bannerConfig.subtitle}
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
          {/* Sarees - Left tall */}
          <Link href={`/shop${categories[0]?.linkCategory && categories[0].linkCategory !== "all" ? `?category=${categories[0].linkCategory}` : ""}`} className="group relative aspect-[4/5] overflow-hidden bg-muted">
            {(categories[0]?.imageUrl || featuredProducts[0]?.images?.[0]) && (
              <Image src={categories[0]?.imageUrl || featuredProducts[0]?.images?.[0]} alt={categories[0]?.label || "Sarees"} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            )}
            <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/40" />
            <div className="absolute bottom-8 left-8">
              <h3 className="text-2xl font-bold text-white uppercase tracking-wider">{categories[0]?.label || "Sarees"}</h3>
              {categories[0]?.subtitle && <p className="text-white/80 text-sm mt-1">{categories[0].subtitle}</p>}
            </div>
          </Link>

          {/* Center column - two stacked */}
          <div className="grid grid-cols-1 gap-4">
            <Link href={`/shop${categories[1]?.linkCategory && categories[1].linkCategory !== "all" ? `?category=${categories[1].linkCategory}` : ""}`} className="group relative aspect-[4/2.4] overflow-hidden bg-muted">
              {(categories[1]?.imageUrl || featuredProducts[1]?.images?.[0]) && (
                <Image src={categories[1]?.imageUrl || featuredProducts[1]?.images?.[0]} alt={categories[1]?.label || "Silver"} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              )}
              <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/40" />
              <div className="absolute bottom-6 left-6">
                <h3 className="text-xl font-bold text-white uppercase tracking-wider">{categories[1]?.label || "Silver Collection"}</h3>
              </div>
            </Link>
            <Link href={`/shop${categories[2]?.linkCategory && categories[2].linkCategory !== "all" ? `?category=${categories[2].linkCategory}` : ""}`} className="group relative aspect-[4/2.4] overflow-hidden bg-muted">
              {(categories[2]?.imageUrl || featuredProducts[2]?.images?.[0]) && (
                <Image src={categories[2]?.imageUrl || featuredProducts[2]?.images?.[0]} alt={categories[2]?.label || "New Arrivals"} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              )}
              <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/40" />
              <div className="absolute bottom-6 left-6">
                <h3 className="text-xl font-bold text-white uppercase tracking-wider">{categories[2]?.label || "New Arrivals"}</h3>
              </div>
            </Link>
          </div>

          {/* Silver Gifts - Right tall */}
          <Link href={`/shop${categories[3]?.linkCategory && categories[3].linkCategory !== "all" ? `?category=${categories[3].linkCategory}` : ""}`} className="group relative aspect-[4/5] overflow-hidden bg-muted">
            {(categories[3]?.imageUrl || featuredProducts[3]?.images?.[0]) && (
              <Image src={categories[3]?.imageUrl || featuredProducts[3]?.images?.[0]} alt={categories[3]?.label || "Gifts"} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            )}
            <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/40" />
            <div className="absolute bottom-8 left-8">
              <h3 className="text-2xl font-bold text-white uppercase tracking-wider">{categories[3]?.label || "Silver Gifts"}</h3>
              {categories[3]?.subtitle && <p className="text-white/80 text-sm mt-1">{categories[3].subtitle}</p>}
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
            {loadingProducts ? (
              Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  mrp={product.mrp}
                  category={product.category}
                  image={product.images?.[0] || "https://placehold.co/600x800"}
                />
              ))
            ) : (
              Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))
            )}
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
