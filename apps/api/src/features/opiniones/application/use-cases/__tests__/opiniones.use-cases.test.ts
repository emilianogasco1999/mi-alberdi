import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type {
  CreateOpinionData,
  IOpinionesRepository,
  NegocioMetadata,
} from '../../../domain/repositories/IOpinionesRepository.js';
import { CreateOpinionUseCase } from '../create-opinion.use-case.js';
import { ResponderOpinionUseCase } from '../responder-opinion.use-case.js';
import { EliminarRespuestaComercianteUseCase } from '../eliminar-respuesta-comerciante.use-case.js';
import { DeleteOpinionUseCase } from '../delete-opinion.use-case.js';
import { GetMiOpinionUseCase } from '../get-mi-opinion.use-case.js';
import { GetOpinionesNegocioUseCase } from '../get-opiniones-negocio.use-case.js';
import type {
  ListadoOpinionesResponseDTO,
  OpinionDTO,
  QueryOpinionesNegocioInput,
} from '@mi-alberdi/shared';

class MockOpinionesRepository implements IOpinionesRepository {
  usuarios = new Map<string, { id: string; nombre: string; apellido: string | null }>();
  negocios = new Map<string, NegocioMetadata>();
  publicaciones = new Map<string, { id: string; negocioId: string; titulo: string }>();
  opiniones = new Map<string, OpinionDTO & { propietarioNegocioId: string }>();

  async findUsuarioById(
    id: string,
  ): Promise<{ id: string; nombre: string; apellido: string | null } | null> {
    return this.usuarios.get(id) ?? null;
  }

  async findNegocioById(id: string): Promise<NegocioMetadata | null> {
    return this.negocios.get(id) ?? null;
  }

  async findPublicacionById(
    id: string,
  ): Promise<{ id: string; negocioId: string; titulo: string } | null> {
    return this.publicaciones.get(id) ?? null;
  }

  async findOpinionById(
    id: string,
  ): Promise<(OpinionDTO & { propietarioNegocioId: string }) | null> {
    return this.opiniones.get(id) ?? null;
  }

  async findOpinionByUsuarioYNegocio(
    usuarioId: string,
    negocioId: string,
  ): Promise<OpinionDTO | null> {
    for (const op of this.opiniones.values()) {
      if (op.usuarioId === usuarioId && op.negocioId === negocioId) {
        return op;
      }
    }
    return null;
  }

  async createOpinion(data: CreateOpinionData): Promise<OpinionDTO> {
    const negocio = this.negocios.get(data.negocioId)!;
    const opinion: OpinionDTO & { propietarioNegocioId: string } = {
      id: `opinion-${this.opiniones.size + 1}`,
      negocioId: data.negocioId,
      publicacionId: data.publicacionId ?? null,
      publicacionTitulo: data.publicacionId
        ? this.publicaciones.get(data.publicacionId)?.titulo ?? null
        : null,
      usuarioId: data.usuarioId,
      nombreAutorVisible: data.nombreAutorVisible,
      puntuacion: data.puntuacion,
      comentario: data.comentario ?? null,
      fotoEvidenciaUrl: data.fotoEvidenciaUrl ?? null,
      respuestaComerciante: null,
      respondidoEn: null,
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
      propietarioNegocioId: negocio.propietarioId,
    };

    this.opiniones.set(opinion.id, opinion);
    negocio.totalOpiniones += 1;
    negocio.ratingPromedio = 5.0; // Simplificado en mock
    return opinion;
  }

  async responderOpinion(id: string, respuesta: string): Promise<OpinionDTO> {
    const op = this.opiniones.get(id)!;
    op.respuestaComerciante = respuesta;
    op.respondidoEn = new Date().toISOString();
    return op;
  }

  async eliminarRespuesta(id: string): Promise<OpinionDTO> {
    const op = this.opiniones.get(id)!;
    op.respuestaComerciante = null;
    op.respondidoEn = null;
    return op;
  }

  async deleteOpinion(id: string, negocioId: string): Promise<void> {
    this.opiniones.delete(id);
    const negocio = this.negocios.get(negocioId);
    if (negocio) {
      negocio.totalOpiniones = Math.max(0, negocio.totalOpiniones - 1);
    }
  }

  async getOpinionesNegocio(
    negocioId: string,
    query: QueryOpinionesNegocioInput,
  ): Promise<ListadoOpinionesResponseDTO> {
    const negocio = this.negocios.get(negocioId);
    const ops = Array.from(this.opiniones.values()).filter(
      (o) => o.negocioId === negocioId,
    );

    return {
      opiniones: ops,
      ratingPromedio: negocio?.ratingPromedio ?? 0,
      totalOpiniones: negocio?.totalOpiniones ?? 0,
      distribucion: { 1: 0, 2: 0, 3: 0, 4: 0, 5: ops.length },
      paginacion: {
        pagina: query.pagina,
        limite: query.limite,
        total: ops.length,
        totalPaginas: 1,
      },
    };
  }

  async recalcularRatingNegocio(
    negocioId: string,
  ): Promise<{ ratingPromedio: number; totalOpiniones: number }> {
    const ops = Array.from(this.opiniones.values()).filter(
      (o) => o.negocioId === negocioId,
    );
    const sum = ops.reduce((acc, o) => acc + o.puntuacion, 0);
    const count = ops.length;
    const avg = count > 0 ? Number((sum / count).toFixed(2)) : 0;
    return { ratingPromedio: avg, totalOpiniones: count };
  }
}

describe('POW-33: Opiniones Use Cases', () => {
  const setup = () => {
    const repo = new MockOpinionesRepository();
    const negocioId = '11111111-1111-1111-1111-111111111111';
    const ownerId = 'owner-uuid';

    repo.negocios.set(negocioId, {
      id: negocioId,
      nombreComercial: 'Farmacia Alberdi',
      propietarioId: ownerId,
      ratingPromedio: 0,
      totalOpiniones: 0,
    });

    repo.publicaciones.set('pub-1', {
      id: 'pub-1',
      negocioId,
      titulo: 'Paracetamol 500mg',
    });

    return { repo, negocioId, ownerId };
  };

  describe('CreateOpinionUseCase', () => {
    it('debe registrar una calificación válida de un vecino', async () => {
      const { repo, negocioId } = setup();
      const useCase = new CreateOpinionUseCase(repo);

      const result = await useCase.execute(
        'vecino-uuid-1',
        {
          negocioId,
          nombreAutorVisible: 'Carlos Morales',
          puntuacion: 5,
          comentario: 'Excelente servicio, atienden muy rápido',
        },
      );

      assert.equal(result.puntuacion, 5);
      assert.equal(result.nombreAutorVisible, 'Carlos Morales');
      assert.equal(result.negocioId, negocioId);
    });

    it('antifraude: el dueño del negocio no puede calificarse a sí mismo', async () => {
      const { repo, negocioId, ownerId } = setup();
      const useCase = new CreateOpinionUseCase(repo);

      await assert.rejects(
        async () => {
          await useCase.execute(ownerId, {
            negocioId,
            puntuacion: 5,
          });
        },
        { name: 'ClientError' },
      );
    });

    it('debe impedir que un usuario emita una segunda opinión para el mismo negocio', async () => {
      const { repo, negocioId } = setup();
      const useCase = new CreateOpinionUseCase(repo);

      await useCase.execute('vecino-uuid-1', {
        negocioId,
        nombreAutorVisible: 'Carlos Morales',
        puntuacion: 4,
      });

      await assert.rejects(
        async () => {
          await useCase.execute('vecino-uuid-1', {
            negocioId,
            nombreAutorVisible: 'Carlos Morales',
            puntuacion: 5,
          });
        },
        { name: 'ClientError' },
      );
    });

    it('debe fallar si la publicación pertenece a otro negocio', async () => {
      const { repo, negocioId } = setup();
      repo.publicaciones.set('pub-otro', {
        id: 'pub-otro',
        negocioId: 'otro-negocio-uuid',
        titulo: 'Otro producto',
      });
      const useCase = new CreateOpinionUseCase(repo);

      await assert.rejects(
        async () => {
          await useCase.execute('vecino-uuid-1', {
            negocioId,
            publicacionId: 'pub-otro',
            puntuacion: 3,
          });
        },
        { name: 'ValidationError' },
      );
    });
  });

  describe('ResponderOpinionUseCase', () => {
    it('debe permitir al dueño del negocio responder una opinión', async () => {
      const { repo, negocioId, ownerId } = setup();
      const createUseCase = new CreateOpinionUseCase(repo);
      const responderUseCase = new ResponderOpinionUseCase(repo);

      const op = await createUseCase.execute('vecino-uuid-1', {
        negocioId,
        nombreAutorVisible: 'Carlos',
        puntuacion: 5,
      });

      const result = await responderUseCase.execute(
        op.id,
        ownerId,
        'comerciante',
        { respuestaComerciante: '¡Muchas gracias por elegirnos Carlos!' },
      );

      assert.equal(
        result.respuestaComerciante,
        '¡Muchas gracias por elegirnos Carlos!',
      );
      assert.ok(result.respondidoEn);
    });

    it('debe rechazar a un usuario que no sea el dueño ni admin', async () => {
      const { repo, negocioId } = setup();
      const createUseCase = new CreateOpinionUseCase(repo);
      const responderUseCase = new ResponderOpinionUseCase(repo);

      const op = await createUseCase.execute('vecino-uuid-1', {
        negocioId,
        nombreAutorVisible: 'Carlos',
        puntuacion: 5,
      });

      await assert.rejects(
        async () => {
          await responderUseCase.execute(
            op.id,
            'otro-usuario',
            'comerciante',
            { respuestaComerciante: 'Respuesta' },
          );
        },
        { name: 'ForbiddenError' },
      );
    });
  });

  describe('EliminarRespuestaComercianteUseCase', () => {
    it('debe permitir al dueño del negocio eliminar su respuesta', async () => {
      const { repo, negocioId, ownerId } = setup();
      const createUseCase = new CreateOpinionUseCase(repo);
      const responderUseCase = new ResponderOpinionUseCase(repo);
      const eliminarRespuestaUseCase = new EliminarRespuestaComercianteUseCase(repo);

      const op = await createUseCase.execute('vecino-uuid-1', {
        negocioId,
        nombreAutorVisible: 'Carlos',
        puntuacion: 5,
      });

      await responderUseCase.execute(op.id, ownerId, 'comerciante', {
        respuestaComerciante: 'Respuesta inicial',
      });

      const result = await eliminarRespuestaUseCase.execute(op.id, ownerId, 'comerciante');
      assert.equal(result.respuestaComerciante, null);
      assert.equal(result.respondidoEn, null);
    });

    it('debe rechazar si un tercero intenta eliminar la respuesta del comerciante', async () => {
      const { repo, negocioId, ownerId } = setup();
      const createUseCase = new CreateOpinionUseCase(repo);
      const responderUseCase = new ResponderOpinionUseCase(repo);
      const eliminarRespuestaUseCase = new EliminarRespuestaComercianteUseCase(repo);

      const op = await createUseCase.execute('vecino-uuid-1', {
        negocioId,
        nombreAutorVisible: 'Carlos',
        puntuacion: 5,
      });

      await responderUseCase.execute(op.id, ownerId, 'comerciante', {
        respuestaComerciante: 'Respuesta inicial',
      });

      await assert.rejects(
        async () => {
          await eliminarRespuestaUseCase.execute(op.id, 'vecino-uuid-1', 'vecino');
        },
        { name: 'ForbiddenError' },
      );
    });
  });

  describe('DeleteOpinionUseCase', () => {
    it('el autor puede eliminar su propia opinión', async () => {
      const { repo, negocioId } = setup();
      const createUseCase = new CreateOpinionUseCase(repo);
      const deleteUseCase = new DeleteOpinionUseCase(repo);

      const op = await createUseCase.execute('vecino-uuid-1', {
        negocioId,
        nombreAutorVisible: 'Carlos',
        puntuacion: 5,
      });

      await deleteUseCase.execute(op.id, 'vecino-uuid-1', 'vecino');
      assert.equal(repo.opiniones.size, 0);
    });

    it('un moderador o admin puede eliminar opiniones', async () => {
      const { repo, negocioId } = setup();
      const createUseCase = new CreateOpinionUseCase(repo);
      const deleteUseCase = new DeleteOpinionUseCase(repo);

      const op = await createUseCase.execute('vecino-uuid-1', {
        negocioId,
        nombreAutorVisible: 'Carlos',
        puntuacion: 5,
      });

      await deleteUseCase.execute(op.id, 'moderador-uuid', 'moderador');
      assert.equal(repo.opiniones.size, 0);
    });

    it('un usuario tercero no puede eliminar la opinión de otro', async () => {
      const { repo, negocioId } = setup();
      const createUseCase = new CreateOpinionUseCase(repo);
      const deleteUseCase = new DeleteOpinionUseCase(repo);

      const op = await createUseCase.execute('vecino-uuid-1', {
        negocioId,
        nombreAutorVisible: 'Carlos',
        puntuacion: 5,
      });

      await assert.rejects(
        async () => {
          await deleteUseCase.execute(op.id, 'tercero-uuid', 'vecino');
        },
        { name: 'ForbiddenError' },
      );
    });
  });

  describe('GetMiOpinionUseCase & GetOpinionesNegocioUseCase', () => {
    it('debe devolver mi opinión si ya califiqué', async () => {
      const { repo, negocioId } = setup();
      const createUseCase = new CreateOpinionUseCase(repo);
      const getMiOpinionUseCase = new GetMiOpinionUseCase(repo);

      await createUseCase.execute('vecino-uuid-1', {
        negocioId,
        nombreAutorVisible: 'Carlos',
        puntuacion: 5,
      });

      const miOp = await getMiOpinionUseCase.execute('vecino-uuid-1', negocioId);
      assert.ok(miOp);
      assert.equal(miOp.puntuacion, 5);

      const otraOp = await getMiOpinionUseCase.execute('otro-vecino', negocioId);
      assert.equal(otraOp, null);
    });

    it('debe listar opiniones del negocio con distribución y paginación', async () => {
      const { repo, negocioId } = setup();
      const createUseCase = new CreateOpinionUseCase(repo);
      const listUseCase = new GetOpinionesNegocioUseCase(repo);

      await createUseCase.execute('vecino-1', {
        negocioId,
        nombreAutorVisible: 'Carlos',
        puntuacion: 5,
      });
      await createUseCase.execute('vecino-2', {
        negocioId,
        nombreAutorVisible: 'Maria',
        puntuacion: 5,
      });

      const result = await listUseCase.execute(negocioId, {
        pagina: 1,
        limite: 10,
        orden: 'recientes',
      });

      assert.equal(result.totalOpiniones, 2);
      assert.equal(result.opiniones.length, 2);
      assert.equal(result.distribucion[5], 2);
    });
  });
});
