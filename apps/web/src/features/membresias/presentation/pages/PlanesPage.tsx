'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, ShieldCheck, Zap, CreditCard, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { apiClient } from '@/core/api/api.client';
import { useAuthStore } from '@/core/store/auth.store';
import type { PlanCatalogoDTO, PreferenciaMpResponseDTO } from '@mi-alberdi/shared';

export function PlanesPage() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');

  const { user, accessToken } = useAuthStore();
  const [planes, setPlanes] = useState<PlanCatalogoDTO[]>([]);
  const [negocioId, setNegocioId] = useState<string>('f549aa39-a7ed-4e02-ac6d-ea3a50f62977');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [preferenciaGenerada, setPreferenciaGenerada] = useState<PreferenciaMpResponseDTO | null>(null);
  const [simulando, setSimulando] = useState(false);

  useEffect(() => {
    // 1. Cargar planes públicos
    apiClient
      .get<{ data: PlanCatalogoDTO[] }>('/membresias/planes')
      .then((res) => {
        if (res.data?.data) {
          setPlanes(res.data.data);
        }
      })
      .catch((err) => {
        console.error('Error cargando planes:', err);
      });

    // 2. Revisar si viene de retorno de Mercado Pago
    if (statusParam === 'success') {
      setMensajeExito('¡Pago completado con éxito! Tu plan se encuentra activo.');
    } else if (statusParam === 'failure') {
      setMensajeError('El pago fue cancelado o rechazado por Mercado Pago.');
    } else if (statusParam === 'pending') {
      setMensajeExito('Tu pago está pendiente de acreditación en Mercado Pago.');
    }
  }, [statusParam]);

  const handlePagarConMercadoPago = async (planCodigo: 'plata' | 'oro') => {
    if (!accessToken) {
      setMensajeError('No se encontró una sesión activa. Por favor iniciá sesión en /login primero.');
      return;
    }

    if (!negocioId.trim()) {
      setMensajeError('Por favor ingresá un ID de negocio válido para asociar el plan');
      return;
    }

    setLoadingPlan(planCodigo);
    setMensajeError(null);
    setMensajeExito(null);

    try {
      const response = await apiClient.post<{ data: PreferenciaMpResponseDTO }>(
        '/membresias/pagos/mercadopago/checkout',
        {
          negocioId: negocioId.trim(),
          planCodigo,
          periodoMeses: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const data = response.data.data;
      setPreferenciaGenerada(data);

      // Si tiene URL de pasarela real de Mercado Pago (sandbox o producción)
      const urlPago = data.sandboxInitPoint || data.initPoint;

      if (urlPago.startsWith('https://')) {
        // Abrir pasarela de Mercado Pago en una pestaña nueva
        window.open(urlPago, '_blank', 'noopener,noreferrer');
        setMensajeExito(
          'Se abrió la pasarela de Mercado Pago en una nueva pestaña. Cuando termines de pagar, podés simular la aprobación con el botón debajo para activar la membresía al instante.',
        );
      } else {
        setMensajeExito(
          `Preferencia generada en Sandbox. Pago ID: ${data.pagoId}. Podés simular la aprobación con el botón debajo.`,
        );
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Error al iniciar checkout con Mercado Pago';
      setMensajeError(msg);
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleSimularAprobacion = async () => {
    if (!preferenciaGenerada?.pagoId) return;

    setSimulando(true);
    try {
      await apiClient.post('/membresias/pagos/sandbox/simular', {
        pagoId: preferenciaGenerada.pagoId,
        estado: 'approved',
      });

      setMensajeExito(
        '¡Pago simulado y APROBADO con éxito! La membresía fue activada y los entitlements sincronizados en la base de datos.',
      );
      setPreferenciaGenerada(null);
    } catch (err: any) {
      setMensajeError(err.response?.data?.error?.message || 'Error al simular pago');
    } finally {
      setSimulando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Cabecera */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Planes de Suscripción — Mi Alberdi
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Impulsá tu comercio u oficio en Alberdi
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-base text-slate-600">
            Precios justos y transparentes pensados para apoyar al comercio y prestador local.
          </p>

          {/* Estado de Sesión */}
          <div className="mt-4 flex justify-center">
            {user && accessToken ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  Sesión activa: <strong>{user.nombre}</strong> ({user.email}) — Rol: <strong>{user.rol}</strong>
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                <span>⚠️ No estás logueado.</span>
                <a href="/login" className="font-bold underline hover:text-amber-950">
                  Iniciar sesión aquí
                </a>
              </div>
            )}
          </div>
        </div>


        {/* Input de Negocio para Pruebas */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-8 max-w-xl mx-auto">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            ID de Negocio a suscriptor (UUID de prueba)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={negocioId}
              onChange={(e) => setNegocioId(e.target.value)}
              placeholder="Ej: f549aa39-a7ed-4e02-ac6d-ea3a50f62977"
              className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Por defecto cargado con <strong>Sandwichería Ema</strong> (perfil de prueba).
          </p>
        </div>

        {/* Notificaciones de Éxito / Error */}
        {mensajeExito && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">{mensajeExito}</p>
            </div>
          </div>
        )}

        {mensajeError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <p className="font-semibold text-sm">{mensajeError}</p>
          </div>
        )}

        {/* Modal / Card de Simulación Sandbox */}
        {preferenciaGenerada && (
          <div className="mb-8 p-6 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-md">
            <div className="flex items-center gap-2 mb-2 text-amber-900 font-bold">
              <Zap className="w-5 h-5 text-amber-600" />
              <span>Modo Sandbox Mercado Pago — Pago Creado</span>
            </div>
            <p className="text-sm text-amber-800 mb-4">
              Se generó la orden de pago <strong>{preferenciaGenerada.pagoId}</strong> por{' '}
              <strong>${preferenciaGenerada.montoArs} ARS</strong> para el Plan{' '}
              <strong>{preferenciaGenerada.planCodigo.toUpperCase()}</strong>.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSimularAprobacion}
                disabled={simulando}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm text-sm transition-colors flex items-center gap-2"
              >
                {simulando ? 'Simulando...' : '⚡ Simular Aprobación Instantánea (Webhook)'}
              </button>
              {preferenciaGenerada.sandboxInitPoint.startsWith('https://') && (
                <a
                  href={preferenciaGenerada.sandboxInitPoint}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-[#009EE3] hover:bg-[#0081ba] text-white font-semibold rounded-lg shadow-sm text-sm transition-colors flex items-center gap-2"
                >
                  Abrir Checkout Mercado Pago <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Grilla de Planes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 1. Plan Gratis */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Para empezar
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">Vecino Gratis</h3>
              <p className="text-sm text-slate-600 mt-2">
                Ideal para trabajadores de un oficio o emprendimientos desde el hogar.
              </p>
              <div className="mt-6 flex items-baseline">
                <span className="text-4xl font-extrabold text-slate-900">$0</span>
                <span className="text-slate-500 ml-1 text-sm font-medium">/mes</span>
              </div>

              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Hasta 2 publicaciones activas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>1 sucursal en el mapa de Alberdi</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Botón directo a WhatsApp</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Código QR para vidriera</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100">
              <span className="block text-center text-xs font-semibold text-slate-400 py-2">
                Plan Activo por Defecto
              </span>
            </div>
          </div>

          {/* 2. Plan Plata */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-300 p-6 flex flex-col justify-between relative">
            <div>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Recomendado Comercios
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">Comercio Plata</h3>
              <p className="text-sm text-slate-600 mt-2">
                Visibilidad ampliada con Estrella de Vidriera y múltiples sucursales.
              </p>
              <div className="mt-6 flex items-baseline">
                <span className="text-4xl font-extrabold text-slate-900">$1.500</span>
                <span className="text-slate-500 ml-1 text-sm font-medium">ARS /mes</span>
              </div>

              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                <li className="flex items-center gap-2 font-medium text-slate-900">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>1 Cupo de Destacado (Estrella de Vidriera)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Hasta 10 publicaciones activas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Hasta 3 sucursales en el mapa</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Sello de Perfil Verificado</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Panel de estadísticas de visitas</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100">
              <button
                onClick={() => handlePagarConMercadoPago('plata')}
                disabled={loadingPlan === 'plata'}
                className="w-full py-3 px-4 bg-[#009EE3] hover:bg-[#0081ba] text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                {loadingPlan === 'plata' ? 'Generando...' : 'Pagar con Mercado Pago'}
              </button>
            </div>
          </div>

          {/* 3. Plan Oro */}
          <div className="bg-gradient-to-b from-amber-50/40 to-white rounded-2xl shadow-lg border-2 border-amber-400 p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-400 text-amber-950 text-xs font-black px-3 py-1 rounded-bl-lg uppercase tracking-wider">
              Máxima Visibilidad
            </div>
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Impulso Total
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">Impulso Oro</h3>
              <p className="text-sm text-slate-600 mt-2">
                Todo desbloqueado para liderar en búsquedas y portada de Alberdi.
              </p>
              <div className="mt-6 flex items-baseline">
                <span className="text-4xl font-extrabold text-slate-900">$2.500</span>
                <span className="text-slate-500 ml-1 text-sm font-medium">ARS /mes</span>
              </div>

              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                <li className="flex items-center gap-2 font-bold text-slate-900">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>3 Cupos de Destacados en Portada</span>
                </li>
                <li className="flex items-center gap-2 font-semibold text-slate-900">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Máxima prioridad en ranking de búsqueda</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Publicaciones ilimitadas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Hasta 10 sucursales activas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Banner destacado en portada</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Historias / Reels diarios</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100">
              <button
                onClick={() => handlePagarConMercadoPago('oro')}
                disabled={loadingPlan === 'oro'}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#009EE3] to-[#007cb3] hover:from-[#008dc9] hover:to-[#006e9f] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                {loadingPlan === 'oro' ? 'Generando...' : 'Pagar con Mercado Pago'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

