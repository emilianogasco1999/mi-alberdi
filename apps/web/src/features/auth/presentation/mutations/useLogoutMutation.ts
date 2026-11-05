'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/core/store/auth.store';
import { AuthRepositoryImpl } from '../../infrastructure/repositories/auth.repository.impl';

export function useLogoutMutation() {
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);
  const authRepository = new AuthRepositoryImpl();

  return useMutation({
    mutationFn: () => authRepository.logout(),
    onSuccess: () => {
      clearSession();
      toast.success('Sesión cerrada correctamente');
      router.push('/');
    },
    onError: () => {
      // Incluso si la API falla, limpiamos la sesión localmente
      clearSession();
      router.push('/');
    },
  });
}

