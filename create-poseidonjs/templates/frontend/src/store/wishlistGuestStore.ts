import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const memoryStorage: Storage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  key: () => null,
  length: 0,
};

function wishlistGuestStorage(): Storage {
  if (typeof window === 'undefined') return memoryStorage;
  return window.localStorage;
}

type WishlistGuestState = {
  ids: string[];
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useWishlistGuestStore = create<WishlistGuestState>()(
  persist(
    (set, get) => ({
      ids: [],
      add: (id) => {
        const cur = get().ids;
        if (cur.includes(id)) return;
        set({ ids: [...cur, id] });
      },
      remove: (id) => set({ ids: get().ids.filter((x) => x !== id) }),
      clear: () => set({ ids: [] }),
    }),
    {
      name: 'poseidon-wishlist-guest',
      storage: createJSONStorage(wishlistGuestStorage),
      partialize: (state) => ({ ids: state.ids }),
    }
  )
);
