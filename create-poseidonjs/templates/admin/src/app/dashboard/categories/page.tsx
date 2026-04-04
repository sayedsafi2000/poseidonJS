'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['categories', search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const response = await api.get(`/categories?${params.toString()}`);
      return response.data.data;
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Categories
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Organize products into categories
          </p>
        </div>
        <Link href="/dashboard/categories/new" className="btn-primary flex items-center gap-2">
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
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300">
                  Title
                </th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300">
                  Collection
                </th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300">
                  Handle
                </th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300">
                  Products
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
              ) : data?.categories?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-sm text-gray-500">
                    No categories found
                  </td>
                </tr>
              ) : (
                data?.categories?.map((category: any) => (
                  <tr
                    key={category._id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="py-2 px-3">
                      <Link
                        href={`/dashboard/categories/${category._id}`}
                        className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        {category.name}
                      </Link>
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-600 dark:text-gray-400">
                      {category.collection ? (
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs font-medium">
                          {category.collection.name}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-600 dark:text-gray-400">
                      /{category.slug || category.name?.toLowerCase().replace(/\s+/g, '-')}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-600 dark:text-gray-400">
                      {category.productCount || 0}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/categories/${category._id}`}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </Link>
                        <button
                          onClick={() => handleDelete(category._id)}
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

