import type { Metadata } from 'next';
import { QUIENES_SOMOS } from '@/features/institucional/domain/constants/institucional.content';

export const metadata: Metadata = {
  title: 'Quiénes somos | Mi Alberdi',
  description: 'Conocé la misión y la visión de Mi Alberdi, la guía digital de Juan Bautista Alberdi.',
};

export default function QuienesSomosPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-4xl font-semibold uppercase tracking-wide text-primary">
        Quiénes somos
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-soft">{QUIENES_SOMOS.intro}</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <section className="rounded-card bg-cream-light p-6">
          <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-primary">
            Misión
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{QUIENES_SOMOS.mision}</p>
        </section>
        <section className="rounded-card bg-cream-light p-6">
          <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-primary">
            Visión
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{QUIENES_SOMOS.vision}</p>
        </section>
      </div>
    </main>
  );
}
