'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { format } from 'date-fns';
import { ArrowLeft, MapPin, Package, Phone, User } from 'lucide-react';
import api from '@/lib/api';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('token')) {
      router.replace(`/login?next=${encodeURIComponent(`/account/orders/${id}`)}`);
      return;
    }
    setReady(true);
  }, [router, id]);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const response = await api.get(`/orders/${id}`);
      return response.data.data.order as Record<string, unknown>;
    },
    enabled: ready && !!id,
  });

  if (!ready) {
    return (
      <div className="container-custom py-16 text-center text-gray-600">Loading…</div>
    );
  }

  if (isLoading) {
    return (
      <div className="container-custom py-16 text-center text-gray-600">Loading order…</div>
    );
  }

  if (error || !order) {
    return (
      <div className="container-custom py-16 text-center space-y-4">
        <p className="text-gray-600">We couldn&apos;t load this order.</p>
        <Link href="/account/orders" className="btn-primary inline-block">
          Back to orders
        </Link>
      </div>
    );
  }

  const shipping = order.shippingAddress as Record<string, string> | undefined;
  const items = (order.items as Array<Record<string, unknown>>) || [];

  return (
    <div className="container-custom py-8 max-w-4xl">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-primary-600 hover:underline mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        All orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Order #{(order.orderNumber as string) || id}
          </h1>
          <p className="text-gray-600 mt-1">
            Placed {order.createdAt ? format(new Date(order.createdAt as string), 'MMM d, yyyy h:mm a') : ''}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            ${Number(order.total).toFixed(2)}
          </p>
          <span className="inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-800">
            {String(order.orderStatus)}
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-600" />
            Shipping address
          </h2>
          {shipping ? (
            <div className="text-gray-700 space-y-1 text-sm">
              <p className="font-medium text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4 shrink-0" />
                {shipping.fullName}
              </p>
              <p>{shipping.address}</p>
              <p>
                {shipping.city}, {shipping.postalCode}
              </p>
              <p>{shipping.country}</p>
              <p className="flex items-center gap-2 pt-2">
                <Phone className="w-4 h-4 shrink-0" />
                {shipping.phone}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No address on file for this order.</p>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment</h2>
          <p className="text-gray-700">
            <span className="font-medium">Cash on delivery</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">Status: {String(order.paymentStatus)}</p>
        </div>
      </div>

      <div className="card p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary-600" />
          Items
        </h2>
        <ul className="divide-y divide-gray-100">
          {items.map((line, idx) => {
            const product = line.product as Record<string, unknown> | undefined;
            const name = (line.name as string) || (product?.name as string) || 'Product';
            const img =
              (typeof product?.images === 'object' &&
                Array.isArray(product.images) &&
                (product.images[0] as string)) ||
              '/placeholder.jpg';
            const qty = Number(line.quantity) || 0;
            const price = Number(line.price) || 0;
            return (
              <li key={idx} className="flex gap-4 py-4 first:pt-0">
                <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100">
                  <Image src={img} alt={name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{name}</p>
                  <p className="text-sm text-gray-600">
                    ${price.toFixed(2)} × {qty}
                  </p>
                </div>
                <p className="font-medium text-gray-900">${(price * qty).toFixed(2)}</p>
              </li>
            );
          })}
        </ul>

        <div className="border-t mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>${Number(order.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span>${Number(order.shippingCost).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax</span>
            <span>${Number(order.tax).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-900 pt-2">
            <span>Total</span>
            <span>${Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
