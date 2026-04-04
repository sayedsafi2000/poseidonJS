export const AUTH_CHANGED_EVENT = 'poseidon-auth-changed';

export type StoredUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  avatar?: string | null;
  isVerified?: boolean;
};

export function saveAuthSession(
  token: string,
  user: {
    id?: string;
    _id?: string;
    firstName: string;
    lastName: string;
    email: string;
    role?: string;
    avatar?: string | null;
    isVerified?: boolean;
  }
) {
  if (typeof window === 'undefined') return;
  const id = user.id ?? user._id ?? '';
  const stored: StoredUser = {
    _id: String(id),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    avatar: user.avatar ?? undefined,
    isVerified: user.isVerified,
  };
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(stored));
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function mergeStoredUser(partial: Partial<StoredUser>) {
  if (typeof window === 'undefined') return;
  const cur = getStoredUser();
  if (!cur) return;
  localStorage.setItem('user', JSON.stringify({ ...cur, ...partial }));
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}
