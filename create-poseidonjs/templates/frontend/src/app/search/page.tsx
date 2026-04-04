'use client';

import { Suspense, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useStorefrontAddToCart } from '@/hooks/useStorefrontAddToCart';
import { Button } from '@/components/ui/button';
import StorefrontProductCard from '@/components/product/StorefrontProductCard';
import { Search as SearchIcon, TrendingUp } from 'lucide-react';

function SearchPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useStorefrontAddToCart();

  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  const { data: results, isLoading, isError } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query.trim()) return { products: [], pagination: {} };
      const params = new URLSearchParams({
        search: query.trim(),
        limit: '24',
        page: '1',
      });
      const response = await api.get(`/products?${params.toString()}`);
      return response.data.data;
    },
    enabled: !!query.trim(),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleAddToCart = (product: any) => {
    addToCart(product);
  };

  const popularSearches = ['laptop', 'phone', 'headphones', 'watch', 'camera', 'tablet'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Search Products</h1>
            <p className="text-xl text-white/90">Find exactly what you&apos;re looking for</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search for products..."
                className="w-full px-6 py-4 pr-14 rounded-xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-white/30 shadow-2xl"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                aria-label="Search"
              >
                <SearchIcon className="w-6 h-6" />
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container-custom">
          {!query.trim() ? (
            <div className="text-center py-12">
              <SearchIcon className="w-24 h-24 mx-auto text-gray-300 mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Start Your Search</h2>
              <p className="text-gray-600 mb-8 text-lg">Enter keywords to find the perfect products</p>

              <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-4 text-sm text-gray-500">
                  <TrendingUp className="w-4 h-4" />
                  <span>Popular Searches:</span>
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  {popularSearches.map((term) => (
                    <Link
                      key={term}
                      href={`/search?q=${encodeURIComponent(term)}`}
                      className="px-4 py-2 bg-white border-2 border-gray-200 rounded-full hover:border-primary-500 hover:text-primary-600 transition-all font-medium capitalize"
                    >
                      {term}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Searching for &quot;{query}&quot;...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-red-600 text-lg mb-4">Something went wrong. Please try again.</p>
              <Button onClick={() => router.refresh()} variant="outline">
                Retry
              </Button>
            </div>
          ) : !results?.products || results.products.length === 0 ? (
            <div className="text-center py-12">
              <SearchIcon className="w-24 h-24 mx-auto text-gray-300 mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-3">No Results Found</h2>
              <p className="text-gray-600 mb-8 text-lg">
                We couldn&apos;t find any products matching <strong>&quot;{query}&quot;</strong>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/products" className="btn-primary inline-block">
                  Browse All Products
                </Link>
                <Link href="/categories" className="btn-secondary inline-block">
                  Browse Categories
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Search Results for &quot;{query}&quot;
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Found {results.pagination?.total ?? results.products.length} product
                    {(results.pagination?.total ?? results.products.length) !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {results.products.map((product: any) => (
                  <StorefrontProductCard
                    key={product._id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-600">
          Loading search…
        </div>
      }
    >
      <SearchPageInner />
    </Suspense>
  );
}
