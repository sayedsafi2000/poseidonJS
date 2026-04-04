'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Search, Truck, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

type TrackedOrder = {
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod?: string;
  createdAt: string;
  deliveredAt?: string;
  trackingNumber?: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingAddress?: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
};

const statusClass: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
  processing: 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200',
  shipped: 'bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200',
  delivered: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200',
  cancelled: 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200',
  hold: 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-200',
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<TrackedOrder | null>(null);

  const trackMutation = useMutation({
    mutationFn: async () => {
      const params = new URLSearchParams({
        orderNumber: orderNumber.trim(),
        email: email.trim(),
      });
      const res = await api.get(`/orders/track?${params.toString()}`);
      return res.data.data.order as TrackedOrder;
    },
    onSuccess: (order) => {
      setResult(order);
      toast.success('Order found');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setResult(null);
      toast.error(err.response?.data?.message || 'Could not find that order');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !email.trim()) {
      toast.error('Enter your order number and the email used at checkout');
      return;
    }
    trackMutation.mutate();
  };

  return (
    <div className="container-custom py-10 md:py-14 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-950 text-primary-600 mb-4">
          <Truck className="w-7 h-7" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Track your order</h1>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
          Enter the order number from your confirmation email and the email address you used when
          placing the order.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="w-5 h-5" />
            Look up order
          </CardTitle>
          <CardDescription>
            Order numbers look like <span className="font-mono text-foreground/80">ORD-1234567890123</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="orderNumber" className="text-sm font-medium">
                Order number
              </label>
              <Input
                id="orderNumber"
                name="orderNumber"
                autoComplete="off"
                placeholder="e.g. ORD-1234567890123"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto" disabled={trackMutation.isPending}>
              {trackMutation.isPending ? 'Searching…' : 'Track order'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order {result.orderNumber}
                </CardTitle>
                <CardDescription>
                  Placed{' '}
                  {result.createdAt
                    ? format(new Date(result.createdAt), 'MMM d, yyyy · h:mm a')
                    : ''}
                </CardDescription>
              </div>
              <span
                className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                  statusClass[result.orderStatus] || statusClass.pending
                }`}
              >
                {result.orderStatus}
              </span>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground">Payment</p>
                  <p className="font-medium capitalize">
                    {String(result.paymentMethod || '—').replace(/_/g, ' ')} · {result.paymentStatus}
                  </p>
                </div>
                {result.trackingNumber ? (
                  <div>
                    <p className="text-muted-foreground">Tracking</p>
                    <p className="font-mono font-medium">{result.trackingNumber}</p>
                  </div>
                ) : null}
                {result.deliveredAt ? (
                  <div>
                    <p className="text-muted-foreground">Delivered</p>
                    <p className="font-medium">
                      {format(new Date(result.deliveredAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                ) : null}
              </div>

              {result.shippingAddress && (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-muted-foreground flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4" />
                    Shipping address
                  </p>
                  <p className="font-medium">{result.shippingAddress.fullName}</p>
                  <p>{result.shippingAddress.address}</p>
                  <p>
                    {result.shippingAddress.city}, {result.shippingAddress.postalCode}
                  </p>
                  <p>{result.shippingAddress.country}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="divide-y">
                {result.items.map((line, idx) => (
                  <li key={idx} className="flex gap-4 py-4 first:pt-0">
                    <div className="relative w-16 h-16 shrink-0 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                      {line.image ? (
                        <Image src={line.image} alt="" fill className="object-cover" sizes="64px" />
                      ) : (
                        <Package className="w-6 h-6 text-muted-foreground" aria-hidden />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{line.name}</p>
                      <p className="text-muted-foreground text-sm">
                        ${Number(line.price).toFixed(2)} × {line.quantity}
                      </p>
                    </div>
                    <p className="font-medium shrink-0">
                      ${(Number(line.price) * line.quantity).toFixed(2)}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${Number(result.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>${Number(result.shippingCost ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax</span>
                  <span>${Number(result.tax ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>Total</span>
                  <span>${Number(result.total).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            Logged in? You can also view orders in{' '}
            <Link href="/account/orders" className="text-primary-600 hover:underline font-medium">
              My account → Orders
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
