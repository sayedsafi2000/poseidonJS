'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
// Using div with card styling instead
import { Trophy, TrendingUp, Package, DollarSign, Star } from 'lucide-react';

export default function VendorRankingPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['vendor-ranking'],
    queryFn: async () => {
      const response = await api.get('/vendors/ranking?period=monthly&limit=20');
      return response.data.data;
    },
  });

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
    if (rank === 2) return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400';
    if (rank === 3) return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400';
    return 'bg-blue-50 dark:bg-blue-900/10 text-blue-800 dark:text-blue-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vendor Performance Ranking</h1>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading rankings...</div>
      ) : data?.rankings ? (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Rank</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Vendor</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Overall Score</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Orders</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Revenue</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Rating</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Delivery</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Quality</th>
                </tr>
              </thead>
              <tbody>
                {data.rankings.map((vendor: any) => (
                  <tr
                    key={vendor.vendor.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${getRankColor(
                          vendor.rank
                        )}`}
                      >
                        {vendor.rank === 1 ? <Trophy className="w-4 h-4" /> : vendor.rank}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{vendor.vendor.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{vendor.vendor.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-bold text-lg text-gray-900 dark:text-white">
                        {vendor.ranking.overall}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-gray-700 dark:text-gray-300">
                      {vendor.metrics.totalOrders}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-700 dark:text-gray-300">
                      ${vendor.metrics.totalRevenue.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {vendor.metrics.averageRating.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right text-gray-700 dark:text-gray-300">
                      {vendor.ranking.delivery}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-700 dark:text-gray-300">
                      {vendor.ranking.quality}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-gray-500 dark:text-gray-400">No vendor rankings available</p>
        </div>
      )}
    </div>
  );
}

