import Link from 'next/link';
import { Github, Twitter, Instagram } from 'lucide-react';

const navigation = {
  shop: [
    { label: 'All Products', href: '/products' },
    { label: 'Search', href: '/search' },
  ],
  account: [
    { label: 'My Account', href: '/account' },
    { label: 'Orders', href: '/orders' },
    { label: 'Cart', href: '/cart' },
  ],
  company: [
    { label: 'About', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
};

const socials = [
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Github, label: 'GitHub', href: '#' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-border bg-background border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="text-base font-semibold tracking-tight">
              StoreFront
            </Link>
            <p className="text-muted-foreground mt-2 max-w-45 text-sm leading-relaxed">
              Quality goods, delivered fast.
            </p>
            <div className="mt-4 flex items-center gap-3">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <p className="text-foreground mb-3 text-sm font-medium">Shop</p>
            <ul className="flex flex-col gap-2">
              {navigation.shop.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <p className="text-foreground mb-3 text-sm font-medium">Account</p>
            <ul className="flex flex-col gap-2">
              {navigation.account.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-foreground mb-3 text-sm font-medium">Company</p>
            <ul className="flex flex-col gap-2">
              {navigation.company.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-border mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row">
          <p className="text-muted-foreground text-xs">© {year} StoreFront. All rights reserved.</p>
          <p className="text-muted-foreground text-xs">Secure payments via Stripe</p>
        </div>
      </div>
    </footer>
  );
}
