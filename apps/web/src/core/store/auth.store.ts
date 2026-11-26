'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUserDTO } from '@mi-alberdi/shared';

interface AuthState {
  user: AuthUserDTO | null;
  setSession: (user: AuthUserDTO) => void;
  clearSession: () => void;
}

/**
 * Store de sesión pública.
 * La sesión real vive en la cookie HttpOnly de Better Auth: aquí solo se guarda
 * el perfil público para la UI. NUNCA persistir tokens en localStorage.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setSession: (user) => set({ user }),
      clearSession: () => set({ user: null }),
    }),
    {
      name: 'mi-alberdi-auth-storage',
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
