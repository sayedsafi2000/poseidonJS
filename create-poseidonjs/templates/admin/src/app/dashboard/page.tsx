'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Wallet,
  ShoppingBag,
  Box,
  UserCheck,
  TrendingUp,
  AlertCircle,
  Clock,
  PackageX,
} from 'lucide-react';

export default function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/analytics/dashboard');
      return response.data.data;
    },
  });

  const statCards = [
    {
      name: 'Total Revenue',
      value: stats?.totalRevenue ? `$${stats.totalRevenue.toFixed(2)}` : '$0.00',
      icon: Wallet,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      name: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      name: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Box,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      name: 'Total Customers',
      value: stats?.totalCustomers || 0,
      icon: UserCheck,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  const alerts = [
    {
      title: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      title: 'Low Stock Products',
      value: stats?.lowStockProducts || 0,
      icon: PackageX,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      title: 'Monthly Revenue',
      value: stats?.monthlyRevenue ? `$${stats.monthlyRevenue.toFixed(2)}` : '$0.00',
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Dashboard Overview
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Welcome back! Here's what's happening with your store today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="card p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {alerts.map((alert) => (
          <div key={alert.title} className="card p-4">
            <div className="flex items-center gap-3">
              <div className={`${alert.bgColor} p-2.5 rounded-lg`}>
                <alert.icon className={`w-5 h-5 ${alert.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {alert.title}
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white mt-0.5">
                  {alert.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card p-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Recent Orders
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300">
                  Order ID
                </th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300">
                  Customer
                </th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300">
                  Total
                </th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order: any) => (
                  <tr
                    key={order._id}
                    className="border-b border-gray-200 dark:border-gray-700"
                  >
                    <td className="py-2 px-3 text-sm text-gray-900 dark:text-white">
                      {order.orderNumber}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-900 dark:text-white">
                      {order.customer?.firstName} {order.customer?.lastName}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-900 dark:text-white">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.orderStatus === 'delivered'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : order.orderStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    No recent orders
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

