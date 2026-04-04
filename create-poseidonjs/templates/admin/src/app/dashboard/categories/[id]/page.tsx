'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, X, Save, Trash2, Edit, Search } from 'lucide-react';

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const categoryId = params.id;
  const [productSearch, setProductSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [collectionsData, setCollectionsData] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    collection: '',
    isActive: true,
  });

  // Fetch collections on mount
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await api.get('/collections');
        setCollectionsData(response.data.data?.collections || []);
      } catch (error) {
        console.error('Failed to fetch collections');
      }
    };
    fetchCollections();
  }, []);

  // Fetch category data
  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', categoryId],
    queryFn: async () => {
      const response = await api.get(`/categories/${categoryId}`);
      const data = response.data.data;
      setFormData({
        name: data.name || '',
        slug: data.slug || '',
        description: data.description || '',
        image: data.image || '',
        collection: data.collection?._id || data.collection || '',
        isActive: data.isActive !== undefined ? data.isActive : true,
      });
      return data;
    },
    enabled: !!categoryId,
  });

  const { data: productsData, isLoading: productsLoading, refetch: refetchProducts } = useQuery({
    queryKey: ['category-products', categoryId, productSearch],
    queryFn: async () => {
      const params = new URLSearchParams({
        category: String(categoryId),
        limit: '500',
        page: '1',
      });
      if (productSearch.trim()) params.append('search', productSearch.trim());
      const response = await api.get(`/products?${params.toString()}`);
      return response.data.data;
    },
    enabled: !!categoryId,
  });

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await api.put(`/categories/${categoryId}`, data);
    },
    onSuccess: () => {
      toast.success('Category updated successfully');
      queryClient.invalidateQueries({ queryKey: ['category', categoryId] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update category');
    },
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await api.delete(`/categories/${categoryId}`);
    },
    onSuccess: () => {
      toast.success('Category deleted successfully');
      router.push('/dashboard/categories');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete category');
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
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload image');
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
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) return;
    deleteMutation.mutate();
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Delete product "${productName}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/${productId}`);
      toast.success('Product deleted');
      refetchProducts();
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  if (categoryLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-gray-500">Loading category...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Link href="/dashboard/categories" className="hover:text-gray-900 dark:hover:text-white">
          Categories
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white">{categoryData?.name || 'Category'}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/categories"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit Category
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Update category details
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
          <label className="label">Collection *</label>
          <select
            name="collection"
            value={formData.collection}
            onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
            className="input-field"
            required
          >
            <option value="">-- Select a collection --</option>
            {collectionsData.map((collection: any) => (
              <option key={collection._id} value={collection._id}>
                {collection.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Select which collection this category belongs to</p>
        </div>

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
          <label className="label">Category Image</label>
          {formData.image ? (
            <div className="relative w-full h-48 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <Image
                src={formData.image}
                alt="Category"
                fill
                className="object-cover"
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
                id="category-image"
              />
              <label
                htmlFor="category-image"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {uploading ? 'Uploading...' : 'Click to upload category image'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  PNG, JPG, WEBP (Max 5MB)
                </span>
              </label>
            </div>
          )}
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
          <Link href="/dashboard/categories" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>

      {/* Products in this category */}
      <div className="card p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Products in this category ({productsData?.pagination?.total ?? productsData?.products?.length ?? 0})
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
                    No products in this category
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

