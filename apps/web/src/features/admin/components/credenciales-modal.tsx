'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Check, Copy, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface CredencialesGeneradas {
  nombre: string;
  email: string;
  password: string;
}

interface CredencialesModalProps {
  credenciales: CredencialesGeneradas | null;
  onClose: () => void;
}

type EstadoCopiado = 'idle' | 'copiado' | 'error';

const COPIADO_TIMEOUT_MS = 2500;

/**
 * Diálogo accesible post-alta. Usa <dialog> nativo (focus trap, cierre con Esc
 * y foco devuelto al elemento previo sin dependencias extra).
 */
export function CredencialesModal({ credenciales, onClose }: CredencialesModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [estadoCopiado, setEstadoCopiado] = useState<EstadoCopiado>('idle');

  const open = credenciales !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (estadoCopiado === 'idle') return;
    const timeout = setTimeout(() => setEstadoCopiado('idle'), COPIADO_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [estadoCopiado]);

  const handleCopiar = async () => {
    if (!credenciales) return;
    try {
      await navigator.clipboard.writeText(
        `Email: ${credenciales.email}\nContraseña: ${credenciales.password}`,
      );
      setEstadoCopiado('copiado');
    } catch {
      setEstadoCopiado('error');
    }
  };

  const handleClose = () => {
    setEstadoCopiado('idle');
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        handleClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-panel border border-hairline bg-white p-8 text-ink backdrop:bg-ink/40"
    >
      {credenciales && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <h2 id={titleId} className="font-display text-xl font-semibold text-primary">
              Cuenta creada con éxito
            </h2>
            <p id={descriptionId} className="text-sm text-ink-soft">
              Compartí estas credenciales con <strong>{credenciales.nombre}</strong> para que
              pueda ingresar a Mi Alberdi.
            </p>
          </div>

          <dl className="flex flex-col gap-3 rounded-card bg-surface-faint p-4 text-sm">
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium text-muted">Correo electrónico</dt>
              <dd className="break-all font-medium text-ink">{credenciales.email}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium text-muted">Contraseña provisoria</dt>
              <dd className="break-all font-mono font-medium text-ink">
                {credenciales.password}
              </dd>
            </div>
          </dl>

          <div className="flex items-start gap-2 rounded-card border border-cream bg-cream-light p-3 text-xs font-medium text-primary">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>Esta contraseña no volverá a mostrarse</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row-reverse">
            <Button type="button" onClick={handleCopiar} className="flex-1">
              {estadoCopiado === 'copiado' ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {estadoCopiado === 'copiado' ? '¡Copiado!' : 'Copiar credenciales'}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cerrar y crear otra
            </Button>
          </div>

          <p role="status" aria-live="polite" className="min-h-4 text-xs text-muted">
            {estadoCopiado === 'copiado' && 'Credenciales copiadas al portapapeles.'}
            {estadoCopiado === 'error' &&
              'No se pudo copiar automáticamente. Seleccioná el texto y copialo a mano.'}
          </p>
        </div>
      )}
    </dialog>
  );
}
