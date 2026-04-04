'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, X, Save, Trash2, Edit, Search } from 'lucide-react';

export default function BrandDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const brandId = params.id;
  const [productSearch, setProductSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    website: '',
    image: '',
    isActive: true,
  });

  // Fetch brand data
  const { data: brandData, isLoading: brandLoading } = useQuery({
    queryKey: ['brand', brandId],
    queryFn: async () => {
      const response = await api.get(`/brands/${brandId}`);
      const data = response.data.data;
      setFormData({
        name: data.name || '',
        slug: data.slug || '',
        description: data.description || '',
        website: data.website || '',
        image: data.image || '',
        isActive: data.isActive !== undefined ? data.isActive : true,
      });
      return data;
    },
    enabled: !!brandId,
  });

  const { data: productsData, isLoading: productsLoading, refetch: refetchProducts } = useQuery({
    queryKey: ['brand-products', brandId, productSearch],
    queryFn: async () => {
      const params = new URLSearchParams({
        brand: String(brandId),
        limit: '500',
        page: '1',
      });
      if (productSearch.trim()) params.append('search', productSearch.trim());
      const response = await api.get(`/products?${params.toString()}`);
      return response.data.data;
    },
    enabled: !!brandId,
  });

  // Update brand mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await api.put(`/brands/${brandId}`, data);
    },
    onSuccess: () => {
      toast.success('Brand updated successfully');
      queryClient.invalidateQueries({ queryKey: ['brand', brandId] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update brand');
    },
  });

  // Delete brand mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await api.delete(`/brands/${brandId}`);
    },
    onSuccess: () => {
      toast.success('Brand deleted successfully');
      router.push('/dashboard/brands');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete brand');
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const response = await api.post('/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData(prev => ({ ...prev, image: response.data.data.url }));
      toast.success('Logo uploaded successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this brand? This action cannot be undone.')) return;
    deleteMutation.mutate();
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Delete product "${productName}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/${productId}`);
      toast.success('Product deleted');
      refetchProducts();
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  if (brandLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-gray-500">Loading brand...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Link href="/dashboard/brands" className="hover:text-gray-900 dark:hover:text-white">
          Brands
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white">{brandData?.name || 'Brand'}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/brands"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit Brand
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Update brand details
            </p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="btn-secondary flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="w-4 h-4" />
          {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="card p-4 space-y-4">
        <div>
          <label className="label">Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="label">Handle (Slug) *</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            className="input-field"
            required
          />
          <p className="text-xs text-gray-500 mt-1">URL-friendly identifier</p>
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

        <div>
          <label className="label">Brand Logo</label>
          {formData.image ? (
            <div className="relative w-full h-48 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
              <Image
                src={formData.image}
                alt="Brand Logo"
                fill
                className="object-contain p-4"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
                id="brand-logo"
              />
              <label
                htmlFor="brand-logo"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {uploading ? 'Uploading...' : 'Click to upload brand logo'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  PNG, JPG, SVG (Max 5MB) - Transparent background recommended
                </span>
              </label>
            </div>
          )}
        </div>

        <div>
          <label className="label">Website</label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            className="input-field"
            placeholder="https://example.com"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="rounded"
          />
          <label className="text-sm text-gray-700 dark:text-gray-300">Active</label>
        </div>

        <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button 
            type="submit" 
            disabled={updateMutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href="/dashboard/brands" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>

      <div className="card p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Products for this brand ({productsData?.pagination?.total ?? productsData?.products?.length ?? 0})
          </h2>
          <Link href="/dashboard/products/new" className="btn-primary text-sm inline-flex items-center justify-center">
            Add product
          </Link>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Filter products by name, SKU..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300">Product</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300">SKU</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300">Price</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300">Stock</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {productsLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-sm text-gray-500">
                    Loading products…
                  </td>
                </tr>
              ) : !productsData?.products?.length ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-sm text-gray-500">
                    No products for this brand
                  </td>
                </tr>
              ) : (
                productsData.products.map((product: any) => (
                  <tr
                    key={product._id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] && (
                          <Image
                            src={product.images[0]}
                            alt=""
                            width={40}
                            height={40}
                            className="rounded object-cover"
                          />
                        )}
                        <Link
                          href={`/dashboard/products/${product._id}`}
                          className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600"
                        >
                          {product.name}
                        </Link>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-600 dark:text-gray-400">{product.sku}</td>
                    <td className="py-2 px-3 text-sm text-gray-900 dark:text-white">
                      ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-600 dark:text-gray-400">{product.stock}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          product.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {product.isActive ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/dashboard/products/${product._id}`}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product._id, product.name)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                          title="Delete"
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
