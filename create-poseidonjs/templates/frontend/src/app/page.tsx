'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { useStorefrontAddToCart } from '@/hooks/useStorefrontAddToCart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import StorefrontProductCard from '@/components/product/StorefrontProductCard';
import HomeHeroSection from '@/components/home/HomeHeroSection';
import { ArrowRight, TruckIcon, Shield, RefreshCw, Zap, Award } from 'lucide-react';

export default function HomePage() {
  const { addToCart } = useStorefrontAddToCart();

  const { data: heroBannerList, isLoading: heroBannersLoading } = useQuery({
    queryKey: ['banners', 'hero', 'storefront'],
    queryFn: async () => {
      const response = await api.get('/banners?position=hero&isActive=true');
      const list = response.data?.data?.banners ?? [];
      const now = new Date();
      return list
        .filter((b: any) => {
          if (!b?.isActive) return false;
          if (b.startDate && new Date(b.startDate) > now) return false;
          if (b.endDate && new Date(b.endDate) < now) return false;
          return !!(b.image && b.title);
        })
        .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    },
  });

  const hasHeroBanners = (heroBannerList?.length ?? 0) > 0;

  const { data: heroCollections = [], isLoading: heroCollectionsLoading } = useQuery({
    queryKey: ['collections', 'home-hero'],
    queryFn: async () => {
      const featured = await api.get('/collections?isActive=true&isFeatured=true&limit=12');
      const list = featured.data?.data?.collections ?? [];
      if (list.length > 0) return list;
      const fallback = await api.get('/collections?isActive=true&limit=7');
      return fallback.data?.data?.collections ?? [];
    },
  });

  const { data: featuredProducts } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const params = new URLSearchParams({
        featured: 'true',
        limit: '8',
        page: '1',
        sort: '-createdAt',
      });
      const response = await api.get(`/products?${params.toString()}`);
      return response.data?.data?.products ?? [];
    },
  });

  const { data: specialOffers } = useQuery({
    queryKey: ['special-offers'],
    queryFn: async () => {
      const params = new URLSearchParams({
        offer: 'true',
        limit: '4',
        page: '1',
        sort: '-createdAt',
      });
      const response = await api.get(`/products?${params.toString()}`);
      return response.data?.data?.products ?? [];
    },
  });

  const handleAddToCart = (product: any) => {
    addToCart(product);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <HomeHeroSection
        heroBannersLoading={heroBannersLoading}
        hasHeroBanners={hasHeroBanners}
        banners={heroBannerList ?? []}
        collections={heroCollections}
        collectionsLoading={heroCollectionsLoading}
      />

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: TruckIcon, title: 'Free Shipping', desc: 'On orders over $50' },
              { icon: Shield, title: 'Secure Payment', desc: '100% protected' },
              { icon: RefreshCw, title: 'Easy Returns', desc: '30-day guarantee' },
              { icon: Award, title: 'Best Quality', desc: 'Premium products' },
            ].map((feature, i) => (
              <Card key={i} className="text-center border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products - Enhanced */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="secondary">Featured</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Trending Products
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our hand-picked selection of the best products
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts?.map((product: any) => (
              <StorefrontProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link href="/products">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Special Offers — same cards as featured; API includes sale-priced, promo-targeted, and legacy flags */}
      {specialOffers && specialOffers.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-white to-slate-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <Badge className="mb-4" variant="secondary">
                <Zap className="w-3 h-3 mr-1 inline" />
                Limited Time
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Special Offers
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Discounted picks and products included in active promotions
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {specialOffers.map((product: any) => (
                <StorefrontProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-600 text-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl font-bold">Stay Updated</h2>
            <p className="text-xl text-white/90">
              Subscribe to our newsletter for exclusive deals and updates
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <Button size="lg" className="bg-white text-primary-600 hover:bg-white/90">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
