import Link from 'next/link';

/** Placeholder landing for administrators until the real admin panel exists. */
export function AdminHomePage() {
  return (
    <main className="bg-cream-light px-4 py-12 sm:px-6">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <header className="space-y-2">
          <span className="inline-block rounded-chip bg-cream px-2.5 py-1.5 text-[11px] font-semibold text-primary">
            Panel de administración
          </span>
          <h1 className="font-display text-3xl font-bold text-ink">Bienvenido, administrador</h1>
          <p className="text-sm text-ink-soft">Desde acá vas a gestionar Mi Alberdi.</p>
        </header>

        <Link
          href="/admin/usuarios"
          className="block rounded-card border border-hairline bg-white p-5 transition-colors hover:border-primary"
        >
          <h2 className="font-semibold text-ink">Alta de comerciantes</h2>
          <p className="mt-1 text-sm text-muted">Creá cuentas de comerciantes con una contraseña inicial.</p>
        </Link>
      </div>
    </main>
  );
}
