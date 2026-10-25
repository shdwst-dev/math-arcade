import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { routes } from '../routes';
import legacyCleanupCode from '../../public/legacy-cleanup.js?raw';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

describe('Aviso de privacidad y limpieza de caché heredado', () => {
  it('el pie de página enlaza al aviso de privacidad', async () => {
    const user = userEvent.setup();
    const router = renderAt('/');
    await user.click(screen.getByRole('link', { name: 'Aviso de privacidad' }));
    expect(router.state.location.pathname).toBe('/privacidad');
    expect(
      screen.getByRole('heading', { name: 'AVISO DE PRIVACIDAD' })
    ).toBeVisible();
  });

  it('explica qué se guarda con y sin sesión y enlaza a Cuenta para borrar datos', () => {
    renderAt('/privacidad');
    expect(
      screen.getByRole('heading', { name: /Si juegas sin iniciar sesión/ })
    ).toBeVisible();
    expect(
      screen.getByRole('heading', {
        name: /Si inicias sesión con tu cuenta @upq\.edu\.mx/,
      })
    ).toBeVisible();
    expect(screen.getByText(/tu nombre real, tu matrícula/i)).toBeVisible();
    const article = screen.getByRole('article');
    expect(
      within(article).getByRole('link', { name: 'Cuenta' })
    ).toHaveAttribute('href', '/account');
  });

  it('legacy-cleanup.js borra solo los cachés math-arcade-v* de v1 al activarse', async () => {
    let onActivate:
      | ((event: { waitUntil: (p: Promise<unknown>) => void }) => void)
      | undefined;
    const deleted: string[] = [];

    const fakeSelf = {
      addEventListener: (
        type: string,
        handler: (event: { waitUntil: (p: Promise<unknown>) => void }) => void
      ) => {
        if (type === 'activate') onActivate = handler;
      },
    };
    const fakeCaches = {
      keys: vi
        .fn()
        .mockResolvedValue([
          'math-arcade-v1',
          'math-arcade-v2',
          'math-arcade-v12',
          'workbox-precache-v2-https://math-arcade.vercel.app/',
          'other-cache',
        ]),
      delete: vi.fn().mockImplementation(async (name: string) => {
        deleted.push(name);
        return true;
      }),
    };

    const runSwScript = new Function('self', 'caches', legacyCleanupCode);
    runSwScript(fakeSelf, fakeCaches);
    expect(onActivate).toBeTypeOf('function');

    let pending: Promise<unknown> = Promise.resolve();
    onActivate!({
      waitUntil: (p) => {
        pending = p;
      },
    });
    await pending;

    expect(deleted).toEqual([
      'math-arcade-v1',
      'math-arcade-v2',
      'math-arcade-v12',
    ]);
  });
});
