import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import {
  PROFILE,
  SIGNED_IN,
  SIGNED_OUT,
  renderWithAuth,
} from '../test/renderWithAuth';
import type { LeaderboardRow } from '../features/ranking/api';
import { RankingPage } from './RankingPage';

const { fetchLeaderboard } = vi.hoisted(() => ({ fetchLeaderboard: vi.fn() }));
vi.mock('../features/ranking/api', () => ({
  rankingApi: { fetchLeaderboard },
}));

const rows: LeaderboardRow[] = [
  { rank: 1, username: 'Beto.2', bestScore: 540, isMe: false },
  { rank: 2, username: 'Ana_M', bestScore: 300, isMe: true },
  { rank: 3, username: 'Cris', bestScore: 200, isMe: false },
  { rank: 4, username: 'Dani', bestScore: 100, isMe: false },
];

beforeEach(() => {
  fetchLeaderboard.mockReset();
  fetchLeaderboard.mockResolvedValue(rows);
});

describe('Ranking sin sesión', () => {
  it('sin nube lo explica', () => {
    renderWithAuth(<RankingPage />);
    expect(screen.getByText(/no está configurada/)).toBeInTheDocument();
    expect(fetchLeaderboard).not.toHaveBeenCalled();
  });

  it('con nube pero sin sesión pide iniciar sesión y no consulta nada', () => {
    renderWithAuth(<RankingPage />, SIGNED_OUT);
    expect(
      screen.getByRole('link', { name: /Ir a mi cuenta/ })
    ).toHaveAttribute('href', '/account');
    expect(screen.queryByLabelText('Tema')).toBeNull();
    expect(fetchLeaderboard).not.toHaveBeenCalled();
  });
});

describe('Ranking con sesión', () => {
  it('consulta el primer tema y juego, y muestra medallas y "(tú)"', async () => {
    renderWithAuth(<RankingPage />, SIGNED_IN);
    expect(screen.getByText(/Cargando ranking/)).toBeInTheDocument();
    await screen.findByText('Beto.2');
    expect(fetchLeaderboard).toHaveBeenCalledWith({
      topic: 'fundamentos',
      subtopic: 'todos',
      game: 'memory',
      difficulty: 'Normal',
    });
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(4);
    expect(items[0]).toHaveTextContent('🥇');
    expect(items[1]).toHaveTextContent('🥈');
    expect(items[2]).toHaveTextContent('🥉');
    expect(items[3]).toHaveTextContent('4'); // del 4.º lugar en adelante, el número
    expect(items[1]).toHaveTextContent('Ana_M');
    expect(items[1]).toHaveTextContent('(tú)');
    expect(items[0]).not.toHaveTextContent('(tú)');
  });

  it('cambiar el tema vuelve a consultar y reinicia el subtema', async () => {
    renderWithAuth(<RankingPage />, SIGNED_IN);
    await screen.findByText('Beto.2');
    fireEvent.change(screen.getByLabelText('Subtema'), {
      target: { value: 'matrices' },
    });
    await waitFor(() =>
      expect(fetchLeaderboard).toHaveBeenLastCalledWith(
        expect.objectContaining({ subtopic: 'matrices' })
      )
    );
    fireEvent.change(screen.getByLabelText('Tema'), {
      target: { value: 'integral' },
    });
    await waitFor(() =>
      expect(fetchLeaderboard).toHaveBeenLastCalledWith(
        expect.objectContaining({ topic: 'integral', subtopic: 'todos' })
      )
    );
    expect(screen.getByLabelText('Subtema')).toHaveValue('todos');
    expect(
      within(screen.getByLabelText('Subtema')).getAllByRole('option').length
    ).toBe(10); // todos + 9 de integral
  });

  it('la dificultad solo se puede cambiar en Carrera', async () => {
    renderWithAuth(<RankingPage />, SIGNED_IN);
    await screen.findByText('Beto.2');
    expect(screen.getByLabelText('Dificultad')).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Juego'), {
      target: { value: 'race' },
    });
    expect(screen.getByLabelText('Dificultad')).toBeEnabled();
    fireEvent.change(screen.getByLabelText('Dificultad'), {
      target: { value: 'Difícil' },
    });
    await waitFor(() =>
      expect(fetchLeaderboard).toHaveBeenLastCalledWith(
        expect.objectContaining({ game: 'race', difficulty: 'Difícil' })
      )
    );
  });

  it('sin jugadores lo dice', async () => {
    fetchLeaderboard.mockResolvedValue([]);
    renderWithAuth(<RankingPage />, SIGNED_IN);
    expect(
      await screen.findByText(/Nadie ha jugado esta combinación/)
    ).toBeInTheDocument();
  });

  it('si falla la consulta muestra el motivo en español', async () => {
    fetchLeaderboard.mockRejectedValue(new Error('Failed to fetch'));
    renderWithAuth(<RankingPage />, SIGNED_IN);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo cargar el ranking: Sin conexión a internet.'
    );
  });

  it('no mezcla la respuesta de una combinación con la de otra', async () => {
    let resolveFirst: (r: LeaderboardRow[]) => void = () => undefined;
    fetchLeaderboard
      .mockImplementationOnce(
        () => new Promise((resolve) => (resolveFirst = resolve))
      )
      .mockResolvedValueOnce([
        { rank: 1, username: 'SoloCarrera', bestScore: 1, isMe: false },
      ]);
    renderWithAuth(<RankingPage />, SIGNED_IN);
    fireEvent.change(screen.getByLabelText('Juego'), {
      target: { value: 'bomb' },
    });
    expect(await screen.findByText('SoloCarrera')).toBeInTheDocument();
    resolveFirst(rows); // llega tarde la respuesta de Memorama
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.queryByText('Beto.2')).toBeNull();
    expect(screen.getByText('SoloCarrera')).toBeInTheDocument();
  });

  it('avisa a quien no ha elegido apodo que no aparece', async () => {
    renderWithAuth(<RankingPage />, {
      ...SIGNED_IN,
      profile: {
        ...PROFILE,
        username: 'jugador_ab12cd34',
        hasChosenUsername: false,
      },
    });
    await screen.findByText('Beto.2');
    expect(screen.getByText(/no apareces en el ranking/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Elegir apodo' })).toHaveAttribute(
      'href',
      '/account'
    );
  });
});
