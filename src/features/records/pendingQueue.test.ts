import { beforeEach, describe, expect, it } from 'vitest';
import {
  MAX_PENDING,
  PENDING_KEY,
  enqueue,
  readPending,
  writePending,
  type PendingGame,
} from './pendingQueue';

const item = (score: number, userId = 'u1'): PendingGame => ({
  userId,
  topic: 'integral',
  subtopic: 'por_partes',
  game: 'memory',
  difficulty: 'Normal',
  score,
  won: true,
});

beforeEach(() => localStorage.clear());

describe('cola de partidas pendientes', () => {
  it('empieza vacía y conserva el orden', () => {
    expect(readPending()).toEqual([]);
    enqueue(item(1));
    enqueue(item(2));
    expect(readPending().map((p) => p.score)).toEqual([1, 2]);
  });

  it('al quedar vacía se borra la llave', () => {
    enqueue(item(1));
    writePending([]);
    expect(localStorage.getItem(PENDING_KEY)).toBeNull();
  });

  it('lee el formato de v1 y descarta entradas inválidas o manipuladas', () => {
    localStorage.setItem(
      PENDING_KEY,
      JSON.stringify([
        item(10),
        { ...item(20), topic: 'geometria' },
        { ...item(30), score: 'mucho' },
        { ...item(40), userId: '' },
        'basura',
        null,
      ])
    );
    expect(readPending().map((p) => p.score)).toEqual([10]);
  });

  it('JSON dañado o que no es lista → cola vacía', () => {
    localStorage.setItem(PENDING_KEY, '{no es json');
    expect(readPending()).toEqual([]);
    localStorage.setItem(PENDING_KEY, '{"a":1}');
    expect(readPending()).toEqual([]);
  });

  it('no crece sin límite: se queda con las más recientes', () => {
    writePending(Array.from({ length: MAX_PENDING + 5 }, (_, i) => item(i)));
    const queue = readPending();
    expect(queue).toHaveLength(MAX_PENDING);
    expect(queue[0].score).toBe(5);
  });
});
