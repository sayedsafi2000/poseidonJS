'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles } from 'lucide-react';
import { optimizeCloudinaryUrl } from '@/lib/imageOptimization';

export default function CollectionsPage() {
  const router = useRouter();
  
  const { data: collections, isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const response = await api.get('/collections');
      return response.data.data.collections;
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-white/20 backdrop-blur-sm border-white/30 text-white">
              <Sparkles className="w-3 h-3 mr-1" />
              Curated Collections
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Featured Collections
            </h1>
            <p className="text-xl text-white/90">
              Discover our carefully curated product collections
            </p>
          </div>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-12">
        <div className="container-custom">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading collections...</p>
            </div>
          ) : !collections || collections.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-24 h-24 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg mb-4">No collections found</p>
              <button onClick={() => router.push('/products')} className="btn-primary">
                Browse All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {collections.map((collection: any) => (
                <Card 
                  key={collection._id} 
                  className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 bg-white h-full cursor-pointer"
                  onClick={() => router.push(`/products?collection=${collection.slug}`)}
                >
                  <CardContent className="p-0">
                    {/* Collection Image */}
                    <div className="relative h-64 overflow-hidden bg-slate-100">
                      {collection.image ? (
                        <Image
                          src={optimizeCloudinaryUrl(collection.image, { quality: 'auto' })}
                          alt={collection.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          quality={85}
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="bg-gradient-to-br from-purple-500 to-pink-500 h-full flex items-center justify-center">
                          <Sparkles className="w-24 h-24 text-white/50" />
                        </div>
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {/* Collection Title on Hover */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        <Badge className="mb-2 bg-white/20 backdrop-blur-sm text-white">
                          Collection
                        </Badge>
                        <h3 className="text-2xl font-bold">
                          {collection.name}
                        </h3>
                      </div>
                    </div>

                    {/* Collection Info */}
                    <div className="p-6">
                      <h3 className="font-bold text-xl mb-2 group-hover:text-primary-600 transition-colors">
                        {collection.name}
                      </h3>
                      
                      {collection.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {collection.description}
                        </p>
                      )}

                      {/* Product Count */}
                      {collection.products?.length > 0 && (
                        <p className="text-sm text-gray-500 mb-4">
                          {collection.products.length} products
                        </p>
                      )}

                      {/* View Collection Button */}
                      <div className="flex items-center justify-between">
                        <span className="text-primary-600 font-medium text-sm group-hover:gap-2 transition-all inline-flex items-center">
                          Explore Collection
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform ml-1" />
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
