import type { Metadata } from 'next';
import { FaqAccordion } from '@/features/institucional/components/faq-accordion';
import { PREGUNTAS_FRECUENTES } from '@/features/institucional/domain/constants/institucional.content';

export const metadata: Metadata = {
  title: 'Preguntas frecuentes | Mi Alberdi',
  description: 'Respuestas a las preguntas más frecuentes de vecinos y comerciantes de Mi Alberdi.',
};

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-4xl font-semibold uppercase tracking-wide text-primary">
        Preguntas frecuentes
      </h1>
      <p className="mt-2 text-muted">Lo que más nos preguntan vecinos y comerciantes.</p>
      <div className="mt-8">
        <FaqAccordion items={PREGUNTAS_FRECUENTES} />
      </div>
    </main>
  );
}
