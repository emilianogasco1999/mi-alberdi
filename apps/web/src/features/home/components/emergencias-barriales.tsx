import { Flame, HeartPulse, Phone, Siren, type LucideIcon } from 'lucide-react';
import { EMERGENCIAS, type EmergenciaId } from '../domain/constants/emergencias';

const ICONOS: Record<EmergenciaId, LucideIcon> = {
  policia: Siren,
  bomberos: Flame,
  salud: HeartPulse,
};

export function EmergenciasBarriales() {
  return (
    <section aria-labelledby="emergencias-titulo" className="pt-10 text-left">
      <h2
        id="emergencias-titulo"
        className="font-display text-xl font-semibold uppercase tracking-wide text-ink"
      >
        Números de emergencia
      </h2>
      <p className="mt-1 text-sm text-muted">
        Tocá un número para llamar desde tu celular.
      </p>

      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {EMERGENCIAS.map(({ id, nombre, numero }) => {
          const Icono = ICONOS[id];
          return (
            <li key={id}>
              <a
                href={`tel:${numero}`}
                aria-label={`Llamar a ${nombre}: ${numero}`}
                className="flex items-center gap-4 rounded-card bg-red-700 px-5 py-4 text-white shadow-sm transition-transform hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2 motion-safe:active:scale-[0.97]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <Icono className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-medium">{nombre}</span>
                  <span className="font-display text-3xl font-semibold leading-none tracking-wide">
                    {numero}
                  </span>
                </span>
                <Phone className="ml-auto h-5 w-5 opacity-80" aria-hidden="true" />
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
