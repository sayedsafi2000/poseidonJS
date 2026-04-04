'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BrandsPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['brands', search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const response = await api.get(`/brands?${params.toString()}`);
      return response.data.data;
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;

    try {
      await api.delete(`/brands/${id}`);
      toast.success('Brand deleted successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete brand');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Brands
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage product brands
          </p>
        </div>
        <Link href="/dashboard/brands/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-3">
        {/* Filter */}
        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <Filter className="w-4 h-4" />
          <span className="text-sm">Add filter</span>
        </button>

        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
        </div>
      </div>

      {/* Brands Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300">
                  Name
                </th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300">
                  Handle
                </th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300">
                  Products
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
                  <td colSpan={5} className="text-center py-6 text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : data?.brands?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-sm text-gray-500">
                    No brands found
                  </td>
                </tr>
              ) : (
                data?.brands?.map((brand: any) => (
                  <tr
                    key={brand._id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="py-2 px-3">
                      <Link
                        href={`/dashboard/brands/${brand._id}`}
                        className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        {brand.name}
                      </Link>
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-600 dark:text-gray-400">
                      /{brand.slug || brand.name?.toLowerCase().replace(/\s+/g, '-')}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-600 dark:text-gray-400">
                      {brand.productCount || 0}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          brand.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                        }`}
                      >
                        {brand.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/brands/${brand._id}`}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </Link>
                        <button
                          onClick={() => handleDelete(brand._id)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

