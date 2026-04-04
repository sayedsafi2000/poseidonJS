/** Matches account settings shipping JSON shape */

export type AddressForm = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

export function parseStoredAddress(raw: string | null | undefined): AddressForm {
  const empty = { street: '', city: '', state: '', zipCode: '', country: '' };
  if (!raw?.trim()) return empty;
  try {
    const o = JSON.parse(raw) as Record<string, unknown>;
    if (o && typeof o === 'object') {
      return {
        street: String(o.street ?? ''),
        city: String(o.city ?? ''),
        state: String(o.state ?? ''),
        zipCode: String(o.zipCode ?? ''),
        country: String(o.country ?? ''),
      };
    }
  } catch {
    /* plain text legacy */
  }
  return { ...empty, street: raw };
}

/** One line for order + display (street + optional state) */
export function formatStreetForOrder(a: AddressForm): string {
  const s = a.street.trim();
  const st = a.state.trim();
  if (s && st) return `${s}, ${st}`;
  return s || st;
}

export function serializeAddress(a: AddressForm): string {
  const hasAny = Object.values(a).some((v) => String(v).trim());
  if (!hasAny) return '';
  return JSON.stringify({
    street: a.street.trim(),
    city: a.city.trim(),
    state: a.state.trim(),
    zipCode: a.zipCode.trim(),
    country: a.country.trim(),
  });
}
