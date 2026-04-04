'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditPromotionPage() {
  const router = useRouter();
  const params = useParams();
  const promotionId = params.id;
  
  const [loading, setLoading] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'all' | 'single' | 'multiple' | 'category'>('all');
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    description: '',
    startDate: '',
    endDate: '',
    minPurchase: '',
    maxDiscount: '',
    usageLimit: '',
    isActive: true,
    applicableProducts: [] as string[],
    applicableCategories: [] as string[],
  });

  // Fetch promotion data
  const { data: promotionData, isLoading: promotionLoading } = useQuery({
    queryKey: ['promotion', promotionId],
    queryFn: async () => {
      const response = await api.get(`/promotions/${promotionId}`);
      return response.data.data;
    },
  });

  // Fetch products
  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: async () => {
      const response = await api.get('/products?limit=1000');
      return response.data.data;
    },
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data.data;
    },
  });

  // Populate form with promotion data
  useEffect(() => {
    if (promotionData) {
      const startDate = new Date(promotionData.startDate);
      const endDate = new Date(promotionData.endDate);
      
      const products = promotionData.applicableProducts?.map((p: any) => p._id || p) || [];
      const categories = promotionData.applicableCategories?.map((c: any) => c._id || c) || [];
      
      // Determine selection mode based on existing data
      let mode: 'all' | 'single' | 'multiple' | 'category' = 'all';
      if (categories.length > 0) {
        mode = 'category';
      } else if (products.length === 1) {
        mode = 'single';
      } else if (products.length > 1) {
        mode = 'multiple';
      }
      
      setSelectionMode(mode);
      setFormData({
        code: promotionData.code || '',
        type: promotionData.type || 'percentage',
        value: promotionData.value?.toString() || '',
        description: promotionData.description || '',
        startDate: startDate.toISOString().slice(0, 16),
        endDate: endDate.toISOString().slice(0, 16),
        minPurchase: promotionData.minPurchase?.toString() || '',
        maxDiscount: promotionData.maxDiscount?.toString() || '',
        usageLimit: promotionData.usageLimit?.toString() || '',
        isActive: promotionData.isActive ?? true,
        applicableProducts: products,
        applicableCategories: categories,
      });
    }
  }, [promotionData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSelectionModeChange = (mode: 'all' | 'single' | 'multiple' | 'category') => {
    setSelectionMode(mode);
    // Clear selections when changing mode
    setFormData({
      ...formData,
      applicableProducts: [],
      applicableCategories: [],
    });
  };

  const handleSingleProductSelect = (productId: string) => {
    setFormData({
      ...formData,
      applicableProducts: [productId],
      applicableCategories: [],
    });
  };

  const handleProductToggle = (productId: string) => {
    setFormData({
      ...formData,
      applicableProducts: formData.applicableProducts.includes(productId)
        ? formData.applicableProducts.filter(id => id !== productId)
        : [...formData.applicableProducts, productId],
      applicableCategories: [],
    });
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData({
      ...formData,
      applicableCategories: formData.applicableCategories.includes(categoryId)
        ? formData.applicableCategories.filter(id => id !== categoryId)
        : [...formData.applicableCategories, categoryId],
      applicableProducts: [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate selection based on mode
      if (selectionMode === 'single' && formData.applicableProducts.length === 0) {
        toast.error('Please select a product');
        setLoading(false);
        return;
      }
      if (selectionMode === 'multiple' && formData.applicableProducts.length === 0) {
        toast.error('Please select at least one product');
        setLoading(false);
        return;
      }
      if (selectionMode === 'category' && formData.applicableCategories.length === 0) {
        toast.error('Please select at least one category');
        setLoading(false);
        return;
      }

      const promotionData = {
        ...formData,
        value: parseFloat(formData.value),
        minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : undefined,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        applicableProducts: selectionMode === 'all' ? undefined : (formData.applicableProducts.length > 0 ? formData.applicableProducts : undefined),
        applicableCategories: selectionMode === 'all' ? undefined : (formData.applicableCategories.length > 0 ? formData.applicableCategories : undefined),
      };

      await api.put(`/promotions/${promotionId}`, promotionData);
      toast.success('Promotion updated successfully');
      router.push('/dashboard/promotions');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update promotion');
    } finally {
      setLoading(false);
    }
  };

  if (promotionLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading promotion...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/promotions"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Promotion
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Update promotion details
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content - Same as new page */}
        <div className="lg:col-span-2 space-y-4">
          {/* Basic Information */}
          <div className="card p-4 space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Promotion Code *</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label">Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </div>

              <div>
                <label className="label">Value *</label>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label">Usage Limit</label>
                <input
                  type="number"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleInputChange}
                  min="1"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="input-field"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="card p-4 space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Validity Period
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Start Date *</label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label">End Date *</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div className="card p-4 space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Conditions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Minimum Purchase</label>
                <input
                  type="number"
                  name="minPurchase"
                  value={formData.minPurchase}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Maximum Discount</label>
                <input
                  type="number"
                  name="maxDiscount"
                  value={formData.maxDiscount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Applicability Selection */}
          <div className="card p-4 space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Promotion Applicability
            </h2>
            
            <div>
              <label className="label">Select Applicability Type *</label>
              <select
                value={selectionMode}
                onChange={(e) => handleSelectionModeChange(e.target.value as 'all' | 'single' | 'multiple' | 'category')}
                className="input-field"
                required
              >
                <option value="all">Apply to All Products</option>
                <option value="single">Single Product</option>
                <option value="multiple">Multiple Products</option>
                <option value="category">Whole Category</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose how this promotion should be applied
              </p>
            </div>

            {/* Single Product Selection */}
            {selectionMode === 'single' && (
              <div className="space-y-2">
                <label className="label">Select Product *</label>
                {productsLoading ? (
                  <div className="p-4 text-center text-gray-500">Loading products...</div>
                ) : productsError ? (
                  <div className="p-4 text-center text-red-500 border border-red-200 dark:border-red-700 rounded-lg">
                    Error loading products. Please try again.
                  </div>
                ) : !productsData?.products || productsData.products.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 border border-gray-200 dark:border-gray-700 rounded-lg">
                    No products available. Please create products first.
                  </div>
                ) : (
                  <>
                    <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
                      {productsData.products.map((product: any) => (
                        <label
                          key={product._id}
                          className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                            formData.applicableProducts.includes(product._id)
                              ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <input
                            type="radio"
                            name="singleProduct"
                            checked={formData.applicableProducts.includes(product._id)}
                            onChange={() => handleSingleProductSelect(product._id)}
                            className="rounded"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {product.name}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({product.sku})
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                    {formData.applicableProducts.length > 0 && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Selected: {productsData.products.find((p: any) => p._id === formData.applicableProducts[0])?.name}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Multiple Products Selection */}
            {selectionMode === 'multiple' && (
              <div className="space-y-2">
                <label className="label">Select Products *</label>
                <p className="text-xs text-gray-500">
                  Select one or more products for this promotion
                </p>
                {productsLoading ? (
                  <div className="p-4 text-center text-gray-500">Loading products...</div>
                ) : productsError ? (
                  <div className="p-4 text-center text-red-500 border border-red-200 dark:border-red-700 rounded-lg">
                    Error loading products. Please try again.
                  </div>
                ) : !productsData?.products || productsData.products.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 border border-gray-200 dark:border-gray-700 rounded-lg">
                    No products available. Please create products first.
                  </div>
                ) : (
                  <>
                    <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
                      {productsData.products.map((product: any) => (
                        <label
                          key={product._id}
                          className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.applicableProducts.includes(product._id)}
                            onChange={() => handleProductToggle(product._id)}
                            className="rounded"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {product.name}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({product.sku})
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                    {formData.applicableProducts.length > 0 && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        {formData.applicableProducts.length} product(s) selected
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Category Selection */}
            {selectionMode === 'category' && (
              <div className="space-y-2">
                <label className="label">Select Category *</label>
                <p className="text-xs text-gray-500">
                  Select one or more categories. The promotion will apply to all products in the selected categories.
                </p>
                <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
                  {categoriesData?.categories?.map((category: any) => (
                    <label
                      key={category._id}
                      className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.applicableCategories.includes(category._id)}
                        onChange={() => handleCategoryToggle(category._id)}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
                {formData.applicableCategories.length > 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {formData.applicableCategories.length} category(ies) selected
                  </p>
                )}
              </div>
            )}

            {/* All Products Info */}
            {selectionMode === 'all' && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  This promotion will apply to all products in your store.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div className="card p-4 space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Status
            </h2>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Active
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="card p-4 space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Updating...' : 'Update Promotion'}
            </button>
            <Link
              href="/dashboard/promotions"
              className="btn-secondary w-full text-center"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}


