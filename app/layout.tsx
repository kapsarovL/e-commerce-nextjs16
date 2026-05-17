import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/next';
import { VitalsReporter } from '@/components/vitals-reporter';
import Script from 'next/script';
import { headers } from 'next/headers';

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get('x-nonce') ?? '';

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClerkProvider>
          {children}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-V6BKVYNHV9"
            strategy="afterInteractive"
            nonce={nonce}
          />
        </ClerkProvider>
        <Analytics />
        <VitalsReporter />
      </body>
    </html>
  );
}
