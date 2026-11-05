import type { AuthUserDTO, RolUsuario } from '@mi-alberdi/shared';

export class User {
  constructor(private readonly props: AuthUserDTO) {}

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get rol(): RolUsuario {
    return this.props.rol;
  }

  get nombreCompleto(): string {
    if (!this.props.nombre && !this.props.apellido) return this.props.email;
    return `${this.props.nombre ?? ''} ${this.props.apellido ?? ''}`.trim();
  }

  get esAdmin(): boolean {
    return this.props.rol === 'admin';
  }

  toDTO(): AuthUserDTO {
    return { ...this.props };
  }
}
