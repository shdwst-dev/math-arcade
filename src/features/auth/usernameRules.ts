// Mismas reglas que supabase/migrations (set_username y profiles_username_format):
// el servidor es quien manda; esto solo evita ir a la red con un apodo inválido.
export const USERNAME_PATTERN = /^[A-Za-z0-9_.ñÑáéíóúÁÉÍÓÚüÜ-]{3,20}$/;
/** Prefijo de los apodos automáticos: no se puede elegir. */
export const RESERVED_PREFIX = 'jugador_';

export const USERNAME_HELP =
  'De 3 a 20 caracteres: letras, números, guion bajo (_), punto (.) o guion (-). No puede empezar con "jugador_".';

export function isValidUsername(raw: string): boolean {
  const name = raw.trim();
  return (
    USERNAME_PATTERN.test(name) &&
    !name.toLowerCase().startsWith(RESERVED_PREFIX)
  );
}
