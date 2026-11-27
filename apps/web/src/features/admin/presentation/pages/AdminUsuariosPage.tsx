'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/core/store/auth.store';
import { useAuthHydrated } from '@/core/store/useAuthHydrated';
import { CrearComercianteForm } from '../../components/crear-comerciante-form';

/**
 * Vista administrativa de alta de comerciantes.
 * La guarda de rol es solo UX: la autorización real la impone la API (401/403).
 */
export function AdminUsuariosPage() {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (hydrated && !user) {
      router.replace('/login');
    }
  }, [hydrated, user, router]);

  if (!hydrated || !user) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4">
        <p role="status" className="text-sm text-muted">
          Verificando sesión...
        </p>
      </main>
    );
  }

  if (user.rol !== 'admin') {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md space-y-3 text-center">
          <h1 className="font-display text-2xl font-bold text-ink">Acceso restringido</h1>
          <p className="text-sm text-muted">
            Solo los administradores pueden dar de alta cuentas de comerciantes.
          </p>
          <Link href="/" className="text-sm font-medium text-primary hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-cream-light px-4 py-12 sm:px-6">
      <div className="mx-auto w-full max-w-lg space-y-6">
        <header className="space-y-2">
          <span className="inline-block rounded-chip bg-cream px-2.5 py-1.5 text-[11px] font-semibold text-primary">
            Panel de administración
          </span>
          <h1 className="font-display text-3xl font-bold text-ink">Alta de comerciantes</h1>
          <p className="text-sm text-ink-soft">
            Creá la cuenta de un comerciante con una contraseña inicial. Después podrás
            compartirle las credenciales para que ingrese.
          </p>
        </header>

        <section
          aria-label="Formulario de alta de comerciante"
          className="rounded-panel border border-hairline bg-white p-8"
        >
          <CrearComercianteForm />
        </section>
      </div>
    </main>
  );
}
