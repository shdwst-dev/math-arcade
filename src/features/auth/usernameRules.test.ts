import { describe, expect, it } from 'vitest';
import { isValidUsername } from './usernameRules';

// Los mismos casos que comprueba supabase/tests/03_rpc.test.sql: cliente y servidor deben coincidir.
describe('reglas del apodo (iguales a las del servidor)', () => {
  it.each([
    'Ana_M',
    'Beto.2',
    'Ñandú.2',
    'abc',
    'a'.repeat(20),
    'x-y_z.9',
    '  Ana_M  ',
  ])('acepta "%s"', (name) => {
    expect(isValidUsername(name)).toBe(true);
  });

  it.each([
    ['vacío', ''],
    ['2 letras', 'ab'],
    ['solo espacios', '   '],
    ['21 letras', 'a'.repeat(21)],
    ['con espacio', 'con espacio'],
    ['con arroba', 'a@b.com'],
    ['HTML', '<script>'],
    ['comillas', "o'brien"],
    ['emoji', 'ana😀'],
    ['imita el automático', 'jugador_hack'],
    ['imita el automático en mayúsculas', 'JUGADOR_X1'],
  ])('rechaza %s', (_name, value) => {
    expect(isValidUsername(value)).toBe(false);
  });
});
