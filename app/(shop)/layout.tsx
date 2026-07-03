import { ClerkProvider } from '@clerk/nextjs';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { CookieConsent } from '@/components/cookie-consent';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <Navbar />
      <main id="main-content" className="min-h-[calc(100vh-3.5rem)] w-full">
        {children}
      </main>
      <div id="cookie-sentinel" className="h-px" />
      <Footer />
      <CookieConsent />
    </ClerkProvider>
  );
}
