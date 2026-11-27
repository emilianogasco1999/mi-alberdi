'use client';

import { AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputField } from '@/components/Form/InputField';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { InvalidCredentialsError } from '../../domain/errors/auth.errors';
import { useLoginMutation } from '../mutations/useLoginMutation';
import { loginSchema, type LoginFormValues } from '../validation/login.validation';

const GENERIC_ERROR_MESSAGE = 'No pudimos iniciar sesión. Intentá de nuevo en unos minutos.';

interface LoginFormProps {
  returnUrl?: string | null;
}

export function LoginForm({ returnUrl }: LoginFormProps) {
  const { mutate: login, isPending, isError, error: loginError } = useLoginMutation({ returnUrl });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    login(values);
  };

  const errorMessage =
    loginError instanceof InvalidCredentialsError ? loginError.message : GENERIC_ERROR_MESSAGE;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
      {isError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-input border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{errorMessage}</p>
        </div>
      )}

      <FieldGroup>
        <InputField
          label="Correo electrónico"
          type="email"
          placeholder="vecino@mialberdi.com.ar"
          disabled={isPending}
          error={errors.email?.message}
          {...register('email')}
        />

        <InputField
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          disabled={isPending}
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" disabled={isPending} className="mt-2 w-full">
          {isPending ? 'Ingresando...' : 'Iniciar sesión'}
        </Button>
      </FieldGroup>
    </form>
  );
}
