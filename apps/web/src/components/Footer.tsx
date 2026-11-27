import Link from 'next/link';

const ENLACES = [
  { href: '/quienes-somos', label: 'Quiénes somos' },
  { href: '/faq', label: 'Preguntas frecuentes' },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-cream-light">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-display text-lg font-semibold uppercase tracking-wide text-primary">
            Mi Alberdi
          </p>
          <p className="text-sm text-muted">Juan Bautista Alberdi, Tucumán</p>
        </div>
        <nav aria-label="Información institucional">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-ink-soft">
            {ENLACES.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="hover:text-primary hover:underline">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
