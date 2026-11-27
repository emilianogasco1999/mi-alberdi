import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ActualizarNegocioSchema,
  CrearNegocioSchema,
  NEGOCIOS_MESSAGES,
  NegocioResponseSchema,
  createNegocioSchema,
} from '@mi-alberdi/shared';

describe('SUB-BE-03.1: Esquemas Zod y DTOs de Negocio (@mi-alberdi/shared)', () => {
  describe('CrearNegocioSchema', () => {
    it('debe validar un payload válido con formato HU-03 (COMERCIO / OFICIO) y normalizar campos canónicos', () => {
      const result = CrearNegocioSchema.safeParse({
        nombre: '  Ferretería San Martín  ',
        tipo: 'COMERCIO',
        telefono: '+54 9 3865 123456',
        direccion: 'Av. Campero 450, Alberdi',
        descripcion: 'Ferretería industrial y del hogar',
        instagram: '@ferreteria.sanmartin',
        logoUrl: '/uploads/logos/ferreteria.webp',
        bannerUrl: 'https://cdn.mialberdi.com/banners/ferreteria.jpg',
      });

      assert.equal(result.success, true);
      if (result.success) {
        assert.equal(result.data.nombre, 'Ferretería San Martín');
        assert.equal(result.data.nombreComercial, 'Ferretería San Martín');
        assert.equal(result.data.tipo, 'COMERCIO');
        assert.equal(result.data.tipoPerfil, 'comercio');
        assert.equal(result.data.telefono, '+54 9 3865 123456');
        assert.equal(result.data.whatsappPrincipal, '+54 9 3865 123456');
        assert.equal(result.data.direccion, 'Av. Campero 450, Alberdi');
        assert.equal(result.data.direccionEscrita, 'Av. Campero 450, Alberdi');
        assert.equal(result.data.instagram, '@ferreteria.sanmartin');
        assert.equal(result.data.instagramHandle, '@ferreteria.sanmartin');
      }
    });

    it('debe aceptar tipo en minúsculas (oficio) y URL completa de Instagram', () => {
      const result = CrearNegocioSchema.safeParse({
        nombre: 'Plomería y Gas Don Juan',
        tipo: 'oficio',
        telefono: '3865445566',
        direccion: 'Barrio Belgrano, Alberdi',
        instagram: 'https://www.instagram.com/plomeria_donjuan/',
      });

      assert.equal(result.success, true);
      if (result.success) {
        assert.equal(result.data.tipo, 'OFICIO');
        assert.equal(result.data.tipoPerfil, 'oficio');
        assert.equal(result.data.instagramHandle, 'https://www.instagram.com/plomeria_donjuan/');
      }
    });

    it('debe rechazar nombre con menos de 3 caracteres o más de 100 caracteres', () => {
      const corto = CrearNegocioSchema.safeParse({
        nombre: 'Ab',
        tipo: 'COMERCIO',
        telefono: '+543865123456',
        direccion: 'Av. Campero 123',
      });

      assert.equal(corto.success, false);
      if (!corto.success) {
        assert.equal(corto.error.issues[0]?.message, NEGOCIOS_MESSAGES.VALIDACION.NOMBRE_MIN);
      }

      const largo = CrearNegocioSchema.safeParse({
        nombre: 'A'.repeat(101),
        tipo: 'COMERCIO',
        telefono: '+543865123456',
        direccion: 'Av. Campero 123',
      });

      assert.equal(largo.success, false);
      if (!largo.success) {
        assert.equal(largo.error.issues[0]?.message, NEGOCIOS_MESSAGES.VALIDACION.NOMBRE_MAX);
      }
    });

    it('debe rechazar dirección con menos de 5 caracteres', () => {
      const result = CrearNegocioSchema.safeParse({
        nombre: 'Kiosco El Paso',
        tipo: 'COMERCIO',
        telefono: '+543865123456',
        direccion: '1234',
      });

      assert.equal(result.success, false);
      if (!result.success) {
        assert.equal(result.error.issues[0]?.message, NEGOCIOS_MESSAGES.VALIDACION.DIRECCION_MIN);
      }
    });

    it('debe rechazar teléfono e Instagram con formatos inválidos', () => {
      const result = CrearNegocioSchema.safeParse({
        nombre: 'Electricidad Sur',
        tipo: 'OFICIO',
        telefono: 'abc-invalido',
        direccion: 'Calle Mitre 250',
        instagram: 'https://facebook.com/no-es-instagram',
      });

      assert.equal(result.success, false);
      if (!result.success) {
        const messages = result.error.issues.map((i) => i.message);
        assert.equal(messages.includes(NEGOCIOS_MESSAGES.VALIDACION.TELEFONO_INVALIDO), true);
        assert.equal(messages.includes(NEGOCIOS_MESSAGES.VALIDACION.INSTAGRAM_INVALIDO), true);
      }
    });
  });

  describe('ActualizarNegocioSchema', () => {
    it('debe permitir actualización parcial y sincronizar claves normalizadas', () => {
      const result = ActualizarNegocioSchema.safeParse({
        nombre: 'Panadería La Espiga Dorada',
        direccion: 'San Martín 890',
      });

      assert.equal(result.success, true);
      if (result.success) {
        assert.equal(result.data.nombreComercial, 'Panadería La Espiga Dorada');
        assert.equal(result.data.direccionEscrita, 'San Martín 890');
      }
    });
  });

  describe('NegocioResponseSchema & Retrocompatibilidad', () => {
    it('debe validar NegocioResponseDto omitiendo propietarioId', () => {
      const parsed = NegocioResponseSchema.safeParse({
        id: 'c812005d-2cca-47ec-873a-fb193dd208a7',
        slug: 'panaderia-san-cayetano',
        nombre: 'Panadería San Cayetano',
        nombreComercial: 'Panadería San Cayetano',
        tipo: 'COMERCIO',
        tipoPerfil: 'comercio',
        telefono: '+543865123456',
        whatsappPrincipal: '+543865123456',
        direccion: 'Av. Campero 450',
        direccionEscrita: 'Av. Campero 450',
        descripcion: 'Pan artesanal',
        instagram: '@sancayetano',
        instagramHandle: '@sancayetano',
        logoUrl: '/uploads/logo.webp',
        bannerUrl: null,
        estado: 'activo',
        planActual: 'gratis',
        creadoEn: new Date().toISOString(),
        actualizadoEn: new Date().toISOString(),
      });

      assert.equal(parsed.success, true);
    });

    it('debe mantener retrocompatibilidad con createNegocioSchema existente', () => {
      const legacy = createNegocioSchema.safeParse({
        tipoPerfil: 'COMERCIO',
        rubroPrincipalId: 'e4b6c1a0-1234-4567-89ab-cdef01234567',
        nombreComercial: 'Heladería del Centro',
        whatsappPrincipal: '+543865998877',
      });

      assert.equal(legacy.success, true);
      if (legacy.success) {
        assert.equal(legacy.data.tipoPerfil, 'comercio');
      }
    });
  });
});
