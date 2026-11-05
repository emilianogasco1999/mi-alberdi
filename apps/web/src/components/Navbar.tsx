'use client';

import Link from 'next/link';
import { User as UserIcon, LogOut, ShieldCheck, Store } from 'lucide-react';
import { useAuthStore } from '@/core/store/auth.store';
import { Button } from '@/components/ui/button';
import { useLogoutMutation } from '@/features/auth/presentation/mutations/useLogoutMutation';

export function Navbar() {
  const user = useAuthStore((state) => state.user);
  const { mutate: logout, isPending } = useLogoutMutation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-xs">
            A
          </span>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-slate-900 leading-tight">
              Mi Alberdi
            </span>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              Tucumán
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Tarjeta con datos del usuario logueado */}
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 shadow-2xs">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <UserIcon className="h-4 w-4" />
                </div>
                <div className="hidden flex-col text-left sm:flex">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-800">
                      {user.nombre} {user.apellido ?? ''}
                    </span>
                    {user.rol === 'admin' && (
                      <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-100 px-1.5 py-0.2 text-[10px] font-bold text-amber-800">
                        <ShieldCheck className="h-3 w-3" />
                        Admin
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 truncate max-w-[160px]">
                    {user.email}
                  </span>
                </div>
              </div>

              {/* Botón Cerrar Sesión */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => logout()}
                disabled={isPending}
                className="gap-1.5 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/login">Ingresar</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/login" className="gap-1.5">
                  <Store className="h-3.5 w-3.5" />
                  <span>Publicar</span>
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

