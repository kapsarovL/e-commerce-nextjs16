import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
      <Footer />
    </>
  );
}
