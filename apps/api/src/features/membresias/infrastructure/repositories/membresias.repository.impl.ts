import { prisma } from '@core/infrastructure/database/prisma.service.js';
import { ClientError, NotFoundError } from '@core/domain/errors/appErrors.js';
import type {
  CodigoPlan,
  PlanCatalogoDTO,
  MembresiaDTO,
  PagoMembresiaDTO,
  EstadoMembresiaNegocioDTO,
  PreferenciaMpResponseDTO,
} from '@mi-alberdi/shared';
import type { IMembresiasRepository } from '../../domain/repositories/IMembresiasRepository.js';
import { MercadoPagoService } from '../services/mercadopago.service.js';

export class MembresiasRepositoryImpl implements IMembresiasRepository {
  private readonly mpService = new MercadoPagoService();
  async getPlanesCatalogo(): Promise<PlanCatalogoDTO[]> {
    const planes = await prisma.planCatalogo.findMany({
      where: { activo: true },
      orderBy: { prioridadBase: 'asc' },
    });

    return planes.map((p) => ({
      codigo: p.codigo as CodigoPlan,
      nombre: p.nombre,
      precioMensualArs: Number(p.precioMensualArs),
      maxPublicaciones: p.maxPublicaciones,
      maxFotosPorPublicacion: p.maxFotosPorPublicacion,
      cuposDestacados: p.cuposDestacados,
      maxSucursales: p.maxSucursales,
      maxReelsActivos: p.maxReelsActivos,
      prioridadBase: p.prioridadBase,
      permiteEstadisticas: p.permiteEstadisticas,
      permitePinDestacado: p.permitePinDestacado,
      permiteBanner: p.permiteBanner,
      permiteAsistenteIa: p.permiteAsistenteIa,
      caracteristicasBase: (p.caracteristicasBase as Record<string, unknown>) ?? {},
      activo: p.activo,
    }));
  }

  async getPlanPorCodigo(codigo: CodigoPlan): Promise<PlanCatalogoDTO | null> {
    const p = await prisma.planCatalogo.findUnique({
      where: { codigo },
    });

    if (!p) return null;

    return {
      codigo: p.codigo as CodigoPlan,
      nombre: p.nombre,
      precioMensualArs: Number(p.precioMensualArs),
      maxPublicaciones: p.maxPublicaciones,
      maxFotosPorPublicacion: p.maxFotosPorPublicacion,
      cuposDestacados: p.cuposDestacados,
      maxSucursales: p.maxSucursales,
      maxReelsActivos: p.maxReelsActivos,
      prioridadBase: p.prioridadBase,
      permiteEstadisticas: p.permiteEstadisticas,
      permitePinDestacado: p.permitePinDestacado,
      permiteBanner: p.permiteBanner,
      permiteAsistenteIa: p.permiteAsistenteIa,
      caracteristicasBase: (p.caracteristicasBase as Record<string, unknown>) ?? {},
      activo: p.activo,
    };
  }

  async getNegocioOwnerId(negocioId: string): Promise<string | null> {
    const negocio = await prisma.negocio.findUnique({
      where: { id: negocioId },
      select: { propietarioId: true },
    });
    return negocio?.propietarioId ?? null;
  }

  async getUsuarioPuedeProbarPremium(usuarioId: string): Promise<boolean> {
    const usuario = await prisma.perfilUsuario.findUnique({
      where: { id: usuarioId },
      select: { puedeProbarPremium: true },
    });
    return usuario?.puedeProbarPremium ?? false;
  }

  async getEstadoNegocio(negocioId: string): Promise<EstadoMembresiaNegocioDTO | null> {
    const negocio = await prisma.negocio.findUnique({
      where: { id: negocioId },
      include: {
        _count: {
          select: {
            publicaciones: {
              where: { esDestacada: true },
            },
            ubicaciones: {
              where: { activaPorPlan: true },
            },
          },
        },
        membresias: {
          where: {
            estado: { in: ['activa', 'en_prueba'] },
          },
          orderBy: { fechaFin: 'desc' },
          take: 1,
          include: {
            plan: true,
            codigoPromocional: {
              select: { codigo: true, descripcion: true },
            },
          },
        },
      },
    });

    if (!negocio) return null;

    const membresiaActual = negocio.membresias[0];
    let membresiaDTO: MembresiaDTO | null = null;

    if (membresiaActual) {
      membresiaDTO = {
        id: membresiaActual.id,
        negocioId: membresiaActual.negocioId,
        planCodigo: membresiaActual.planCodigo as CodigoPlan,
        estado: membresiaActual.estado as any,
        fechaInicio: membresiaActual.fechaInicio.toISOString(),
        fechaFin: membresiaActual.fechaFin.toISOString(),
        esPrueba: membresiaActual.esPrueba,
        codigoPromocionalId: membresiaActual.codigoPromocionalId,
        autoRenovar: membresiaActual.autoRenovar,
        creadoEn: membresiaActual.creadoEn.toISOString(),
        actualizadoEn: membresiaActual.actualizadoEn.toISOString(),
        plan: {
          codigo: membresiaActual.plan.codigo as CodigoPlan,
          nombre: membresiaActual.plan.nombre,
          precioMensualArs: Number(membresiaActual.plan.precioMensualArs),
          maxPublicaciones: membresiaActual.plan.maxPublicaciones,
          maxFotosPorPublicacion: membresiaActual.plan.maxFotosPorPublicacion,
          cuposDestacados: membresiaActual.plan.cuposDestacados,
          maxSucursales: membresiaActual.plan.maxSucursales,
          maxReelsActivos: membresiaActual.plan.maxReelsActivos,
          prioridadBase: membresiaActual.plan.prioridadBase,
          permiteEstadisticas: membresiaActual.plan.permiteEstadisticas,
          permitePinDestacado: membresiaActual.plan.permitePinDestacado,
          permiteBanner: membresiaActual.plan.permiteBanner,
          permiteAsistenteIa: membresiaActual.plan.permiteAsistenteIa,
          caracteristicasBase:
            (membresiaActual.plan.caracteristicasBase as Record<string, unknown>) ?? {},
          activo: membresiaActual.plan.activo,
        },
        codigoPromocional: membresiaActual.codigoPromocional
          ? {
              codigo: membresiaActual.codigoPromocional.codigo,
              descripcion: membresiaActual.codigoPromocional.descripcion,
            }
          : null,
      };
    }

    return {
      negocioId: negocio.id,
      nombreComercial: negocio.nombreComercial,
      planActual: negocio.planActual as CodigoPlan,
      planVenceEn: negocio.planVenceEn ? negocio.planVenceEn.toISOString() : null,
      prioridadPlan: negocio.prioridadPlan,
      cuposDestacadosMax: negocio.cuposDestacadosMax,
      cuposDestacadosEnUso: negocio._count.publicaciones,
      maxSucursales: negocio.maxSucursales,
      sucursalesActivas: negocio._count.ubicaciones,
      entitlements: (negocio.entitlements as Record<string, unknown>) ?? {},
      membresiaActiva: membresiaDTO,
    };
  }

  async cambiarAPlanGratis(negocioId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Cancelar membresías activas o en prueba
      await tx.membresia.updateMany({
        where: {
          negocioId,
          estado: { in: ['activa', 'en_prueba'] },
        },
        data: {
          estado: 'cancelada',
        },
      });

      // Actualizar negocio a plan gratis (trigger PostgreSQL sincroniza y degrada)
      await tx.negocio.update({
        where: { id: negocioId },
        data: {
          planActual: 'gratis',
          planVenceEn: null,
        },
      });
    });
  }

  async crearMembresiaPrueba(params: {
    negocioId: string;
    usuarioId: string;
    planCodigo: CodigoPlan;
    diasPrueba: number;
  }): Promise<MembresiaDTO> {
    return prisma.$transaction(async (tx) => {
      const ahora = new Date();
      const fechaFin = new Date(ahora.getTime() + params.diasPrueba * 24 * 60 * 60 * 1000);

      // Cancelar anteriores si hubiese
      await tx.membresia.updateMany({
        where: {
          negocioId: params.negocioId,
          estado: { in: ['activa', 'en_prueba'] },
        },
        data: { estado: 'cancelada' },
      });

      // Crear membresía en prueba
      const membresia = await tx.membresia.create({
        data: {
          negocioId: params.negocioId,
          planCodigo: params.planCodigo,
          estado: 'en_prueba',
          esPrueba: true,
          fechaInicio: ahora,
          fechaFin,
          autoRenovar: false,
        },
        include: { plan: true },
      });

      // Marcar usuario como que ya utilizó su beneficio de prueba
      await tx.perfilUsuario.update({
        where: { id: params.usuarioId },
        data: { puedeProbarPremium: false },
      });

      // Actualizar negocio (el trigger materializa entitlements y límites)
      await tx.negocio.update({
        where: { id: params.negocioId },
        data: {
          planActual: params.planCodigo,
          planVenceEn: fechaFin,
        },
      });

      return {
        id: membresia.id,
        negocioId: membresia.negocioId,
        planCodigo: membresia.planCodigo as CodigoPlan,
        estado: membresia.estado as any,
        fechaInicio: membresia.fechaInicio.toISOString(),
        fechaFin: membresia.fechaFin.toISOString(),
        esPrueba: membresia.esPrueba,
        codigoPromocionalId: membresia.codigoPromocionalId,
        autoRenovar: membresia.autoRenovar,
        creadoEn: membresia.creadoEn.toISOString(),
        actualizadoEn: membresia.actualizadoEn.toISOString(),
      };
    });
  }

  async crearSolicitudPago(params: {
    negocioId: string;
    usuarioId: string;
    planCodigo: CodigoPlan;
    meses: number;
    autoRenovar: boolean;
    pasarela: string;
    montoArs: number;
    comprobanteUrl?: string | null;
    referenciaExterna?: string | null;
  }): Promise<{ membresia: MembresiaDTO; pago: PagoMembresiaDTO }> {
    return prisma.$transaction(async (tx) => {
      const ahora = new Date();
      // Membresía inicial pendiente de pago (fechaFin provisional)
      const fechaFinProvisoria = new Date(
        ahora.getTime() + params.meses * 30 * 24 * 60 * 60 * 1000,
      );

      const membresia = await tx.membresia.create({
        data: {
          negocioId: params.negocioId,
          planCodigo: params.planCodigo,
          estado: 'vencida', // Estado inactivo hasta aprobación del pago
          fechaInicio: ahora,
          fechaFin: fechaFinProvisoria,
          autoRenovar: params.autoRenovar,
          esPrueba: false,
        },
      });

      const pago = await tx.pagoMembresia.create({
        data: {
          membresiaId: membresia.id,
          negocioId: params.negocioId,
          usuarioId: params.usuarioId,
          montoArs: params.montoArs,
          pasarela: params.pasarela,
          referenciaExterna: params.referenciaExterna ?? null,
          comprobanteUrl: params.comprobanteUrl ?? null,
          estado: 'pendiente',
        },
      });

      return {
        membresia: {
          id: membresia.id,
          negocioId: membresia.negocioId,
          planCodigo: membresia.planCodigo as CodigoPlan,
          estado: membresia.estado as any,
          fechaInicio: membresia.fechaInicio.toISOString(),
          fechaFin: membresia.fechaFin.toISOString(),
          esPrueba: membresia.esPrueba,
          codigoPromocionalId: membresia.codigoPromocionalId,
          autoRenovar: membresia.autoRenovar,
          creadoEn: membresia.creadoEn.toISOString(),
          actualizadoEn: membresia.actualizadoEn.toISOString(),
        },
        pago: {
          id: pago.id,
          membresiaId: pago.membresiaId,
          negocioId: pago.negocioId,
          usuarioId: pago.usuarioId,
          montoArs: Number(pago.montoArs),
          pasarela: pago.pasarela,
          referenciaExterna: pago.referenciaExterna,
          estado: pago.estado as any,
          comprobanteUrl: pago.comprobanteUrl,
          metadataPasarela: (pago.metadataPasarela as Record<string, unknown>) ?? null,
          pagadoEn: pago.pagadoEn ? pago.pagadoEn.toISOString() : null,
          creadoEn: pago.creadoEn.toISOString(),
          actualizadoEn: pago.actualizadoEn.toISOString(),
        },
      };
    });
  }

  async canjearCodigoPromo(params: {
    negocioId: string;
    usuarioId: string;
    codigo: string;
  }): Promise<{ membresia: MembresiaDTO; planOtorgado: CodigoPlan; dias: number }> {
    return prisma.$transaction(async (tx) => {
      const promo = await tx.codigoPromocional.findUnique({
        where: { codigo: params.codigo },
      });

      if (!promo || !promo.activo) {
        throw NotFoundError('El código promocional no existe o se encuentra inactivo');
      }

      const ahora = new Date();
      if (promo.validoHasta && promo.validoHasta < ahora) {
        throw ClientError('El código promocional ha vencido');
      }

      if (promo.usosActuales >= promo.usosMaximos) {
        throw ClientError('El código promocional ha alcanzado el límite máximo de usos permitidos');
      }

      // Incrementar uso del código
      await tx.codigoPromocional.update({
        where: { id: promo.id },
        data: { usosActuales: { increment: 1 } },
      });

      // Calcular nueva fecha fin
      const fechaFin = new Date(ahora.getTime() + promo.diasVigencia * 24 * 60 * 60 * 1000);

      // Cancelar membresías activas anteriores
      await tx.membresia.updateMany({
        where: {
          negocioId: params.negocioId,
          estado: { in: ['activa', 'en_prueba'] },
        },
        data: { estado: 'cancelada' },
      });

      // Crear membresía activa bonificada
      const membresia = await tx.membresia.create({
        data: {
          negocioId: params.negocioId,
          planCodigo: promo.planOtorgado,
          estado: 'activa',
          esPrueba: false,
          codigoPromocionalId: promo.id,
          fechaInicio: ahora,
          fechaFin,
          autoRenovar: false,
        },
      });

      // Registrar pago bonificado con pasarela promo
      await tx.pagoMembresia.create({
        data: {
          membresiaId: membresia.id,
          negocioId: params.negocioId,
          usuarioId: params.usuarioId,
          montoArs: 0,
          pasarela: 'promo',
          referenciaExterna: promo.codigo,
          estado: 'aprobado',
          pagadoEn: ahora,
        },
      });

      // Actualizar negocio: el trigger PostgreSQL sincroniza entitlements y cupos
      await tx.negocio.update({
        where: { id: params.negocioId },
        data: {
          planActual: promo.planOtorgado,
          planVenceEn: fechaFin,
        },
      });

      return {
        membresia: {
          id: membresia.id,
          negocioId: membresia.negocioId,
          planCodigo: membresia.planCodigo as CodigoPlan,
          estado: membresia.estado as any,
          fechaInicio: membresia.fechaInicio.toISOString(),
          fechaFin: membresia.fechaFin.toISOString(),
          esPrueba: membresia.esPrueba,
          codigoPromocionalId: membresia.codigoPromocionalId,
          autoRenovar: membresia.autoRenovar,
          creadoEn: membresia.creadoEn.toISOString(),
          actualizadoEn: membresia.actualizadoEn.toISOString(),
        },
        planOtorgado: promo.planOtorgado as CodigoPlan,
        dias: promo.diasVigencia,
      };
    });
  }

  async registrarPagoTransferencia(params: {
    membresiaId: string;
    negocioId: string;
    usuarioId: string;
    montoArs: number;
    comprobanteUrl?: string | null;
    referenciaExterna?: string | null;
  }): Promise<PagoMembresiaDTO> {
    const membresia = await prisma.membresia.findUnique({
      where: { id: params.membresiaId },
    });

    if (!membresia || membresia.negocioId !== params.negocioId) {
      throw NotFoundError('Membresía no encontrada para este negocio');
    }

    const pago = await prisma.pagoMembresia.create({
      data: {
        membresiaId: params.membresiaId,
        negocioId: params.negocioId,
        usuarioId: params.usuarioId,
        montoArs: params.montoArs,
        pasarela: 'transferencia_manual',
        comprobanteUrl: params.comprobanteUrl ?? null,
        referenciaExterna: params.referenciaExterna ?? null,
        estado: 'pendiente',
      },
    });

    return {
      id: pago.id,
      membresiaId: pago.membresiaId,
      negocioId: pago.negocioId,
      usuarioId: pago.usuarioId,
      montoArs: Number(pago.montoArs),
      pasarela: pago.pasarela,
      referenciaExterna: pago.referenciaExterna,
      estado: pago.estado as any,
      comprobanteUrl: pago.comprobanteUrl,
      metadataPasarela: (pago.metadataPasarela as Record<string, unknown>) ?? null,
      pagadoEn: pago.pagadoEn ? pago.pagadoEn.toISOString() : null,
      creadoEn: pago.creadoEn.toISOString(),
      actualizadoEn: pago.actualizadoEn.toISOString(),
    };
  }

  async revisarPagoManual(params: {
    pagoId: string;
    accion: 'aprobar' | 'rechazar';
    motivoRechazo?: string;
  }): Promise<PagoMembresiaDTO> {
    return prisma.$transaction(async (tx) => {
      const pago = await tx.pagoMembresia.findUnique({
        where: { id: params.pagoId },
        include: { membresia: true },
      });

      if (!pago) {
        throw NotFoundError('Pago no encontrado');
      }

      if (pago.estado !== 'pendiente') {
        throw ClientError(`El pago ya se encuentra en estado ${pago.estado}`);
      }

      const ahora = new Date();

      if (params.accion === 'aprobar') {
        const fechaFin = new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000);

        // Actualizar pago a aprobado
        const pagoActualizado = await tx.pagoMembresia.update({
          where: { id: params.pagoId },
          data: {
            estado: 'aprobado',
            pagadoEn: ahora,
          },
        });

        // Activar membresía
        await tx.membresia.update({
          where: { id: pago.membresiaId },
          data: {
            estado: 'activa',
            fechaInicio: ahora,
            fechaFin,
          },
        });

        // Actualizar negocio: trigger PostgreSQL sincroniza entitlements y cupos
        await tx.negocio.update({
          where: { id: pago.negocioId },
          data: {
            planActual: pago.membresia.planCodigo,
            planVenceEn: fechaFin,
          },
        });

        return {
          id: pagoActualizado.id,
          membresiaId: pagoActualizado.membresiaId,
          negocioId: pagoActualizado.negocioId,
          usuarioId: pagoActualizado.usuarioId,
          montoArs: Number(pagoActualizado.montoArs),
          pasarela: pagoActualizado.pasarela,
          referenciaExterna: pagoActualizado.referenciaExterna,
          estado: pagoActualizado.estado as any,
          comprobanteUrl: pagoActualizado.comprobanteUrl,
          metadataPasarela: (pagoActualizado.metadataPasarela as Record<string, unknown>) ?? null,
          pagadoEn: pagoActualizado.pagadoEn ? pagoActualizado.pagadoEn.toISOString() : null,
          creadoEn: pagoActualizado.creadoEn.toISOString(),
          actualizadoEn: pagoActualizado.actualizadoEn.toISOString(),
        };
      } else {
        // Rechazar
        const pagoRechazado = await tx.pagoMembresia.update({
          where: { id: params.pagoId },
          data: {
            estado: 'rechazado',
            metadataPasarela: params.motivoRechazo
              ? { motivoRechazo: params.motivoRechazo }
              : undefined,
          },
        });

        await tx.membresia.update({
          where: { id: pago.membresiaId },
          data: { estado: 'cancelada' },
        });

        return {
          id: pagoRechazado.id,
          membresiaId: pagoRechazado.membresiaId,
          negocioId: pagoRechazado.negocioId,
          usuarioId: pagoRechazado.usuarioId,
          montoArs: Number(pagoRechazado.montoArs),
          pasarela: pagoRechazado.pasarela,
          referenciaExterna: pagoRechazado.referenciaExterna,
          estado: pagoRechazado.estado as any,
          comprobanteUrl: pagoRechazado.comprobanteUrl,
          metadataPasarela: (pagoRechazado.metadataPasarela as Record<string, unknown>) ?? null,
          pagadoEn: null,
          creadoEn: pagoRechazado.creadoEn.toISOString(),
          actualizadoEn: pagoRechazado.actualizadoEn.toISOString(),
        };
      }
    });
  }

  async getPagosByNegocio(params: {
    negocioId: string;
    page: number;
    limit: number;
  }): Promise<{ pagos: PagoMembresiaDTO[]; total: number; page: number; totalPages: number }> {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;

    const [pagos, total] = await Promise.all([
      prisma.pagoMembresia.findMany({
        where: { negocioId: params.negocioId },
        orderBy: { creadoEn: 'desc' },
        skip,
        take: limit,
        include: {
          negocio: { select: { nombreComercial: true } },
          usuario: { select: { nombre: true, apellido: true } },
        },
      }),
      prisma.pagoMembresia.count({
        where: { negocioId: params.negocioId },
      }),
    ]);

    const dtos: PagoMembresiaDTO[] = pagos.map((p) => ({
      id: p.id,
      membresiaId: p.membresiaId,
      negocioId: p.negocioId,
      usuarioId: p.usuarioId,
      montoArs: Number(p.montoArs),
      pasarela: p.pasarela,
      referenciaExterna: p.referenciaExterna,
      estado: p.estado as any,
      comprobanteUrl: p.comprobanteUrl,
      metadataPasarela: (p.metadataPasarela as Record<string, unknown>) ?? null,
      pagadoEn: p.pagadoEn ? p.pagadoEn.toISOString() : null,
      creadoEn: p.creadoEn.toISOString(),
      actualizadoEn: p.actualizadoEn.toISOString(),
      negocioNombre: p.negocio.nombreComercial,
      usuarioNombre: `${p.usuario.nombre} ${p.usuario.apellido ?? ''}`.trim(),
    }));

    return {
      pagos: dtos,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getPagosAdmin(params: {
    negocioId?: string;
    estado?: string;
    pasarela?: string;
    page: number;
    limit: number;
  }): Promise<{ pagos: PagoMembresiaDTO[]; total: number; page: number; totalPages: number }> {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (params.negocioId) where.negocioId = params.negocioId;
    if (params.estado) where.estado = params.estado;
    if (params.pasarela) where.pasarela = params.pasarela;

    const [pagos, total] = await Promise.all([
      prisma.pagoMembresia.findMany({
        where,
        orderBy: { creadoEn: 'desc' },
        skip,
        take: limit,
        include: {
          negocio: { select: { nombreComercial: true } },
          usuario: { select: { nombre: true, apellido: true } },
        },
      }),
      prisma.pagoMembresia.count({ where }),
    ]);

    const dtos: PagoMembresiaDTO[] = pagos.map((p) => ({
      id: p.id,
      membresiaId: p.membresiaId,
      negocioId: p.negocioId,
      usuarioId: p.usuarioId,
      montoArs: Number(p.montoArs),
      pasarela: p.pasarela,
      referenciaExterna: p.referenciaExterna,
      estado: p.estado as any,
      comprobanteUrl: p.comprobanteUrl,
      metadataPasarela: (p.metadataPasarela as Record<string, unknown>) ?? null,
      pagadoEn: p.pagadoEn ? p.pagadoEn.toISOString() : null,
      creadoEn: p.creadoEn.toISOString(),
      actualizadoEn: p.actualizadoEn.toISOString(),
      negocioNombre: p.negocio.nombreComercial,
      usuarioNombre: `${p.usuario.nombre} ${p.usuario.apellido ?? ''}`.trim(),
    }));

    return {
      pagos: dtos,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }


  async ejecutarVencimientoMembresias(): Promise<{ membresiasVencidas: number }> {
    const ahora = new Date();

    const vencidas = await prisma.membresia.findMany({
      where: {
        fechaFin: { lt: ahora },
        estado: { in: ['activa', 'en_prueba'] },
      },
      select: {
        id: true,
        negocioId: true,
      },
    });

    if (vencidas.length === 0) {
      return { membresiasVencidas: 0 };
    }

    const ids = vencidas.map((m) => m.id);
    const negociosIds = [...new Set(vencidas.map((m) => m.negocioId))];

    await prisma.$transaction(async (tx) => {
      // Marcar membresías como vencidas
      await tx.membresia.updateMany({
        where: { id: { in: ids } },
        data: { estado: 'vencida' },
      });

      // Degradar negocios a plan gratis (trigger Postgres sincroniza y degrada limpiamente)
      for (const negocioId of negociosIds) {
        // Verificar si tiene alguna otra membresía activa que venza en el futuro
        const activaRestante = await tx.membresia.findFirst({
          where: {
            negocioId,
            estado: 'activa',
            fechaFin: { gt: ahora },
          },
          orderBy: { fechaFin: 'desc' },
        });

        if (!activaRestante) {
          await tx.negocio.update({
            where: { id: negocioId },
            data: {
              planActual: 'gratis',
              planVenceEn: null,
            },
          });
        }
      }
    });

    return { membresiasVencidas: vencidas.length };
  }

  async crearPreferenciaMercadoPago(params: {
    negocioId: string;
    usuarioId: string;
    planCodigo: CodigoPlan;
    meses: number;
    emailComprador?: string;
  }): Promise<PreferenciaMpResponseDTO> {
    const plan = await prisma.planCatalogo.findUnique({
      where: { codigo: params.planCodigo },
    });

    if (!plan || !plan.activo) {
      throw NotFoundError('El plan seleccionado no está disponible');
    }

    const ahora = new Date();
    const diasDuracion = params.meses * 30;
    const fechaFinProvisoria = new Date(ahora.getTime() + diasDuracion * 24 * 60 * 60 * 1000);
    const montoArs = Number(plan.precioMensualArs) * params.meses;

    // 1. Crear membresía provisional (inactiva / vencida) y pago pendiente
    const { membresia, pago } = await prisma.$transaction(async (tx) => {
      const nuevaMembresia = await tx.membresia.create({
        data: {
          negocioId: params.negocioId,
          planCodigo: params.planCodigo,
          estado: 'vencida', // inactiva hasta que MP notifique pago aprobado
          fechaInicio: ahora,
          fechaFin: fechaFinProvisoria,
          autoRenovar: false,
          esPrueba: false,
        },
      });

      const nuevoPago = await tx.pagoMembresia.create({
        data: {
          membresiaId: nuevaMembresia.id,
          negocioId: params.negocioId,
          usuarioId: params.usuarioId,
          montoArs,
          pasarela: 'mercadopago',
          estado: 'pendiente',
        },
      });

      return { membresia: nuevaMembresia, pago: nuevoPago };
    });

    // 2. Generar preferencia con Mercado Pago
    const prefResult = await this.mpService.crearPreferencia({
      pagoId: pago.id,
      negocioId: params.negocioId,
      nombrePlan: plan.nombre,
      montoArs,
      meses: params.meses,
      emailComprador: params.emailComprador,
    });

    // 3. Guardar el ID de preferencia como referencia externa
    await prisma.pagoMembresia.update({
      where: { id: pago.id },
      data: {
        referenciaExterna: prefResult.preferenceId,
        metadataPasarela: {
          preferenceId: prefResult.preferenceId,
          initPoint: prefResult.initPoint,
          sandboxInitPoint: prefResult.sandboxInitPoint,
          modoSandbox: prefResult.modoSandbox,
        },
      },
    });

    return {
      preferenceId: prefResult.preferenceId,
      initPoint: prefResult.initPoint,
      sandboxInitPoint: prefResult.sandboxInitPoint,
      pagoId: pago.id,
      montoArs,
      planCodigo: params.planCodigo,
      modoSandbox: prefResult.modoSandbox,
    };
  }

  async procesarPagoMercadoPago(params: {
    pagoId: string;
    estadoMp: 'approved' | 'rejected' | 'pending';
    metadata?: Record<string, unknown>;
  }): Promise<PagoMembresiaDTO> {
    return prisma.$transaction(async (tx) => {
      const pago = await tx.pagoMembresia.findUnique({
        where: { id: params.pagoId },
        include: { membresia: true, negocio: true },
      });

      if (!pago) {
        throw NotFoundError(`Pago con ID ${params.pagoId} no encontrado`);
      }

      // Si ya fue aprobado previamente, devolvemos el estado idempotente
      if (pago.estado === 'aprobado') {
        return {
          id: pago.id,
          membresiaId: pago.membresiaId,
          negocioId: pago.negocioId,
          usuarioId: pago.usuarioId,
          montoArs: Number(pago.montoArs),
          pasarela: pago.pasarela,
          referenciaExterna: pago.referenciaExterna,
          estado: pago.estado as any,
          comprobanteUrl: pago.comprobanteUrl,
          metadataPasarela: (pago.metadataPasarela as Record<string, unknown>) ?? null,
          pagadoEn: pago.pagadoEn ? pago.pagadoEn.toISOString() : null,
          creadoEn: pago.creadoEn.toISOString(),
          actualizadoEn: pago.actualizadoEn.toISOString(),
          negocioNombre: pago.negocio.nombreComercial,
        };
      }

      const ahora = new Date();

      if (params.estadoMp === 'approved') {
        const fechaFin = new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000);

        // Actualizar pago a aprobado
        const pagoActualizado = await tx.pagoMembresia.update({
          where: { id: params.pagoId },
          data: {
            estado: 'aprobado',
            pagadoEn: ahora,
            metadataPasarela: {
              ...((pago.metadataPasarela as object) || {}),
              ...(params.metadata || {}),
              aprobadoPorWebhook: true,
            } as any,
          },
        });

        // Activar membresía
        await tx.membresia.update({
          where: { id: pago.membresiaId },
          data: {
            estado: 'activa',
            fechaInicio: ahora,
            fechaFin,
          },
        });

        // Actualizar negocio: trigger PostgreSQL sincroniza entitlements y cupos
        await tx.negocio.update({
          where: { id: pago.negocioId },
          data: {
            planActual: pago.membresia.planCodigo,
            planVenceEn: fechaFin,
          },
        });

        return {
          id: pagoActualizado.id,
          membresiaId: pagoActualizado.membresiaId,
          negocioId: pagoActualizado.negocioId,
          usuarioId: pagoActualizado.usuarioId,
          montoArs: Number(pagoActualizado.montoArs),
          pasarela: pagoActualizado.pasarela,
          referenciaExterna: pagoActualizado.referenciaExterna,
          estado: pagoActualizado.estado as any,
          comprobanteUrl: pagoActualizado.comprobanteUrl,
          metadataPasarela: (pagoActualizado.metadataPasarela as Record<string, unknown>) ?? null,
          pagadoEn: ahora.toISOString(),
          creadoEn: pagoActualizado.creadoEn.toISOString(),
          actualizadoEn: pagoActualizado.actualizadoEn.toISOString(),
          negocioNombre: pago.negocio.nombreComercial,
        };
      } else if (params.estadoMp === 'rejected') {
        const pagoRechazado = await tx.pagoMembresia.update({
          where: { id: params.pagoId },
          data: {
            estado: 'rechazado',
            metadataPasarela: {
              ...((pago.metadataPasarela as object) || {}),
              ...(params.metadata || {}),
            } as any,
          },
        });

        await tx.membresia.update({
          where: { id: pago.membresiaId },
          data: { estado: 'cancelada' },
        });

        return {
          id: pagoRechazado.id,
          membresiaId: pagoRechazado.membresiaId,
          negocioId: pagoRechazado.negocioId,
          usuarioId: pagoRechazado.usuarioId,
          montoArs: Number(pagoRechazado.montoArs),
          pasarela: pagoRechazado.pasarela,
          referenciaExterna: pagoRechazado.referenciaExterna,
          estado: pagoRechazado.estado as any,
          comprobanteUrl: pagoRechazado.comprobanteUrl,
          metadataPasarela: (pagoRechazado.metadataPasarela as Record<string, unknown>) ?? null,
          pagadoEn: null,
          creadoEn: pagoRechazado.creadoEn.toISOString(),
          actualizadoEn: pagoRechazado.actualizadoEn.toISOString(),
          negocioNombre: pago.negocio.nombreComercial,
        };
      } else {
        // Pending
        return {
          id: pago.id,
          membresiaId: pago.membresiaId,
          negocioId: pago.negocioId,
          usuarioId: pago.usuarioId,
          montoArs: Number(pago.montoArs),
          pasarela: pago.pasarela,
          referenciaExterna: pago.referenciaExterna,
          estado: pago.estado as any,
          comprobanteUrl: pago.comprobanteUrl,
          metadataPasarela: (pago.metadataPasarela as Record<string, unknown>) ?? null,
          pagadoEn: null,
          creadoEn: pago.creadoEn.toISOString(),
          actualizadoEn: pago.actualizadoEn.toISOString(),
          negocioNombre: pago.negocio.nombreComercial,
        };
      }
    });
  }
}


