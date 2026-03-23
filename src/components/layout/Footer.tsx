
import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Twitter } from "lucide-react";

export default function Footer() {
  const footerSections = [
    {
      title: "Collections",
      links: [
        { name: "Silk Sarees", href: "/shop?category=silk" },
        { name: "Wedding Specials", href: "/shop?category=wedding" },
        { name: "Silver Idols", href: "/shop?category=silver-idols" },
        { name: "Silver Coins", href: "/shop?category=silver-coins" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Contact", href: "/contact" },
        { name: "Careers", href: "#" },
        { name: "Journal", href: "#" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "FAQ", href: "/faq" },
        { name: "Shipping Policy", href: "/shipping-policy" },
        { name: "Returns & Exchanges", href: "/returns-policy" },
        { name: "Privacy Policy", href: "/privacy-policy" },
      ],
    },
  ];

  return (
    <footer className="border-t bg-background pt-20 pb-10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
          <div className="flex flex-col gap-6">
               <Link href="/" className="flex items-center gap-2">
                            <div className="relative h-10 w-10">
                              <Image 
                                src="/assets/favicon.png" 
                                alt="Siddhivinayak" 
                                fill 
                                className="object-contain"
                              />
                            </div>
                            <span className="font-headline text-xl">Siddhivinayak</span>
                          </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Crafting timeless sarees and meaningful silver gifts for life's most cherished occasions. Based in India, serving elegance worldwide.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-accent transition-colors"><Instagram className="h-5 w-5" /></Link>
              <Link href="#" className="hover:text-accent transition-colors"><Facebook className="h-5 w-5" /></Link>
              <Link href="#" className="hover:text-accent transition-colors"><Twitter className="h-5 w-5" /></Link>
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title} className="flex flex-col gap-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-primary">
                {section.title}
              </h4>
              <ul className="flex flex-col gap-4">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 flex flex-col items-center justify-between gap-6 border-t pt-10 md:flex-row">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-tight">
            © {new Date().getFullYear()} Siddhivinayak Collection. All rights reserved.
          </p>
          <div className="flex gap-8 text-xs font-medium uppercase tracking-tight text-muted-foreground">
            <span>India</span>
            <span>English</span>
            <span>Premium Logistics</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
