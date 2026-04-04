'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const SEGMENT_LABELS: Record<string, string> = {
  account: 'Account',
  auth: 'Auth',
  brands: 'Brands',
  cart: 'Cart',
  categories: 'Categories',
  checkout: 'Checkout',
  collections: 'Collections',
  contact: 'Contact',
  faq: 'FAQ',
  login: 'Log in',
  orders: 'Orders',
  privacy: 'Privacy',
  products: 'Products',
  register: 'Register',
  returns: 'Returns',
  search: 'Search',
  settings: 'Settings',
  shipping: 'Shipping',
  'session-transfer': 'Session',
  'track-order': 'Track order',
  'verify-email': 'Verify email',
  wishlist: 'Wishlist',
};

const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

function humanizeSegment(segment: string): string {
  return segment
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function labelForSegment(segment: string, index: number, segments: string[]): string {
  const key = segment.toLowerCase();
  if (SEGMENT_LABELS[key]) return SEGMENT_LABELS[key];
  if (OBJECT_ID_RE.test(segment)) {
    const prev = segments[index - 1]?.toLowerCase();
    if (prev === 'orders') return 'Order details';
    return 'Details';
  }
  return humanizeSegment(segment);
}

export default function StorefrontBreadcrumbs() {
  const pathname = usePathname() || '/';
  const normalized = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

  if (normalized === '/') {
    return null;
  }

  const segments = normalized.split('/').filter(Boolean);
  const items: { href: string; label: string }[] = [{ href: '/', label: 'Home' }];

  let acc = '';
  segments.forEach((seg, i) => {
    acc += `/${seg}`;
    items.push({
      href: acc,
      label: labelForSegment(seg, i, segments),
    });
  });

  return (
    <nav aria-label="Breadcrumb" className="border-b bg-muted/40">
      <div className="container-custom py-2.5">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={item.href} className="flex items-center gap-1 min-w-0">
                {i > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" aria-hidden />
                )}
                {i === 0 ? (
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1 shrink-0 text-foreground/80 hover:text-primary-600 transition-colors"
                  >
                    <Home className="h-3.5 w-3.5" aria-hidden />
                    <span className="sr-only sm:not-sr-only">{item.label}</span>
                  </Link>
                ) : isLast ? (
                  <span className="font-medium text-foreground truncate" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-primary-600 transition-colors truncate"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
