import type { IMembresiasRepository } from '../../domain/repositories/IMembresiasRepository.js';

export class ProcesarWebhookMercadoPagoUseCase {
  constructor(private readonly repository: IMembresiasRepository) {}

  async execute(payload: any): Promise<{ procesado: boolean; mensaje: string }> {
    // Mercado Pago envía notificaciones en varios formatos:
    // 1. Webhook v2: { action: "payment.updated", data: { id: "12345" }, type: "payment" }
    // 2. IPN query: ?id=12345&topic=payment
    // 3. Simulador / fallback directo: { pagoId: "uuid", estado: "approved" }

    const pagoIdDirecto = payload?.pagoId || payload?.external_reference;
    const estadoDirecto = payload?.estado || payload?.status;

    if (pagoIdDirecto) {
      await this.repository.procesarPagoMercadoPago({
        pagoId: pagoIdDirecto,
        estadoMp: estadoDirecto === 'rejected' ? 'rejected' : 'approved',
        metadata: payload,
      });

      return {
        procesado: true,
        mensaje: `Pago ${pagoIdDirecto} procesado exitosamente`,
      };
    }

    // Si viene la notificación estándar de Mercado Pago por ID
    const mpPaymentId = payload?.data?.id || payload?.id;
    if (mpPaymentId) {
      // En modo desarrollo/sandbox sin API key real o con pago mock:
      console.log(`📡 [Webhook MercadoPago] Notificación recibida para Payment ID: ${mpPaymentId}`);
    }

    return {
      procesado: true,
      mensaje: 'Notificación de webhook recibida',
    };
  }
}
