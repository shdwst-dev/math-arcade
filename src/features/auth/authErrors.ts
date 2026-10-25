import { USERNAME_HELP } from './usernameRules';

const GENERIC = 'Ocurrió un error. Intenta de nuevo.';
export const DOMAIN_MESSAGE =
  'Solo se permiten cuentas institucionales (@upq.edu.mx).';

type ErrorLike = { message?: string; code?: string | null } | null | undefined;

/** Mensaje en español para un error de las funciones del servidor o de la red. */
export function friendlyError(error: ErrorLike): string {
  const message = error?.message ?? '';
  if (/username_taken/.test(message))
    return 'Ese apodo ya está en uso. Prueba con otro.';
  if (/username_invalid/.test(message))
    return `Apodo no válido. ${USERNAME_HELP}`;
  if (/not_authenticated|jwt|expired/i.test(message))
    return 'Tu sesión expiró. Vuelve a iniciar sesión.';
  if (
    /failed to fetch|network|load failed/i.test(message) ||
    (typeof navigator !== 'undefined' && !navigator.onLine)
  ) {
    return 'Sin conexión a internet.';
  }
  return GENERIC;
}

/**
 * Cuando el inicio de sesión falla, Supabase vuelve a la app con el motivo en la
 * URL (`#error=...&error_description=...`). Devuelve un mensaje para el alumno,
 * o `null` si no hay error. `url` se puede pasar para probar.
 */
export function authRedirectMessage(
  url: { hash: string; search: string } = window.location
): string | null {
  const params = new URLSearchParams(url.hash.replace(/^#/, '') || url.search);
  const error = params.get('error');
  if (!error) return null;
  const description = (params.get('error_description') ?? '').toLowerCase();
  const code = (params.get('error_code') ?? '').toLowerCase();

  // El motivo de dominio va primero: el Auth Hook también responde con `access_denied`.
  if (
    description.includes('database error saving new user') ||
    description.includes('institucional') ||
    description.includes('signup_domain_not_allowed') ||
    code === 'unexpected_failure' ||
    code === 'hook_payload_invalid_content_type'
  ) {
    return DOMAIN_MESSAGE;
  }
  if (error === 'access_denied') return 'Cancelaste el inicio de sesión.';
  return 'No se pudo iniciar sesión. Intenta de nuevo.';
}

/** Quita el error de la URL para que no reaparezca al recargar. */
export function clearAuthRedirectParams(): void {
  if (!/[#?&]error=/.test(window.location.hash + window.location.search))
    return;
  window.history.replaceState(null, '', window.location.pathname);
}
