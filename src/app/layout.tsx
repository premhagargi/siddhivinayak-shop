import type { Metadata } from 'next';
import './globals.css';
import { ClientProviders } from '@/components/providers/ClientProviders';

// Force dynamic rendering to prevent static generation issues with React context
export const dynamic = 'force-dynamic';

const siteUrl = 'https://siddhivinayakcollections.com';

export const metadata: Metadata = {
  title: {
    default: 'Siddhivinayak Collection — Premium Sarees & Silver Gifts Online',
    template: '%s | Siddhivinayak Collection',
  },
  description: 'Discover handcrafted Banarasi sarees, silk sarees & pure silver gifts. Perfect for weddings, festivals & return gifts. Shop now with free delivery across India.',
  keywords: [
    'sarees online', 'banarasi saree', 'silk saree', 'buy saree online India',
    'silver gifts', 'silver idols', 'return gifts', 'wedding sarees',
    'Indian ethnic wear', 'silver pooja items', 'gift for wedding',
    'siddhivinayak collection', 'premium sarees', 'handloom sarees',
  ],
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl,
    siteName: 'Siddhivinayak Collection',
    title: 'Siddhivinayak Collection — Handcrafted Sarees & Silver Gifts',
    description: 'Shop premium Banarasi & silk sarees, pure silver idols, and curated return gifts. Trusted by 1000+ happy customers. Free delivery pan-India.',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Siddhivinayak Collection — Premium Sarees & Silver Gifts',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Siddhivinayak Collection — Handcrafted Sarees & Silver Gifts',
    description: 'Premium Banarasi sarees, silk sarees & pure silver gifts. Free delivery across India.',
    images: [`${siteUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    // Add your Google Search Console verification code here
    // google: 'your-verification-code',
  },
  other: {
    'theme-color': '#B89B5E',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/assets/favicon.png" />
        <link rel="apple-touch-icon" href="/assets/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

        {/* JSON-LD: Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Siddhivinayak Collection",
              url: "https://siddhivinayakcollections.com",
              logo: "https://siddhivinayakcollections.com/assets/favicon.png",
              sameAs: [],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                availableLanguage: ["English", "Hindi"],
              },
            }),
          }}
        />

        {/* JSON-LD: WebSite (enables sitelinks search box) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Siddhivinayak Collection",
              url: "https://siddhivinayakcollections.com",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    "https://siddhivinayakcollections.com/shop?search={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />

        {/* JSON-LD: LocalBusiness */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              name: "Siddhivinayak Collection",
              url: "https://siddhivinayakcollections.com",
              logo: "https://siddhivinayakcollections.com/assets/favicon.png",
              image: "https://siddhivinayakcollections.com/og-image.png",
              description:
                "Premium Banarasi sarees, silk sarees, and pure silver gifts for weddings, festivals, and return gifts.",
              priceRange: "₹₹",
              currenciesAccepted: "INR",
              paymentAccepted: "UPI, Credit Card, Debit Card, Net Banking",
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                  "Monday", "Tuesday", "Wednesday", "Thursday",
                  "Friday", "Saturday", "Sunday",
                ],
                opens: "00:00",
                closes: "23:59",
              },
            }),
          }}
        />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
