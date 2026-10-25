import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { routes } from '../routes';
import { getBestScore, STORAGE_KEY } from '../features/records/localRecords';
import { celebrate } from '../lib/confetti';

vi.mock('../lib/confetti', () => ({ celebrate: vi.fn() }));

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

const cardsByPair = () => {
  const pairs = new Map<string, HTMLElement[]>();
  for (const card of document.querySelectorAll<HTMLElement>('[data-pair]')) {
    const id = card.dataset.pair!;
    pairs.set(id, [...(pairs.get(id) ?? []), card]);
  }
  return [...pairs.values()];
};

/** Espera a que cargue el juego (carga diferida) y devuelve las parejas de cartas. */
async function waitForMemory() {
  await waitFor(() =>
    expect(document.querySelectorAll('[data-pair]')).toHaveLength(12)
  );
  return cardsByPair();
}

function winMemory(pairs: HTMLElement[][]) {
  for (const [a, b] of pairs) {
    fireEvent.click(a);
    fireEvent.click(b);
  }
  act(() => vi.advanceTimersByTime(500));
}

beforeEach(() => {
  localStorage.clear();
  vi.mocked(celebrate).mockClear();
});
afterEach(() => vi.useRealTimers());

describe('Jugar una partida', () => {
  it('ganar guarda el récord, muestra la victoria y permite repetir', async () => {
    renderAt('/play/integral/por_partes/memory');
    const pairs = await waitForMemory();
    expect(screen.getByText('PUNTOS: 0')).toBeInTheDocument();

    vi.useFakeTimers();
    winMemory(pairs);
    vi.useRealTimers();

    expect(
      screen.getByRole('dialog', { name: /VICTORIA/ })
    ).toBeInTheDocument();
    expect(screen.getByText('Puntuación final: 600')).toBeInTheDocument();
    expect(screen.getByText(/¡NUEVO RÉCORD!/)).toBeInTheDocument();
    expect(celebrate).toHaveBeenCalledTimes(1);
    expect(
      getBestScore({
        topic: 'integral',
        subtopic: 'por_partes',
        game: 'memory',
        difficulty: 'Normal',
      })
    ).toBe(600);

    fireEvent.click(screen.getByRole('button', { name: 'Jugar de nuevo' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByText('PUNTOS: 0')).toBeInTheDocument();
    const again = await waitForMemory();

    vi.useFakeTimers();
    winMemory(again);
    vi.useRealTimers();
    expect(screen.getByText('Puntuación final: 600')).toBeInTheDocument();
    expect(screen.queryByText(/¡NUEVO RÉCORD!/)).toBeNull(); // empatar no es récord
    expect(screen.getByText(/Mejor: 600/)).toBeInTheDocument();
  });

  it('perder con 0 puntos no cuenta como récord ni guarda nada', async () => {
    // Relojes falsos desde antes de montar: el temporizador de la Bomba nace al cargar el juego.
    vi.useFakeTimers();
    renderAt('/play/integral/por_partes/bomb');
    await act(async () => {
      await vi.dynamicImportSettled();
    });
    expect(screen.getByRole('timer')).toHaveTextContent('00:30');

    act(() => vi.advanceTimersByTime(30_000));
    vi.useRealTimers();

    expect(
      screen.getByRole('dialog', { name: /GAME OVER/ })
    ).toBeInTheDocument();
    expect(screen.queryByText(/¡NUEVO RÉCORD!/)).toBeNull();
    expect(celebrate).not.toHaveBeenCalled();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(
      screen.getByRole('link', { name: 'Elegir otro juego' })
    ).toHaveAttribute('href', '/topic/integral/por_partes');
    expect(
      screen.getByRole('link', { name: 'Menú principal' })
    ).toHaveAttribute('href', '/');
  });

  it('muestra el modo y la dificultad (solo en Carrera)', async () => {
    renderAt('/play/integral/todos/race?difficulty=Difícil');
    await screen.findByText(/Meta: 800 puntos/);
    expect(
      screen.getByText(
        /Carrera del Saber · Cálculo Integral › Todos los temas · Difícil/
      )
    ).toBeInTheDocument();
  });

  it('una dificultad inválida en la URL usa Normal', async () => {
    renderAt('/play/integral/todos/race?difficulty=Imposible');
    await screen.findByText(/Meta: 500 puntos/);
  });
});

describe('Rutas de juego inválidas o sin preguntas suficientes', () => {
  it('Memorama en un subtema con 4 preguntas vuelve a la selección y explica por qué', () => {
    const router = renderAt('/play/fundamentos/ecuaciones_1/memory');
    expect(router.state.location.pathname).toBe(
      '/topic/fundamentos/ecuaciones_1'
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Necesita al menos 6 preguntas'
    );
  });

  it('un juego inexistente vuelve a la selección', () => {
    const router = renderAt('/play/integral/por_partes/ajedrez');
    expect(router.state.location.pathname).toBe('/topic/integral/por_partes');
  });

  it('un tema o subtema inexistente vuelve a donde tiene sentido', () => {
    expect(renderAt('/play/geometria/x/memory').state.location.pathname).toBe(
      '/'
    );
    expect(renderAt('/play/integral/nada/memory').state.location.pathname).toBe(
      '/topic/integral'
    );
  });
});

describe('Tutoriales', () => {
  it('se abren desde la tarjeta del juego y se cierran con Esc', () => {
    renderAt('/topic/integral/todos');
    fireEvent.click(
      screen.getByRole('button', { name: 'Cómo se juega Desactiva la Bomba' })
    );
    const dialog = screen.getByRole('dialog', { name: /Desactiva la Bomba/ });
    expect(dialog).toHaveTextContent(
      'Desactiva la bomba resolviendo 5 problemas'
    );
    expect(dialog).toHaveTextContent('Tienes 30 segundos iniciales');
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('también se cierran con el botón ¡Entendido!', () => {
    renderAt('/topic/integral/todos');
    fireEvent.click(
      screen.getByRole('button', { name: 'Cómo se juega Carrera del Saber' })
    );
    fireEvent.click(screen.getByRole('button', { name: '¡Entendido!' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
