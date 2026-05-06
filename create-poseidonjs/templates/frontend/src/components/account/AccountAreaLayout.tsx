'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Mail, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function AccountAreaLayout({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = !!localStorage.getItem('token');
    setHasToken(token);
    if (!token) {
      const next = encodeURIComponent(pathname || '/account');
      router.replace(`/login?next=${next}`);
    }
  }, [pathname, router]);

  if (hasToken === null || hasToken === false) {
    return (
      <div className="container-custom py-12 text-center text-gray-600">
        Redirecting to login…
      </div>
    );
  }

  const { data: meUser } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data.data.user as { isVerified?: boolean; email?: string };
    },
    enabled: hasToken,
    staleTime: 30_000,
  });

  const resendMutation = useMutation({
    mutationFn: () => api.post('/auth/resend-verification'),
    onSuccess: () => {
      toast.success('Verification link sent. Check your inbox.');
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || 'Could not send email');
    },
  });

  const showBanner = Boolean(hasToken && meUser && meUser.isVerified === false);

  return (
    <>
      {showBanner && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="container-custom py-3 px-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2 text-sm text-amber-950">
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-700" aria-hidden />
                <p>
                  <span className="font-semibold">Verify your email</span>
                  <span className="text-amber-900">
                    {' '}
                    — confirm your address so we can reach you about orders and security.
                  </span>
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="shrink-0 border-amber-400 bg-white text-amber-950 hover:bg-amber-100"
                disabled={resendMutation.isPending}
                onClick={() => resendMutation.mutate()}
              >
                <Mail className="w-4 h-4 mr-2" />
                {resendMutation.isPending ? 'Sending…' : 'Send verification link'}
              </Button>
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
