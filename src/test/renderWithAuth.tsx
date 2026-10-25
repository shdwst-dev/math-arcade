import { render } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import {
  AuthContext,
  GUEST_AUTH,
  type AuthContextValue,
} from '../features/auth/AuthContext';
import type { Profile } from '../features/auth/authApi';

export const PROFILE: Profile = {
  username: 'Ana_M',
  hasChosenUsername: true,
  totalGamesPlayed: 12,
  totalWins: 5,
};

/** Una persona con sesión iniciada (con la nube "configurada"). */
export const SIGNED_IN: Partial<AuthContextValue> = {
  enabled: true,
  status: 'signedIn',
  userId: 'u1',
  profile: PROFILE,
};

/** Hay nube pero nadie ha iniciado sesión. */
export const SIGNED_OUT: Partial<AuthContextValue> = {
  enabled: true,
  status: 'signedOut',
};

/** Pinta `ui` dentro de un router y de un contexto de sesión con los valores indicados. */
export function renderWithAuth(
  ui: React.ReactElement,
  auth: Partial<AuthContextValue> = {},
  path = '/'
) {
  const value: AuthContextValue = { ...GUEST_AUTH, ...auth };
  const router = createMemoryRouter([{ path: '*', element: ui }], {
    initialEntries: [path],
  });
  const utils = render(
    <AuthContext.Provider value={value}>
      <RouterProvider router={router} />
    </AuthContext.Provider>
  );
  return { ...utils, router };
}
