'use client';

import { useCallback } from 'react';
import { useCartStore } from '@/store/cartStore';
import { getProductCartUnitPrice } from '@/lib/productDisplay';
import toast from 'react-hot-toast';

type ProductLike = {
  _id: string;
  name: string;
  images?: string[];
  stock?: number;
};

/**
 * Adds to the persisted cart store. Works for guests and logged-in users alike;
 * the auth gate happens at checkout, not here.
 * @returns true if added, false if blocked (out of stock).
 */
export function useStorefrontAddToCart() {
  const addItem = useCartStore((s) => s.addItem);

  const addToCart = useCallback(
    (product: ProductLike, options?: { quantity?: number }) => {
      const qty = Math.max(1, options?.quantity ?? 1);
      const stock = product.stock ?? 0;

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
    [addItem]
  );

  return { addToCart };
}
