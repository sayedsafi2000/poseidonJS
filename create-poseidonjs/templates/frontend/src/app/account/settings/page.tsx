'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { mergeStoredUser } from '@/lib/authSession';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Save,
  CheckCircle,
  Upload,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  type AddressForm,
  parseStoredAddress,
  serializeAddress,
} from '@/lib/userAddress';

type MeUser = {
  id?: string;
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string | null;
  avatar?: string | null;
  role?: string;
  isVerified?: boolean;
  createdAt?: string;
};

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const PASSWORD_HINT =
  'At least 8 characters with uppercase, lowercase, a number, and a special character (@$!%*?&)';

export default function AccountSettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [addressData, setAddressData] = useState<AddressForm>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  const [emailChange, setEmailChange] = useState({
    newEmail: '',
    password: '',
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('token')) {
      router.replace(`/login?next=${encodeURIComponent('/account/settings')}`);
      return;
    }
    setAuthReady(true);
  }, [router]);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data.data.user as MeUser;
    },
    enabled: authReady,
  });

  useEffect(() => {
    if (!user) return;
    setProfile({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
    });
    setAddressData(parseStoredAddress(user.address ?? undefined));
    setAvatarPreview(user.avatar || null);
    setPendingAvatarFile(null);
  }, [user]);

  const syncStoredUser = (u: MeUser) => {
    mergeStoredUser({
      firstName: u.firstName ?? '',
      lastName: u.lastName ?? '',
      email: u.email ?? '',
      avatar: u.avatar ?? undefined,
      isVerified: u.isVerified,
    });
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const response = await api.put('/auth/update-profile', body);
      return response.data.data.user as MeUser;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      syncStoredUser(updated);
      toast.success('Profile updated successfully!');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let avatarUrl: string | undefined;
    if (pendingAvatarFile) {
      try {
        const fd = new FormData();
        fd.append('file', pendingAvatarFile);
        const up = await api.post('/upload', fd);
        avatarUrl = up.data.data.url as string;
      } catch (err: unknown) {
        const msg =
          err && typeof err === 'object' && 'response' in err
            ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
            : undefined;
        toast.error(msg || 'Failed to upload photo');
        return;
      }
    }
    const body: Record<string, unknown> = {
      firstName: profile.firstName.trim(),
      lastName: profile.lastName.trim(),
      phone: profile.phone.trim() || undefined,
    };
    if (avatarUrl) body.avatar = avatarUrl;
    updateProfileMutation.mutate(body);
    setPendingAvatarFile(null);
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ address: serializeAddress(addressData) });
  };

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await api.put('/auth/change-password', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to update password');
    },
  });

  const updateEmailMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await api.put('/auth/update-email', data);
      return response.data.data.user as { email: string; isVerified?: boolean };
    },
    onSuccess: (data) => {
      mergeStoredUser({ email: data.email, isVerified: data.isVerified });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Email updated. Please verify your new address.');
      setEmailChange({ newEmail: '', password: '' });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to update email');
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!PASSWORD_REGEX.test(passwordData.newPassword)) {
      toast.error(PASSWORD_HINT);
      return;
    }

    updatePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailChange.newEmail.trim().toLowerCase();
    if (!email) {
      toast.error('Enter a new email address');
      return;
    }
    if (!emailChange.password) {
      toast.error('Enter your current password to change email');
      return;
    }
    updateEmailMutation.mutate({ email, password: emailChange.password });
  };

  const onAvatarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <p className="text-gray-600">Redirecting…</p>
      </div>
    );
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <p className="text-gray-600">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <Settings className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Account Settings</h1>
            <p className="text-xl text-white/90">Manage your account information and preferences</p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container-custom max-w-4xl">
          <div className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <User className="w-6 h-6 text-primary-600" />
                  Profile & photo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    <div className="relative h-24 w-24 rounded-full overflow-hidden bg-slate-200 shrink-0">
                      {avatarPreview ? (
                        <Image
                          src={avatarPreview}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized={
                            avatarPreview.startsWith('data:') || avatarPreview.startsWith('blob:')
                          }
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <User className="w-10 h-10" />
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onAvatarPick}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Change photo
                      </Button>
                      <p className="text-sm text-gray-500 mt-2">Optional — JPG or PNG, max 5MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={profile.firstName}
                          onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                          className="input-field pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={profile.lastName}
                          onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                          className="input-field pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={profile.email}
                          readOnly
                          className="input-field pl-10 bg-gray-50 text-gray-600"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Use &quot;Change email&quot; below to update your address.
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          className="input-field pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save profile
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Mail className="w-6 h-6 text-primary-600" />
                  Change email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEmailSubmit} className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New email</label>
                    <input
                      type="email"
                      value={emailChange.newEmail}
                      onChange={(e) => setEmailChange({ ...emailChange, newEmail: e.target.value })}
                      className="input-field"
                      placeholder="new@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={emailChange.password}
                      onChange={(e) => setEmailChange({ ...emailChange, password: e.target.value })}
                      className="input-field"
                      placeholder="Confirm it’s you"
                    />
                  </div>
                  <Button type="submit" variant="secondary" disabled={updateEmailMutation.isPending}>
                    {updateEmailMutation.isPending ? 'Updating…' : 'Update email'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <MapPin className="w-6 h-6 text-primary-600" />
                  Default shipping address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddressSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street
                      </label>
                      <input
                        type="text"
                        value={addressData.street}
                        onChange={(e) =>
                          setAddressData({ ...addressData, street: e.target.value })
                        }
                        className="input-field"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                          type="text"
                          value={addressData.city}
                          onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State / province
                        </label>
                        <input
                          type="text"
                          value={addressData.state}
                          onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                          className="input-field"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ZIP / postal
                        </label>
                        <input
                          type="text"
                          value={addressData.zipCode}
                          onChange={(e) =>
                            setAddressData({ ...addressData, zipCode: e.target.value })
                          }
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country
                        </label>
                        <input
                          type="text"
                          value={addressData.country}
                          onChange={(e) =>
                            setAddressData({ ...addressData, country: e.target.value })
                          }
                          className="input-field"
                        />
                      </div>
                    </div>
                  </div>
                  <Button type="submit" disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? 'Saving…' : 'Save address'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Lock className="w-6 h-6 text-primary-600" />
                  Change password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, currentPassword: e.target.value })
                          }
                          className="input-field pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, newPassword: e.target.value })
                          }
                          className="input-field pl-10"
                          required
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{PASSWORD_HINT}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm new password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                          }
                          className="input-field pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={updatePasswordMutation.isPending}
                    className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                  >
                    {updatePasswordMutation.isPending ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Updating…
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Update password
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader>
                <CardTitle className="text-lg">Account status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Account type</span>
                  <Badge variant="secondary">{user?.role || 'Customer'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Member since</span>
                  <span className="font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Email verified</span>
                  {user?.isVerified ? (
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-800 border-amber-300">
                      Pending verification
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
