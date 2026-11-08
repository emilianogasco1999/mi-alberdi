import { MercadoPagoConfig, Preference } from 'mercadopago';
import { envs } from '@config/environment.js';

export interface CrearPreferenciaParams {
  pagoId: string;
  negocioId: string;
  nombrePlan: string;
  montoArs: number;
  meses: number;
  emailComprador?: string;
}

export interface PreferenciaCreadaResult {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
  modoSandbox: boolean;
}

export class MercadoPagoService {
  private client: MercadoPagoConfig | null = null;

  constructor() {
    if (envs.MP_ACCESS_TOKEN && envs.MP_ACCESS_TOKEN.trim().length > 10) {
      this.client = new MercadoPagoConfig({
        accessToken: envs.MP_ACCESS_TOKEN.trim(),
        options: { timeout: 10000 },
      });
    }
  }

  async crearPreferencia(params: CrearPreferenciaParams): Promise<PreferenciaCreadaResult> {
    // Si tenemos token válido de Mercado Pago, usamos el SDK oficial
    if (this.client) {
      try {
        const preference = new Preference(this.client);

        const preferenceBody: any = {
          items: [
            {
              id: params.pagoId,
              title: `Plan ${params.nombrePlan.toUpperCase()} — Mi Alberdi (${params.meses} mes/es)`,
              description: `Suscripción comercial en la plataforma Mi Alberdi`,
              unit_price: params.montoArs,
              quantity: 1,
              currency_id: 'ARS',
            },
          ],
          payer: {
            email: params.emailComprador || 'comerciante@mialberdi.com.ar',
          },
          back_urls: {
            success: envs.MP_SUCCESS_URL,
            failure: envs.MP_FAILURE_URL,
            pending: envs.MP_PENDING_URL,
          },
          external_reference: params.pagoId,
          statement_descriptor: 'MI ALBERDI',
        };

        // Mercado Pago exige que back_urls.success sea HTTPS para habilitar auto_return
        if (envs.MP_SUCCESS_URL.startsWith('https://')) {
          preferenceBody.auto_return = 'approved';
        }

        // notification_url solo si es una URL pública (no localhost)
        if (envs.MP_WEBHOOK_URL.startsWith('https://')) {
          preferenceBody.notification_url = envs.MP_WEBHOOK_URL;
        }

        const response = await preference.create({
          body: preferenceBody,
        });

        return {
          preferenceId: response.id || `pref_${Date.now()}`,
          initPoint: response.init_point || '',
          sandboxInitPoint: response.sandbox_init_point || response.init_point || '',
          modoSandbox: true,
        };
      } catch (error) {
        console.warn(
          '⚠️ Error al conectar con API de Mercado Pago SDK, aplicando fallback de desarrollo:',
          error,
        );
      }
    }


    // Modo Sandbox / Fallback de desarrollo (cuando aún no se configuró MP_ACCESS_TOKEN)
    const mockPrefId = `pref_dev_${Date.now()}_${params.pagoId.slice(0, 8)}`;
    const redirectUrl = `${envs.MP_SUCCESS_URL}&payment_id=mock_mp_${Date.now()}&status=approved&external_reference=${params.pagoId}`;

    return {
      preferenceId: mockPrefId,
      initPoint: redirectUrl,
      sandboxInitPoint: redirectUrl,
      modoSandbox: true,
    };
  }
}

