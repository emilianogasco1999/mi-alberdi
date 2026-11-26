import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../../../../app.js';

describe('Smoke Test: Montaje de Better Auth en Express (/api/auth/*)', () => {
  const app = createApp();

  it('1. GET /api/auth/get-session responde 200 con null cuando no hay cookie de sesión', async () => {
    const res = await request(app).get('/api/auth/get-session');

    assert.equal(res.status, 200);
    assert.equal(res.body, null);
  });

  it('2. POST /api/auth/sign-in/email rechaza credenciales inválidas sin filtrar datos', async () => {
    const res = await request(app)
      .post('/api/auth/sign-in/email')
      .send({
        email: 'inexistente@mialberdi.com.ar',
        password: 'PasswordInvalido123!',
      });

    // Better Auth retorna 401 Unauthorized o 400 ante credenciales erróneas
    assert.ok(res.status === 401 || res.status === 400);
    assert.ok(res.body.message || res.body.error);
  });

  it('3. POST /api/auth/sign-in/email autentica exitosamente al admin del seed y emite cookie de sesión', async () => {
    const res = await request(app)
      .post('/api/auth/sign-in/email')
      .send({
        email: 'admin@mialberdi.com.ar',
        password: 'AdminAlberdi2026!',
      });

    assert.equal(res.status, 200);
    assert.ok(res.body.user);
    assert.equal(res.body.user.email, 'admin@mialberdi.com.ar');
    assert.equal(res.body.user.role, 'admin');

    // Verificar que Better Auth emita la cookie de sesión en la cabecera set-cookie
    const setCookie = res.headers['set-cookie'];
    assert.ok(setCookie, 'Debe emitir cabecera set-cookie');
    const cookieHeader = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie;
    assert.ok(cookieHeader.includes('better-auth.session_token') || cookieHeader.includes('better-auth'));
  });

  it('4. GET /api/auth/get-session recupera la sesión activa cuando se envía la cookie emitida', async () => {
    // 1. Iniciar sesión para obtener cookie
    const loginRes = await request(app)
      .post('/api/auth/sign-in/email')
      .send({
        email: 'admin@mialberdi.com.ar',
        password: 'AdminAlberdi2026!',
      });

    assert.equal(loginRes.status, 200);
    const cookies = loginRes.headers['set-cookie'];
    assert.ok(cookies);

    // 2. Consultar sesión enviando la cookie
    const sessionRes = await request(app)
      .get('/api/auth/get-session')
      .set('Cookie', cookies);

    assert.equal(sessionRes.status, 200);
    assert.ok(sessionRes.body);
    assert.ok(sessionRes.body.session);
    assert.ok(sessionRes.body.user);
    assert.equal(sessionRes.body.user.email, 'admin@mialberdi.com.ar');
    assert.equal(sessionRes.body.user.role, 'admin');
  });
});
