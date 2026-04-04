'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AUTH_CHANGED_EVENT, clearAuthSession, getStoredUser, type StoredUser } from '@/lib/authSession';

export function useAuthSession() {
  const pathname = usePathname();
  const [user, setUser] = useState<StoredUser | null>(null);

  const refresh = useCallback(() => {
    setUser(getStoredUser());
  }, []);

  useEffect(() => {
    refresh();
  }, [pathname, refresh]);

  useEffect(() => {
    const onAuth = () => refresh();
    window.addEventListener(AUTH_CHANGED_EVENT, onAuth);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, onAuth);
  }, [refresh]);

  const logout = useCallback(() => {
    clearAuthSession();
    setUser(null);
  }, []);

  return {
    user,
    isLoggedIn: !!user,
    logout,
    refresh,
  };
}
