'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { setPendingCartItem } from '@/lib/cartPending';
import { getProductCartUnitPrice } from '@/lib/productDisplay';
import toast from 'react-hot-toast';

type ProductLike = {
  _id: string;
  name: string;
  images?: string[];
  stock?: number;
};

/**
 * Adds to cart when logged in; otherwise stores intent and sends user to login (then /cart).
 * @returns true if added to cart, false if redirected to auth
 */
export function useStorefrontAddToCart() {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const addToCart = useCallback(
    (product: ProductLike, options?: { quantity?: number }) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const qty = Math.max(1, options?.quantity ?? 1);
      const stock = product.stock ?? 0;

      if (!token) {
        setPendingCartItem({
          id: String(product._id),
          name: product.name,
          price: getProductCartUnitPrice(product as Record<string, unknown>),
          image: product.images?.[0] || '/placeholder.jpg',
          stock,
          quantity: qty,
        });
        toast('Log in to add items to your cart', { icon: '🔐' });
        router.push(`/login?next=${encodeURIComponent('/cart')}`);
        return false;
      }

      if (stock <= 0) {
        toast.error('This product is out of stock');
        return false;
      }

      for (let i = 0; i < qty; i++) {
        addItem({
          id: String(product._id),
          name: product.name,
          price: getProductCartUnitPrice(product as Record<string, unknown>),
          image: product.images?.[0] || '/placeholder.jpg',
          quantity: 1,
          stock,
        });
      }
      toast.success(qty > 1 ? `Added ${qty} items to cart` : 'Added to cart');
      return true;
    },
    [addItem, router]
  );

  return { addToCart };
}
