'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, User, Mail, Phone, Camera, Lock, Save } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getCurrentUser } from '@/lib/auth';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [emailData, setEmailData] = useState({
    newEmail: '',
    password: '',
  });
  const [emailLoading, setEmailLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Fetch current user profile
  const { data: userData, refetch: refetchUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data.data.user;
    },
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        avatar: userData.avatar || '',
      });
    }
  }, [userData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const payload = new FormData();
    payload.append('file', file);

    try {
      setAvatarUploading(true);
      const response = await api.post('/upload', payload);
      const avatarUrl = response.data.data.url;
      
      setFormData((prev) => ({ ...prev, avatar: avatarUrl }));
      toast.success('Avatar uploaded successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/auth/update-profile', formData);
      toast.success('Profile updated successfully');
      
      // Update localStorage user data
      const currentUser = getCurrentUser();
      if (currentUser && response.data.data.user) {
        const updatedUser = {
          ...currentUser,
          firstName: response.data.data.user.firstName,
          lastName: response.data.data.user.lastName,
          phone: response.data.data.user.phone,
          avatar: response.data.data.user.avatar,
          isActive: response.data.data.user.isActive ?? true,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('storage'));
      }
      
      refetchUser();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);

    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    try {
      await api.post('/auth/resend-verification');
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send verification email');
    } finally {
      setResendLoading(false);
    }
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailData.newEmail || !emailData.password) {
      toast.error('Please fill all fields');
      return;
    }

    setEmailLoading(true);

    try {
      const response = await api.put('/auth/update-email', {
        email: emailData.newEmail,
        password: emailData.password,
      });
      toast.success('Email updated! Please verify your new email address.');
      
      // Update localStorage
      const currentUser = getCurrentUser();
      if (currentUser && response.data.data.user) {
        const updatedUser = {
          ...currentUser,
          email: response.data.data.user.email,
          isVerified: false,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('storage'));
      }
      
      setEmailData({ newEmail: '', password: '' });
      refetchUser();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update email');
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Profile Information */}
          <div className="card p-4 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </h2>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              {/* Avatar */}
              <div>
                <label className="label flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  {formData.avatar ? (
                    <div className="relative">
                      <Image
                        src={formData.avatar}
                        alt="Profile"
                        width={100}
                        height={100}
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, avatar: '' }))}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <label className="btn-secondary cursor-pointer inline-flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      {avatarUploading ? 'Uploading...' : formData.avatar ? 'Change' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={avatarUploading}
                      />
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      JPG, PNG or GIF. Max size 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name *</label>
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
                  Email Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    className="input-field bg-gray-50 dark:bg-gray-800 cursor-not-allowed flex-1"
                    disabled
                    readOnly
                  />
                  {!userData?.isVerified && (
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendLoading}
                      className="btn-secondary text-sm px-4 whitespace-nowrap"
                    >
                      {resendLoading ? 'Sending...' : 'Resend Verification'}
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {userData?.isVerified ? (
                    <span className="text-green-600 dark:text-green-400">✓ Email verified</span>
                  ) : (
                    <span className="text-yellow-600 dark:text-yellow-400">⚠ Email not verified. Check your inbox.</span>
                  )}
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="label flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="+1 234 567 8900"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Update Email */}
          <div className="card p-4 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Update Email Address
            </h2>

            <form onSubmit={handleEmailUpdate} className="space-y-4">
              <div>
                <label className="label">New Email Address *</label>
                <input
                  type="email"
                  value={emailData.newEmail}
                  onChange={(e) => setEmailData((prev) => ({ ...prev, newEmail: e.target.value }))}
                  className="input-field"
                  required
                  placeholder="newemail@example.com"
                />
              </div>

              <div>
                <label className="label">Current Password *</label>
                <input
                  type="password"
                  value={emailData.password}
                  onChange={(e) => setEmailData((prev) => ({ ...prev, password: e.target.value }))}
                  className="input-field"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter your current password to confirm email change
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={emailLoading}
                  className="btn-primary flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  {emailLoading ? 'Updating...' : 'Update Email'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="card p-4 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Change Password
            </h2>

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="label">Current Password *</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label">New Password *</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="input-field"
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Must be at least 6 characters
                </p>
              </div>

              <div>
                <label className="label">Confirm New Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="input-field"
                  required
                  minLength={6}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="btn-primary flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar - Account Info */}
        <div className="space-y-4">
          <div className="card p-4 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Account Information</h2>
            
            {userData && (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Role
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {userData.role || 'Admin'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Account Status
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs ${
                        (userData.isActive !== false && userData.role === 'admin') || userData.isActive
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                      }`}
                    >
                      {(userData.isActive !== false && userData.role === 'admin') || userData.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Email Verification
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs ${
                        userData.isVerified
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}
                    >
                      {userData.isVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

