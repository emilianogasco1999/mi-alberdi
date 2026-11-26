import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { ROLES_USUARIO } from '@mi-alberdi/shared';
import { createApp } from '../../../../app.js';
import { prisma } from '@core/infrastructure/database/prisma.service.js';

/**
 * Integración contra Better Auth real (sin InMemoryAuthService):
 * verifica que POST /api/admin/usuarios persista el usuario en la base.
 */
describe('Integración real: POST /api/admin/usuarios con Better Auth', () => {
  const app = createApp();
  const runId = Date.now();
  const createdEmails: string[] = [];
  let adminCookies: string[] = [];

  const uniqueEmail = (prefix: string): string => {
    const email = `${prefix}-${runId}@alberdi-test.com`;
    createdEmails.push(email);
    return email;
  };

  before(async () => {
    const res = await request(app).post('/api/auth/sign-in/email').send({
      email: 'admin@mialberdi.com.ar',
      password: 'AdminAlberdi2026!',
    });
    assert.equal(res.status, 200, 'El admin del seed debe poder iniciar sesión');
    adminCookies = res.headers['set-cookie'] as unknown as string[];
  });

  after(async () => {
    const users = await prisma.user.findMany({
      where: { email: { in: createdEmails } },
      select: { id: true },
    });
    const userIds = users.map((u) => u.id);
    await prisma.session.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.account.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  });

  it('1. Persiste el comerciante en la base con rol "comerciante" y devuelve el DTO público', async () => {
    const email = uniqueEmail('persistencia');

    const res = await request(app)
      .post('/api/admin/usuarios')
      .set('Cookie', adminCookies)
      .send({ nombre: 'Ferretería Real', email, password: 'Password123' });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.email, email);
    assert.equal(res.body.data.nombre, 'Ferretería Real');
    assert.equal(res.body.data.rol, ROLES_USUARIO.COMERCIANTE);
    assert.equal(res.body.data.estado, 'activo');
    assert.equal('password' in res.body.data, false);
    assert.equal('passwordHash' in res.body.data, false);

    const row = await prisma.user.findUnique({ where: { email } });
    assert.ok(row, 'El usuario debe existir en la tabla user');
    assert.equal(row.role, ROLES_USUARIO.COMERCIANTE);
    assert.equal(row.name, 'Ferretería Real');
    assert.equal(res.body.data.id, row.id);
  });

  it('2. El comerciante creado puede iniciar sesión con la contraseña inicial', async () => {
    const email = uniqueEmail('login');

    const created = await request(app)
      .post('/api/admin/usuarios')
      .set('Cookie', adminCookies)
      .send({ nombre: 'Kiosco Login', email, password: 'Password123' });
    assert.equal(created.status, 201);

    const login = await request(app)
      .post('/api/auth/sign-in/email')
      .send({ email, password: 'Password123' });

    assert.equal(login.status, 200);
    assert.equal(login.body.user.role, ROLES_USUARIO.COMERCIANTE);
  });

  it('3. Retorna 409 si el email ya existe, sin distinguir mayúsculas', async () => {
    const email = uniqueEmail('duplicado');
    const payload = { nombre: 'Panadería Dup', email, password: 'Password123' };

    const first = await request(app)
      .post('/api/admin/usuarios')
      .set('Cookie', adminCookies)
      .send(payload);
    assert.equal(first.status, 201);

    const second = await request(app)
      .post('/api/admin/usuarios')
      .set('Cookie', adminCookies)
      .send({ ...payload, email: email.toUpperCase() });

    assert.equal(second.status, 409);
    assert.equal(second.body.ok, false);
    assert.equal(
      second.body.error.message,
      'El correo electrónico ya se encuentra registrado en el sistema',
    );
  });

  it('4. Retorna 401 sin sesión y no crea el usuario', async () => {
    const email = uniqueEmail('sinsesion');

    const res = await request(app)
      .post('/api/admin/usuarios')
      .send({ nombre: 'Sin Sesion', email, password: 'Password123' });

    assert.equal(res.status, 401);
    assert.equal(await prisma.user.findUnique({ where: { email } }), null);
  });
});
