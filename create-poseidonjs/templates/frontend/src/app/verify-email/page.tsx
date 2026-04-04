'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { verifyEmailOnce } from '@/lib/verifyEmailRequest';
import { getStoredUser, mergeStoredUser } from '@/lib/authSession';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');
  const [status, setStatus] = useState<'loading' | 'ok' | 'err'>('loading');
  const [message, setMessage] = useState('');
  const successRef = useRef(false);

  useEffect(() => {
    successRef.current = false;

    if (!token) {
      setStatus('err');
      setMessage('This link is invalid or incomplete. Open your account and use “Send verification link”.');
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await verifyEmailOnce(token, emailParam);
        if (cancelled) return;
        successRef.current = true;
        const verifiedEmail = res.data?.data?.user?.email as string | undefined;
        const stored = getStoredUser();
        if (
          stored &&
          verifiedEmail &&
          stored.email.toLowerCase() === String(verifiedEmail).toLowerCase()
        ) {
          mergeStoredUser({ isVerified: true });
        }
        try {
          await queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        } catch {
          /* ignore */
        }
        setStatus('ok');
        setMessage(res.data?.message || 'Your email is verified.');
      } catch (e: unknown) {
        if (cancelled || successRef.current) return;
        const msg =
          e && typeof e === 'object' && 'response' in e
            ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
            : undefined;
        setStatus('err');
        setMessage(msg || 'Verification failed.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, emailParam, queryClient]);

  return (
    <div className="container-custom py-16 px-4 max-w-lg mx-auto text-center">
      {status === 'loading' && <p className="text-gray-600">Verifying your email…</p>}

      {status === 'ok' && (
        <div className="space-y-4">
          <CheckCircle className="w-16 h-16 mx-auto text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">Email verified</h1>
          <p className="text-gray-600">{message}</p>
          <Button asChild>
            <Link href="/account">Go to your account</Link>
          </Button>
        </div>
      )}

      {status === 'err' && (
        <div className="space-y-4">
          <XCircle className="w-16 h-16 mx-auto text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900">Could not verify</h1>
          <p className="text-gray-600">{message}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline">
              <Link href="/account">Back to account</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="container-custom py-16 text-center text-gray-600">Loading…</div>
      }
    >
      <VerifyEmailInner />
    </Suspense>
  );
}
