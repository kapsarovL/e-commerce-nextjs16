import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex min-h-[calc(100vh-3.5rem)] flex-col">{children}</main>
      <Footer />
    </>
  );
}
