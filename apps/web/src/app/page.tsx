import Link from 'next/link';
import { Store, Wrench, MapPin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
      <div className="space-y-6 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3.5 py-1 text-xs font-semibold text-blue-800">
          <MapPin className="h-3.5 w-3.5" />
          Juan Bautista Alberdi, Tucumán
        </span>

        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Mi Alberdi
        </h1>

        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          La guía digital de nuestra ciudad: comercios, oficios, profesionales y emprendimientos
          con contacto directo por WhatsApp y sin comisiones.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Button asChild size="lg">
            <Link href="/login">Publicar mi Negocio u Oficio</Link>
          </Button>
        </div>

        <div className="grid gap-4 pt-10 text-left sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <Store className="mb-3 h-6 w-6 text-blue-600" />
            <h2 className="font-semibold text-slate-900">Comercios y Sucursales</h2>
            <p className="mt-1 text-sm text-slate-600">
              Vidriera digital con ubicación en el mapa, horarios cortados y catálogo.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <Wrench className="mb-3 h-6 w-6 text-blue-600" />
            <h2 className="font-semibold text-slate-900">Oficios y Profesionales</h2>
            <p className="mt-1 text-sm text-slate-600">
              Plomeros, electricistas, gasistas y profesionales a domicilio o por turno.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <MessageCircle className="mb-3 h-6 w-6 text-blue-600" />
            <h2 className="font-semibold text-slate-900">Contacto 100% Directo</h2>
            <p className="mt-1 text-sm text-slate-600">
              Hablás directo al WhatsApp del comerciante o especialista sin intermediarios.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
