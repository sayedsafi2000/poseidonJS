import type { AxiosResponse } from 'axios';
import api from '@/lib/api';

type G = typeof globalThis & {
  __poseidonVerifyEmailPromises?: Map<string, Promise<AxiosResponse>>;
};

/**
 * One shared Map across HMR / duplicate chunks so only one GET runs per token.
 * After success the promise stays resolved — retries get the same result, not a second API call.
 */
function getVerifyMap() {
  const g = globalThis as G;
  if (!g.__poseidonVerifyEmailPromises) {
    g.__poseidonVerifyEmailPromises = new Map();
  }
  return g.__poseidonVerifyEmailPromises;
}

export function verifyEmailOnce(token: string, email?: string | null): Promise<AxiosResponse> {
  const verifyPromises = getVerifyMap();
  const em = email?.trim().toLowerCase();
  // One request per token only — avoids duplicate GETs (Strict Mode) and mixed cache keys.
  let p = verifyPromises.get(token);
  if (!p) {
    const params: Record<string, string> = { token };
    if (em) params.email = em;
    p = api.get('/auth/verify-email', { params }).catch((err) => {
      verifyPromises.delete(token);
      throw err;
    });
    verifyPromises.set(token, p);
  }
  return p;
}
