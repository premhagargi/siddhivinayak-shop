import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import LenisProvider from '@/components/providers/LenisProvider';
import { AppLayout } from '@/components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'Siddhivinayak Collection | Timeless Sarees & Silver Gifts',
  description: 'A premium Indian brand specializing in elegant sarees and meaningful silver gifting items. Modern, minimal, and sophisticated.',
  icons: {
    icon: [
      { url: '/assets/favicon.png', type: 'image/png' },
    ],
    shortcut: '/assets/favicon.png',
    apple: '/assets/favicon.png',
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
        <link rel="icon" href="/assets/favicon.png" type="image/png" sizes="32x32" />
        <link rel="shortcut icon" href="/assets/favicon.png" />
        <link rel="apple-touch-icon" href="/assets/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <LenisProvider>
          <AppLayout>
            {children}
          </AppLayout>
          <Toaster />
        </LenisProvider>
      </body>
    </html>
  );
}
