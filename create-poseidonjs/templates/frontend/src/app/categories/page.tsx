'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Package } from 'lucide-react';
import { optimizeCloudinaryUrl } from '@/lib/imageOptimization';

export default function CategoriesPage() {
  const router = useRouter();
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data.data.categories;
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary-600 to-purple-600 text-white py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-white/20 backdrop-blur-sm border-white/30 text-white">
              <Package className="w-3 h-3 mr-1" />
              Browse by Category
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Shop by Category
            </h1>
            <p className="text-xl text-white/90">
              Explore our wide range of product categories
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12">
        <div className="container-custom">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading categories...</p>
            </div>
          ) : !categories || categories.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-24 h-24 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg">No categories found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category: any) => (
                <Card 
                  key={category._id}
                  className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 bg-white h-full cursor-pointer"
                  onClick={() => router.push(`/products?category=${category.slug}`)}
                >
                  <CardContent className="p-0">
                    {/* Category Image */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary-100 to-purple-100">
                      {category.image ? (
                        <Image
                          src={optimizeCloudinaryUrl(category.image, { quality: 'auto' })}
                          alt={category.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          quality={80}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="w-16 h-16 text-primary-300" />
                        </div>
                      )}
                      
                      {/* Product Count Badge */}
                      {category.productCount > 0 && (
                        <Badge className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-900">
                          {category.productCount} Products
                        </Badge>
                      )}
                    </div>

                    {/* Category Info */}
                    <div className="p-6">
                      <h3 className="font-bold text-xl mb-2 group-hover:text-primary-600 transition-colors">
                        {category.name}
                      </h3>
                      
                      {category.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {category.description}
                        </p>
                      )}

                      {/* View Products Button */}
                      <div className="flex items-center text-primary-600 font-medium text-sm group-hover:gap-2 transition-all">
                        <span>Shop Now</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Back to Products */}
          <div className="text-center mt-12">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg hover:from-primary-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              View All Products
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Categories CTA */}
      <section className="py-16 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Can't find what you're looking for?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Browse all our products or contact our support team
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="px-8 py-3 bg-white text-gray-900 rounded-lg hover:bg-white/90 transition-colors font-medium"
              >
                Browse All Products
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-colors font-medium border border-white/20"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
