'use client';

import { useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { CrearUsuarioComercianteInput } from '@mi-alberdi/shared';
import { CrearComercianteUseCase } from '../../application/use-cases/crear-comerciante.use-case';
import { UsuariosAdminRepositoryImpl } from '../../infrastructure/repositories/usuarios-admin.repository.impl';

export function useCrearComercianteMutation() {
  const useCase = useMemo(
    () => new CrearComercianteUseCase(new UsuariosAdminRepositoryImpl()),
    [],
  );

  return useMutation({
    mutationFn: (input: CrearUsuarioComercianteInput) => useCase.execute(input),
  });
}
