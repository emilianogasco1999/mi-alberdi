'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { LoginInput } from '@mi-alberdi/shared';
import { useAuthStore } from '@/core/store/auth.store';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { resolvePostLoginRoute } from '../../domain/services/post-login-route';
import { AuthRepositoryImpl } from '../../infrastructure/repositories/auth.repository.impl';

interface UseLoginMutationOptions {
  /** Internal path to return to after a successful login (from `?returnUrl=`). */
  returnUrl?: string | null;
}

export function useLoginMutation({ returnUrl }: UseLoginMutationOptions = {}) {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  const authRepository = new AuthRepositoryImpl();
  const loginUseCase = new LoginUseCase(authRepository);

  return useMutation({
    mutationFn: (credentials: LoginInput) => loginUseCase.execute(credentials),
    onSuccess: (session) => {
      const user = session.user.toDTO();
      setSession(user);
      toast.success(`¡Bienvenido a Mi Alberdi, ${session.user.nombreCompleto}!`);
      router.push(resolvePostLoginRoute(user.rol, returnUrl));
    },
  });
}
