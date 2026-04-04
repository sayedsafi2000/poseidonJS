'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '@/store/cartStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import {
  formatStreetForOrder,
  parseStoredAddress,
} from '@/lib/userAddress';

interface CheckoutForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('token')) {
      toast.error('Please sign in to place an order');
      router.replace(`/login?next=${encodeURIComponent('/checkout')}`);
      return;
    }
    setAuthReady(true);
  }, [router]);

  const { data: meUser, isLoading: meLoading } = useQuery({
    queryKey: ['checkout-profile'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data.data.user as {
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        address?: string | null;
      };
    },
    enabled: authReady,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CheckoutForm>({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
    },
  });

  useEffect(() => {
    if (!meUser) return;
    const parsed = parseStoredAddress(meUser.address ?? undefined);
    const streetLine = formatStreetForOrder(parsed);
    reset({
      fullName: `${meUser.firstName || ''} ${meUser.lastName || ''}`.trim(),
      email: meUser.email || '',
      phone: meUser.phone || '',
      address: streetLine || parsed.street,
      city: parsed.city,
      postalCode: parsed.zipCode,
      country: parsed.country,
    });
  }, [meUser, reset]);

  if (!authReady || items.length === 0) {
    if (authReady && items.length === 0) {
      router.replace('/cart');
    }
    return (
      <div className="container-custom py-16 text-center text-gray-600">
        {meLoading ? 'Loading…' : items.length === 0 ? 'Redirecting…' : null}
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const onSubmit = async (data: CheckoutForm) => {
    try {
      const orderData = {
        items: items.map((item) => ({
          product: item.id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName: data.fullName.trim(),
          address: data.address.trim(),
          city: data.city.trim(),
          postalCode: data.postalCode.trim(),
          country: data.country.trim(),
          phone: data.phone.trim(),
        },
        paymentMethod: 'cash_on_delivery',
      };

      const response = await api.post('/orders', orderData);
      const order = response.data?.data?.order;
      if (!order?._id) {
        toast.error('Order created but response was unexpected');
        router.push('/account/orders');
        clearCart();
        return;
      }
      toast.success('Order placed! Pay with cash when your order arrives.');
      clearCart();
      router.push(`/account/orders/${order._id}`);
    } catch (error: unknown) {
      const msg =
        error &&
        typeof error === 'object' &&
        'response' in error &&
        (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(msg || 'Failed to place order');
    }
  };

  return (
    <div className="container-custom py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
      <p className="text-gray-600 mb-8">
        Payment: <strong>Cash on delivery</strong> only. Have the exact amount ready for the courier.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full name *
                  </label>
                  <input
                    {...register('fullName', { required: 'Full name is required' })}
                    className="input-field"
                    placeholder="John Doe"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    type="email"
                    className="input-field"
                    readOnly
                    title="Email is tied to your account"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    {...register('phone', { required: 'Phone is required' })}
                    className="input-field"
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-bold text-gray-900">Shipping address</h2>
                <Link
                  href="/account/settings"
                  className="text-sm text-primary-600 hover:underline shrink-0"
                >
                  Edit saved address
                </Link>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                We pre-fill from your saved address in account settings. You can change it for this
                order only.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street address *
                  </label>
                  <input
                    {...register('address', { required: 'Address is required' })}
                    className="input-field"
                    placeholder="123 Main St, Apt 4B"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      {...register('city', { required: 'City is required' })}
                      className="input-field"
                      placeholder="New York"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal code *
                    </label>
                    <input
                      {...register('postalCode', { required: 'Postal code is required' })}
                      className="input-field"
                      placeholder="10001"
                    />
                    {errors.postalCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    {...register('country', { required: 'Country is required' })}
                    className="input-field"
                    placeholder="United States"
                  />
                  {errors.country && (
                    <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="card p-6 bg-slate-50 border border-slate-200">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Payment</h2>
              <p className="text-gray-700">
                You will pay in cash when the order is delivered. No card or online payment is
                required.
              </p>
            </div>

            <button type="submit" className="w-full btn-primary">
              Place order (COD)
            </button>
          </form>
        </div>

        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order summary</h2>

            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src={item.image || '/placeholder.jpg'}
                      alt={item.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary-600">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
