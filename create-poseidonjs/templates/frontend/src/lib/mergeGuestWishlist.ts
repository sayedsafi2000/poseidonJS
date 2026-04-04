import api from '@/lib/api';
import { useWishlistGuestStore } from '@/store/wishlistGuestStore';

/** After login/register: copy guest wishlist IDs to the API, then clear local guest list. */
export async function mergeGuestWishlistIntoApi() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem('token')) return;

  const ids = [...useWishlistGuestStore.getState().ids];
  if (!ids.length) return;

  await Promise.all(
    ids.map((id) =>
      api.post(`/wishlist/${id}`).catch(() => {
        /* duplicate or invalid id */
      })
    )
  );
  useWishlistGuestStore.getState().clear();
}
