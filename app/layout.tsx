import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/next';
import { VitalsReporter } from '@/components/vitals-reporter';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'StoreFront',
  description: 'A modern e-commerce storefront',
  verification: {
    google: 'tTsgaPYqJcPUdJWUFYl6hZufQpIn1VhrHZSB_xY06m8',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClerkProvider>{children}</ClerkProvider>
        <Analytics />
        <VitalsReporter />
      </body>
    </html>
  );
}
