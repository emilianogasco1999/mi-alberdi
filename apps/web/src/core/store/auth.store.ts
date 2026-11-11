'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUserDTO } from '@mi-alberdi/shared';

interface AuthState {
  user: AuthUserDTO | null;
  accessToken: string | null;
  setSession: (user: AuthUserDTO, accessToken: string) => void;
  clearSession: () => void;
}

/**
 * Store de sesión pública.
 * REGLA DE SEGURIDAD (@pnpm-monorepo): NUNCA persistir refreshToken en localStorage.
 * El refreshToken viaja únicamente por cookie httpOnly.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setSession: (user, accessToken) => set({ user, accessToken }),
      clearSession: () => set({ user: null, accessToken: null }),
    }),
    {
      name: 'mi-alberdi-auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    },
  ),
);
