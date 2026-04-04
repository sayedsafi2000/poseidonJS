'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, ShoppingBag, Heart, Settings, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { clearAuthSession } from '@/lib/authSession';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
  }, [router]);

  const handleLogout = () => {
    clearAuthSession();
    router.push('/');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container-custom py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="card p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>

            <nav className="space-y-2">
              <Link
                href="/account"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-50 text-primary-600 font-medium"
              >
                <User className="w-5 h-5" />
                Profile
              </Link>
              <Link
                href="/account/orders"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <ShoppingBag className="w-5 h-5" />
                Orders
              </Link>
              <Link
                href="/account/wishlist"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Heart className="w-5 h-5" />
                Wishlist
              </Link>
              <Link
                href="/account/settings"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Settings className="w-5 h-5" />
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                title="Log out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          <div className="card p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={user.firstName}
                    disabled
                    className="input-field bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={user.lastName}
                    disabled
                    className="input-field bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="input-field bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="text"
                  value={user.phone || 'Not provided'}
                  disabled
                  className="input-field bg-gray-50"
                />
              </div>

              <div className="pt-4">
                <Link
                  href="/account/settings"
                  className="btn-primary inline-block"
                >
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="card p-6 text-center">
              <ShoppingBag className="w-10 h-10 text-primary-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-gray-600">Total Orders</p>
            </div>
            <div className="card p-6 text-center">
              <Heart className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-gray-600">Wishlist Items</p>
            </div>
            <div className="card p-6 text-center">
              <User className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-green-600">Active</p>
              <p className="text-gray-600">Account Status</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

