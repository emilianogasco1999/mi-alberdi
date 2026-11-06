import {
  ForbiddenError,
  NotFoundError,
  ClientError,
} from '@core/domain/errors/appErrors.js';
import type {
  SolicitarCambioPlanInput,
  MembresiaDTO,
  PagoMembresiaDTO,
} from '@mi-alberdi/shared';
import type { IMembresiasRepository } from '../../domain/repositories/IMembresiasRepository.js';

export interface SolicitarCambioPlanResult {
  tipo: 'cambio_a_gratis' | 'prueba_activada' | 'pago_requerido';
  mensaje: string;
  membresia?: MembresiaDTO;
  pago?: PagoMembresiaDTO;
}

export class SolicitarCambioPlanUseCase {
  constructor(private readonly repository: IMembresiasRepository) {}

  async execute(
    usuarioId: string,
    rol: string,
    input: SolicitarCambioPlanInput,
  ): Promise<SolicitarCambioPlanResult> {
    const ownerId = await this.repository.getNegocioOwnerId(input.negocioId);
    if (!ownerId) {
      throw NotFoundError('Negocio no encontrado');
    }

    const esAdmin = rol === 'administrador' || rol === 'moderador';
    if (ownerId !== usuarioId && !esAdmin) {
      throw ForbiddenError('No tienes permisos para modificar el plan de este negocio');
    }

    // Caso 1: Cambio a Plan Gratis
    if (input.nuevoPlan === 'gratis') {
      await this.repository.cambiarAPlanGratis(input.negocioId);
      return {
        tipo: 'cambio_a_gratis',
        mensaje: 'Tu negocio ha pasado al Plan Gratis. Las publicaciones y sucursales excedentes se han pausado ordenadamente.',
      };
    }

    // Caso 2: Verificar si califica para prueba gratuita
    const puedeProbar = await this.repository.getUsuarioPuedeProbarPremium(usuarioId);
    if (puedeProbar) {
      const membresiaPrueba = await this.repository.crearMembresiaPrueba({
        negocioId: input.negocioId,
        usuarioId,
        planCodigo: input.nuevoPlan,
        diasPrueba: 14,
      });

      return {
        tipo: 'prueba_activada',
        mensaje: `¡Felicidades! Activaste 14 días de prueba gratuita del Plan ${input.nuevoPlan.toUpperCase()}. Todos los beneficios están habilitados.`,
        membresia: membresiaPrueba,
      };
    }

    // Caso 3: Plan pago con orden de pago
    const planInfo = await this.repository.getPlanPorCodigo(input.nuevoPlan);
    if (!planInfo) {
      throw NotFoundError('El plan seleccionado no existe');
    }

    const meses = input.periodoMeses || 1;
    const montoArs = planInfo.precioMensualArs * meses;

    const solicitud = await this.repository.crearSolicitudPago({
      negocioId: input.negocioId,
      usuarioId,
      planCodigo: input.nuevoPlan,
      meses,
      autoRenovar: input.autoRenovar,
      pasarela: 'transferencia_manual',
      montoArs,
    });

    return {
      tipo: 'pago_requerido',
      mensaje: `Solicitud de suscripción al Plan ${input.nuevoPlan.toUpperCase()} creada. Realiza el pago o sube tu comprobante para activar los beneficios.`,
      membresia: solicitud.membresia,
      pago: solicitud.pago,
    };
  }
}
