
"use client";

import Link from "next/link";
import { Search, ShoppingBag, User, Heart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Navbar() {
  const navLinks = [
    { name: "Shop", href: "/shop" },
    { name: "Sarees", href: "/shop?category=saree" },
    { name: "Silver", href: "/shop?category=silver" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        {/* Mobile Menu */}
        <div className="flex items-center md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-none">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 rounded-none">
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
          className="font-headline text-xl font-bold tracking-widest text-primary md:text-2xl"
        >
          SIDDHIVINAYAK
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="font-body text-sm font-medium tracking-tight hover:text-accent transition-colors uppercase"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="rounded-none hidden sm:inline-flex">
            <Search className="h-5 w-5" />
          </Button>
          <Link href="/wishlist">
            <Button variant="ghost" size="icon" className="rounded-none hidden sm:inline-flex">
              <Heart className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/account">
            <Button variant="ghost" size="icon" className="rounded-none">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="rounded-none relative">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center bg-accent text-[10px] text-white font-bold">
                0
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
