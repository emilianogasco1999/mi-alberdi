'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  crearUsuarioComercianteSchema,
  type CrearUsuarioComercianteInput,
} from '@mi-alberdi/shared';
import { InputField } from '@/components/Form/InputField';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { parseApiError } from '@/core/api/api-error';
import { useCrearComercianteMutation } from '../presentation/mutations/useCrearComercianteMutation';
import { CredencialesModal, type CredencialesGeneradas } from './credenciales-modal';

const EMAIL_DUPLICADO_FALLBACK =
  'El correo electrónico ya se encuentra registrado en el sistema';

export function CrearComercianteForm() {
  const { mutate: crearComerciante, isPending } = useCrearComercianteMutation();
  const [credenciales, setCredenciales] = useState<CredencialesGeneradas | null>(null);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    reset,
    formState: { errors },
  } = useForm<CrearUsuarioComercianteInput>({
    resolver: zodResolver(crearUsuarioComercianteSchema),
    mode: 'onTouched',
    defaultValues: { nombre: '', email: '', password: '' },
  });

  const onSubmit = (values: CrearUsuarioComercianteInput) => {
    crearComerciante(values, {
      onSuccess: (usuario) => {
        setCredenciales({
          nombre: usuario.nombre,
          email: usuario.email,
          // La API nunca devuelve la contraseña: se muestra la que ingresó el admin.
          password: values.password,
        });
      },
      onError: (error) => {
        const { status, message } = parseApiError(error);

        if (status === 409) {
          setError('email', { type: 'server', message: message ?? EMAIL_DUPLICADO_FALLBACK });
          setFocus('email');
          return;
        }
        if (status === 401 || status === 403) {
          toast.error('Tu sesión expiró o no tenés permisos para crear comerciantes.');
          return;
        }
        toast.error('No pudimos crear la cuenta. Intentá de nuevo en unos minutos.');
      },
    });
  };

  const handleCerrarModal = () => {
    setCredenciales(null);
    setMostrarPassword(false);
    reset();
    setFocus('nombre');
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full" aria-busy={isPending}>
        <FieldGroup>
          <InputField
            label="Nombre del comerciante"
            type="text"
            autoComplete="off"
            placeholder="Ferretería El Tornillo"
            disabled={isPending}
            error={errors.nombre?.message}
            {...register('nombre')}
          />

          <InputField
            label="Correo electrónico"
            type="email"
            autoComplete="off"
            placeholder="comercio@mialberdi.com.ar"
            disabled={isPending}
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="flex flex-col gap-2">
            <InputField
              label="Contraseña inicial"
              type={mostrarPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres, con letras y números"
              disabled={isPending}
              error={errors.password?.message}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setMostrarPassword((visible) => !visible)}
              aria-pressed={mostrarPassword}
              disabled={isPending}
              className="inline-flex w-fit items-center gap-1.5 rounded-chip text-xs font-medium text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
            >
              {mostrarPassword ? (
                <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            </button>
          </div>

          <Button type="submit" disabled={isPending} className="mt-2 w-full">
            {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {isPending ? 'Creando cuenta...' : 'Crear cuenta de comerciante'}
          </Button>
        </FieldGroup>
      </form>

      <CredencialesModal credenciales={credenciales} onClose={handleCerrarModal} />
    </>
  );
}
