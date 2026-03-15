import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingCart, Tag, BarChart3 } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';

async function requireAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect('/sign-in');
  const role = (sessionClaims?.publicMetadata as { role?: string } | undefined)?.role;
  if (role !== 'admin') redirect('/');
}

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="bg-muted/30 flex min-h-screen">
      {/* Sidebar */}
      <aside className="bg-background flex w-60 shrink-0 flex-col border-r">
        <div className="flex h-14 items-center border-b px-5">
          <BarChart3 className="text-primary mr-2 h-5 w-5" />
          <span className="text-sm font-semibold">Admin</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-4">
          <div className="flex items-center gap-2">
            <UserButton />
            <span className="text-muted-foreground text-xs">Admin</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
