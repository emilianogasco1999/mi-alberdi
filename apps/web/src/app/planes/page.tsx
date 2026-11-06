import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PlanesPage } from '@/features/membresias/presentation/pages/PlanesPage';

export const metadata: Metadata = {
  title: 'Planes y Precios | Mi Alberdi',
  description: 'Conocé los planes de suscripción para comercios y oficios en Juan Bautista Alberdi',
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <p className="text-slate-500 font-medium">Cargando planes...</p>
        </div>
      }
    >
      <PlanesPage />
    </Suspense>
  );
}
