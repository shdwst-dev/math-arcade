import { describe, expect, it } from 'vitest';
import { fakeQuestions, seededRng } from '../../test/rng';
import {
  MEMORY_MAX_SCORE,
  MEMORY_PAIRS,
  createMemory,
  isCardVisible,
  memoryReducer,
  type MemoryState,
} from './logic';

const newGame = (seed = 1) => createMemory(fakeQuestions(10), seededRng(seed));

/** Las dos cartas (uids) de cada pareja. */
function pairsOf(state: MemoryState): number[][] {
  const byPair = new Map<number, number[]>();
  for (const c of state.cards)
    byPair.set(c.pairId, [...(byPair.get(c.pairId) ?? []), c.uid]);
  return [...byPair.values()];
}

const flip = (s: MemoryState, uid: number) =>
  memoryReducer(s, { type: 'flip', uid });

describe('Memorama: creación', () => {
  it('reparte 6 parejas (12 cartas), una de pregunta y otra de respuesta', () => {
    const state = newGame();
    expect(state.cards).toHaveLength(MEMORY_PAIRS * 2);
    for (const pair of pairsOf(state)) {
      const kinds = pair.map((uid) => state.cards[uid].kind).sort();
      expect(kinds).toEqual(['answer', 'prompt']);
    }
  });

  it('usa preguntas distintas en cada pareja', () => {
    const state = newGame();
    const prompts = state.cards
      .filter((c) => c.kind === 'prompt')
      .map((c) => c.latex);
    expect(new Set(prompts).size).toBe(MEMORY_PAIRS);
  });

  it('con la misma semilla reparte igual y con otra semilla, distinto', () => {
    const order = (seed: number) =>
      newGame(seed)
        .cards.map((c) => c.latex)
        .join('|');
    expect(order(7)).toBe(order(7));
    expect(order(7)).not.toBe(order(8));
  });

  it('empieza sin puntos y con todas las cartas boca abajo', () => {
    const state = newGame();
    expect(state.score).toBe(0);
    expect(state.cards.some((c) => isCardVisible(state, c))).toBe(false);
  });
});

describe('Memorama: reglas', () => {
  it('una pareja correcta suma 100 y se queda boca arriba', () => {
    let state = newGame();
    const [a, b] = pairsOf(state)[0];
    state = flip(flip(state, a), b);
    expect(state.score).toBe(100);
    expect(state.status).toBe('playing');
    expect(isCardVisible(state, state.cards[a])).toBe(true);
    expect(isCardVisible(state, state.cards[b])).toBe(true);
  });

  it('una pareja incorrecta resta 10, bloquea el tablero y se voltea después', () => {
    let state = newGame();
    const pairs = pairsOf(state);
    const [a] = pairs[0];
    const [b] = pairs[1];
    state = flip(flip(state, a), b);
    expect(state.score).toBe(-10);
    expect(state.status).toBe('checking');
    expect(flip(state, pairs[2][0])).toBe(state); // bloqueado mientras se comprueba
    state = memoryReducer(state, { type: 'hideMismatch' });
    expect(state.status).toBe('playing');
    expect(state.faceUp).toEqual([]);
    expect(isCardVisible(state, state.cards[a])).toBe(false);
  });

  it('ignora voltear la misma carta dos veces o una que ya hizo pareja', () => {
    let state = newGame();
    const [a, b] = pairsOf(state)[0];
    state = flip(state, a);
    expect(flip(state, a)).toBe(state);
    state = flip(state, b);
    expect(flip(state, a)).toBe(state);
    expect(state.score).toBe(100);
  });

  it('ignora cartas inexistentes y "hideMismatch" fuera de lugar', () => {
    const state = newGame();
    expect(flip(state, 99)).toBe(state);
    expect(memoryReducer(state, { type: 'hideMismatch' })).toBe(state);
  });

  it('gana al encontrar todas las parejas y el máximo posible es 600', () => {
    let state = newGame();
    for (const [a, b] of pairsOf(state)) state = flip(flip(state, a), b);
    expect(state.status).toBe('won');
    expect(state.score).toBe(MEMORY_MAX_SCORE);
    expect(MEMORY_MAX_SCORE).toBe(600);
    expect(flip(state, 0)).toBe(state);
  });

  it('los fallos restan: ganar con 2 fallos da 580', () => {
    let state = newGame();
    const pairs = pairsOf(state);
    for (let i = 0; i < 2; i++) {
      state = memoryReducer(flip(flip(state, pairs[0][0]), pairs[1][0]), {
        type: 'hideMismatch',
      });
    }
    for (const [a, b] of pairs) state = flip(flip(state, a), b);
    expect(state.status).toBe('won');
    expect(state.score).toBe(580);
  });
});
