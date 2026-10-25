import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { CloudError, type RecordsApi } from '../features/records/cloudApi';
import {
  getCloudBest,
  resetCloud,
  setCloudRecords,
} from '../features/records/cloudStore';
import { getBestScore, getRecords } from '../features/records/localRecords';
import { readPending } from '../features/records/pendingQueue';
import { celebrate } from '../lib/confetti';
import { SIGNED_IN, SIGNED_OUT, renderWithAuth } from '../test/renderWithAuth';
import { PlayPage } from './PlayPage';
import { GameSelectPage } from './GameSelectPage';
import { Route, Routes } from 'react-router-dom';

vi.mock('../lib/confetti', () => ({ celebrate: vi.fn() }));

const target = {
  topic: 'integral',
  subtopic: 'por_partes',
  game: 'memory',
  difficulty: 'Normal',
} as const;
const apiWith = (saveGame: RecordsApi['saveGame']) =>
  ({ saveGame }) as unknown as RecordsApi;

/** Juega un Memorama completo (12 cartas) tocando las parejas. */
async function winMemory() {
  await waitFor(() =>
    expect(document.querySelectorAll('[data-pair]')).toHaveLength(12)
  );
  const pairs = new Map<string, HTMLElement[]>();
  for (const card of document.querySelectorAll<HTMLElement>('[data-pair]')) {
    pairs.set(card.dataset.pair!, [
      ...(pairs.get(card.dataset.pair!) ?? []),
      card,
    ]);
  }
  vi.useFakeTimers();
  for (const [a, b] of pairs.values()) {
    fireEvent.click(a);
    fireEvent.click(b);
  }
  act(() => vi.advanceTimersByTime(500));
  vi.useRealTimers();
}

const play = (auth: Parameters<typeof renderWithAuth>[1]) =>
  renderWithAuth(
    <Routes>
      <Route path="/play/:topicId/:subtopicId/:gameId" element={<PlayPage />} />
    </Routes>,
    auth,
    '/play/integral/por_partes/memory'
  );

beforeEach(() => {
  localStorage.clear();
  resetCloud();
  vi.mocked(celebrate).mockClear();
});

describe('Partida con sesión: se guarda en la cuenta', () => {
  it('ganar sube la partida, muestra el récord de la nube y NO escribe en el dispositivo', async () => {
    const saveGame = vi
      .fn()
      .mockResolvedValue({ isNewRecord: true, bestScore: 600 });
    play({ ...SIGNED_IN, records: apiWith(saveGame) });
    await winMemory();

    expect(
      await screen.findByText(/¡Nuevo récord guardado en la nube!/)
    ).toBeInTheDocument();
    expect(saveGame).toHaveBeenCalledWith(
      expect.objectContaining({
        topic: 'integral',
        subtopic: 'por_partes',
        game: 'memory',
        score: 600,
        won: true,
      })
    );
    expect(screen.getByText(/¡NUEVO RÉCORD!/)).toBeInTheDocument();
    expect(getCloudBest(target)).toBe(600);
    expect(getBestScore(target)).toBe(0);
    expect(getRecords()).toEqual([]);
  });

  it('mientras sube dice que está guardando y luego confirma sin récord', async () => {
    let finish: (v: { isNewRecord: boolean; bestScore: number }) => void = () =>
      undefined;
    const saveGame = vi.fn(
      () =>
        new Promise<{ isNewRecord: boolean; bestScore: number }>(
          (r) => (finish = r)
        )
    );
    play({ ...SIGNED_IN, records: apiWith(saveGame) });
    await winMemory();

    expect(screen.getByText(/Guardando en la nube/)).toBeInTheDocument();
    await act(async () => finish({ isNewRecord: false, bestScore: 900 }));
    expect(screen.getByText(/Partida guardada en la nube/)).toBeInTheDocument();
    expect(screen.queryByText(/¡NUEVO RÉCORD!/)).toBeNull(); // el servidor manda
    expect(screen.getByText(/Mejor: 900/)).toBeInTheDocument();
  });

  it('sin conexión la deja en cola y avisa que se subirá después', async () => {
    const saveGame = vi
      .fn()
      .mockRejectedValue(new CloudError('retry', 'Failed to fetch'));
    play({ ...SIGNED_IN, records: apiWith(saveGame) });
    await winMemory();

    expect(
      await screen.findByText(
        /Sin conexión: se subirá cuando vuelva el internet/
      )
    ).toBeInTheDocument();
    expect(readPending()).toEqual([
      expect.objectContaining({ userId: 'u1', score: 600, game: 'memory' }),
    ]);
    expect(getCloudBest(target)).toBe(600); // ya cuenta en pantalla
  });

  it('si el servidor rechaza la partida lo dice y no la encola', async () => {
    const saveGame = vi
      .fn()
      .mockRejectedValue(
        new CloudError('rejected', 'score_out_of_range', '22003')
      );
    play({ ...SIGNED_IN, records: apiWith(saveGame) });
    await winMemory();
    expect(
      await screen.findByText(/La nube no aceptó esta partida/)
    ).toBeInTheDocument();
    expect(readPending()).toEqual([]);
  });
});

describe('Partida sin sesión', () => {
  it('con la nube disponible guarda en el dispositivo e invita a iniciar sesión', async () => {
    play({ ...SIGNED_OUT, records: apiWith(vi.fn()) });
    await winMemory();
    const link = await screen.findByRole('link', { name: 'Inicia sesión' });
    expect(link).toHaveAttribute('href', '/account');
    expect(getBestScore(target)).toBe(600);
  });

  it('sin nube no muestra nada sobre la nube', async () => {
    play({});
    await winMemory();
    expect(await screen.findByText(/VICTORIA/)).toBeInTheDocument();
    expect(screen.queryByText(/nube/)).toBeNull();
  });
});

describe('Mejores puntajes en la selección de juego', () => {
  const select = (auth: Parameters<typeof renderWithAuth>[1]) =>
    renderWithAuth(
      <Routes>
        <Route
          path="/topic/:topicId/:subtopicId"
          element={<GameSelectPage />}
        />
      </Routes>,
      auth,
      '/topic/integral/por_partes'
    );

  it('con sesión muestra los de la cuenta (no los del dispositivo)', () => {
    localStorage.setItem(
      'mathArcade_scores',
      JSON.stringify({
        integral_por_partes_memory: {
          score: 111,
          date: '2026-01-01T00:00:00Z',
        },
      })
    );
    setCloudRecords([{ ...target, score: 555, date: '2026-01-01T00:00:00Z' }]);
    select(SIGNED_IN);
    expect(screen.getByText('🏆 Mejor: 555')).toBeInTheDocument();
    expect(screen.queryByText('🏆 Mejor: 111')).toBeNull();
  });

  it('como invitado muestra los del dispositivo', () => {
    localStorage.setItem(
      'mathArcade_scores',
      JSON.stringify({
        integral_por_partes_memory: {
          score: 111,
          date: '2026-01-01T00:00:00Z',
        },
      })
    );
    select(SIGNED_OUT);
    expect(screen.getByText('🏆 Mejor: 111')).toBeInTheDocument();
  });

  it('se actualiza al llegar los récords de la nube', async () => {
    setCloudRecords([]);
    select(SIGNED_IN);
    expect(screen.getAllByText('🏆 Mejor: 0')).toHaveLength(3);
    act(() =>
      setCloudRecords([{ ...target, score: 420, date: '2026-01-01T00:00:00Z' }])
    );
    expect(await screen.findByText('🏆 Mejor: 420')).toBeInTheDocument();
  });
});
