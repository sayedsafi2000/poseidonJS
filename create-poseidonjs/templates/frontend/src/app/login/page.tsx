'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { saveAuthSession } from '@/lib/authSession';
import { mergeGuestWishlistIntoApi } from '@/lib/mergeGuestWishlist';
import { consumePendingCartItem } from '@/lib/cartPending';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Package } from 'lucide-react';
import toast from 'react-hot-toast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const nextPath = searchParams.get('next') || '/account';
  const qs = searchParams.toString();
  const registerHref = qs ? `/register?${qs}` : '/register';

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/auth/login', { email: email.trim(), password });
      return res.data.data;
    },
    onSuccess: async (data) => {
      saveAuthSession(data.token, {
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
        role: data.user.role,
        avatar: data.user.avatar,
        isVerified: data.user.isVerified,
      });
      await mergeGuestWishlistIntoApi();
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-guest'] });

      const pending = consumePendingCartItem();
      if (pending) {
        const add = useCartStore.getState().addItem;
        for (let i = 0; i < pending.quantity; i++) {
          add({
            id: pending.id,
            name: pending.name,
            price: pending.price,
            image: pending.image,
            quantity: 1,
            stock: pending.stock,
          });
        }
        toast.success('Signed in — item added to your cart');
      } else {
        toast.success('Welcome back!');
      }

      router.push(nextPath);
      router.refresh();
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Enter email and password');
      return;
    }
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="bg-gradient-to-r from-primary-600 to-purple-600 text-white py-14">
        <div className="container-custom text-center">
          <LogIn className="w-14 h-14 mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Sign in</h1>
          <p className="text-white/90 max-w-lg mx-auto">
            Access your account, orders, and saved wishlist
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container-custom max-w-md mx-auto px-4">
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <Package className="w-10 h-10 text-primary-600" />
              </div>
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>Sign in with the email you used at registration</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
                </Button>
              </form>

              <p className="text-center text-sm text-gray-600 mt-6">
                Don&apos;t have an account?{' '}
                <Link href={registerHref} className="font-semibold text-primary-600 hover:underline">
                  Create one
                </Link>
              </p>
              <p className="text-center text-sm text-gray-500 mt-2">
                <Link href="/" className="hover:text-primary-600">
                  ← Back to store
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center text-gray-600">Loading…</div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
