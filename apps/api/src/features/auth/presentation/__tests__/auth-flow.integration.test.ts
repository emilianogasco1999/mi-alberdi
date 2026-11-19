import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import express, { Request, Response } from 'express';
import { createApp } from '../../../../app.js';
import { requireAuth } from '@core/presentation/middlewares/auth.middleware.js';
import { requireRole } from '@core/presentation/middlewares/permission.middleware.js';
import { errorHandler } from '@core/presentation/middlewares/errorHandler.middleware.js';
import { auth } from '@core/infrastructure/auth/better-auth.config.js';
import { prisma } from '@core/infrastructure/database/prisma.service.js';

describe('Integración: Flujo Completo de Autenticación con Better Auth (SUB-BE-02.3 / POW-145)', () => {
  const mainApp = createApp();

  // App de prueba para verificar autorización end-to-end con middlewares
  const createSecureTestApp = () => {
    const app = express();
    app.use(express.json());

    // Endpoint autenticado
    app.get('/api/test/profile', requireAuth, (req: Request, res: Response) => {
      res.status(200).json({
        ok: true,
        user: {
          id: req.user?.id,
          email: req.user?.email,
          role: req.user?.role,
        },
      });
    });

    // Endpoint restringido solo a administradores
    app.get(
      '/api/test/admin-panel',
      requireAuth,
      requireRole(['admin']),
      (req: Request, res: Response) => {
        res.status(200).json({ ok: true, message: 'Bienvenido al panel de administración' });
      },
    );

    app.use(errorHandler);
    return app;
  };

  const secureApp = createSecureTestApp();

  let adminCookies: string[] = [];
  let vecinoCookies: string[] = [];

  const adminCredentials = {
    email: 'admin@mialberdi.com.ar',
    password: 'AdminAlberdi2026!',
  };

  const vecinoCredentials = {
    email: 'vecino-auth-test@mialberdi.com.ar',
    password: 'VecinoPassword2026!',
  };

  before(async () => {
    // Asegurar usuario vecino en DB para test de roles
    try {
      await auth.api.createUser({
        body: {
          name: 'Vecino Auth Flow Test',
          email: vecinoCredentials.email,
          password: vecinoCredentials.password,
        },
      });
    } catch {
      // Usuario ya existente de una corrida anterior
    }

    await prisma.user.update({
      where: { email: vecinoCredentials.email },
      data: { role: 'vecino' },
    });
  });

  describe('1. Login Exitoso y Emisión de Cookies Seguras (/api/auth/sign-in/email)', () => {
    it('debe autenticar exitosamente y emitir cookie HttpOnly con better-auth.session_token', async () => {
      const res = await request(mainApp)
        .post('/api/auth/sign-in/email')
        .send(adminCredentials);

      assert.strictEqual(res.status, 200);
      assert.ok(res.body.user, 'La respuesta debe incluir el objeto user');
      assert.strictEqual(res.body.user.email, adminCredentials.email);
      assert.strictEqual(res.body.user.role, 'admin');

      // Seguridad: verificar que no se filtren contraseñas ni hashes
      assert.strictEqual('password' in res.body.user, false);
      assert.strictEqual('passwordHash' in res.body.user, false);

      // Verificar cabecera Set-Cookie
      const rawCookies = res.headers['set-cookie'];
      assert.ok(rawCookies, 'Debe emitir cabecera set-cookie');
      adminCookies = (rawCookies as unknown as string[]) || [];

      const cookieHeader = Array.isArray(rawCookies) ? rawCookies.join('; ') : rawCookies;
      assert.match(cookieHeader, /better-auth\.session_token=/i, 'Debe contener el nombre de la cookie de sesión');
      assert.match(cookieHeader, /HttpOnly/i, 'La cookie debe tener la directiva HttpOnly para mitigar ataques XSS');
      assert.match(cookieHeader, /Path=\//i, 'La cookie debe tener el Path configurado en /');
    });
  });

  describe('2. Rechazo ante Credenciales Inválidas o Usuario Inexistente', () => {
    it('debe rechazar con HTTP 401 si el usuario no existe', async () => {
      const res = await request(mainApp)
        .post('/api/auth/sign-in/email')
        .send({
          email: 'usuario.inexistente@mialberdi.com.ar',
          password: 'PasswordInvalido123!',
        });

      assert.strictEqual(res.status, 401);
      // No debe emitir cookie de sesión
      const rawCookies = res.headers['set-cookie'];
      if (rawCookies) {
        const cookieStr = Array.isArray(rawCookies) ? rawCookies.join('; ') : rawCookies;
        assert.doesNotMatch(cookieStr, /better-auth\.session_token=[^;]+/i);
      }
    });

    it('debe rechazar con HTTP 401 si la contraseña es incorrecta para un usuario existente', async () => {
      const res = await request(mainApp)
        .post('/api/auth/sign-in/email')
        .send({
          email: adminCredentials.email,
          password: 'ContraseñaTotalmenteIncorrecta999!',
        });

      assert.strictEqual(res.status, 401);
    });
  });

  describe('3. Acceso a Endpoints Protegidos con requireAuth y requireRole', () => {
    it('debe rechazar con HTTP 401 Unauthorized cuando no se envía cookie de sesión', async () => {
      const res = await request(secureApp).get('/api/test/profile');

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.ok, false);
      assert.match(res.body.error.message, /Token de acceso no proporcionado/i);
    });

    it('debe permitir acceso con HTTP 200 a endpoint privado cuando se envía la cookie del admin', async () => {
      const res = await request(secureApp)
        .get('/api/test/profile')
        .set('Cookie', adminCookies);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.ok, true);
      assert.strictEqual(res.body.user.email, adminCredentials.email);
      assert.strictEqual(res.body.user.role, 'admin');
    });

    it('debe permitir acceso a /api/test/admin-panel a usuario con rol admin', async () => {
      const res = await request(secureApp)
        .get('/api/test/admin-panel')
        .set('Cookie', adminCookies);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.ok, true);
      assert.match(res.body.message, /panel de administración/i);
    });

    it('debe rechazar con HTTP 403 Forbidden a usuario con rol vecino intentando acceder a admin-panel', async () => {
      // Iniciar sesión con vecino
      const loginVecino = await request(mainApp)
        .post('/api/auth/sign-in/email')
        .send(vecinoCredentials);

      assert.strictEqual(loginVecino.status, 200);
      vecinoCookies = (loginVecino.headers['set-cookie'] as unknown as string[]) || [];

      // Intento de acceso a admin-panel con sesión de vecino
      const res = await request(secureApp)
        .get('/api/test/admin-panel')
        .set('Cookie', vecinoCookies);

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.ok, false);
      assert.match(res.body.error.message, /permisos suficientes/i);
    });
  });

  describe('4. Flujo de Cierre de Sesión (/api/auth/sign-out) y Revocación', () => {
    it('debe cerrar sesión exitosamente e invalidar la cookie activa', async () => {
      // 1. Iniciar sesión fresca para obtener cookie
      const loginRes = await request(mainApp)
        .post('/api/auth/sign-in/email')
        .send(adminCredentials);

      assert.strictEqual(loginRes.status, 200);
      const sessionCookies = (loginRes.headers['set-cookie'] as unknown as string[]) || [];

      // 2. Comprobar que la sesión funciona
      const accessBefore = await request(secureApp)
        .get('/api/test/profile')
        .set('Cookie', sessionCookies);
      assert.strictEqual(accessBefore.status, 200);

      // 3. Ejecutar POST /api/auth/sign-out
      const logoutRes = await request(mainApp)
        .post('/api/auth/sign-out')
        .set('Origin', 'http://localhost:3000')
        .set('Cookie', sessionCookies)
        .send({});

      assert.strictEqual(logoutRes.status, 200);

      // 4. Intentar acceder al endpoint protegido con esa sesión cerrada -> debe responder 401
      const accessAfter = await request(secureApp)
        .get('/api/test/profile')
        .set('Cookie', sessionCookies);

      assert.strictEqual(accessAfter.status, 401);
      assert.strictEqual(accessAfter.body.ok, false);
      assert.match(accessAfter.body.error.message, /Token de acceso no proporcionado/i);
    });
  });
});
