import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import {
  resetCloud,
  setCloudError,
  setCloudLoading,
  setCloudRecords,
} from '../features/records/cloudStore';
import {
  getRecords,
  saveIfHighScore,
  type LocalRecord,
} from '../features/records/localRecords';
import { SIGNED_IN, SIGNED_OUT, renderWithAuth } from '../test/renderWithAuth';
import { StatsPage } from './StatsPage';

const memory = {
  topic: 'fundamentos',
  subtopic: 'matrices',
  game: 'memory',
  difficulty: 'Normal',
} as const;
const race = {
  topic: 'integral',
  subtopic: 'todos',
  game: 'race',
  difficulty: 'Difícil',
} as const;
const cloud: LocalRecord[] = [
  { ...race, score: 800, date: '2026-02-01T00:00:00Z' },
];

beforeEach(() => {
  localStorage.clear();
  resetCloud();
});

describe('Estadísticas como invitado', () => {
  it('sin récords invita a jugar', () => {
    renderWithAuth(<StatsPage />);
    expect(
      screen.getByText(/No hay récords guardados aún/)
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Borrar todo/ })).toBeNull();
  });

  it('lista los récords del dispositivo agrupados por tema, con el nombre del subtema', () => {
    saveIfHighScore(memory, 590);
    saveIfHighScore(race, 700);
    renderWithAuth(<StatsPage />);
    expect(
      screen.getByText(/guardados en este dispositivo/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Fundamentos' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Cálculo Integral' })
    ).toBeInTheDocument();
    expect(screen.getByText('Matrices')).toBeInTheDocument();
    expect(screen.getByText('Todos los temas')).toBeInTheDocument();
    expect(screen.getByText('590')).toBeInTheDocument();
    expect(screen.getByText('(Difícil)')).toBeInTheDocument(); // solo Carrera muestra la dificultad
    expect(
      screen.getByText('Mejor puntaje').previousElementSibling
    ).toHaveTextContent('700');
  });

  it('con la nube disponible sugiere iniciar sesión', () => {
    renderWithAuth(<StatsPage />, SIGNED_OUT);
    expect(screen.getByRole('link', { name: 'Inicia sesión' })).toHaveAttribute(
      'href',
      '/account'
    );
  });

  it('borrar todo pide confirmación y vacía los récords del dispositivo', async () => {
    saveIfHighScore(memory, 590);
    renderWithAuth(<StatsPage />);
    fireEvent.click(screen.getByRole('button', { name: /Borrar todo/ }));
    expect(screen.getByRole('dialog')).toHaveTextContent(
      'guardados en este dispositivo'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Sí, borrar' }));
    await waitFor(() =>
      expect(
        screen.getByText(/No hay récords guardados aún/)
      ).toBeInTheDocument()
    );
    expect(getRecords()).toEqual([]);
  });
});

describe('Estadísticas con sesión', () => {
  it('muestra los récords de la cuenta y no los del dispositivo', () => {
    saveIfHighScore(memory, 590); // de otra persona que jugó aquí como invitado
    setCloudRecords(cloud);
    renderWithAuth(<StatsPage />, SIGNED_IN);
    expect(screen.getByText(/Récords de tu cuenta/)).toBeInTheDocument();
    expect(screen.getByRole('listitem')).toHaveTextContent('800');
    expect(screen.queryByText('Matrices')).toBeNull();
  });

  it('incluye partidas y victorias de la cuenta', () => {
    setCloudRecords(cloud);
    renderWithAuth(<StatsPage />, SIGNED_IN);
    expect(
      screen.getByText('Partidas').previousElementSibling
    ).toHaveTextContent('12');
    expect(
      screen.getByText('Victorias').previousElementSibling
    ).toHaveTextContent('5');
  });

  it('mientras carga y si falla lo dice (sin mostrar "no hay récords")', () => {
    setCloudLoading();
    const { unmount } = renderWithAuth(<StatsPage />, SIGNED_IN);
    expect(screen.getByRole('status')).toHaveTextContent('Cargando récords');
    expect(screen.queryByText(/No hay récords guardados aún/)).toBeNull();
    unmount();

    setCloudError();
    renderWithAuth(<StatsPage />, SIGNED_IN);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar'
    );
    expect(screen.queryByText(/No hay récords guardados aún/)).toBeNull();
  });

  it('se actualiza cuando llegan récords nuevos de la nube', async () => {
    setCloudRecords([]);
    renderWithAuth(<StatsPage />, SIGNED_IN);
    expect(
      screen.getByText(/No hay récords guardados aún/)
    ).toBeInTheDocument();
    act(() => setCloudRecords(cloud));
    expect(await screen.findByRole('listitem')).toHaveTextContent('800');
  });

  it('borrar todo borra el progreso de la nube, no el del dispositivo', async () => {
    saveIfHighScore(memory, 590);
    setCloudRecords(cloud);
    const clearProgress = vi.fn().mockResolvedValue(undefined);
    renderWithAuth(<StatsPage />, { ...SIGNED_IN, clearProgress });
    fireEvent.click(screen.getByRole('button', { name: /Borrar todo/ }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('de la nube');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Sí, borrar' }));
    await waitFor(() => expect(clearProgress).toHaveBeenCalledTimes(1));
    expect(getRecords()).toHaveLength(1);
  });
});
