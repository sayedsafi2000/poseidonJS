'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register } from '@/lib/auth';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Phone, ArrowRight, Camera, MapPin, Building2, FileText } from 'lucide-react';
import Image from 'next/image';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatar, setAvatar] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    role: 'vendor', // Default to vendor
    vendorInfo: {
      businessName: '',
      businessAddress: '',
      taxId: '',
    },
  });

  const [passwordErrors, setPasswordErrors] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('vendorInfo.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        vendorInfo: {
          ...prev.vendorInfo,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Password validation
    if (name === 'password') {
      validatePassword(value);
    }
  };

  const validatePassword = (password: string) => {
    setPasswordErrors({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password),
    });
  };

  const isPasswordValid = () => {
    return Object.values(passwordErrors).every((error) => error === true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      e.target.value = '';
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      e.target.value = '';
      return;
    }

    const payload = new FormData();
    payload.append('file', file);

    try {
      setAvatarUploading(true);
      // Use signup endpoint which doesn't require authentication
      const response = await api.post('/upload/signup', payload);
      
      if (response.data.success && response.data.data?.url) {
        setAvatar(response.data.data.url);
        toast.success('Image uploaded successfully');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload image';
      toast.error(errorMessage);
      
      // Log detailed error for debugging
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data,
        });
      }
    } finally {
      setAvatarUploading(false);
      // Reset file input so same file can be selected again
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!avatar) {
      toast.error('Profile image is required');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!isPasswordValid()) {
      toast.error('Password does not meet requirements');
      setLoading(false);
      return;
    }

    if (formData.role === 'vendor' && !formData.vendorInfo.businessName) {
      toast.error('Business name is required for vendors');
      setLoading(false);
      return;
    }

    try {
      const { firstName, lastName, email, password, phone, address, role, vendorInfo } = formData;
      await register({
        firstName,
        lastName,
        email,
        password,
        phone: phone || undefined,
        address: address || undefined,
        avatar,
        role: role as 'admin' | 'vendor',
        vendorInfo: role === 'vendor' ? vendorInfo : undefined,
      });

      toast.success('Registration successful! Please check your email to verify your account.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">PoseidonJS</h1>
          <p className="text-gray-600 dark:text-gray-400">Create your account</p>
        </div>

        {/* Signup Form */}
        <div className="card p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Sign Up
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="label">Account Type *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="vendor">Vendor</option>
                <option value="admin">Admin</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Select your account type (Admin or Vendor only)
              </p>
            </div>

            {/* Profile Image */}
            <div>
              <label className="label flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Profile Image *
              </label>
              <div className="flex items-center gap-4">
                {avatar ? (
                  <div className="relative">
                    <Image
                      src={avatar}
                      alt="Profile"
                      width={100}
                      height={100}
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => setAvatar('')}
                      className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <Camera className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div>
                  <label 
                    htmlFor="avatar-upload"
                    className="btn-secondary cursor-pointer inline-flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    {avatarUploading ? 'Uploading...' : avatar ? 'Change' : 'Upload Image'}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={avatarUploading}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    JPG, PNG or GIF. Max size 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label flex items-center gap-2">
                  <User className="w-4 h-4" />
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="label flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="input-field"
                required
                placeholder="+1 234 567 8900"
              />
            </div>

            {/* Address */}
            <div>
              <label className="label flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="input-field"
                rows={3}
                required
                placeholder="Enter your full address"
              />
            </div>

            {/* Vendor Info - Only for Vendor */}
            {formData.role === 'vendor' && (
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Business Information
                </h3>
                
                <div>
                  <label className="label">Business Name *</label>
                  <input
                    type="text"
                    name="vendorInfo.businessName"
                    value={formData.vendorInfo.businessName}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                    placeholder="Your business name"
                  />
                </div>

                <div>
                  <label className="label">Business Address</label>
                  <textarea
                    name="vendorInfo.businessAddress"
                    value={formData.vendorInfo.businessAddress}
                    onChange={handleInputChange}
                    className="input-field"
                    rows={2}
                    placeholder="Business address (optional, will use personal address if not provided)"
                  />
                </div>

                <div>
                  <label className="label flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Tax ID / Registration Number
                  </label>
                  <input
                    type="text"
                    name="vendorInfo.taxId"
                    value={formData.vendorInfo.taxId}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Tax ID or registration number (optional)"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="label flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="input-field"
                required
                minLength={8}
              />
              <div className="mt-2 space-y-1">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Password Requirements:</p>
                <div className="space-y-1 text-xs">
                  <div className={`flex items-center gap-2 ${passwordErrors.length ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                    <span>{passwordErrors.length ? '✓' : '○'}</span>
                    At least 8 characters
                  </div>
                  <div className={`flex items-center gap-2 ${passwordErrors.uppercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                    <span>{passwordErrors.uppercase ? '✓' : '○'}</span>
                    One uppercase letter (A-Z)
                  </div>
                  <div className={`flex items-center gap-2 ${passwordErrors.lowercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                    <span>{passwordErrors.lowercase ? '✓' : '○'}</span>
                    One lowercase letter (a-z)
                  </div>
                  <div className={`flex items-center gap-2 ${passwordErrors.number ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                    <span>{passwordErrors.number ? '✓' : '○'}</span>
                    One number (0-9)
                  </div>
                  <div className={`flex items-center gap-2 ${passwordErrors.special ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                    <span>{passwordErrors.special ? '✓' : '○'}</span>
                    One special character (@$!%*?&)
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="input-field"
                required
                minLength={8}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !avatar || !isPasswordValid()}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Info Message */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
            After signing up, please check your email to verify your account before logging in.
          </p>
        </div>
      </div>
    </div>
  );
}
