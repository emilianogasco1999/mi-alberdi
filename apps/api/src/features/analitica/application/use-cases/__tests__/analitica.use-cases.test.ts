import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type {
  IAnaliticaRepository,
  NegocioMetadata,
  RegistrarEventoData,
  GetMetricasParams,
} from '../../../domain/repositories/IAnaliticaRepository.js';
import { RegistrarEventoUseCase } from '../registrar-evento.use-case.js';
import { RegistrarEventosBatchUseCase } from '../registrar-eventos-batch.use-case.js';
import { GetMetricasNegocioUseCase } from '../get-metricas-negocio.use-case.js';
import type { MetricasNegocioResponseDTO } from '@mi-alberdi/shared';

class MockAnaliticaRepository implements IAnaliticaRepository {
  negocios = new Map<string, NegocioMetadata>();
  publicaciones = new Map<string, { id: string; negocioId: string }>();
  ubicaciones = new Map<string, { id: string; negocioId: string }>();
  reels = new Map<string, { id: string; negocioId: string }>();
  eventos: RegistrarEventoData[] = [];

  async findNegocioById(id: string): Promise<NegocioMetadata | null> {
    return this.negocios.get(id) ?? null;
  }

  async findPublicacionById(id: string): Promise<{ id: string; negocioId: string } | null> {
    return this.publicaciones.get(id) ?? null;
  }

  async findUbicacionById(id: string): Promise<{ id: string; negocioId: string } | null> {
    return this.ubicaciones.get(id) ?? null;
  }

  async findReelById(id: string): Promise<{ id: string; negocioId: string } | null> {
    return this.reels.get(id) ?? null;
  }

  async registrarEvento(data: RegistrarEventoData): Promise<{ id: string; creadoEn: Date }> {
    this.eventos.push(data);
    return { id: 'mock-event-uuid', creadoEn: new Date() };
  }

  async registrarEventosBatch(eventos: RegistrarEventoData[]): Promise<{ count: number }> {
    this.eventos.push(...eventos);
    return { count: eventos.length };
  }

  async getMetricasNegocio(params: GetMetricasParams): Promise<MetricasNegocioResponseDTO> {
    const negocio = this.negocios.get(params.negocioId);
    return {
      negocioId: params.negocioId,
      nombreComercial: negocio?.nombreComercial ?? 'Negocio Test',
      periodo: params.periodoNombre,
      rango: {
        desde: params.desde.toISOString(),
        hasta: params.hasta.toISOString(),
      },
      resumen: {
        totalVistasNegocio: 10,
        totalVistasPublicaciones: 25,
        totalClicsWhatsapp: 12,
        totalClicsTelefono: 3,
        totalClicsRedSocial: 5,
        totalEscaneosQr: 8,
        totalVistasReel: 4,
        totalConversiones: 23,
        totalInteracciones: 67,
      },
      porSucursal: [
        {
          ubicacionId: 'suc-1',
          nombreSucursal: 'Casa Central',
          totalVistas: 20,
          totalClicsWhatsapp: 10,
          totalEscaneosQr: 6,
          totalEventos: 45,
        },
      ],
      porOrigen: [{ origen: 'web_portada', total: 40 }],
      serieTemporal: [
        {
          fecha: '2026-11-08',
          vistas: 35,
          clicsWhatsapp: 12,
          escaneosQr: 8,
          otros: 12,
        },
      ],
      topPublicaciones: [
        {
          publicacionId: 'pub-1',
          titulo: 'Pizza Especial',
          vistas: 25,
          clicsWhatsapp: 12,
        },
      ],
    };
  }
}

describe('POW-29: Analítica Use Cases', () => {
  const setup = () => {
    const repo = new MockAnaliticaRepository();
    const negocioId = '11111111-1111-1111-1111-111111111111';
    const ownerId = 'user-owner-uuid';

    repo.negocios.set(negocioId, {
      id: negocioId,
      nombreComercial: 'Ferretería Alberdi',
      propietarioId: ownerId,
    });

    repo.publicaciones.set('pub-1', { id: 'pub-1', negocioId });
    repo.ubicaciones.set('suc-1', { id: 'suc-1', negocioId });
    repo.reels.set('reel-1', { id: 'reel-1', negocioId });

    return { repo, negocioId, ownerId };
  };

  describe('RegistrarEventoUseCase', () => {
    it('debe registrar un evento de clic_whatsapp válido', async () => {
      const { repo, negocioId } = setup();
      const useCase = new RegistrarEventoUseCase(repo);

      const result = await useCase.execute({
        negocioId,
        publicacionId: 'pub-1',
        ubicacionId: 'suc-1',
        tipoEvento: 'clic_whatsapp',
        origen: 'web_portada',
      });

      assert.equal(result.id, 'mock-event-uuid');
      assert.equal(repo.eventos.length, 1);
      assert.equal(repo.eventos[0]?.tipoEvento, 'clic_whatsapp');
    });

    it('debe fallar si el negocio especificado no existe', async () => {
      const { repo } = setup();
      const useCase = new RegistrarEventoUseCase(repo);

      await assert.rejects(
        async () => {
          await useCase.execute({
            negocioId: '99999999-9999-9999-9999-999999999999',
            tipoEvento: 'vista_negocio',
          });
        },
        { name: 'NotFoundError' },
      );
    });

    it('debe fallar si la publicación no pertenece al negocio', async () => {
      const { repo, negocioId } = setup();
      repo.publicaciones.set('pub-otro-negocio', {
        id: 'pub-otro-negocio',
        negocioId: 'otro-negocio-uuid',
      });
      const useCase = new RegistrarEventoUseCase(repo);

      await assert.rejects(
        async () => {
          await useCase.execute({
            negocioId,
            publicacionId: 'pub-otro-negocio',
            tipoEvento: 'vista_publicacion',
          });
        },
        { name: 'ValidationError' },
      );
    });
  });

  describe('RegistrarEventosBatchUseCase', () => {
    it('debe registrar un lote de eventos exitosamente', async () => {
      const { repo, negocioId } = setup();
      const useCase = new RegistrarEventosBatchUseCase(repo);

      const result = await useCase.execute({
        eventos: [
          { negocioId, tipoEvento: 'vista_negocio', origen: 'buscador' },
          { negocioId, tipoEvento: 'clic_whatsapp', origen: 'buscador' },
        ],
      });

      assert.equal(result.count, 2);
      assert.equal(repo.eventos.length, 2);
    });

    it('debe retornar count 0 si el lote está vacío', async () => {
      const { repo } = setup();
      const useCase = new RegistrarEventosBatchUseCase(repo);

      const result = await useCase.execute({ eventos: [] });
      assert.equal(result.count, 0);
    });
  });

  describe('GetMetricasNegocioUseCase', () => {
    it('debe permitir al dueño del negocio consultar sus métricas', async () => {
      const { repo, negocioId, ownerId } = setup();
      const useCase = new GetMetricasNegocioUseCase(repo);

      const result = await useCase.execute(negocioId, ownerId, 'comerciante', {
        periodo: '30d',
      });

      assert.equal(result.negocioId, negocioId);
      assert.equal(result.resumen.totalConversiones, 23);
      assert.equal(result.porSucursal.length, 1);
    });

    it('debe permitir a un administrador consultar las métricas', async () => {
      const { repo, negocioId } = setup();
      const useCase = new GetMetricasNegocioUseCase(repo);

      const result = await useCase.execute(negocioId, 'admin-uuid', 'admin', {
        periodo: '7d',
      });

      assert.equal(result.negocioId, negocioId);
    });

    it('debe rechazar con ForbiddenError a otro usuario no dueño ni admin', async () => {
      const { repo, negocioId } = setup();
      const useCase = new GetMetricasNegocioUseCase(repo);

      await assert.rejects(
        async () => {
          await useCase.execute(negocioId, 'otro-usuario-uuid', 'comerciante', {
            periodo: '30d',
          });
        },
        { name: 'ForbiddenError' },
      );
    });

    it('debe rechazar si la fecha desde es posterior a la fecha hasta', async () => {
      const { repo, negocioId, ownerId } = setup();
      const useCase = new GetMetricasNegocioUseCase(repo);

      await assert.rejects(
        async () => {
          await useCase.execute(negocioId, ownerId, 'comerciante', {
            desde: '2026-11-10',
            hasta: '2026-11-01',
          });
        },
        { name: 'ValidationError' },
      );
    });
  });
});
