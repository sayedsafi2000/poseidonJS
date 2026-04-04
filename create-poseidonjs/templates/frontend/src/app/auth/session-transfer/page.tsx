'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { saveAuthSession } from '@/lib/authSession';
import { mergeGuestWishlistIntoApi } from '@/lib/mergeGuestWishlist';

/**
 * Completes sign-in on the storefront when redirected from the admin app with ?token=...
 * (localStorage is per-origin, so the shopper cannot stay logged in on admin + shop without this.)
 */
function SessionTransferInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hint, setHint] = useState('Signing you in…');

  useEffect(() => {
    const token = searchParams.get('token');
    const nextRaw = searchParams.get('next') || '/account';
    const nextPath = nextRaw.startsWith('/') ? nextRaw : '/account';

    if (!token?.trim()) {
      router.replace('/login');
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        localStorage.setItem('token', token.trim());
        const res = await api.get('/auth/me');
        if (cancelled) return;
        const u = res.data.data.user as {
          id?: string;
          _id?: string;
          firstName: string;
          lastName: string;
          email: string;
          role?: string;
          avatar?: string | null;
          isVerified?: boolean;
        };
        saveAuthSession(token.trim(), {
          id: u.id ?? u._id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          role: u.role,
          avatar: u.avatar,
          isVerified: u.isVerified,
        });
        await mergeGuestWishlistIntoApi();
        router.replace(nextPath);
        router.refresh();
      } catch {
        if (cancelled) return;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setHint('Could not complete sign-in. Redirecting…');
        router.replace('/login');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div className="container-custom py-16 text-center text-gray-600">
      <p>{hint}</p>
    </div>
  );
}

export default function SessionTransferPage() {
  return (
    <Suspense
      fallback={
        <div className="container-custom py-16 text-center text-gray-600">Loading…</div>
      }
    >
      <SessionTransferInner />
    </Suspense>
  );
}
