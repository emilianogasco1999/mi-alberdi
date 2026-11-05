'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputField } from '@/components/Form/InputField';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { useLoginMutation } from '../mutations/useLoginMutation';
import { loginSchema, type LoginFormValues } from '../validation/login.validation';

export function LoginForm() {
  const { mutate: login, isPending } = useLoginMutation();

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
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
