import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { VitalsReporter } from '@/components/vitals-reporter';
import Script from 'next/script';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'StoreFront',
  description: 'A modern e-commerce storefront',
  verification: {
    google: 'tTsgaPYqJcPUdJWUFYl6hZufQpIn1VhrHZSB_xY06m8',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <a
          href="#main-content"
          className="ring-ring bg-background text-foreground sr-only fixed top-0 left-0 z-[100] m-3 rounded-md px-4 py-2 text-sm font-medium shadow-sm ring-2 outline-none focus:not-sr-only"
        >
          Skip to content
        </a>
        {children}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-V6BKVYNHV9" strategy="lazyOnload" />
        <Analytics />
        <VitalsReporter />
      </body>
    </html>
  );
}
