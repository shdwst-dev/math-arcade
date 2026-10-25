import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DOMAIN_MESSAGE,
  authRedirectMessage,
  clearAuthRedirectParams,
  friendlyError,
} from './authErrors';

afterEach(() => {
  vi.restoreAllMocks();
  window.history.replaceState(null, '', '/');
});

describe('mensajes para el alumno', () => {
  it.each([
    ['username_taken', /ya está en uso/],
    ['username_invalid', /Apodo no válido/],
    ['not_authenticated', /sesión expiró/],
    ['JWT expired', /sesión expiró/],
    ['Failed to fetch', /Sin conexión/],
    ['algo raro del servidor', /Ocurrió un error/],
  ])('"%s"', (message, expected) => {
    expect(friendlyError({ message })).toMatch(expected);
  });

  it('sin error o sin mensaje usa el genérico', () => {
    expect(friendlyError(null)).toMatch(/Ocurrió un error/);
    expect(friendlyError({})).toMatch(/Ocurrió un error/);
  });

  it('sin internet siempre dice que no hay conexión', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    expect(friendlyError({ message: 'cualquier cosa' })).toMatch(
      /Sin conexión/
    );
  });
});

describe('error al volver de Google', () => {
  const at = (hash = '', search = '') => authRedirectMessage({ hash, search });

  it('sin error no hay mensaje', () => {
    expect(at()).toBeNull();
    expect(at('#access_token=abc&type=bearer')).toBeNull();
    expect(at('', '?code=abc')).toBeNull();
  });

  it('una cuenta que no es de la UPQ (el trigger rechaza el alta)', () => {
    expect(
      at(
        '#error=server_error&error_code=unexpected_failure&error_description=Database+error+saving+new+user'
      )
    ).toBe(DOMAIN_MESSAGE);
    expect(
      at(
        '',
        '?error=server_error&error_description=Database+error+saving+new+user'
      )
    ).toBe(DOMAIN_MESSAGE);
  });

  it('el mensaje del Auth Hook', () => {
    expect(
      at(
        '#error=access_denied&error_description=Solo+se+permiten+cuentas+institucionales+(@upq.edu.mx).'
      )
    ).toBe(DOMAIN_MESSAGE);
  });

  it('cancelar la pantalla de Google no es un error del alumno', () => {
    expect(
      at('#error=access_denied&error_description=The+user+denied+access')
    ).toBe('Cancelaste el inicio de sesión.');
  });

  it('cualquier otro fallo da un mensaje genérico', () => {
    expect(at('#error=server_error&error_description=otra+cosa')).toBe(
      'No se pudo iniciar sesión. Intenta de nuevo.'
    );
  });

  it('limpia el error de la URL pero no toca otras URL', () => {
    window.history.replaceState(
      null,
      '',
      '/account#error=server_error&error_description=x'
    );
    clearAuthRedirectParams();
    expect(window.location.hash).toBe('');
    expect(window.location.pathname).toBe('/account');

    window.history.replaceState(null, '', '/topic/integral?difficulty=Fácil');
    clearAuthRedirectParams();
    expect(window.location.search).toBe('?difficulty=F%C3%A1cil');
  });
});
