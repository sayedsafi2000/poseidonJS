'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowLeft, MapPin, Package, Phone, User } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const ORDER_STATUSES = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'hold',
] as const;

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const queryClient = useQueryClient();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await api.get(`/orders/${orderId}`);
      return response.data.data.order as Record<string, unknown>;
    },
    enabled: !!orderId,
  });

  const statusMutation = useMutation({
    mutationFn: async (orderStatus: string) => {
      await api.put(`/orders/${orderId}/status`, { orderStatus });
    },
    onSuccess: () => {
      toast.success('Order status updated');
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || 'Failed to update status');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400">Loading order…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400">Order not found.</p>
        <Link href="/dashboard/orders" className="btn-secondary inline-block">
          Back to orders
        </Link>
      </div>
    );
  }

  const shipping = order.shippingAddress as Record<string, string> | undefined;
  const customer = order.customer as Record<string, string> | undefined;
  const items = (order.items as Array<Record<string, unknown>>) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link
          href="/dashboard/orders"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors inline-flex"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Order {(order.orderNumber as string) || orderId}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {order.createdAt
              ? format(new Date(order.createdAt as string), 'MMM d, yyyy h:mm a')
              : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">Status</label>
          <select
            value={String(order.orderStatus)}
            onChange={(e) => statusMutation.mutate(e.target.value)}
            disabled={statusMutation.isPending}
            className="input-field text-sm py-2 min-w-[160px]"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-4 space-y-3">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4" />
            Customer
          </h2>
          {customer ? (
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <p>
                {customer.firstName} {customer.lastName}
              </p>
              <p>{customer.email}</p>
              {customer.phone ? <p>{customer.phone}</p> : null}
            </div>
          ) : (
            <p className="text-sm text-gray-500">—</p>
          )}
        </div>

        <div className="card p-4 space-y-3">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="w-4 h-4" />
            Payment
          </h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <p>
              <span className="text-gray-500">Method:</span>{' '}
              {String(order.paymentMethod || '—').replace(/_/g, ' ')}
            </p>
            <p>
              <span className="text-gray-500">Payment:</span> {String(order.paymentStatus)}
            </p>
            <p>
              <span className="text-gray-500">Invoice:</span> {String(order.invoiceStatus)}
            </p>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4" />
          Shipping address
        </h2>
        {shipping ? (
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <p className="font-medium text-gray-900 dark:text-white">{shipping.fullName}</p>
            <p>{shipping.address}</p>
            <p>
              {shipping.city}, {shipping.postalCode}
            </p>
            <p>{shipping.country}</p>
            <p className="flex items-center gap-2 pt-1">
              <Phone className="w-4 h-4 shrink-0" />
              {shipping.phone}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No shipping address</p>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Line items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left py-2 px-3">Product</th>
                <th className="text-right py-2 px-3">Price</th>
                <th className="text-right py-2 px-3">Qty</th>
                <th className="text-right py-2 px-3">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((line, idx) => {
                const product = line.product as Record<string, unknown> | undefined;
                const name = (line.name as string) || (product?.name as string) || 'Product';
                const img =
                  (line.image as string) ||
                  (Array.isArray(product?.images) && (product.images[0] as string)) ||
                  '';
                const qty = Number(line.quantity) || 0;
                const price = Number(line.price) || 0;
                return (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 dark:border-gray-700"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded overflow-hidden bg-gray-100 shrink-0">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={img}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              —
                            </div>
                          )}
                        </div>
                        <span className="text-gray-900 dark:text-white font-medium">{name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">${price.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right">{qty}</td>
                    <td className="py-3 px-3 text-right font-medium">
                      ${(price * qty).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 space-y-2 text-sm border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Subtotal</span>
            <span>${Number(order.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Shipping</span>
            <span>${Number(order.shippingCost ?? 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Tax</span>
            <span>${Number(order.tax ?? 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-600">
            <span>Total</span>
            <span>${Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
