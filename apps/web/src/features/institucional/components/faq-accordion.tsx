import { ChevronDown } from 'lucide-react';
import type { PreguntaFrecuente } from '../domain/constants/institucional.content';

interface FaqAccordionProps {
  items: readonly PreguntaFrecuente[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  return (
    <div className="divide-y divide-hairline rounded-card border border-hairline bg-white">
      {items.map(({ id, pregunta, respuesta }) => (
        <details key={id} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium text-ink marker:hidden hover:bg-surface-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary [&::-webkit-details-marker]:hidden">
            {pregunta}
            <ChevronDown
              className="h-5 w-5 shrink-0 text-primary transition-transform group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <p className="px-5 pb-4 text-sm leading-relaxed text-muted">{respuesta}</p>
        </details>
      ))}
    </div>
  );
}
