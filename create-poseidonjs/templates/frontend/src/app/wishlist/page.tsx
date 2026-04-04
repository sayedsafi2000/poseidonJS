'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useStorefrontAddToCart } from '@/hooks/useStorefrontAddToCart';
import { useWishlistGuestStore } from '@/store/wishlistGuestStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StorefrontProductCard from '@/components/product/StorefrontProductCard';
import { Heart, Trash2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const pathname = usePathname();
  const { addToCart } = useStorefrontAddToCart();
  const queryClient = useQueryClient();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(typeof window !== 'undefined' && !!localStorage.getItem('token'));
  }, [pathname]);

  const guestIds = useWishlistGuestStore((s) => s.ids);

  const { data: serverWishlist, isLoading: loadingServer } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const response = await api.get('/wishlist');
      return response.data.data.items;
    },
    enabled: hasToken,
  });

  const { data: guestWishlist, isLoading: loadingGuest } = useQuery({
    queryKey: ['wishlist-guest', guestIds.join(',')],
    queryFn: async () => {
      const results = await Promise.all(
        guestIds.map((id) =>
          api.get(`/products/${id}`).then((r) => r.data.data).catch(() => null)
        )
      );
      return results
        .filter(Boolean)
        .map((p: { _id: string }) => ({ _id: p._id, product: p }));
    },
    enabled: !hasToken && guestIds.length > 0,
  });

  const wishlist = hasToken
    ? serverWishlist ?? []
    : guestIds.length > 0
      ? guestWishlist ?? []
      : [];

  const isLoading = hasToken
    ? loadingServer
    : guestIds.length > 0
      ? loadingGuest
      : false;

  const removeFromWishlistApi = useMutation({
    mutationFn: async (productId: string) => {
      await api.delete(`/wishlist/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Removed from wishlist');
      setRemovingId(null);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to remove item');
      setRemovingId(null);
    },
  });

  const handleMoveToCart = (product: any) => {
    const added = addToCart(product, { quantity: 1 });
    if (added) {
      handleRemove(product._id);
    }
  };

  const handleRemove = (productId: string) => {
    setRemovingId(productId);
    if (hasToken) {
      removeFromWishlistApi.mutate(productId);
    } else {
      useWishlistGuestStore.getState().remove(productId);
      queryClient.invalidateQueries({ queryKey: ['wishlist-guest'] });
      toast.success('Removed from wishlist');
      setRemovingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="bg-gradient-to-r from-pink-600 to-rose-600 text-white py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 fill-white" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              My Wishlist
            </h1>
            <p className="text-xl text-white/90">
              Save your favorite items for later
            </p>
            {wishlist && wishlist.length > 0 && (
              <Badge className="mt-4 bg-white/20 backdrop-blur-sm border-white/30 text-white text-lg px-4 py-2">
                {wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'}
              </Badge>
            )}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container-custom max-w-7xl">
          {!wishlist || wishlist.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-24 h-24 mx-auto text-gray-300 mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Your Wishlist is Empty
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                Start adding products you love to your wishlist
              </p>
              <Button size="lg" asChild className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700">
                <Link href="/products">
                  Browse Products
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlist.map((item: { _id: string; product: any }) => {
                const product = item.product;
                if (!product) return null;

                return (
                  <div
                    key={item._id}
                    className={removingId === product._id ? 'opacity-50 pointer-events-none' : ''}
                  >
                    <StorefrontProductCard
                      product={product}
                      onAddToCart={handleMoveToCart}
                      disableCart={product.stock === 0 || removingId === product._id}
                      topLeftSlot={
                        <Button
                          size="icon"
                          variant="secondary"
                          type="button"
                          onClick={() => handleRemove(product._id)}
                          disabled={removingId === product._id}
                          className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-500 hover:text-white z-[2]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      }
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {wishlist && wishlist.length > 0 && (
        <section className="py-12 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="container-custom max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Shop More?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Discover more amazing products
            </p>
            <Button size="lg" asChild className="bg-white text-gray-900 hover:bg-white/90">
              <Link href="/products">
                Continue Shopping
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
