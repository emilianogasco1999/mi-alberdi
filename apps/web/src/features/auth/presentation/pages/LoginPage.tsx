import Link from 'next/link';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Juan Bautista Alberdi
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Ingresar a Mi Alberdi
          </h1>
          <p className="text-sm text-slate-600">
            Gestioná tu comercio, oficio o perfil de vecino
          </p>
        </div>

        <LoginForm />

        <div className="text-center text-xs text-slate-500">
          <Link href="/" className="font-medium text-blue-600 hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
