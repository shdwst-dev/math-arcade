import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  STORAGE_KEY,
  clearAll,
  getBestScore,
  getRecords,
  saveIfHighScore,
  type RecordTarget,
} from './localRecords';

const memory: RecordTarget = {
  topic: 'fundamentos',
  subtopic: 'productos_notables',
  game: 'memory',
  difficulty: 'Normal',
};
const race = (difficulty: RecordTarget['difficulty']): RecordTarget => ({
  topic: 'integral',
  subtopic: 'todos',
  game: 'race',
  difficulty,
});

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('récords locales', () => {
  it('devuelve 0 si nunca se ha jugado', () => {
    expect(getBestScore(memory)).toBe(0);
    expect(getRecords()).toEqual([]);
  });

  it('solo guarda y avisa cuando se supera el récord', () => {
    expect(saveIfHighScore(memory, 300)).toBe(true);
    expect(saveIfHighScore(memory, 200)).toBe(false);
    expect(saveIfHighScore(memory, 300)).toBe(false);
    expect(saveIfHighScore(memory, 400)).toBe(true);
    expect(getBestScore(memory)).toBe(400);
  });

  it('un puntaje de 0 o negativo nunca es récord', () => {
    expect(saveIfHighScore(memory, 0)).toBe(false);
    expect(saveIfHighScore(memory, -30)).toBe(false);
    expect(getRecords()).toEqual([]);
    expect(saveIfHighScore(memory, 10)).toBe(true);
  });

  it('separa los récords de Carrera por dificultad', () => {
    saveIfHighScore(race('Fácil'), 340);
    saveIfHighScore(race('Difícil'), 840);
    expect(getBestScore(race('Fácil'))).toBe(340);
    expect(getBestScore(race('Normal'))).toBe(0);
    expect(getBestScore(race('Difícil'))).toBe(840);
  });

  it('ignora la dificultad en los juegos que no la usan', () => {
    saveIfHighScore({ ...memory, difficulty: 'Difícil' }, 500);
    expect(getBestScore({ ...memory, difficulty: 'Fácil' })).toBe(500);
  });

  it('lee el formato de v1, incluidos subtemas con guion bajo y dificultad', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        fundamentos_productos_notables_memory: {
          score: 600,
          date: '2026-01-01T00:00:00.000Z',
        },
        integral_todos_race_Difícil: {
          score: 840,
          date: '2026-01-02T00:00:00.000Z',
        },
      })
    );
    expect(getRecords()).toEqual([
      {
        topic: 'fundamentos',
        subtopic: 'productos_notables',
        game: 'memory',
        difficulty: 'Normal',
        score: 600,
        date: '2026-01-01T00:00:00.000Z',
      },
      {
        topic: 'integral',
        subtopic: 'todos',
        game: 'race',
        difficulty: 'Difícil',
        score: 840,
        date: '2026-01-02T00:00:00.000Z',
      },
    ]);
    expect(getBestScore(memory)).toBe(600);
  });

  it('ignora llaves desconocidas y entradas con forma inválida', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        otra_cosa: { score: 1, date: 'x' },
        fundamentos_subtema_inexistente_memory: { score: 1, date: 'x' },
        fundamentos_matrices_bomb: { score: 'mucho', date: 'x' },
        fundamentos_matrices_memory: { score: 100, date: 'x' },
      })
    );
    expect(getRecords().map((r) => `${r.subtopic}/${r.game}`)).toEqual([
      'matrices/memory',
    ]);
  });

  it('no se rompe con JSON dañado ni con un valor que no es objeto', () => {
    localStorage.setItem(STORAGE_KEY, '{no es json');
    expect(getRecords()).toEqual([]);
    expect(getBestScore(memory)).toBe(0);
    localStorage.setItem(STORAGE_KEY, '42');
    expect(getRecords()).toEqual([]);
    expect(saveIfHighScore(memory, 100)).toBe(true);
    expect(getBestScore(memory)).toBe(100);
  });

  it('no se rompe si el almacenamiento no está disponible', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    expect(getBestScore(memory)).toBe(0);
    expect(saveIfHighScore(memory, 100)).toBe(false);
  });

  it('borra todo con clearAll', () => {
    saveIfHighScore(memory, 100);
    clearAll();
    expect(getRecords()).toEqual([]);
  });
});
