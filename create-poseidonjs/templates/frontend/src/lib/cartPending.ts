const KEY = 'poseidon-pending-cart';

export type PendingCartPayload = {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  quantity: number;
};

export function setPendingCartItem(payload: PendingCartPayload) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

export function consumePendingCartItem(): PendingCartPayload | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  sessionStorage.removeItem(KEY);
  try {
    const p = JSON.parse(raw) as PendingCartPayload;
    if (!p?.id || !p.name) return null;
    return {
      ...p,
      quantity: Math.max(1, Number(p.quantity) || 1),
    };
  } catch {
    return null;
  }
}
