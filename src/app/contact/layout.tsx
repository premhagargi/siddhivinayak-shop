import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Siddhivinayak Collection for orders, inquiries, or support. We are here to help you find the perfect saree or silver gift.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
