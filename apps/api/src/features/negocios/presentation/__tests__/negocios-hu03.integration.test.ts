import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import express from 'express';
import request from 'supertest';
import { createApp } from '../../../../app.js';
import { auth } from '@core/infrastructure/auth/better-auth.config.js';
import { prisma } from '@core/infrastructure/database/prisma.service.js';
import { errorHandler } from '@core/presentation/middlewares/errorHandler.middleware.js';
import { InMemoryNegociosRepository } from '../../infrastructure/repositories/in-memory-negocios.repository.js';
import { NegociosRoutes } from '../routes/negocios.routes.js';

describe('Integración SUB-BE-03.3: Endpoints de Negocios y Middleware de Carga de Assets', () => {
  const mainApp = createApp();
  let comercianteACookies: string[] = [];
  let comercianteBCookies: string[] = [];

  before(async () => {
    const password = 'Password123!';
    const emailA = 'comerciante-a-hu03@mialberdi.com.ar';
    const emailB = 'comerciante-b-hu03@mialberdi.com.ar';

    for (const [email, name] of [
      [emailA, 'Comerciante A HU03'],
      [emailB, 'Comerciante B HU03'],
    ] as const) {
      try {
        await auth.api.createUser({
          body: { name, email, password },
        });
      } catch {
        // Usuario ya creado en corrida previa
      }
      await prisma.user.update({
        where: { email },
        data: { role: 'comerciante' },
      });
    }

    const loginA = await request(mainApp)
      .post('/api/auth/sign-in/email')
      .send({ email: emailA, password });
    comercianteACookies = (loginA.headers['set-cookie'] as unknown as string[]) || [];

    const loginB = await request(mainApp)
      .post('/api/auth/sign-in/email')
      .send({ email: emailB, password });
    comercianteBCookies = (loginB.headers['set-cookie'] as unknown as string[]) || [];
  });

  const createTestApp = (repository = new InMemoryNegociosRepository()) => {
    const app = express();
    app.use(express.json());
    app.use('/api/negocios', NegociosRoutes(repository));
    app.use(errorHandler);
    return { app, repository };
  };

  it('1. POST /api/negocios crea un comercio con multipart/form-data (logo .webp y banner .png válidos <= 2MB)', async () => {
    const { app } = createTestApp();
    const fakeImageBuffer = Buffer.alloc(1024, 0xff); // 1KB

    const res = await request(app)
      .post('/api/negocios')
      .set('Cookie', comercianteACookies)
      .field('nombre', 'Ferretería San Martín')
      .field('tipo', 'COMERCIO')
      .field('telefono', '+54 9 3865 123456')
      .field('direccion', 'Av. Campero 450, Alberdi')
      .field('descripcion', 'Materiales eléctricos y herramientas')
      .field('instagram', '@ferreteria.sanmartin')
      .attach('logo', fakeImageBuffer, {
        filename: 'logo-comercio.webp',
        contentType: 'image/webp',
      })
      .attach('banner', fakeImageBuffer, {
        filename: 'banner-comercio.png',
        contentType: 'image/png',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.data.nombre, 'Ferretería San Martín');
    assert.equal(res.body.data.tipo, 'COMERCIO');
    assert.equal(res.body.data.tipoPerfil, 'comercio');
    assert.equal(res.body.data.direccion, 'Av. Campero 450, Alberdi');
    assert.match(res.body.data.logoUrl, /^\/uploads\/negocios\/logos\/.+\.webp$/);
    assert.match(res.body.data.bannerUrl, /^\/uploads\/negocios\/banners\/.+\.png$/);
    assert.equal('propietarioId' in res.body.data, false);
  });

  it('2. POST /api/negocios rechaza con 400 Bad Request un archivo con extensión no permitida (.pdf / .exe)', async () => {
    const { app } = createTestApp();
    const fakePdfBuffer = Buffer.from('%PDF-1.4 fake pdf content');

    const res = await request(app)
      .post('/api/negocios')
      .set('Cookie', comercianteACookies)
      .field('nombre', 'Comercio Con Archivo Inválido')
      .field('tipo', 'COMERCIO')
      .field('telefono', '+543865123456')
      .field('direccion', 'Av. Campero 123')
      .attach('logo', fakePdfBuffer, {
        filename: 'documento.pdf',
        contentType: 'application/pdf',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.ok, false);
    assert.equal(res.body.error.code, 'INVALID_FILE_TYPE');
    assert.match(res.body.error.message, /Formato de archivo no permitido/i);
  });

  it('3. POST /api/negocios rechaza con 400 Bad Request un archivo que supera el límite de 2MB', async () => {
    const { app } = createTestApp();
    const oversizedBuffer = Buffer.alloc(2 * 1024 * 1024 + 1024, 0xaa); // 2MB + 1KB

    const res = await request(app)
      .post('/api/negocios')
      .set('Cookie', comercianteACookies)
      .field('nombre', 'Comercio Imagen Pesada')
      .field('tipo', 'COMERCIO')
      .field('telefono', '+543865123456')
      .field('direccion', 'Av. Campero 123')
      .attach('logo', oversizedBuffer, {
        filename: 'pesado.jpg',
        contentType: 'image/jpeg',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.ok, false);
    assert.equal(res.body.error.code, 'FILE_TOO_LARGE');
    assert.match(res.body.error.message, /2MB/i);
  });

  it('4. GET /api/negocios/mis-comercios lista únicamente los comercios propios del comerciante autenticado (1:N)', async () => {
    const { app } = createTestApp();

    // Comerciante A crea 2 locales
    await request(app)
      .post('/api/negocios')
      .set('Cookie', comercianteACookies)
      .send({
        nombre: 'Panadería Del Sol',
        tipo: 'COMERCIO',
        telefono: '+543865100001',
        direccion: 'San Martín 150',
        descripcion: 'Panadería artesanal',
        instagram: '@panaderia.delsol',
      });

    await request(app)
      .post('/api/negocios')
      .set('Cookie', comercianteACookies)
      .send({
        nombre: 'Gasista Matriculado A',
        tipo: 'OFICIO',
        telefono: '+543865100002',
        direccion: 'Barrio Norte Calle 2',
        descripcion: 'Instalaciones de gas natural y envasado',
        instagram: '@gasista.alberdi',
      });

    // Comerciante B crea 1 local
    await request(app)
      .post('/api/negocios')
      .set('Cookie', comercianteBCookies)
      .send({
        nombre: 'Verdulería El Huerto',
        tipo: 'COMERCIO',
        telefono: '+543865200001',
        direccion: 'Belgrano 400',
      });

    const listA = await request(app)
      .get('/api/negocios/mis-comercios')
      .set('Cookie', comercianteACookies);

    assert.equal(listA.status, 200);
    assert.equal(listA.body.ok, true);
    assert.equal(listA.body.data.length, 2);
    assert.equal(listA.body.data[0].nombre, 'Panadería Del Sol');
    assert.equal(listA.body.data[0].descripcion, 'Panadería artesanal');
    assert.equal(listA.body.data[0].instagram, '@panaderia.delsol');
    assert.equal(listA.body.data[1].nombre, 'Gasista Matriculado A');
    assert.equal(listA.body.data[1].descripcion, 'Instalaciones de gas natural y envasado');
    assert.equal(listA.body.data[1].instagram, '@gasista.alberdi');

    const listB = await request(app)
      .get('/api/negocios/mis-comercios')
      .set('Cookie', comercianteBCookies);

    assert.equal(listB.status, 200);
    assert.equal(listB.body.data.length, 1);
    assert.equal(listB.body.data[0].nombre, 'Verdulería El Huerto');
  });

  it('5. PUT /api/negocios/:id permite editar un comercio propio y bloquea con 403 si pertenece a otro usuario', async () => {
    const { app } = createTestApp();

    const createdRes = await request(app)
      .post('/api/negocios')
      .set('Cookie', comercianteACookies)
      .send({
        nombre: 'Pizzería Don Mateo',
        tipo: 'COMERCIO',
        telefono: '+543865300001',
        direccion: 'Av. Campero 200',
      });

    const negocioId = createdRes.body.data.id as string;

    // Edición por su dueño (Comerciante A) -> 200 OK
    const updateOk = await request(app)
      .put(`/api/negocios/${negocioId}`)
      .set('Cookie', comercianteACookies)
      .send({
        nombre: 'Pizzería y Lomitería Don Mateo',
        direccion: 'Av. Campero 250',
      });

    assert.equal(updateOk.status, 200);
    assert.equal(updateOk.body.ok, true);
    assert.equal(updateOk.body.data.nombre, 'Pizzería y Lomitería Don Mateo');
    assert.equal(updateOk.body.data.direccion, 'Av. Campero 250');

    // Intento de edición por Comerciante B -> 403 Forbidden
    const updateForbidden = await request(app)
      .put(`/api/negocios/${negocioId}`)
      .set('Cookie', comercianteBCookies)
      .send({
        nombre: 'Pizzería Robada',
      });

    assert.equal(updateForbidden.status, 403);
    assert.equal(updateForbidden.body.ok, false);
    assert.match(updateForbidden.body.error.message, /No tenés permisos/i);
  });

  it('6. Rechaza con 401 Unauthorized si se invoca cualquier endpoint privado sin sesión activa', async () => {
    const { app } = createTestApp();

    const resGet = await request(app).get('/api/negocios/mis-comercios');
    assert.equal(resGet.status, 401);

    const resPost = await request(app).post('/api/negocios').send({
      nombre: 'Sin Sesion',
      tipo: 'COMERCIO',
      telefono: '+543865123456',
      direccion: 'Av. Campero 100',
    });
    assert.equal(resPost.status, 401);
  });
});
