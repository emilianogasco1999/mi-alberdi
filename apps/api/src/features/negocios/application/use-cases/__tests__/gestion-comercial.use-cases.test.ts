import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { ActualizarNegocioSchema, CrearNegocioSchema } from '@mi-alberdi/shared';
import { InMemoryNegociosRepository } from '../../../infrastructure/repositories/in-memory-negocios.repository.js';
import { ActualizarNegocioUseCase } from '../actualizar-negocio.use-case.js';
import { CrearNegocioUseCase } from '../crear-negocio.use-case.js';
import { ListarMisNegociosUseCase } from '../listar-mis-negocios.use-case.js';

describe('SUB-BE-03.2: Casos de Uso de Gestión Comercial (Clean Architecture)', () => {
  let repository: InMemoryNegociosRepository;
  let crearNegocioUseCase: CrearNegocioUseCase;
  let listarMisNegociosUseCase: ListarMisNegociosUseCase;
  let actualizarNegocioUseCase: ActualizarNegocioUseCase;

  const COMERCIANTE_A_ID = '11111111-1111-4111-8111-111111111111';
  const COMERCIANTE_B_ID = '22222222-2222-4222-8222-222222222222';

  beforeEach(() => {
    repository = new InMemoryNegociosRepository();
    crearNegocioUseCase = new CrearNegocioUseCase(repository);
    listarMisNegociosUseCase = new ListarMisNegociosUseCase(repository);
    actualizarNegocioUseCase = new ActualizarNegocioUseCase(repository);
  });

  describe('CrearNegocioUseCase', () => {
    it('debe crear un comercio u oficio asociado al usuario, generar slug único y omitir propietarioId en el DTO', async () => {
      const input = CrearNegocioSchema.parse({
        nombre: 'Ferretería El Tornillo',
        tipo: 'COMERCIO',
        telefono: '+54 9 3865 112233',
        direccion: 'Av. Campero 450',
        descripcion: 'Herramientas y materiales eléctricos',
        instagram: '@ferreteria.eltornillo',
      });

      const creado = await crearNegocioUseCase.execute(COMERCIANTE_A_ID, input);

      assert.ok(creado.id);
      assert.equal(creado.slug, 'ferreteria-el-tornillo');
      assert.equal(creado.nombre, 'Ferretería El Tornillo');
      assert.equal(creado.nombreComercial, 'Ferretería El Tornillo');
      assert.equal(creado.tipo, 'COMERCIO');
      assert.equal(creado.tipoPerfil, 'comercio');
      assert.equal(creado.telefono, '+54 9 3865 112233');
      assert.equal(creado.direccion, 'Av. Campero 450');
      assert.equal(creado.instagram, '@ferreteria.eltornillo');
      assert.equal('propietarioId' in creado, false);
    });

    it('debe desambiguar el slug automáticamente si ya existe otro comercio con el mismo nombre', async () => {
      const input = CrearNegocioSchema.parse({
        nombre: 'Panadería San Cayetano',
        tipo: 'COMERCIO',
        telefono: '+543865123456',
        direccion: 'San Martín 120',
      });

      const primero = await crearNegocioUseCase.execute(COMERCIANTE_A_ID, input);
      const segundo = await crearNegocioUseCase.execute(COMERCIANTE_B_ID, input);

      assert.equal(primero.slug, 'panaderia-san-cayetano');
      assert.equal(segundo.slug, 'panaderia-san-cayetano-2');
    });
  });

  describe('ListarMisNegociosUseCase (Relación 1:N y Aislamiento)', () => {
    it('debe listar únicamente los comercios y oficios pertenecientes al comerciante autenticado (1:N)', async () => {
      await crearNegocioUseCase.execute(
        COMERCIANTE_A_ID,
        CrearNegocioSchema.parse({
          nombre: 'Kiosco 24 Horas',
          tipo: 'COMERCIO',
          telefono: '+543865100001',
          direccion: 'Calle Rivadavia 105',
        }),
      );
      await crearNegocioUseCase.execute(
        COMERCIANTE_A_ID,
        CrearNegocioSchema.parse({
          nombre: 'Electricista Matriculado Carlos',
          tipo: 'OFICIO',
          telefono: '+543865100002',
          direccion: 'Barrio Centro, Alberdi',
        }),
      );
      await crearNegocioUseCase.execute(
        COMERCIANTE_B_ID,
        CrearNegocioSchema.parse({
          nombre: 'Carnicería Don José',
          tipo: 'COMERCIO',
          telefono: '+543865999999',
          direccion: 'Av. Mitre 700',
        }),
      );

      const negociosComercianteA = await listarMisNegociosUseCase.execute(COMERCIANTE_A_ID);
      const negociosComercianteB = await listarMisNegociosUseCase.execute(COMERCIANTE_B_ID);

      assert.equal(negociosComercianteA.length, 2);
      assert.equal(negociosComercianteA[0]?.nombre, 'Kiosco 24 Horas');
      assert.equal(negociosComercianteA[1]?.nombre, 'Electricista Matriculado Carlos');
      assert.equal(negociosComercianteA[1]?.tipo, 'OFICIO');

      assert.equal(negociosComercianteB.length, 1);
      assert.equal(negociosComercianteB[0]?.nombre, 'Carnicería Don José');
    });
  });

  describe('ActualizarNegocioUseCase (Validación estricta de propiedad)', () => {
    it('debe permitir al propietario actualizar los datos y dirección de su comercio', async () => {
      const creado = await crearNegocioUseCase.execute(
        COMERCIANTE_A_ID,
        CrearNegocioSchema.parse({
          nombre: 'Taller Mecánico Sur',
          tipo: 'OFICIO',
          telefono: '+543865223344',
          direccion: 'Barrio Sur Calle 4',
        }),
      );

      const cambios = ActualizarNegocioSchema.parse({
        nombre: 'Taller Mecánico Integral Sur',
        direccion: 'Av. Campero 850',
        instagram: '@tallersur.alberdi',
      });

      const actualizado = await actualizarNegocioUseCase.execute(
        creado.id,
        COMERCIANTE_A_ID,
        cambios,
      );

      assert.equal(actualizado.nombre, 'Taller Mecánico Integral Sur');
      assert.equal(actualizado.nombreComercial, 'Taller Mecánico Integral Sur');
      assert.equal(actualizado.direccion, 'Av. Campero 850');
      assert.equal(actualizado.direccionEscrita, 'Av. Campero 850');
      assert.equal(actualizado.instagram, '@tallersur.alberdi');
    });

    it('debe rechazar con 403 ForbiddenError si otro comerciante intenta modificar un negocio ajeno', async () => {
      const creadoPorA = await crearNegocioUseCase.execute(
        COMERCIANTE_A_ID,
        CrearNegocioSchema.parse({
          nombre: 'Farmacia Alberdi',
          tipo: 'COMERCIO',
          telefono: '+543865334455',
          direccion: 'Plaza Principal 10',
        }),
      );

      await assert.rejects(
        async () => {
          await actualizarNegocioUseCase.execute(
            creadoPorA.id,
            COMERCIANTE_B_ID,
            ActualizarNegocioSchema.parse({ nombre: 'Farmacia Intrusa' }),
          );
        },
        (error: unknown) => {
          const appErr = error as { statusCode?: number; message?: string };
          assert.equal(appErr.statusCode, 403);
          assert.match(appErr.message ?? '', /No tenés permisos/i);
          return true;
        },
      );
    });

    it('debe rechazar con 404 NotFoundError si el negocio no existe', async () => {
      await assert.rejects(
        async () => {
          await actualizarNegocioUseCase.execute(
            '99999999-9999-4999-8999-999999999999',
            COMERCIANTE_A_ID,
            ActualizarNegocioSchema.parse({ nombre: 'Inexistente' }),
          );
        },
        (error: unknown) => {
          const appErr = error as { statusCode?: number; message?: string };
          assert.equal(appErr.statusCode, 404);
          assert.match(appErr.message ?? '', /no existe/i);
          return true;
        },
      );
    });
  });
});
