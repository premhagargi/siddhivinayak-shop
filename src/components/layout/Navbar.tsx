
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingBag, User, Heart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Determine if we should use light text (white) or dark text (black/primary)
  // On home page at the top, we want white text because the hero is dark.
  // After scrolling or on other pages, we follow the theme.
  const useLightText = isHome && !isScrolled;

  return (
    <header 
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500 ease-in-out",
        isScrolled 
          ? "bg-background/70 backdrop-blur-xl border-b py-3" 
          : "bg-transparent border-transparent py-5"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        {/* Mobile Menu */}
        <div className="flex items-center md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "rounded-none transition-colors",
                  useLightText ? "text-white hover:text-white/80 hover:bg-white/10" : "text-primary"
                )}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 rounded-none bg-background">
              <nav className="flex flex-col gap-6 p-8 font-headline font-bold text-lg">
                <Link href="/" className="mb-4">SIDDHIVINAYAK</Link>
                {navLinks.map((link) => (
                  <Link key={link.name} href={link.href} className="hover:text-accent transition-colors">
                    {link.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <Link 
          href="/" 
          className={cn(
            "font-headline text-xl font-bold tracking-[0.2em] transition-all duration-500 md:text-2xl",
            useLightText ? "text-white" : "text-primary"
          )}
        >
          SIDDHIVINAYAK
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "font-body text-[10px] font-bold tracking-[0.2em] transition-all duration-300 uppercase relative group",
                useLightText ? "text-white/90 hover:text-white" : "text-primary/70 hover:text-primary"
              )}
            >
              {link.name}
              <span className={cn(
                "absolute -bottom-1 left-0 w-0 h-[1px] transition-all duration-300 group-hover:w-full",
                useLightText ? "bg-white" : "bg-primary"
              )} />
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-1 md:gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "rounded-none hidden sm:inline-flex transition-colors",
              useLightText ? "text-white hover:text-white/80 hover:bg-white/10" : "text-primary"
            )}
          >
            <Search className="h-4 w-4" />
          </Button>
          <Link href="/wishlist">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "rounded-none hidden sm:inline-flex transition-colors",
                useLightText ? "text-white hover:text-white/80 hover:bg-white/10" : "text-primary"
              )}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/account">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "rounded-none transition-colors",
                useLightText ? "text-white hover:text-white/80 hover:bg-white/10" : "text-primary"
              )}
            >
              <User className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/cart">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "rounded-none relative transition-colors",
                useLightText ? "text-white hover:text-white/80 hover:bg-white/10" : "text-primary"
              )}
            >
              <ShoppingBag className="h-4 w-4" />
              <span className={cn(
                "absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center text-[8px] font-bold text-white transition-all",
                isScrolled ? "bg-accent" : "bg-accent"
              )}>
                0
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
