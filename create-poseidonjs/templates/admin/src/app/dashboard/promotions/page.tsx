'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function PromotionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['promotions', page, search, status],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      const response = await api.get(`/promotions?${params.toString()}`);
      return response.data.data;
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;

    try {
      await api.delete(`/promotions/${id}`);
      toast.success('Promotion deleted successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete promotion');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Promotions
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage promotional codes and discounts
          </p>
        </div>
        <Link href="/dashboard/promotions/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Promotion
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-3">
        {/* Filter */}
        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <Filter className="w-4 h-4" />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="bg-transparent border-none outline-none cursor-pointer text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </button>

        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search promotions..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
        </div>
      </div>

      {/* Promotions Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300">
                  Code
                </th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300">
                  Type
                </th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300">
                  Value
                </th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300">
                  Usage
                </th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300">
                  Valid Until
                </th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300">
                  Status
                </th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : data?.promotions?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-sm text-gray-500">
                    No promotions found
                  </td>
                </tr>
              ) : (
                data?.promotions?.map((promo: any) => (
                  <tr
                    key={promo._id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="py-2 px-3 text-sm font-medium text-gray-900 dark:text-white">
                      {promo.code}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-600 dark:text-gray-400">
                      {promo.type}
                    </td>
                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                      {promo.type === 'percentage' ? `${promo.value}%` : `$${promo.value}`}
                    </td>
                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                      {promo.usageCount}/{promo.usageLimit || '∞'}
                    </td>
                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                      {format(new Date(promo.endDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          promo.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                        }`}
                      >
                        {promo.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/promotions/${promo._id}`}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Link>
                        <button
                          onClick={() => handleDelete(promo._id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.pagination && data.pagination.pages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {data.pagination.page} of {data.pagination.pages} pages
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.pagination.pages}
                className="btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

