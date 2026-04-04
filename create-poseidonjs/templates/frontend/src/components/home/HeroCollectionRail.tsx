'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, LayoutGrid } from 'lucide-react';

export type HeroCollectionItem = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  productCount?: number;
};

function CollectionThumb({ image, name }: { image?: string; name: string }) {
  if (image) {
    return (
      <Image
        src={image}
        alt={name}
        width={56}
        height={56}
        className="h-full w-full object-cover"
        quality={80}
        loading="lazy"
      />
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-500/90 to-purple-600/90 text-[10px] font-bold uppercase tracking-wide text-white/95">
      {name.slice(0, 2)}
    </div>
  );
}

export default function HeroCollectionRail({
  collections,
  isLoading,
}: {
  collections: HeroCollectionItem[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <>
        <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden scrollbar-thin -mx-1 px-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-11 w-36 shrink-0 animate-pulse rounded-full bg-slate-200/90"
            />
          ))}
        </div>
        <div className="hidden lg:flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex animate-pulse gap-3 rounded-xl p-2.5">
              <div className="h-14 w-14 shrink-0 rounded-lg bg-slate-200" />
              <div className="flex flex-1 flex-col justify-center gap-2">
                <div className="h-3.5 w-3/4 rounded bg-slate-200" />
                <div className="h-3 w-1/3 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (!collections.length) {
    return null;
  }

  return (
    <>
      {/* Mobile / tablet: horizontal strip (Pickaboo-style category rail) */}
      <div className="lg:hidden">
        <div className="mb-1 flex items-center justify-between px-0.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Collections
          </span>
          <Link
            href="/collections"
            className="text-xs font-medium text-primary-600 hover:text-primary-700"
          >
            See all
          </Link>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin -mx-1 snap-x snap-mandatory px-1">
          {collections.map((c) => (
            <Link
              key={c._id}
              href={`/products?collection=${encodeURIComponent(c.slug)}`}
              className="group flex min-w-[9.5rem] max-w-[11rem] snap-start items-center gap-2.5 rounded-2xl border border-slate-200/90 bg-white py-2 pl-2 pr-3 shadow-sm ring-0 transition hover:border-primary-200 hover:shadow-md"
            >
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl ring-1 ring-slate-900/5">
                <CollectionThumb image={c.image} name={c.name} />
              </div>
              <span className="min-w-0 flex-1 text-left text-sm font-semibold leading-tight text-slate-800 group-hover:text-primary-600">
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop: vertical stack */}
      <nav
        aria-label="Featured collections"
        className="hidden lg:flex h-full min-h-0 flex-col rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm ring-1 ring-slate-900/[0.03]"
      >
        <div className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 text-white shadow-sm">
            <LayoutGrid className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900">Collections</p>
            <p className="text-[11px] text-muted-foreground">Shop by theme</p>
          </div>
        </div>
        <ul className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto scrollbar-thin pr-0.5">
          {collections.map((c) => (
            <li key={c._id}>
              <Link
                href={`/products?collection=${encodeURIComponent(c.slug)}`}
                className="group flex items-center gap-3 rounded-xl border border-transparent px-2 py-2 transition hover:border-primary-200/80 hover:bg-gradient-to-r hover:from-primary-50/80 hover:to-transparent"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 shadow-inner ring-1 ring-slate-900/5">
                  <CollectionThumb image={c.image} name={c.name} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-primary-600">
                    {c.name}
                  </p>
                  {typeof c.productCount === 'number' ? (
                    <p className="text-[11px] text-muted-foreground">
                      {c.productCount} {c.productCount === 1 ? 'product' : 'products'}
                    </p>
                  ) : null}
                </div>
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary-500"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/collections"
          className="mt-2 block rounded-xl border border-dashed border-slate-200 py-2.5 text-center text-xs font-semibold text-primary-600 transition hover:border-primary-300 hover:bg-primary-50/50"
        >
          View all collections
        </Link>
      </nav>
    </>
  );
}
