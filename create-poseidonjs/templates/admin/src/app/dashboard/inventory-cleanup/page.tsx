'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
// Using div with card styling instead
import { AlertTriangle, Package, TrendingDown, Tag, Lightbulb } from 'lucide-react';
import Link from 'next/link';

export default function InventoryCleanupPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['inventory-cleanup'],
    queryFn: async () => {
      const response = await api.get('/products/cleanup-suggestions');
      return response.data.data;
    },
  });

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'dead_stock':
        return 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800';
      case 'slow_moving':
        return 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800';
      case 'discount_candidate':
        return 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800';
      case 'clearance':
        return 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Cleanup Suggestions</h1>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading suggestions...</div>
      ) : data ? (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Dead Stock</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.summary.totalDeadStock}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Slow Moving</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.summary.totalSlowMoving}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3">
                <Tag className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Discount Candidates</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.summary.totalDiscountCandidates}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Clearance</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.summary.totalClearance}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Recommendations</h2>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
              {data.aiRecommendations}
            </pre>
          </div>

          {/* Dead Stock */}
          {data.deadStock.length > 0 && (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Dead Stock Products ({data.deadStock.length})
              </h2>
              <div className="space-y-2">
                {data.deadStock.map((product: any) => (
                  <div
                    key={product.productId}
                    className={`p-4 rounded-lg border ${getRecommendationColor(product.recommendation)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <Link
                          href={`/dashboard/products/${product.productId}`}
                          className="font-medium text-gray-900 dark:text-white hover:underline"
                        >
                          {product.name}
                        </Link>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          SKU: {product.sku} | Stock: {product.stock} | Days since creation: {product.daysSinceCreation}
                        </p>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">
                          {product.suggestedAction} ({product.suggestedDiscount}% discount)
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slow Moving */}
          {data.slowMoving.length > 0 && (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-yellow-600" />
                Slow Moving Products ({data.slowMoving.length})
              </h2>
              <div className="space-y-2">
                {data.slowMoving.map((product: any) => (
                  <div
                    key={product.productId}
                    className={`p-4 rounded-lg border ${getRecommendationColor(product.recommendation)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <Link
                          href={`/dashboard/products/${product.productId}`}
                          className="font-medium text-gray-900 dark:text-white hover:underline"
                        >
                          {product.name}
                        </Link>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          SKU: {product.sku} | Stock: {product.stock} | Sold: {product.soldCount}
                        </p>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">
                          {product.suggestedAction} ({product.suggestedDiscount}% discount)
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-gray-500 dark:text-gray-400">No cleanup suggestions available</p>
        </div>
      )}
    </div>
  );
}

