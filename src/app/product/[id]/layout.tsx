import type { Metadata } from "next";
import { getAdminDb } from "@/lib/firebase-admin";

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const adminDb = getAdminDb();
    if (!adminDb) return { title: "Product" };

    const doc = await adminDb.collection("products").doc(id).get();
    if (!doc.exists) return { title: "Product Not Found" };

    const product = doc.data()!;
    const title = product.name;
    const description =
      product.description?.slice(0, 160) ||
      `Shop ${product.name} — ${product.category} from Siddhivinayak Collection. Free shipping across India.`;
    const image = product.images?.[0];

    return {
      title,
      description,
      openGraph: {
        title: `${title} | Siddhivinayak Collection`,
        description,
        ...(image && {
          images: [{ url: image, width: 600, height: 800, alt: title }],
        }),
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        ...(image && { images: [image] }),
      },
    };
  } catch {
    return { title: "Product" };
  }
}

export default function ProductLayout({ children }: Props) {
  return children;
}
