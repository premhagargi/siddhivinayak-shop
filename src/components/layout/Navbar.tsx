
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingBag, User, Heart, Menu, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  const navLinks = [
    { name: "Shop", href: "/shop" },
    { name: "Sarees", href: "/shop?category=saree" },
    { name: "Silver", href: "/shop?category=silver" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const accountLinks = [
    { name: "My Account", href: "/account", icon: User },
    { name: "Wishlist", href: "/wishlist", icon: Heart },
    { name: "Orders", href: "/account/orders", icon: ShoppingBag },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const useLightText = isHome && !isScrolled;

  return (
    <header 
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-700 ease-in-out",
        isScrolled 
          ? "bg-background/80 backdrop-blur-xl border-b py-2" 
          : "bg-transparent border-transparent py-6"
      )}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex h-14 items-center justify-between">
          
          {/* Left Column: Mobile Menu & Logo */}
          <div className="flex items-center gap-4 flex-1">
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "rounded-none transition-colors h-10 w-10",
                      useLightText ? "text-white hover:bg-white/10" : "text-primary hover:bg-black/5"
                    )}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:w-[350px] p-0 rounded-none bg-background border-r flex flex-col">
                  <SheetHeader className="p-8 border-b text-left">
                    <SheetTitle className="font-headline text-xl font-bold tracking-[0.2em] uppercase">
                      SIDDHIVINAYAK
                    </SheetTitle>
                  </SheetHeader>
                  
                  <nav className="flex flex-col flex-grow overflow-y-auto p-8 gap-8">
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground border-b pb-2">Collections</p>
                      {navLinks.map((link) => (
                        <Link 
                          key={link.name} 
                          href={link.href} 
                          className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] py-2 hover:text-accent transition-colors"
                        >
                          {link.name} <ChevronRight className="h-3 w-3 opacity-30" />
                        </Link>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground border-b pb-2">My Siddhivinayak</p>
                      {accountLinks.map((link) => (
                        <Link 
                          key={link.name} 
                          href={link.href} 
                          className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] py-2 hover:text-accent transition-colors"
                        >
                          <span className="flex items-center gap-3">
                            <link.icon className="h-4 w-4" /> {link.name}
                          </span>
                          <ChevronRight className="h-3 w-3 opacity-30" />
                        </Link>
                      ))}
                    </div>
                  </nav>

                  <div className="p-8 border-t bg-secondary/20">
                    <p className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground leading-relaxed">
                      Crafting Indian heritage since 1994. Premium quality guaranteed.
                    </p>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <Link 
              href="/" 
              className={cn(
                "font-headline text-lg font-bold tracking-[0.25em] transition-all duration-500 md:text-xl",
                useLightText ? "text-white" : "text-primary"
              )}
            >
              SIDDHIVINAYAK
            </Link>
          </div>

          {/* Center Column: Desktop Nav */}
          <nav className="hidden items-center justify-center gap-8 lg:flex flex-grow max-w-fit px-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "font-body text-[10px] font-bold tracking-[0.2em] transition-all duration-300 uppercase relative group py-2 whitespace-nowrap",
                  useLightText ? "text-white/80 hover:text-white" : "text-primary/70 hover:text-primary"
                )}
              >
                {link.name}
                <span className={cn(
                  "absolute bottom-1 left-0 w-0 h-[1.5px] transition-all duration-500 group-hover:w-full",
                  useLightText ? "bg-white" : "bg-accent"
                )} />
              </Link>
            ))}
          </nav>

          {/* Right Column: Icons */}
          <div className="flex items-center justify-end gap-1 md:gap-2 flex-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "rounded-none h-10 w-10 transition-colors",
                useLightText ? "text-white hover:bg-white/10" : "text-primary hover:bg-black/5"
              )}
            >
              <Search className="h-4 w-4" />
            </Button>
            
            <Link href="/account" className="hidden sm:block">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "rounded-none h-10 w-10 transition-colors",
                  useLightText ? "text-white hover:bg-white/10" : "text-primary hover:bg-black/5"
                )}
              >
                <User className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/wishlist" className="hidden sm:block">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "rounded-none h-10 w-10 transition-colors",
                  useLightText ? "text-white hover:bg-white/10" : "text-primary hover:bg-black/5"
                )}
              >
                <Heart className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/cart">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "rounded-none h-10 w-10 relative transition-colors",
                  useLightText ? "text-white hover:bg-white/10" : "text-primary hover:bg-black/5"
                )}
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center text-[9px] font-bold text-white bg-accent">
                  0
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
