import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ROLES_USUARIO, type CrearUsuarioComercianteInput } from '@mi-alberdi/shared';
import { CrearUsuarioComercianteUseCase } from '../crear-usuario-comerciante.use-case.js';
import { InMemoryAuthService } from '../../../infrastructure/adapters/in-memory-auth.service.js';
import { UsuarioYaExisteException } from '../../../domain/exceptions/usuario-ya-existe.exception.js';
import { usuariosMessages } from '../../../domain/constants/usuarios.messages.js';

describe('CrearUsuarioComercianteUseCase', () => {
  let authService: InMemoryAuthService;
  let useCase: CrearUsuarioComercianteUseCase;

  beforeEach(() => {
    authService = new InMemoryAuthService();
    useCase = new CrearUsuarioComercianteUseCase(authService);
  });

  describe('Happy Path', () => {
    it('debe crear un usuario comerciante exitosamente retornando UsuarioPublicoDto con rol comerciante', async () => {
      const input: CrearUsuarioComercianteInput = {
        nombre: 'Don Carlos Ferretería',
        email: 'carlos@ferreteria.com',
        password: 'Password123',
      };

      const resultado = await useCase.execute(input);

      assert.ok(resultado.id, 'Debe generar un ID');
      assert.strictEqual(resultado.nombre, 'Don Carlos Ferretería');
      assert.strictEqual(resultado.email, 'carlos@ferreteria.com');
      assert.strictEqual(resultado.rol, ROLES_USUARIO.COMERCIANTE);
      assert.strictEqual(resultado.estado, 'activo');
      assert.strictEqual(resultado.puedeProbarPremium, true);
      assert.ok(resultado.creadoEn, 'Debe incluir fecha de creación');
      assert.ok(resultado.actualizadoEn, 'Debe incluir fecha de actualización');

      // Seguridad: no debe filtrar contraseñas ni hashes
      assert.strictEqual('password' in resultado, false);
      assert.strictEqual('passwordHash' in resultado, false);
    });
  });

  describe('Unhappy Path', () => {
    it('debe arrojar UsuarioYaExisteException con statusCode 409 si el correo ya existe', async () => {
      const input: CrearUsuarioComercianteInput = {
        nombre: 'Comercio Ya Existente',
        email: 'duplicado@alberdi.com',
        password: 'Password123',
      };

      // Primer alta exitosa
      await useCase.execute(input);

      // Segundo intento con el mismo email -> debe arrojar 409
      await assert.rejects(
        async () => {
          await useCase.execute({
            nombre: 'Otro Comercio',
            email: 'DUPLICADO@alberdi.com', // Normalizado en minúsculas
            password: 'OtraPassword456',
          });
        },
        (error: unknown) => {
          assert.ok(
            error instanceof UsuarioYaExisteException,
            'Debe ser instancia de UsuarioYaExisteException',
          );
          assert.strictEqual(
            (error as UsuarioYaExisteException).statusCode,
            usuariosMessages.usuarioDuplicado.statusCode,
          );
          assert.strictEqual(
            (error as UsuarioYaExisteException).message,
            usuariosMessages.usuarioDuplicado.message,
          );
          return true;
        },
      );
    });
  });
});
