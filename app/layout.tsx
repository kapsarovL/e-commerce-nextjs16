import type { Metadata } from 'next'
import Script from 'next/script'
import { Geist, Geist_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Analytics } from '@vercel/analytics/next'
import { VitalsReporter } from '@/components/vitals-reporter'
import './globals.css'

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
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClerkProvider>{children}</ClerkProvider>
        <Analytics />
        <VitalsReporter />

        {/*
          strategy="afterInteractive" — defers until after hydration.
          The right default for analytics, chat widgets, tag managers.
          Equivalent to: script loads after DOMContentLoaded, non-blocking.
        */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"
          strategy="afterInteractive"
        />

        {/*
          strategy="lazyOnload" — lowest priority, loads during browser idle.
          Use for: non-critical widgets, A/B testing scripts, social embeds.
          Never use "beforeInteractive" unless the script must run before React.
        */}
        <Script
          src="https://cdn.example.com/chat-widget.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  )
}
