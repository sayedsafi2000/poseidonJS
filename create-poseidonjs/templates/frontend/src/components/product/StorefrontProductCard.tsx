'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getProductCardPricing, productHasDiscount } from '@/lib/productDisplay';
import { useWishlist } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils';

export type StorefrontProductCardProps = {
  product: Record<string, unknown> & {
    _id: string;
    name: string;
    slug: string;
    images?: string[];
    brand?: { name?: string; slug?: string };
    category?: { name?: string };
    stock?: number;
    rating?: number;
    reviewsCount?: number;
  };
  onAddToCart: (product: StorefrontProductCardProps['product']) => void;
  /** Extra control shown top-left on hover (e.g. wishlist remove). */
  topLeftSlot?: ReactNode;
  /** Hide wishlist heart (e.g. rare layouts). */
  hideWishlist?: boolean;
  /** Block cart action (e.g. wishlist row being removed). */
  disableCart?: boolean;
};

export default function StorefrontProductCard({
  product,
  onAddToCart,
  topLeftSlot,
  hideWishlist = false,
  disableCart = false,
}: StorefrontProductCardProps) {
  const { isWishlisted, toggleWishlist, pending: wishlistPending } = useWishlist();
  const pricing = getProductCardPricing(product as Record<string, unknown>);
  const showRibbon = productHasDiscount(product as Record<string, unknown>);
  const outOfStock = (product.stock ?? 0) === 0;
  const saved = isWishlisted(String(product._id));

  return (
    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 bg-white">
      <CardContent className="p-0">
        <div className="relative h-64 overflow-hidden bg-slate-100">
          <Image
            src={product.images?.[0] || '/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={85}
            loading="lazy"
          />
          {showRibbon && pricing.percentOff != null && pricing.percentOff > 0 && (
            <Badge className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white border-0">
              {pricing.percentOff}% OFF
            </Badge>
          )}
          {topLeftSlot}
          {!topLeftSlot && !hideWishlist && (
            <Button
              size="icon"
              variant="secondary"
              type="button"
              disabled={wishlistPending}
              aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
              className={cn(
                'absolute top-4 left-4 z-[2] transition-opacity shadow-lg',
                saved ? 'opacity-100 text-red-500 hover:text-red-600' : 'opacity-100 text-slate-700 hover:text-red-500'
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void toggleWishlist(String(product._id));
              }}
            >
              <Heart className={cn('w-4 h-4', saved && 'fill-current')} />
            </Button>
          )}
          {outOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[1]">
              <Badge variant="destructive" className="text-sm px-3 py-1">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {product.brand?.name && (
                <Badge variant="secondary" className="text-xs">
                  {product.brand.name}
                </Badge>
              )}
              {product.category?.name && (
                <Badge variant="outline" className="text-xs">
                  {product.category.name}
                </Badge>
              )}
            </div>
            <Link href={`/products/${product.slug}`}>
              <h3 className="font-semibold text-lg hover:text-primary-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                {product.name}
              </h3>
            </Link>

            <div className="flex items-center gap-1 text-sm">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < (product.rating ?? 4) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-muted-foreground ml-2">({product.reviewsCount ?? 0})</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary-600">
                {pricing.priceLabelPrefix}$
                {pricing.displayPrice.toFixed(2)}
              </div>
              {pricing.compareAtPrice != null && pricing.compareAtPrice > pricing.displayPrice && (
                <div className="text-sm text-muted-foreground line-through">
                  ${pricing.compareAtPrice.toFixed(2)}
                </div>
              )}
            </div>

            <Button
              size="icon"
              type="button"
              onClick={() => onAddToCart(product)}
              disabled={outOfStock || disableCart}
              className="rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all disabled:opacity-50"
            >
              <ShoppingCart className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
