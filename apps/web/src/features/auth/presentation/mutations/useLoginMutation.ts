'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { LoginInput } from '@mi-alberdi/shared';
import { useAuthStore } from '@/core/store/auth.store';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { AuthRepositoryImpl } from '../../infrastructure/repositories/auth.repository.impl';

export function useLoginMutation() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  const authRepository = new AuthRepositoryImpl();
  const loginUseCase = new LoginUseCase(authRepository);

  return useMutation({
    mutationFn: (credentials: LoginInput) => loginUseCase.execute(credentials),
    onSuccess: (session) => {
      setSession(session.user.toDTO());
      toast.success(`¡Bienvenido a Mi Alberdi, ${session.user.nombreCompleto}!`);
      router.push('/');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { status?: number } };
      const message =
        err?.response?.status === 401 || err?.response?.status === 400
          ? 'Correo o contraseña incorrectos.'
          : 'No se pudo iniciar sesión. Intentá de nuevo en unos minutos.';
      toast.error(message);
    },
  });
}
