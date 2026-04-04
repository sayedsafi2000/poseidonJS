'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const response = await api.get('/orders/my-orders');
      return response.data.data.orders;
    },
  });

  const statusColors: any = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="container-custom py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">My Orders</h1>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading orders...</p>
        </div>
      ) : !data || data.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-600 mb-4">No orders found</p>
          <Link href="/products" className="btn-primary inline-block">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((order: any) => (
            <div key={order._id} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Order #{order.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Placed on {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    ${order.total.toFixed(2)}
                  </p>
                  <span
                    className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${
                      statusColors[order.orderStatus]
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Items</p>
                    <p className="font-medium">{order.items.length} products</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment</p>
                    <p className="font-medium">{order.paymentStatus}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Delivery</p>
                    <p className="font-medium">{order.shippingAddress?.city ?? '—'}</p>
                  </div>
                  <div className="text-right">
                    <Link
                      href={`/account/orders/${order._id}`}
                      className="inline-flex items-center gap-2 text-primary-600 font-medium hover:underline"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

