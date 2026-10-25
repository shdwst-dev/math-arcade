import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { routes } from '../routes';
import { saveIfHighScore } from '../features/records/localRecords';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

beforeEach(() => localStorage.clear());

describe('Tema → Subtema → Selección de juego', () => {
  it('la pantalla de inicio lista los tres temas con su número de preguntas', () => {
    renderAt('/');
    expect(screen.getByRole('link', { name: /Fundamentos/ })).toHaveTextContent(
      '143 preguntas'
    );
    expect(
      screen.getByRole('link', { name: /Cálculo Diferencial/ })
    ).toHaveTextContent('60 preguntas');
    expect(
      screen.getByRole('link', { name: /Cálculo Integral/ })
    ).toHaveTextContent('90 preguntas');
  });

  it('un alumno llega a la selección de juego desde el inicio', async () => {
    const user = userEvent.setup();
    const router = renderAt('/');
    await user.click(screen.getByRole('link', { name: /Cálculo Integral/ }));
    expect(router.state.location.pathname).toBe('/topic/integral');
    await user.click(screen.getByRole('link', { name: /Int\. por Partes/ }));
    expect(router.state.location.pathname).toBe('/topic/integral/por_partes');
    expect(
      screen.getByText(/Cálculo Integral › Int\. por Partes/)
    ).toBeVisible();
  });

  it('la pantalla de tema muestra todos sus subtemas y la opción de todos', () => {
    renderAt('/topic/fundamentos');
    const subtopics = within(screen.getByRole('list')).getAllByRole('link');
    expect(subtopics).toHaveLength(8);
    expect(
      screen.getByRole('link', { name: /Todos los temas/ })
    ).toHaveAttribute('href', '/topic/fundamentos/todos');
  });

  it('un tema inexistente regresa al inicio', () => {
    const router = renderAt('/topic/geometria');
    expect(router.state.location.pathname).toBe('/');
  });

  it('un subtema inexistente regresa a la pantalla del tema', () => {
    const router = renderAt('/topic/integral/nada');
    expect(router.state.location.pathname).toBe('/topic/integral');
  });

  it('deshabilita Memorama si el subtema no tiene preguntas suficientes', () => {
    renderAt('/topic/fundamentos/ecuaciones_1');
    expect(screen.getAllByRole('link', { name: 'JUGAR' })).toHaveLength(2);
    expect(screen.getByRole('status')).toHaveTextContent(
      'Necesita al menos 6 preguntas y este tema tiene 4.'
    );
  });

  it('con "todos" los tres juegos están disponibles', () => {
    renderAt('/topic/fundamentos/todos');
    expect(screen.getAllByRole('link', { name: 'JUGAR' })).toHaveLength(3);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('la dificultad se pasa al juego y solo cambia el récord de Carrera', async () => {
    const user = userEvent.setup();
    saveIfHighScore(
      {
        topic: 'integral',
        subtopic: 'todos',
        game: 'race',
        difficulty: 'Difícil',
      },
      840
    );
    saveIfHighScore(
      {
        topic: 'integral',
        subtopic: 'todos',
        game: 'memory',
        difficulty: 'Normal',
      },
      600
    );
    renderAt('/topic/integral/todos');

    const links = () => screen.getAllByRole('link', { name: 'JUGAR' });
    expect(links()[2]).toHaveAttribute(
      'href',
      '/play/integral/todos/race?difficulty=Normal'
    );
    expect(screen.getByText('🏆 Mejor: 600')).toBeVisible();

    await user.click(screen.getByRole('radio', { name: 'Difícil' }));
    expect(links()[2]).toHaveAttribute(
      'href',
      '/play/integral/todos/race?difficulty=Difícil'
    );
    expect(screen.getByText('🏆 Mejor: 840')).toBeVisible();
    expect(screen.getByText('🏆 Mejor: 600')).toBeVisible();
  });
});
