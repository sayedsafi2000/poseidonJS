'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function AccountWishlistPage() {
  useEffect(() => {
    redirect('/wishlist');
  }, []);

  return null;
}
