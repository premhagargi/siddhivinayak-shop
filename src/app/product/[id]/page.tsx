"use client";

export const dynamic = 'force-dynamic';

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
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
  ChevronLeft,
  Loader2,
  ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard from "@/components/shop/ProductCard";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useAuth } from "@/components/providers/AuthProvider";

interface Product {
  id: string;
  name: string;
  price: number;
  mrp: number;
  category: string;
  stock: number;
  description: string;
  images: string[];
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

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  category: string;
  stock: number;
  images: string[];
}

export default function ProductPage() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [isActionSectionVisible, setIsActionSectionVisible] = useState(true);
  const { toast } = useToast();
  const { items: cartItems, addItem: addToCart, updateQuantity: updateCartQuantity } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const { user, loading: authLoading, pendingCartAction, setPendingCartAction, redirectAfterLogin, setRedirectAfterLogin } = useAuth();
  const router = useRouter();
  const actionSectionRef = useRef<HTMLDivElement>(null);
  const inWishlist = product ? isInWishlist(product.id) : false;
  
  // Check if product is already in cart - use useMemo to avoid recalculating on every render
  const cartItem = useMemo(() => {
    return product ? cartItems.find(item => item.productId === product.id) : null;
  }, [cartItems, product]);
  const inCart = !!cartItem;
  const cartQuantity = cartItem?.quantity || 0;
  
  // Calculate max quantity based on stock
  const maxQuantity = useMemo(() => {
    if (!product) return 10;
    return product.stock > 0 ? Math.min(product.stock, 10) : 10;
  }, [product?.stock]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`);
        
        if (!res.ok) {
          throw new Error("Product not found");
        }
        
        const data = await res.json();
        setProduct(data.product);
        setRelatedProducts(data.relatedProducts || []);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load product. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, toast]);

  // Handle pending cart action after successful login
  const pendingActionProcessedRef = useRef(false);

  useEffect(() => {
    // If user just logged in and there's a pending cart action, process it
    if (user && pendingCartAction && product && !pendingActionProcessedRef.current) {
      console.log("Processing pending cart action after login:", pendingCartAction);
      pendingActionProcessedRef.current = true; // Prevent duplicate processing

      const processPendingCart = async () => {
        try {
          await addToCart(pendingCartAction);
          toast({
            title: "Added to bag",
            description: `${pendingCartAction.quantity} item(s) of ${pendingCartAction.name} added to your bag.`,
          });
        } catch (error) {
          console.error("Error processing pending cart action:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to add item to bag. Please try again.",
          });
        } finally {
          // Clear the pending action after processing
          setPendingCartAction(null);
          setRedirectAfterLogin(null);
          pendingActionProcessedRef.current = false; // Reset for future use
        }
      };

      processPendingCart();
    }
  }, [user, pendingCartAction, product]); // Removed unstable dependencies

  // Default placeholder data for when product is loading or unavailable
  const placeholderProduct: Product = {
    id: (id as string) || "",
    name: "Loading...",
    price: 0,
    mrp: 0,
    category: "Saree",
    stock: 0,
    description: "",
    images: ["https://placehold.co/1200x1500"],
  };

  const currentProduct = product || placeholderProduct;

  // Build details object based on category
  const getProductDetails = () => {
    if (currentProduct.category === "Saree" && currentProduct.sareeDetails) {
      return {
        material: currentProduct.sareeDetails.material,
        craft: currentProduct.sareeDetails.craft,
        color: currentProduct.sareeDetails.color,
      };
    }
    if (currentProduct.category === "Silver" && currentProduct.silverDetails) {
      return {
        purity: currentProduct.silverDetails.purity,
        weight: currentProduct.silverDetails.weight,
        finish: currentProduct.silverDetails.finish,
      };
    }
    return {};
  };

  const productDetails = getProductDetails();

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return;
    
    // Check if user is logged in
    if (!user) {
      // Store the pending cart action
      const cartAction = {
        productId: product.id,
        quantity,
        price: product.price,
        name: product.name,
        image: product.images[0],
      };
      
      // Store pending action and redirect URL
      setPendingCartAction(cartAction);
      setRedirectAfterLogin(`/product/${product.id}`);
      
      // Show toast and redirect to login
      toast({
        title: "Please sign in",
        description: "Sign in to add items to your bag.",
      });
      
      // Redirect to login
      router.push(`/login?redirect=/product/${product.id}`);
      return;
    }
    
    setAddingToCart(true);
    try {
      await addToCart({
        productId: product.id,
        quantity,
        price: product.price,
        name: product.name,
        image: product.images[0],
      });
      toast({
        title: "Added to bag",
        description: `${quantity} item(s) of ${product.name} added to your bag.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add item to bag. Please try again.",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle buy now (add to cart and go to checkout)
  const handleBuyNow = async () => {
    if (!product) return;
    
    // Check if user is logged in
    if (!user) {
      toast({
        title: "Please sign in",
        description: "Sign in to continue your purchase.",
      });
      
      router.push(`/login?redirect=/product/${product.id}`);
      return;
    }
    
    setBuyingNow(true);
    try {
      await addToCart({
        productId: product.id,
        quantity,
        price: product.price,
        name: product.name,
        image: product.images[0],
      });
      // Navigate to checkout
      router.push("/checkout");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process your request. Please try again.",
      });
      setBuyingNow(false);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (!product) return;
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your wishlist.",
      });
      return;
    }

    try {
      if (inWishlist) {
        await removeFromWishlist(product.id);
        toast({
          title: "Removed from wishlist",
          description: `${product.name} has been removed from your wishlist.`,
        });
      } else {
        await addToWishlist({
          productId: product.id,
          name: product.name,
          price: product.price,
          mrp: product.mrp,
          category: product.category,
          image: product.images[0],
        });
        toast({
          title: "Added to wishlist",
          description: `${product.name} has been added to your wishlist.`,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    }
  };

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

  // Intersection Observer for mobile sticky action bar
  useEffect(() => {
    if (!actionSectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActionSectionVisible(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '-80px 0px -80px 0px', // Trigger when element is near viewport edges
        threshold: 0.1,
      }
    );

    observer.observe(actionSectionRef.current);

    return () => {
      if (actionSectionRef.current) {
        observer.unobserve(actionSectionRef.current);
      }
    };
  }, [actionSectionRef]);

  const scrollPrev = useCallback(() => {
    if (emblaMainApi) emblaMainApi.scrollPrev();
  }, [emblaMainApi]);

  const scrollNext = useCallback(() => {
    if (emblaMainApi) emblaMainApi.scrollNext();
  }, [emblaMainApi]);

  // Loading state — show skeleton matching actual layout
  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-32 md:px-8 animate-pulse">
        <div className="h-3 w-48 bg-muted rounded mb-8" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="aspect-square bg-muted rounded" />
            <div className="flex gap-2 mt-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-16 h-16 bg-muted rounded" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-7 space-y-4">
            <div className="h-3 w-20 bg-muted rounded" />
            <div className="h-6 w-3/4 bg-muted rounded" />
            <div className="h-8 w-32 bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-2/3 bg-muted rounded" />
            <div className="h-12 w-full bg-muted rounded mt-8" />
            <div className="h-12 w-full bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-32 pb-20 lg:pb-0 md:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link> <ChevronRight className="h-3 w-3" />
        <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link> <ChevronRight className="h-3 w-3" />
        <span className="text-primary">{currentProduct.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Gallery Column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Main Carousel */}
          <div className="relative group overflow-hidden">
            <div className="overflow-hidden bg-muted" ref={mainViewportRef}>
              <div className="flex touch-pan-y">
                {currentProduct.images.map((img, index) => (
                  <div key={index} className="relative flex-[0_0_100%] min-w-0 aspect-square">
                    <Image
                      src={img}
                      alt={`${currentProduct.name} - image ${index + 1}`}
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
              className={`absolute top-6 right-6 z-10 p-3 bg-white/40 backdrop-blur-md rounded-full border border-white/20 transition-all hover:bg-white/60 hover:scale-105 active:scale-95 ${inWishlist ? "text-accent" : "text-primary"}`}
              aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
              onClick={handleWishlistToggle}
            >
              <Heart className={`h-5 w-5 ${inWishlist ? "fill-accent" : ""}`} strokeWidth={1.5} />
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
                {currentProduct.images.map((img, index) => (
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
        <div className="lg:col-span-7 flex flex-col pt-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent mb-2">
            {currentProduct.category}
          </span>
          <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight uppercase text-primary mb-4">
            {currentProduct.name}
          </h1>

          <div className="flex items-center gap-6 mb-8">
            <span className="text-2xl font-bold tracking-tight">₹{currentProduct.price.toLocaleString('en-IN')}</span>
            <span className="text-lg text-muted-foreground line-through opacity-50">₹{currentProduct.mrp.toLocaleString('en-IN')}</span>
          </div>

          <div className="space-y-6 text-muted-foreground leading-relaxed mb-8 text-sm max-w-lg">
            <p>{currentProduct.description}</p>
          </div>

          <div className="space-y-6 max-w-md" ref={actionSectionRef}>
            {/* Stock warning */}
            {currentProduct.stock !== undefined && currentProduct.stock > 0 && currentProduct.stock <= 5 && (
              <p className="text-xs font-bold text-orange-600 uppercase tracking-widest">
                Only {currentProduct.stock} left in stock
              </p>
            )}
            {currentProduct.stock !== undefined && currentProduct.stock <= 0 && (
              <p className="text-xs font-bold text-destructive uppercase tracking-widest">
                Out of Stock
              </p>
            )}
            
            <div className="flex items-center gap-4">
              {/* Show cart quantity if already in cart, otherwise show regular quantity selector */}
              {inCart ? (
                <div className="flex items-center border border-muted h-14 bg-secondary/20">
                  <button 
                    onClick={() => {
                      if (cartQuantity > 1) {
                        updateCartQuantity(currentProduct.id, cartQuantity - 1);
                      }
                    }}
                    disabled={cartQuantity <= 1 || addingToCart}
                    className="px-6 py-2 hover:text-accent transition-colors disabled:opacity-30"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-12 text-center font-bold text-xs">{cartQuantity}</span>
                  <button 
                    onClick={() => {
                      if (cartQuantity < maxQuantity) {
                        updateCartQuantity(currentProduct.id, cartQuantity + 1);
                      }
                    }}
                    disabled={cartQuantity >= maxQuantity || addingToCart}
                    className="px-6 py-2 hover:text-accent transition-colors disabled:opacity-30"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center border border-muted h-14 bg-secondary/20">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-6 py-2 hover:text-accent transition-colors"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center font-bold text-xs">{quantity}</span>
                  <button 
                    onClick={() => {
                      if (quantity < maxQuantity) {
                        setQuantity(q => q + 1);
                      }
                    }}
                    disabled={quantity >= maxQuantity}
                    className="px-6 py-2 hover:text-accent transition-colors disabled:opacity-30"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              )}
              
              {inCart ? (
                <Button 
                  className="flex-grow h-14 rounded-none bg-accent text-white font-bold uppercase tracking-widest text-[10px]"
                  onClick={() => router.push("/cart")}
                >
                  Go to Bag ({cartQuantity})
                </Button>
              ) : (
                <Button 
                  className="flex-grow h-14 rounded-none bg-primary text-white font-bold uppercase tracking-widest text-[10px]"
                  onClick={handleAddToCart}
                  disabled={addingToCart || currentProduct.stock <= 0}
                >
                  {addingToCart ? "Adding..." : "Add to Bag"}
                </Button>
              )}
            </div>
            
            <Button 
              variant="outline" 
              className="w-full h-14 rounded-none border-primary text-primary hover:bg-primary hover:text-white font-bold uppercase tracking-widest text-[10px] transition-all"
              onClick={handleBuyNow}
              disabled={buyingNow || currentProduct.stock <= 0}
            >
              {buyingNow ? "Processing..." : currentProduct.stock <= 0 ? "Out of Stock" : "Buy It Now"}
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
                  {currentProduct.description}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  This Banarasi Silk saree is hand-woven by master craftsmen using techniques passed down through generations. The intricate zari work and the premium silk texture make it a must-have for any bridal trousseau.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-y-10 gap-x-16 bg-secondary/10 p-10">
                {Object.entries(productDetails).map(([key, val]) => (
                  <div key={key}>
                    <h5 className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">{key}</h5>
                    <p className="text-xs font-bold uppercase tracking-tight">{String(val)}</p>
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

      {/* Mobile Sticky Action Bar */}
      {!isActionSectionVisible && currentProduct.stock > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg px-4 py-3 flex items-center gap-3 lg:hidden">
          <div className="flex flex-col min-w-0 flex-shrink">
            <span className="text-xs text-muted-foreground truncate">{currentProduct.name}</span>
            <span className="text-sm font-bold">₹{currentProduct.price.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex gap-2 ml-auto flex-shrink-0">
            {inCart ? (
              <Button
                className="h-10 rounded-none bg-accent text-white font-bold uppercase tracking-widest text-[9px] px-4"
                onClick={() => router.push("/cart")}
              >
                <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
                Bag ({cartQuantity})
              </Button>
            ) : (
              <Button
                className="h-10 rounded-none bg-primary text-white font-bold uppercase tracking-widest text-[9px] px-4"
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? "Adding..." : "Add to Bag"}
              </Button>
            )}
            <Button
              variant="outline"
              className="h-10 rounded-none border-primary font-bold uppercase tracking-widest text-[9px] px-4"
              onClick={handleBuyNow}
              disabled={buyingNow}
            >
              Buy Now
            </Button>
          </div>
        </div>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-40">
          <div className="flex items-center justify-between mb-16">
            <h2 className="font-headline text-3xl font-bold tracking-tight uppercase">Related Creations</h2>
            <Link href="/shop" className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:text-accent transition-colors">
              Explore All <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {relatedProducts.map((p) => (
              <ProductCard 
                key={p.id} 
                id={p.id}
                name={p.name}
                price={p.price}
                category={p.category}
                image={p.images?.[0] || "https://placehold.co/600x800"}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
