import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { envs } from '@config/environment.js';
import { ROLES_USUARIO, type CrearUsuarioComercianteInput } from '@mi-alberdi/shared';
import { createApp } from '../../../../app.js';
import { InMemoryAuthService } from '../../infrastructure/adapters/in-memory-auth.service.js';
import { UsuariosRoutes } from '../routes/usuarios.routes.js';
import express from 'express';
import { errorHandler } from '@core/presentation/middlewares/errorHandler.middleware.js';

describe('Integración: POST /api/admin/usuarios', () => {
  // Generar tokens para pruebas de autorización
  const adminToken = jwt.sign(
    { id: 'admin-uuid-1', email: 'admin@alberdi.com', rol: ROLES_USUARIO.ADMIN },
    envs.JWT_SECRET,
    { expiresIn: '1h' },
  );

  const vecinoToken = jwt.sign(
    { id: 'vecino-uuid-1', email: 'vecino@alberdi.com', rol: ROLES_USUARIO.VECINO },
    envs.JWT_SECRET,
    { expiresIn: '1h' },
  );

  const comercianteToken = jwt.sign(
    { id: 'comerciante-uuid-1', email: 'comerciante@alberdi.com', rol: ROLES_USUARIO.COMERCIANTE },
    envs.JWT_SECRET,
    { expiresIn: '1h' },
  );

  // Helper para crear app de prueba con InMemoryAuthService aislado
  const createTestApp = (authService?: InMemoryAuthService) => {
    const app = express();
    app.use(express.json());
    app.use('/api/admin/usuarios', UsuariosRoutes(authService));
    app.use(errorHandler);
    return app;
  };

  it('1. Retorna 201 Created cuando el admin envía datos válidos', async () => {
    const authService = new InMemoryAuthService();
    const app = createTestApp(authService);

    const payload: CrearUsuarioComercianteInput = {
      nombre: 'Ferretería El Tornillo',
      email: 'eltornillo@alberdi.com',
      password: 'Password123',
    };

    const res = await request(app)
      .post('/api/admin/usuarios')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload);

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.ok, true);
    assert.strictEqual(res.body.message, 'Usuario comerciante creado exitosamente');
    assert.strictEqual(res.body.data.nombre, 'Ferretería El Tornillo');
    assert.strictEqual(res.body.data.email, 'eltornillo@alberdi.com');
    assert.strictEqual(res.body.data.rol, ROLES_USUARIO.COMERCIANTE);
    assert.strictEqual(res.body.data.estado, 'activo');
    assert.ok(res.body.data.id);
    assert.strictEqual('password' in res.body.data, false);
    assert.strictEqual('passwordHash' in res.body.data, false);
  });

  it('2. Retorna 400 Bad Request cuando el body no cumple con la validación de Zod', async () => {
    const app = createTestApp();

    const invalidPayload = {
      nombre: 'A', // Muy corto (< 2 chars)
      email: 'no-es-un-email',
      password: 'corta', // Menor a 8 chars y sin números
    };

    const res = await request(app)
      .post('/api/admin/usuarios')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(invalidPayload);

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.ok, false);
    assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
    assert.ok(Array.isArray(res.body.error.details));
  });

  it('3. Retorna 401 Unauthorized si no se envía token de sesión', async () => {
    const app = createTestApp();

    const payload: CrearUsuarioComercianteInput = {
      nombre: 'Kiosco Central',
      email: 'kiosco@alberdi.com',
      password: 'Password123',
    };

    const res = await request(app)
      .post('/api/admin/usuarios')
      .send(payload);

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.ok, false);
    assert.match(res.body.error.message, /Token de acceso no proporcionado/i);
  });

  it('4. Retorna 403 Forbidden si el usuario no tiene rol ADMIN', async () => {
    const app = createTestApp();

    const payload: CrearUsuarioComercianteInput = {
      nombre: 'Pizzería La Alberdina',
      email: 'pizzeria@alberdi.com',
      password: 'Password123',
    };

    // Intento con rol Vecino
    const resVecino = await request(app)
      .post('/api/admin/usuarios')
      .set('Authorization', `Bearer ${vecinoToken}`)
      .send(payload);

    assert.strictEqual(resVecino.status, 403);
    assert.strictEqual(resVecino.body.ok, false);
    assert.match(resVecino.body.error.message, /permisos suficientes/i);

    // Intento con rol Comerciante
    const resComerciante = await request(app)
      .post('/api/admin/usuarios')
      .set('Authorization', `Bearer ${comercianteToken}`)
      .send(payload);

    assert.strictEqual(resComerciante.status, 403);
    assert.strictEqual(resComerciante.body.ok, false);
  });

  it('5. Retorna 409 Conflict si el email ya existe en el sistema', async () => {
    const authService = new InMemoryAuthService();
    const app = createTestApp(authService);

    const payload: CrearUsuarioComercianteInput = {
      nombre: 'Panadería La Espiga',
      email: 'laespiga@alberdi.com',
      password: 'Password123',
    };

    // Primera creación exitosa
    const res1 = await request(app)
      .post('/api/admin/usuarios')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload);
    assert.strictEqual(res1.status, 201);

    // Segunda creación con el mismo email -> conflicto
    const res2 = await request(app)
      .post('/api/admin/usuarios')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'Otra Panadería',
        email: 'LAESPIGA@alberdi.com',
        password: 'Password456',
      });

    assert.strictEqual(res2.status, 409);
    assert.strictEqual(res2.body.ok, false);
    assert.strictEqual(
      res2.body.error.message,
      'El correo electrónico ya se encuentra registrado en el sistema',
    );
  });
});
