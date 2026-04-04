'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function NewBannerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState('');
  const [mobileImage, setMobileImage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    link: '',
    linkText: '',
    position: 'hero',
    isActive: true,
    sortOrder: '0',
    startDate: '',
    endDate: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMobile = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      // Don't set Content-Type header - let axios set it automatically with boundary
      const response = await api.post('/upload', uploadFormData);
      
      if (isMobile) {
        setMobileImage(response.data.data.url);
      } else {
        setImage(response.data.data.url);
      }
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload image';
      toast.error(errorMessage);
      console.error('Upload error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bannerData = {
        ...formData,
        image,
        mobileImage: mobileImage || undefined,
        sortOrder: parseInt(formData.sortOrder),
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      };

      await api.post('/banners', bannerData);
      toast.success('Banner created successfully');
      router.push('/dashboard/banners');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create banner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/banners"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Add New Banner
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create a new banner for your website
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Basic Information */}
          <div className="card p-4 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Basic Information
            </h2>
            
            <div>
              <label className="label">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">Subtitle</label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                className="input-field"
              />
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

          {/* Link Information */}
          <div className="card p-4 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Link Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Link URL</label>
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="label">Link Text</label>
                <input
                  type="text"
                  name="linkText"
                  value={formData.linkText}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Shop Now"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="card p-4 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Images
            </h2>

            {/* Desktop Image */}
            <div>
              <label className="label">Desktop Image * (16:9 ratio)</label>
              {image ? (
                <div className="relative mt-1 w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden" style={{ aspectRatio: '16 / 9' }}>
                  <Image
                    src={image}
                    alt="Banner"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 transition-colors mt-1 bg-gray-50 dark:bg-gray-900" style={{ aspectRatio: '16 / 9' }}>
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Upload Desktop Image (16:9)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, false)}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Mobile Image */}
            <div>
              <label className="label">Mobile Image (Optional)</label>
              {mobileImage ? (
                <div className="relative mt-1">
                  <Image
                    src={mobileImage}
                    alt="Banner Mobile"
                    width={400}
                    height={400}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setMobileImage('')}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 transition-colors mt-1">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Upload Mobile Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, true)}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Schedule */}
          <div className="card p-4 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Schedule (Optional)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Start Date</label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">End Date</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Position & Order */}
          <div className="card p-4 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Position & Order
            </h2>

            <div>
              <label className="label">Position *</label>
              <select
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="hero">Hero</option>
                <option value="promotional">Promotional</option>
                <option value="category">Category</option>
                <option value="sidebar">Sidebar</option>
              </select>
            </div>

            <div>
              <label className="label">Sort Order</label>
              <input
                type="number"
                name="sortOrder"
                value={formData.sortOrder}
                onChange={handleInputChange}
                min="0"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower numbers appear first
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="card p-4 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
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
              disabled={loading || !image}
              className="btn-primary w-full"
            >
              {loading ? 'Creating...' : 'Create Banner'}
            </button>
            <Link
              href="/dashboard/banners"
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


