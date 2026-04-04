'use client';

import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import HeroCollectionRail, { type HeroCollectionItem } from '@/components/home/HeroCollectionRail';
import DefaultHeroPanel from '@/components/home/DefaultHeroPanel';
import type { StorefrontBanner } from '@/components/home/HeroBannerSwiper';

const HeroBannerSwiper = dynamic(() => import('@/components/home/HeroBannerSwiper'), {
  ssr: false,
  loading: () => (
    <div className="h-full min-h-[320px] w-full animate-pulse rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 shadow-lg sm:min-h-[400px] md:min-h-[min(58vh,560px)]" />
  ),
});

const bannerSkeleton = (
  <div className="h-full min-h-[320px] w-full animate-pulse rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 shadow-lg sm:min-h-[400px] md:min-h-[min(58vh,560px)]" />
);

export default function HomeHeroSection({
  heroBannersLoading,
  hasHeroBanners,
  banners,
  collections,
  collectionsLoading,
}: {
  heroBannersLoading: boolean;
  hasHeroBanners: boolean;
  banners: StorefrontBanner[];
  collections: HeroCollectionItem[];
  collectionsLoading: boolean;
}) {
  const showRail = collectionsLoading || collections.length > 0;

  return (
    <section className="w-full pt-3 sm:pt-5 md:pt-6">
      <div
        className={cn(
          'w-full px-4 sm:px-6 lg:px-8',
          showRail &&
            'flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(220px,270px)_minmax(0,1fr)] lg:items-stretch lg:gap-5 xl:grid-cols-[minmax(240px,290px)_minmax(0,1fr)]'
        )}
      >
        {showRail ? (
          <aside className="order-2 flex h-full min-h-0 flex-col lg:order-1 lg:min-h-[min(58vh,560px)]">
            <HeroCollectionRail collections={collections} isLoading={collectionsLoading} />
          </aside>
        ) : null}

        <div
          className={cn(
            'order-1 flex min-h-0 flex-col lg:order-2',
            showRail && 'h-full min-h-[min(58vh,560px)]',
            !showRail && 'lg:col-span-full'
          )}
        >
            {heroBannersLoading ? (
              bannerSkeleton
            ) : hasHeroBanners ? (
              <HeroBannerSwiper banners={banners} layout={showRail ? 'embedded' : 'full'} />
            ) : (
              <DefaultHeroPanel embedded={showRail} />
            )}
        </div>
      </div>
    </section>
  );
}
