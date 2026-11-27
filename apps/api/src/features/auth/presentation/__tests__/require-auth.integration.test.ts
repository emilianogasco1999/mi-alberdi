import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import express, { Request, Response } from 'express';
import request from 'supertest';
import { requireAuth } from '../../../../core/presentation/middlewares/auth.middleware.js';
import { requireRole } from '../../../../core/presentation/middlewares/permission.middleware.js';
import { errorHandler } from '../../../../core/presentation/middlewares/errorHandler.middleware.js';
import { createApp } from '../../../../app.js';

describe('Integración: Middlewares requireAuth y requireRole (POW-144 / SUB-BE-02.2)', () => {
  // App de prueba con endpoints protegidos por requireAuth y requireRole
  const createTestApp = () => {
    const app = express();
    app.use(express.json());

    // Endpoint solo autenticado
    app.get('/api/test/private', requireAuth, (req: Request, res: Response) => {
      res.status(200).json({
        ok: true,
        user: req.user,
        session: req.session,
      });
    });

    // Endpoint restringido a administradores
    app.get(
      '/api/test/admin-only',
      requireAuth,
      requireRole(['admin']),
      (req: Request, res: Response) => {
        res.status(200).json({ ok: true, role: req.user?.role });
      },
    );

    // Endpoint restringido a comerciantes o administradores (case insensitive test)
    app.get(
      '/api/test/comerciante-only',
      requireAuth,
      requireRole(['COMERCIANTE', 'ADMIN']),
      (req: Request, res: Response) => {
        res.status(200).json({ ok: true, role: req.user?.role });
      },
    );

    app.use(errorHandler);
    return app;
  };

  const testApp = createTestApp();
  const mainApp = createApp();

  describe('1. Middleware requireAuth', () => {
    it('debe rechazar con HTTP 401 cuando no se envían credenciales de sesión', async () => {
      const res = await request(testApp).get('/api/test/private');

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.ok, false);
      assert.match(res.body.error.message, /Token de acceso no proporcionado|sesi[oó]n|autorizad/i);
    });

    it('debe permitir acceso y poblar req.user y req.session con cookie de Better Auth válida', async () => {
      // 1. Iniciar sesión con admin
      const loginRes = await request(mainApp)
        .post('/api/auth/sign-in/email')
        .send({
          email: 'admin@mialberdi.com.ar',
          password: 'AdminAlberdi2026!',
        });

      assert.strictEqual(loginRes.status, 200);
      const cookies = loginRes.headers['set-cookie'];
      assert.ok(cookies, 'Debe haber cookie de sesión');

      // 2. Acceder al endpoint privado con la cookie
      const res = await request(testApp)
        .get('/api/test/private')
        .set('Cookie', cookies);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.ok, true);
      assert.ok(res.body.user);
      assert.ok(res.body.session);
      assert.strictEqual(res.body.user.email, 'admin@mialberdi.com.ar');
      assert.strictEqual(res.body.user.role, 'admin');
      assert.strictEqual(res.body.user.rol, 'admin'); // Alias retrocompatible
    });
  });

  describe('2. Middleware requireRole (RBAC)', () => {
    it('debe permitir acceso con HTTP 200 a usuario admin en ruta admin-only', async () => {
      const loginRes = await request(mainApp)
        .post('/api/auth/sign-in/email')
        .send({
          email: 'admin@mialberdi.com.ar',
          password: 'AdminAlberdi2026!',
        });

      const cookies = loginRes.headers['set-cookie'];

      const res = await request(testApp)
        .get('/api/test/admin-only')
        .set('Cookie', cookies);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.ok, true);
      assert.strictEqual(res.body.role, 'admin');
    });

    it('debe rechazar con HTTP 403 Forbidden cuando el rol no cumple con los permisos requeridos', async () => {
      // Crear app con simulación de usuario con rol 'vecino'
      const appVecino = express();
      appVecino.use(express.json());
      appVecino.get(
        '/api/test/admin-only',
        (req: Request, _res: Response, next) => {
          req.user = {
            id: 'vecino-123',
            name: 'Juan Vecino',
            email: 'vecino@alberdi.com',
            role: 'vecino',
            rol: 'vecino',
          } as any;
          next();
        },
        requireRole(['admin']),
        (_req: Request, res: Response) => {
          res.status(200).json({ ok: true });
        },
      );
      appVecino.use(errorHandler);

      const res = await request(appVecino).get('/api/test/admin-only');

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.ok, false);
      assert.match(res.body.error.message, /permisos suficientes/i);
    });

    it('debe soportar validación case-insensitive de roles ([COMERCIANTE] valida con "admin" o "comerciante")', async () => {
      const loginRes = await request(mainApp)
        .post('/api/auth/sign-in/email')
        .send({
          email: 'admin@mialberdi.com.ar',
          password: 'AdminAlberdi2026!',
        });

      const cookies = loginRes.headers['set-cookie'];

      const res = await request(testApp)
        .get('/api/test/comerciante-only')
        .set('Cookie', cookies);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.ok, true);
    });
  });
});
