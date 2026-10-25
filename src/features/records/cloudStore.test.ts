import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getCloudBest,
  getCloudState,
  rememberCloudBest,
  resetCloud,
  setCloudError,
  setCloudLoading,
  setCloudRecords,
  subscribeCloud,
} from './cloudStore';
import type { RecordTarget } from './localRecords';

const memory: RecordTarget = {
  topic: 'integral',
  subtopic: 'todos',
  game: 'memory',
  difficulty: 'Normal',
};

beforeEach(() => resetCloud());

describe('almacén de la nube', () => {
  it('empieza vacío y pasa por los estados de carga', () => {
    expect(getCloudState().status).toBe('idle');
    setCloudLoading();
    expect(getCloudState().status).toBe('loading');
    setCloudRecords([]);
    expect(getCloudState().status).toBe('ready');
    setCloudError();
    expect(getCloudState().status).toBe('error');
  });

  it('el mejor puntaje es 0 si no hay récord', () => {
    expect(getCloudBest(memory)).toBe(0);
  });

  it('recuerda un récord mayor y no uno menor', () => {
    rememberCloudBest(memory, 300);
    expect(getCloudBest(memory)).toBe(300);
    rememberCloudBest(memory, 200);
    expect(getCloudBest(memory)).toBe(300);
    rememberCloudBest(memory, 500);
    expect(getCloudBest(memory)).toBe(500);
    expect(getCloudState().records).toHaveLength(1);
  });

  it('en juegos sin dificultad todas las dificultades son el mismo récord', () => {
    rememberCloudBest({ ...memory, difficulty: 'Difícil' }, 400);
    expect(getCloudBest({ ...memory, difficulty: 'Fácil' })).toBe(400);
  });

  it('Carrera separa por dificultad', () => {
    const race: RecordTarget = { ...memory, game: 'race', difficulty: 'Fácil' };
    rememberCloudBest(race, 340);
    expect(getCloudBest({ ...race, difficulty: 'Fácil' })).toBe(340);
    expect(getCloudBest({ ...race, difficulty: 'Normal' })).toBe(0);
  });

  it('avisa a quien escucha y deja de avisar al desuscribirse', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeCloud(listener);
    rememberCloudBest(memory, 100);
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    rememberCloudBest(memory, 200);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('reset olvida todo (p. ej. al cerrar sesión)', () => {
    rememberCloudBest(memory, 100);
    resetCloud();
    expect(getCloudBest(memory)).toBe(0);
    expect(getCloudState().status).toBe('idle');
  });
});
