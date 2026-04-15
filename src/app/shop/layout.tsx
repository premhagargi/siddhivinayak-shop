import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse our curated collection of premium Banarasi sarees, silk sarees, and hallmarked silver gifts. Free shipping across India.",
  openGraph: {
    title: "Shop Sarees & Silver | Siddhivinayak Collection",
    description:
      "Premium Banarasi sarees, silk sarees, and hallmarked silver gifts. Free shipping across India.",
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
