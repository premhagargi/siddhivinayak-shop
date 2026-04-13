import type { Metadata } from 'next';
import './globals.css';
import { ClientProviders } from '@/components/providers/ClientProviders';

// Force dynamic rendering to prevent static generation issues with React context
export const dynamic = 'force-dynamic';

const siteUrl = 'https://siddhivinayakcollections.com';

export const metadata: Metadata = {
  title: {
    default: 'Siddhivinayak Collection | Timeless Sarees & Silver Gifts',
    template: '%s | Siddhivinayak Collection',
  },
  description: 'Shop premium Banarasi sarees, silk sarees, and silver gifting items online. Siddhivinayak Collection offers timeless Indian ethnic wear and meaningful silver gifts with free shipping across India.',
  keywords: ['sarees online', 'banarasi saree', 'silk saree', 'silver gifts', 'silver idols', 'Indian ethnic wear', 'wedding sarees', 'buy sarees online India', 'siddhivinayak collection'],
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl,
    siteName: 'Siddhivinayak Collection',
    title: 'Siddhivinayak Collection | Timeless Sarees & Silver Gifts',
    description: 'Shop premium Banarasi sarees, silk sarees, and silver gifting items online. Free shipping across India.',
    images: [
      {
        url: `${siteUrl}/assets/favicon.png`,
        width: 512,
        height: 512,
        alt: 'Siddhivinayak Collection',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Siddhivinayak Collection | Timeless Sarees & Silver Gifts',
    description: 'Shop premium Banarasi sarees, silk sarees, and silver gifting items online.',
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
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
