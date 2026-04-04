'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ForgotPasswordForm {
  email: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm<ForgotPasswordForm>();
  const email = watch('email');

  const onSubmit = async (data: ForgotPasswordForm) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setEmailSent(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send reset email. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-purple-600 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full mb-4">
            <Mail className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Forgot Password?
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {emailSent 
              ? 'Check your email for reset instructions' 
              : 'Enter your email to receive a password reset link'}
          </p>
        </div>

        {emailSent ? (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm text-green-800 dark:text-green-300">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Please check your email and click the link to reset your password. The link will expire in 1 hour.
            </p>
            <div className="flex flex-col gap-2">
              <Link href="/login" className="btn-secondary text-center">
                <ArrowLeft className="w-4 h-4 inline mr-2" />
                Back to Login
              </Link>
              <button
                onClick={() => setEmailSent(false)}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 text-center"
              >
                Resend email
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                id="email"
                className="input-field"
                placeholder="admin@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
              <Mail className="w-5 h-5" />
            </button>

            <Link
              href="/login"
              className="block text-center text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              <ArrowLeft className="w-4 h-4 inline mr-1" />
              Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}



