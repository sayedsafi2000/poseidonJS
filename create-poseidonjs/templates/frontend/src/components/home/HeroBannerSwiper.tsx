'use client';

import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export type StorefrontBanner = {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  mobileImage?: string;
  link?: string;
  linkText?: string;
};

/**
 * Optimize Cloudinary image URL for responsive delivery with auto-quality and format
 * Falls back to original URL if not a Cloudinary image
 */
function optimizeImageUrl(url: string, params?: { width?: number; quality?: string }): string {
  if (!url.includes('res.cloudinary.com')) return url;
  
  const quality = params?.quality || 'auto';
  const width = params?.width ? `,w_${params.width}` : '';
  const autoFormat = '/f_auto';
  
  // Insert transformation parameters after /upload/
  return url.replace('/upload/', `/upload/${autoFormat},q_${quality}${width}/`);
}

function slideShellClass(embedded: boolean) {
  /* 16:9 aspect ratio maintained; uses aspect-video (16/9) and min-h for mobile responsiveness */
  return embedded
    ? 'relative aspect-video w-full overflow-hidden rounded-lg bg-slate-900'
    : 'relative aspect-video w-full overflow-hidden rounded-b-[1.5rem] bg-slate-900 sm:rounded-b-[2rem]';
}

function SlideContent({
  banner,
  embedded = false,
}: {
  banner: StorefrontBanner;
  embedded?: boolean;
}) {
  const shell = slideShellClass(embedded);
  
  // Optimize images for desktop and mobile
  const desktopImageUrl = optimizeImageUrl(banner.image, { quality: 'auto' });
  const mobileImageUrl = banner.mobileImage ? optimizeImageUrl(banner.mobileImage, { quality: 'auto' }) : null;
  
  const slideElement = (
    <div className={shell}>
      <picture className="absolute inset-0 z-0 block h-full w-full overflow-hidden">
        {mobileImageUrl ? (
          <source 
            media="(max-width: 767px)" 
            srcSet={mobileImageUrl}
            type="image/webp"
          />
        ) : null}
        <img
          src={desktopImageUrl}
          alt={banner.title}
          className="hero-banner-slide-img absolute inset-0 h-full w-full object-cover object-center"
          loading="eager"
          decoding="async"
        />
      </picture>
    </div>
  );

  // If banner has a link, wrap in anchor tag
  if (banner.link) {
    if (banner.link.startsWith('/')) {
      return (
        <Link href={banner.link} className="block h-full w-full cursor-pointer">
          {slideElement}
        </Link>
      );
    } else {
      return (
        <a href={banner.link} target="_blank" rel="noopener noreferrer" className="block h-full w-full cursor-pointer">
          {slideElement}
        </a>
      );
    }
  }

  return slideElement;
}

export default function HeroBannerSwiper({
  banners,
  layout = 'full',
}: {
  banners: StorefrontBanner[];
  layout?: 'full' | 'embedded';
}) {
  if (!banners.length) return null;

  const loop = banners.length > 1;
  const embedded = layout === 'embedded';

  return (
    <section
      className={
        embedded
          ? 'relative hero-banner-swiper hero-banner-swiper-embedded isolate flex aspect-video flex-col overflow-hidden rounded-2xl bg-slate-950 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/10'
          : 'relative hero-banner-swiper isolate flex aspect-video flex-col overflow-hidden rounded-b-[1.5rem] bg-slate-950 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.45)] sm:rounded-b-[2rem]'
      }
    >
      <Swiper
        modules={[Autoplay, EffectFade, Pagination, Navigation]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={900}
        autoHeight={false}
        autoplay={
          loop
            ? { delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true }
            : false
        }
        pagination={{
          clickable: true,
          dynamicBullets: loop,
        }}
        navigation={loop}
        loop={loop}
        className={
          embedded
            ? 'hero-banner-swiper-inner h-full w-full flex-1'
            : 'hero-banner-swiper-inner h-full w-full flex-1'
        }
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner._id} className="!h-full">
            <SlideContent banner={banner} embedded={embedded} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
