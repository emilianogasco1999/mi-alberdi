import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SolicitarVerificacionUseCase,
  ResolverSolicitudVerificacionUseCase,
  GetSolicitudesVerificacionUseCase,
  GetMisSolicitudesVerificacionUseCase,
  CrearReporteUseCase,
  ResolverReporteUseCase,
  GetReportesUseCase,
  CrearFeedbackUseCase,
  GetFeedbacksUseCase,
  MarcarFeedbackLeidoUseCase,
} from '../index.js';
import type {
  IModeracionRepository,
  NegocioMetadata,
} from '../../../domain/repositories/IModeracionRepository.js';
import type {
  CrearFeedbackInput,
  CrearReporteInput,
  FeedbackPlataformaDTO,
  ListadoPaginadoDTO,
  QueryListadosModeracionInput,
  ReporteModeracionDTO,
  ResolverReporteInput,
  ResolverSolicitudVerificacionInput,
  SolicitarVerificacionInput,
  SolicitudVerificacionDTO,
} from '@mi-alberdi/shared';

// Mock InMemory de IModeracionRepository
class MockModeracionRepository implements IModeracionRepository {
  public negocios: NegocioMetadata[] = [];
  public publicaciones: Array<{ id: string; titulo: string }> = [];
  public opiniones: Array<{ id: string; negocioId: string }> = [];

  public verificaciones: SolicitudVerificacionDTO[] = [];
  public reportes: ReporteModeracionDTO[] = [];
  public feedbacks: FeedbackPlataformaDTO[] = [];

  async findNegocioById(id: string): Promise<NegocioMetadata | null> {
    return this.negocios.find((n) => n.id === id) || null;
  }

  async findPublicacionById(id: string): Promise<{ id: string; titulo: string } | null> {
    return this.publicaciones.find((p) => p.id === id) || null;
  }

  async findOpinionById(id: string): Promise<{ id: string; negocioId: string } | null> {
    return this.opiniones.find((o) => o.id === id) || null;
  }

  async findPendingVerificacionByNegocio(
    negocioId: string,
  ): Promise<SolicitudVerificacionDTO | null> {
    return (
      this.verificaciones.find(
        (v) => v.negocioId === negocioId && v.estado === 'pendiente',
      ) || null
    );
  }

  async findVerificacionById(id: string): Promise<SolicitudVerificacionDTO | null> {
    return this.verificaciones.find((v) => v.id === id) || null;
  }

  async crearSolicitudVerificacion(
    data: SolicitarVerificacionInput & { solicitanteId: string },
  ): Promise<SolicitudVerificacionDTO> {
    const doc: SolicitudVerificacionDTO = {
      id: 'verif-1',
      negocioId: data.negocioId,
      nombreNegocio: 'Comercio Test',
      solicitanteId: data.solicitanteId,
      documentoFrenteUrl: data.documentoFrenteUrl ?? null,
      comprobanteComercioUrl: data.comprobanteComercioUrl ?? null,
      notasSolicitante: data.notasSolicitante ?? null,
      estado: 'pendiente',
      revisadoPorId: null,
      motivoRechazo: null,
      resueltoEn: null,
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
    };
    this.verificaciones.push(doc);
    return doc;
  }

  async resolverSolicitudVerificacion(
    id: string,
    data: ResolverSolicitudVerificacionInput,
    revisadoPorId: string,
  ): Promise<SolicitudVerificacionDTO> {
    const item = this.verificaciones.find((v) => v.id === id);
    if (!item) throw new Error('Not found');
    item.estado = data.estado;
    item.motivoRechazo = data.motivoRechazo ?? null;
    item.revisadoPorId = revisadoPorId;
    item.resueltoEn = new Date().toISOString();
    return item;
  }

  async getSolicitudesVerificacion(
    query: QueryListadosModeracionInput,
  ): Promise<ListadoPaginadoDTO<SolicitudVerificacionDTO>> {
    const filtered = query.estado
      ? this.verificaciones.filter((v) => v.estado === query.estado)
      : this.verificaciones;
    return {
      items: filtered,
      paginacion: {
        pagina: query.pagina,
        limite: query.limite,
        total: filtered.length,
        totalPaginas: 1,
      },
    };
  }

  async getMisSolicitudesVerificacion(
    solicitanteId: string,
  ): Promise<SolicitudVerificacionDTO[]> {
    return this.verificaciones.filter((v) => v.solicitanteId === solicitanteId);
  }

  async crearReporte(
    data: CrearReporteInput & {
      reportanteId?: string | null;
      dispositivoHash?: string | null;
    },
  ): Promise<ReporteModeracionDTO> {
    const rep: ReporteModeracionDTO = {
      id: `rep-${this.reportes.length + 1}`,
      negocioId: data.negocioId ?? null,
      nombreNegocio: null,
      publicacionId: data.publicacionId ?? null,
      tituloPublicacion: null,
      opinionId: data.opinionId ?? null,
      reportanteId: data.reportanteId ?? null,
      motivo: data.motivo,
      detalle: data.detalle ?? null,
      estado: 'pendiente',
      revisadoPorId: null,
      resolucionNota: null,
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
    };
    this.reportes.push(rep);
    return rep;
  }

  async findReporteById(id: string): Promise<ReporteModeracionDTO | null> {
    return this.reportes.find((r) => r.id === id) || null;
  }

  async resolverReporte(
    id: string,
    data: ResolverReporteInput,
    revisadoPorId: string,
  ): Promise<ReporteModeracionDTO> {
    const item = this.reportes.find((r) => r.id === id);
    if (!item) throw new Error('Not found');
    item.estado = data.estado;
    item.resolucionNota = data.resolucionNota ?? null;
    item.revisadoPorId = revisadoPorId;
    return item;
  }

  async getReportes(
    query: QueryListadosModeracionInput,
  ): Promise<ListadoPaginadoDTO<ReporteModeracionDTO>> {
    const filtered = query.estado
      ? this.reportes.filter((r) => r.estado === query.estado)
      : this.reportes;
    return {
      items: filtered,
      paginacion: {
        pagina: query.pagina,
        limite: query.limite,
        total: filtered.length,
        totalPaginas: 1,
      },
    };
  }

  async crearFeedback(
    data: CrearFeedbackInput & {
      usuarioId?: string | null;
      ipAddress?: string | null;
      userAgent?: string | null;
    },
  ): Promise<FeedbackPlataformaDTO> {
    const item: FeedbackPlataformaDTO = {
      id: `fb-${this.feedbacks.length + 1}`,
      usuarioId: data.usuarioId ?? null,
      nombreCompleto: data.nombreCompleto ?? null,
      email: data.email ?? null,
      mensaje: data.mensaje,
      notasAdmin: null,
      leido: false,
      creadoEn: new Date().toISOString(),
    };
    this.feedbacks.push(item);
    return item;
  }

  async getFeedbacks(
    query: QueryListadosModeracionInput,
  ): Promise<ListadoPaginadoDTO<FeedbackPlataformaDTO>> {
    return {
      items: this.feedbacks,
      paginacion: {
        pagina: query.pagina,
        limite: query.limite,
        total: this.feedbacks.length,
        totalPaginas: 1,
      },
    };
  }

  async marcarFeedbackLeido(
    id: string,
    notasAdmin?: string | null,
  ): Promise<FeedbackPlataformaDTO> {
    const item = this.feedbacks.find((f) => f.id === id);
    if (!item) throw new Error('Not found');
    item.leido = true;
    item.notasAdmin = notasAdmin ?? null;
    return item;
  }
}

describe('POW-35: Moderación Use Cases', () => {
  describe('SolicitarVerificacionUseCase', () => {
    it('debe permitir al dueño del negocio solicitar verificación', async () => {
      const repo = new MockModeracionRepository();
      repo.negocios.push({
        id: 'negocio-1',
        nombreComercial: 'Ferretería Centro',
        propietarioId: 'user-dueno',
        verificacion: 'no_solicitada',
      });

      const useCase = new SolicitarVerificacionUseCase(repo);
      const result = await useCase.execute(
        {
          negocioId: 'negocio-1',
          documentoFrenteUrl: 'https://img.com/dni.jpg',
        },
        'user-dueno',
      );

      assert.equal(result.estado, 'pendiente');
      assert.equal(result.solicitanteId, 'user-dueno');
    });

    it('debe rechazar si otro usuario no dueño intenta solicitar verificación', async () => {
      const repo = new MockModeracionRepository();
      repo.negocios.push({
        id: 'negocio-1',
        nombreComercial: 'Ferretería Centro',
        propietarioId: 'user-dueno',
        verificacion: 'no_solicitada',
      });

      const useCase = new SolicitarVerificacionUseCase(repo);
      await assert.rejects(
        () =>
          useCase.execute(
            { negocioId: 'negocio-1' },
            'user-hacker',
          ),
        { name: 'ForbiddenError' },
      );
    });

    it('debe rechazar si el comercio ya está verificado', async () => {
      const repo = new MockModeracionRepository();
      repo.negocios.push({
        id: 'negocio-1',
        nombreComercial: 'Ferretería Centro',
        propietarioId: 'user-dueno',
        verificacion: 'aprobada',
      });

      const useCase = new SolicitarVerificacionUseCase(repo);
      await assert.rejects(
        () =>
          useCase.execute(
            { negocioId: 'negocio-1' },
            'user-dueno',
          ),
        { name: 'ClientError' },
      );
    });

    it('debe rechazar si ya existe una solicitud pendiente', async () => {
      const repo = new MockModeracionRepository();
      repo.negocios.push({
        id: 'negocio-1',
        nombreComercial: 'Ferretería Centro',
        propietarioId: 'user-dueno',
        verificacion: 'pendiente',
      });
      repo.verificaciones.push({
        id: 'v-1',
        negocioId: 'negocio-1',
        nombreNegocio: 'Ferretería Centro',
        solicitanteId: 'user-dueno',
        documentoFrenteUrl: null,
        comprobanteComercioUrl: null,
        notasSolicitante: null,
        estado: 'pendiente',
        revisadoPorId: null,
        motivoRechazo: null,
        resueltoEn: null,
        creadoEn: '',
        actualizadoEn: '',
      });

      const useCase = new SolicitarVerificacionUseCase(repo);
      await assert.rejects(
        () =>
          useCase.execute(
            { negocioId: 'negocio-1' },
            'user-dueno',
          ),
        { name: 'ClientError' },
      );
    });
  });

  describe('ResolverSolicitudVerificacionUseCase', () => {
    it('debe aprobar la verificación correctamente', async () => {
      const repo = new MockModeracionRepository();
      repo.verificaciones.push({
        id: 'v-1',
        negocioId: 'negocio-1',
        nombreNegocio: 'Ferretería Centro',
        solicitanteId: 'user-dueno',
        documentoFrenteUrl: null,
        comprobanteComercioUrl: null,
        notasSolicitante: null,
        estado: 'pendiente',
        revisadoPorId: null,
        motivoRechazo: null,
        resueltoEn: null,
        creadoEn: '',
        actualizadoEn: '',
      });

      const useCase = new ResolverSolicitudVerificacionUseCase(repo);
      const res = await useCase.execute(
        'v-1',
        { estado: 'aprobada', badgeTexto: 'Comercio Oficial' },
        'admin-1',
      );

      assert.equal(res.estado, 'aprobada');
      assert.equal(res.revisadoPorId, 'admin-1');
    });

    it('debe requerir motivo al rechazar', async () => {
      const repo = new MockModeracionRepository();
      repo.verificaciones.push({
        id: 'v-1',
        negocioId: 'negocio-1',
        nombreNegocio: 'Ferretería Centro',
        solicitanteId: 'user-dueno',
        documentoFrenteUrl: null,
        comprobanteComercioUrl: null,
        notasSolicitante: null,
        estado: 'pendiente',
        revisadoPorId: null,
        motivoRechazo: null,
        resueltoEn: null,
        creadoEn: '',
        actualizadoEn: '',
      });

      const useCase = new ResolverSolicitudVerificacionUseCase(repo);
      await assert.rejects(
        () =>
          useCase.execute(
            'v-1',
            { estado: 'rechazada', motivoRechazo: '' },
            'admin-1',
          ),
        { name: 'ClientError' },
      );
    });
  });

  describe('CrearReporteUseCase', () => {
    it('debe crear un reporte sobre un comercio existente', async () => {
      const repo = new MockModeracionRepository();
      repo.negocios.push({
        id: 'negocio-1',
        nombreComercial: 'Kiosco 24hs',
        propietarioId: 'user-1',
        verificacion: 'no_solicitada',
      });

      const useCase = new CrearReporteUseCase(repo);
      const result = await useCase.execute(
        {
          negocioId: 'negocio-1',
          motivo: 'Spam y publicidad falsa',
          detalle: 'Publica precios falsos',
        },
        { reportanteId: 'vecino-1' },
      );

      assert.equal(result.negocioId, 'negocio-1');
      assert.equal(result.motivo, 'Spam y publicidad falsa');
      assert.equal(result.estado, 'pendiente');
    });

    it('debe rechazar si no se especifica ninguna entidad', async () => {
      const repo = new MockModeracionRepository();
      const useCase = new CrearReporteUseCase(repo);
      await assert.rejects(
        () =>
          useCase.execute(
            { motivo: 'Spam' },
            {},
          ),
        { name: 'ClientError' },
      );
    });

    it('debe rechazar si se especifican múltiples entidades a la vez', async () => {
      const repo = new MockModeracionRepository();
      const useCase = new CrearReporteUseCase(repo);
      await assert.rejects(
        () =>
          useCase.execute(
            {
              negocioId: 'negocio-1',
              publicacionId: 'pub-1',
              motivo: 'Spam',
            },
            {},
          ),
        { name: 'ClientError' },
      );
    });
  });

  describe('ResolverReporteUseCase', () => {
    it('debe resolver un reporte pendiente', async () => {
      const repo = new MockModeracionRepository();
      repo.reportes.push({
        id: 'rep-1',
        negocioId: 'negocio-1',
        nombreNegocio: null,
        publicacionId: null,
        tituloPublicacion: null,
        opinionId: null,
        reportanteId: null,
        motivo: 'Spam',
        detalle: null,
        estado: 'pendiente',
        revisadoPorId: null,
        resolucionNota: null,
        creadoEn: '',
        actualizadoEn: '',
      });

      const useCase = new ResolverReporteUseCase(repo);
      const result = await useCase.execute(
        'rep-1',
        { estado: 'resuelto_aceptado', resolucionNota: 'Publicación pausada' },
        'admin-1',
      );

      assert.equal(result.estado, 'resuelto_aceptado');
      assert.equal(result.resolucionNota, 'Publicación pausada');
      assert.equal(result.revisadoPorId, 'admin-1');
    });
  });

  describe('Feedback Use Cases', () => {
    it('debe crear un feedback de la plataforma', async () => {
      const repo = new MockModeracionRepository();
      const useCase = new CrearFeedbackUseCase(repo);
      const fb = await useCase.execute(
        {
          mensaje: 'Me encanta la plataforma, sigan así!',
          nombreCompleto: 'Juan Alberdi',
          email: 'juan@alberdi.com',
        },
        { ipAddress: '127.0.0.1' },
      );

      assert.equal(fb.mensaje, 'Me encanta la plataforma, sigan así!');
      assert.equal(fb.leido, false);
    });

    it('debe marcar el feedback como leído', async () => {
      const repo = new MockModeracionRepository();
      repo.feedbacks.push({
        id: 'fb-1',
        usuarioId: null,
        nombreCompleto: 'Juan',
        email: 'juan@test.com',
        mensaje: 'Test feedback',
        notasAdmin: null,
        leido: false,
        creadoEn: '',
      });

      const useCase = new MarcarFeedbackLeidoUseCase(repo);
      const fb = await useCase.execute('fb-1', 'Anotado para Sprint 2');

      assert.equal(fb.leido, true);
      assert.equal(fb.notasAdmin, 'Anotado para Sprint 2');
    });
  });
});
