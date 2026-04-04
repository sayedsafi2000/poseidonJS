'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function DefaultHeroPanel({ embedded }: { embedded?: boolean }) {
  return (
    <section
      className={
        embedded
          ? 'relative h-full min-h-[320px] overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 text-white shadow-lg ring-1 ring-white/10 sm:min-h-[400px] md:min-h-[min(58vh,560px)]'
          : 'relative overflow-hidden bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 text-white'
      }
    >
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

      <div className={`relative ${embedded ? 'px-5 py-14 sm:px-8 md:py-20' : 'container-custom py-24 md:py-32'}`}>
        <div className={embedded ? 'max-w-xl space-y-6 md:max-w-2xl' : 'max-w-4xl mx-auto text-center space-y-8'}>
          <div
            className={
              embedded
                ? 'flex flex-col gap-3 sm:flex-row sm:flex-wrap'
                : 'flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in'
            }
          >
            <Button size="lg" asChild className="bg-slate-800 text-white shadow-2xl hover:bg-slate-700">
              <Link href="/products">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
            >
              <Link href="/categories">Browse Categories</Link>
            </Button>
          </div>
        </div>
      </div>

      {!embedded && (
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-12 fill-white">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      )}
    </section>
  );
}
