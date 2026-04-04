'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { AUTH_CHANGED_EVENT } from '@/lib/authSession';
import { useWishlistGuestStore } from '@/store/wishlistGuestStore';

export function useWishlist() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [hasToken, setHasToken] = useState(false);

  const syncToken = useCallback(() => {
    setHasToken(typeof window !== 'undefined' && !!localStorage.getItem('token'));
  }, []);

  useEffect(() => {
    syncToken();
  }, [pathname, syncToken]);

  useEffect(() => {
    const onAuth = () => {
      syncToken();
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    };
    window.addEventListener(AUTH_CHANGED_EVENT, onAuth);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, onAuth);
  }, [syncToken, queryClient]);

  const guestIds = useWishlistGuestStore((s) => s.ids);
  const guestAdd = useWishlistGuestStore((s) => s.add);
  const guestRemove = useWishlistGuestStore((s) => s.remove);

  const { data: serverItems } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await api.get('/wishlist');
      return res.data.data.items as { _id: string; product: { _id: string } }[];
    },
    enabled: hasToken,
  });

  const serverIds = useMemo(() => {
    const set = new Set<string>();
    for (const row of serverItems || []) {
      if (row?.product?._id) set.add(String(row.product._id));
    }
    return set;
  }, [serverItems]);

  const addMutation = useMutation({
    mutationFn: async (productId: string) => {
      await api.post(`/wishlist/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (productId: string) => {
      await api.delete(`/wishlist/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const isWishlisted = useCallback(
    (productId: string) => {
      const id = String(productId);
      if (hasToken) return serverIds.has(id);
      return guestIds.includes(id);
    },
    [hasToken, serverIds, guestIds]
  );

  const toggleWishlist = useCallback(
    async (productId: string) => {
      const id = String(productId);
      if (hasToken) {
        try {
          if (serverIds.has(id)) {
            await removeMutation.mutateAsync(id);
            toast.success('Removed from wishlist');
          } else {
            await addMutation.mutateAsync(id);
            toast.success('Added to wishlist');
          }
        } catch (e: unknown) {
          const err = e as { response?: { data?: { message?: string } } };
          toast.error(err?.response?.data?.message || 'Could not update wishlist');
        }
        return;
      }
      if (guestIds.includes(id)) {
        guestRemove(id);
        toast.success('Removed from wishlist');
      } else {
        guestAdd(id);
        toast.success('Added to wishlist');
      }
      queryClient.invalidateQueries({ queryKey: ['wishlist-guest'] });
    },
    [
      hasToken,
      serverIds,
      guestIds,
      guestAdd,
      guestRemove,
      addMutation,
      removeMutation,
      queryClient,
    ]
  );

  const count = hasToken ? (serverItems?.length ?? 0) : guestIds.length;
  const pending = addMutation.isPending || removeMutation.isPending;

  return { isWishlisted, toggleWishlist, count, hasToken, pending };
}
