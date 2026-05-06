'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsPage() {
  const { data: salesData } = useQuery({
    queryKey: ['sales-analytics'],
    queryFn: async () => {
      const response = await api.get('/analytics/sales?period=month');
      return response.data.data.salesData;
    },
  });

  const { data: productData } = useQuery({
    queryKey: ['product-analytics'],
    queryFn: async () => {
      const response = await api.get('/analytics/products');
      return response.data.data;
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track your business performance
        </p>
      </div>

      {/* Sales Chart */}
      <div className="card p-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Sales Overview
        </h2>
        {salesData && salesData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalSales"
                stroke="#0ea5e9"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            No sales data available
          </div>
        )}
      </div>

      {/* Top Products & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Products */}
        <div className="card p-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Top Selling Products
          </h2>
          {productData?.topProducts && productData.topProducts.length > 0 ? (
            <div className="space-y-3">
              {productData.topProducts.map((product: any, index: number) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-500">#{index + 1}</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {product.soldCount || 0} sold
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    ${product.price?.toFixed(2) || '0.00'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No products data available
            </div>
          )}
        </div>

        {/* Products by Category */}
        <div className="card p-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Products by Category
          </h2>
          {productData?.productsByCategory && productData.productsByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productData.productsByCategory}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={90}
                  label={({ name, percent }: { name: string; percent: number }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={false}
                >
                  {productData.productsByCategory.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any, name: any) => [`${value} products`, name]} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-500">
              No category data available
            </div>
          )}
        </div>
      </div>

      {/* Low Stock Products */}
      <div className="card p-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Low Stock Products
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                  Product
                </th>
                <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                  SKU
                </th>
                <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                  Stock
                </th>
              </tr>
            </thead>
            <tbody>
              {productData?.lowStockProducts && productData.lowStockProducts.length > 0 ? (
                productData.lowStockProducts.map((product: any) => (
                  <tr
                    key={product._id}
                    className="border-b border-gray-200 dark:border-gray-700"
                  >
                    <td className="py-2 px-3 text-gray-900 dark:text-white">
                      {product.name}
                    </td>
                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                      {product.sku}
                    </td>
                    <td className="py-2 px-3">
                      <span className="font-medium text-red-600">
                        {product.stock}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-gray-500">
                    No low stock products
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

