'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { getProductCardPricing, productHasDiscount } from '@/lib/productDisplay';
import { useWishlist } from '@/hooks/useWishlist';
import { useStorefrontAddToCart } from '@/hooks/useStorefrontAddToCart';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Minus, Plus, Heart } from 'lucide-react';
import { optimizeCloudinaryUrl } from '@/lib/imageOptimization';
export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useStorefrontAddToCart();
  const { isWishlisted, toggleWishlist, pending: wishlistPending } = useWishlist();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const response = await api.get(`/products/${slug}`);
      return response.data.data;
    },
    enabled: !!slug,
  });

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, { quantity });
  };

  if (isLoading) {
    return (
      <div className="container-custom py-12">
        <div className="text-center">
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-custom py-12">
        <div className="text-center">
          <p className="text-gray-600">Product not found</p>
        </div>
      </div>
    );
  }

  const pricing = getProductCardPricing(product);
  const discounted = productHasDiscount(product);

  return (
    <div className="container-custom py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="relative h-96 md:h-[500px] mb-4 rounded-xl overflow-hidden bg-slate-100">
            <Image
              src={optimizeCloudinaryUrl(product.images[selectedImage] || '/placeholder.jpg', { quality: 'high' })}
              alt={product.name}
              fill
              className="object-cover"
              quality={85}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-24 rounded-lg overflow-hidden ${
                    selectedImage === index ? 'ring-2 ring-primary-600' : ''
                  }`}
                >
                  <Image
                    src={optimizeCloudinaryUrl(image, { width: 100, quality: 'auto' })}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                    quality={75}
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-4xl font-bold text-gray-900 flex-1">{product.name}</h1>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 h-11 w-11"
              disabled={wishlistPending}
              aria-label={isWishlisted(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
              onClick={() => void toggleWishlist(String(product._id))}
            >
              <Heart
                className={`w-5 h-5 ${isWishlisted(product._id) ? 'fill-red-500 text-red-500' : 'text-gray-700'}`}
              />
            </Button>
          </div>
          
          <div className="flex items-center gap-3 mb-4 text-sm">
            {product.brand && (
              <>
                <span className="text-gray-600">Brand:</span>
                {product.brand.slug ? (
                  <Link
                    href={`/products?brand=${encodeURIComponent(product.brand.slug)}`}
                    className="font-semibold text-primary-600 hover:underline"
                  >
                    {product.brand.name}
                  </Link>
                ) : (
                  <span className="font-semibold text-primary-600">{product.brand.name}</span>
                )}
                <span className="text-gray-400">•</span>
              </>
            )}
            {product.category && (
              <>
                <span className="text-gray-600">Category:</span>
                <span className="font-semibold text-gray-900">{product.category.name}</span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span
              className={`text-3xl font-bold ${discounted ? 'text-primary-600' : 'text-gray-900'}`}
            >
              {pricing.priceLabelPrefix}${pricing.displayPrice.toFixed(2)}
            </span>
            {discounted && pricing.compareAtPrice != null && (
              <span className="text-xl text-gray-500 line-through">
                ${pricing.compareAtPrice.toFixed(2)}
              </span>
            )}
            {discounted && pricing.percentOff != null && pricing.percentOff > 0 && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                {pricing.percentOff}% OFF
              </span>
            )}
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">SKU: {product.sku}</p>
            <p className="text-sm text-gray-600">
              Stock: <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
              </span>
            </p>
          </div>

          <div className="mb-6">
            <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-600">{product.description}</p>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 mb-6">
            <span className="font-semibold text-gray-900">Quantity:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </button>

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="mt-8 border-t pt-6">
              <h2 className="font-semibold text-gray-900 mb-4">Specifications</h2>
              <dl className="space-y-2">
                {Object.entries(product.specifications).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex">
                    <dt className="font-medium text-gray-700 w-1/3">{key}:</dt>
                    <dd className="text-gray-600 w-2/3">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

