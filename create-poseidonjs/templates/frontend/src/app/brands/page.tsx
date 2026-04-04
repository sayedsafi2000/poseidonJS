'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';
import Image from 'next/image';
import { optimizeCloudinaryUrl } from '@/lib/imageOptimization';

export default function BrandsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['brands', search],
    queryFn: async () => {
      const params = new URLSearchParams({ isActive: 'true' });
      if (search) params.append('search', search);
      const response = await api.get(`/brands?${params.toString()}`);
      return response.data.data;
    },
  });

  const brands = data?.brands || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container-custom py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Shop by Brand
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore our curated collection of premium brands
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-12">
          <input
            type="text"
            placeholder="Search brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Brands Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-lg text-gray-500">Loading brands...</div>
          </div>
        ) : brands.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Brands Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {search ? 'Try a different search term' : 'Check back soon for new brands'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {brands.map((brand: any) => (
              <Card
                key={brand._id}
                className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-gray-800 cursor-pointer"
                onClick={() => router.push(`/products?brand=${brand.slug}`)}
              >
                <CardContent className="p-6">
                  <div className="aspect-square relative mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                    {brand.image ? (
                      <Image
                        src={optimizeCloudinaryUrl(brand.image, { quality: 'auto' })}
                        alt={brand.name}
                        fill
                        className="object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                        quality={80}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      />
                    ) : (
                      <div className="text-4xl font-bold text-gray-400 dark:text-gray-500">
                        {brand.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {brand.name}
                    </h3>
                    {brand.productCount !== undefined && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {brand.productCount} {brand.productCount === 1 ? 'Product' : 'Products'}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
