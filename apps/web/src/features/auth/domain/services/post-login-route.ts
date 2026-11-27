import type { RolUsuario } from '@mi-alberdi/shared';

export function getHomeRouteForRole(rol: RolUsuario): string {
  switch (rol) {
    case 'admin':
      return '/admin';
    case 'comerciante':
      return '/dashboard';
    default:
      return '/';
  }
}

/** Only same-site relative paths are accepted, to avoid open redirects. */
export function isSafeInternalPath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//') && !path.includes('\\');
}

export function resolvePostLoginRoute(rol: RolUsuario, returnUrl?: string | null): string {
  if (returnUrl && isSafeInternalPath(returnUrl)) {
    return returnUrl;
  }
  return getHomeRouteForRole(rol);
}
