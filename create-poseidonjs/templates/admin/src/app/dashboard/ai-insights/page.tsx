'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
// Using div with card styling instead
import { BarChart3, TrendingUp, AlertTriangle, Package, Users, DollarSign, Calendar } from 'lucide-react';

export default function AIInsightsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const { data: summaryData, isLoading } = useQuery({
    queryKey: ['ai-summary', selectedPeriod],
    queryFn: async () => {
      const response = await api.get(`/ai-summary/${selectedPeriod}`);
      return response.data.data;
    },
  });

  const { data: customerInsights } = useQuery({
    queryKey: ['customer-insights', selectedPeriod],
    queryFn: async () => {
      const response = await api.get(`/ai/customer-insights?period=${selectedPeriod}`);
      return response.data.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Business Insights</h1>
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading insights...</div>
      ) : summaryData ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {summaryData.totalOrders}
                  </p>
                </div>
                <Package className="w-8 h-8 text-primary-600" />
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    ${summaryData.totalRevenue.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">New Customers</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {summaryData.newCustomers}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Low Stock Items</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {summaryData.lowStockProducts.length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* AI Summary */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Summary</h2>
            <div className="prose dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans">
                {summaryData.aiSummary}
              </pre>
            </div>
          </div>

          {/* Best Selling Products */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Best Selling Products
            </h2>
            <div className="space-y-2">
              {summaryData.bestSellingProducts.slice(0, 10).map((product: any, index: number) => (
                <div
                  key={product.id || index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">{product.sold} sold</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ${product.revenue?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Insights */}
          {customerInsights && (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Customer Behavior Insights
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Customers</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {customerInsights.metrics.totalCustomers}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Repeat Rate</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {customerInsights.metrics.repeatPurchaseRate}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Avg Order Value</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      ${customerInsights.metrics.averageOrderValue}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Repeat Customers</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {customerInsights.metrics.repeatCustomers}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">AI Insights</h3>
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                    {customerInsights.aiInsights}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      )}
    </div>
  );
}

