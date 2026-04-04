'use client';

import { Suspense, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import StorefrontProductCard from '@/components/product/StorefrontProductCard';
import { useStorefrontAddToCart } from '@/hooks/useStorefrontAddToCart';

function ProductsPageInner() {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('-createdAt');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [collectionFilter, setCollectionFilter] = useState('');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [offerOnly, setOfferOnly] = useState(false);
  const { addToCart } = useStorefrontAddToCart();

  useEffect(() => {
    setCategoryFilter(searchParams.get('category') || '');
    setBrandFilter(searchParams.get('brand') || '');
    setCollectionFilter(searchParams.get('collection') || '');
    setFeaturedOnly(searchParams.get('featured') === 'true');
    setOfferOnly(searchParams.get('offer') === 'true');
    setPage(1);
  }, [searchParams]);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories?isActive=true');
      return response.data.data.categories;
    },
  });

  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const response = await api.get('/brands?isActive=true');
      return response.data.data.brands;
    },
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      'products',
      page,
      sort,
      categoryFilter,
      brandFilter,
      collectionFilter,
      featuredOnly,
      offerOnly,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: '12',
        sort,
      });
      if (categoryFilter) params.set('category', categoryFilter);
      if (brandFilter) params.set('brand', brandFilter);
      if (collectionFilter) params.set('collection', collectionFilter);
      if (featuredOnly) params.set('featured', 'true');
      if (offerOnly) params.set('offer', 'true');
      const response = await api.get(`/products?${params.toString()}`);
      return response.data.data;
    },
  });

  const handleAddToCart = (product: any) => {
    addToCart(product);
  };

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {offerOnly
            ? 'Special Offers'
            : featuredOnly
              ? 'Featured Products'
              : 'All Products'}
        </h1>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <p className="text-gray-600">
            {data?.pagination?.total ?? 0} products found
          </p>

          <div className="flex gap-4 w-full md:w-auto flex-wrap">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="input-field flex-1 md:w-48"
            >
              <option value="">All Categories</option>
              {categories?.map((category: any) => (
                <option key={category._id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={brandFilter}
              onChange={(e) => {
                setBrandFilter(e.target.value);
                setPage(1);
              }}
              className="input-field flex-1 md:w-48"
            >
              <option value="">All Brands</option>
              {brands?.map((brand: any) => (
                <option key={brand._id} value={brand.slug}>
                  {brand.name}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="input-field flex-1 md:w-48"
            >
              <option value="-createdAt">Newest</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="name">Name: A-Z</option>
              <option value="-name">Name: Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading products...</p>
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <p className="text-red-600">
            Could not load products. Please try again.
          </p>
        </div>
      ) : data?.products?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No products found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {data?.products?.map((product: any) => (
              <StorefrontProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          {data?.pagination && data.pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {page} of {data.pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.pagination.pages}
                className="btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="container-custom py-12 text-center text-gray-600">
          Loading products…
        </div>
      }
    >
      <ProductsPageInner />
    </Suspense>
  );
}
