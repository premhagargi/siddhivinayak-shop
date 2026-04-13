import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/cart", "/checkout", "/order-confirmation"],
      },
    ],
    sitemap: "https://siddhivinayakcollections.com/sitemap.xml",
  };
}
