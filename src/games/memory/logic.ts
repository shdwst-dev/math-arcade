import type { Question } from '../../content';
import { shuffle, type Rng } from '../shuffle';

// Reglas de v1: 6 parejas, +100 por pareja, −10 por fallo.
export const MEMORY_PAIRS = 6;
export const MEMORY_MATCH_POINTS = 100;
export const MEMORY_MISMATCH_POINTS = -10;
export const MEMORY_MAX_SCORE = MEMORY_PAIRS * MEMORY_MATCH_POINTS;
/** Tiempo que se muestran dos cartas distintas antes de voltearlas (ms). */
export const MEMORY_MISMATCH_DELAY_MS = 1000;
/** Pausa entre encontrar la última pareja y mostrar la victoria (ms). */
export const MEMORY_WIN_DELAY_MS = 500;

export type MemoryCard = {
  uid: number;
  pairId: number;
  kind: 'prompt' | 'answer';
  latex: string;
};

export type MemoryState = {
  cards: MemoryCard[];
  /** Cartas boca arriba que aún no forman pareja (como máximo 2). */
  faceUp: number[];
  /** Parejas ya encontradas. */
  matched: number[];
  score: number;
  /** `checking`: hay dos cartas distintas a la vista y el tablero está bloqueado. */
  status: 'playing' | 'checking' | 'won';
};

export type MemoryAction =
  { type: 'flip'; uid: number } | { type: 'hideMismatch' };

export function createMemory(
  questions: readonly Question[],
  rng: Rng = Math.random
): MemoryState {
  const chosen = shuffle(questions, rng).slice(0, MEMORY_PAIRS);
  const cards = shuffle(
    chosen.flatMap((q, pairId) => [
      { pairId, kind: 'prompt' as const, latex: q.prompt },
      { pairId, kind: 'answer' as const, latex: q.answer },
    ]),
    rng
  ).map((card, uid) => ({ ...card, uid }));
  return { cards, faceUp: [], matched: [], score: 0, status: 'playing' };
}

export function isCardVisible(state: MemoryState, card: MemoryCard): boolean {
  return state.faceUp.includes(card.uid) || state.matched.includes(card.pairId);
}

export function memoryReducer(
  state: MemoryState,
  action: MemoryAction
): MemoryState {
  switch (action.type) {
    case 'flip': {
      if (state.status !== 'playing') return state;
      const card = state.cards.find((c) => c.uid === action.uid);
      if (!card || isCardVisible(state, card)) return state;

      const faceUp = [...state.faceUp, card.uid];
      if (faceUp.length < 2) return { ...state, faceUp };

      const [first, second] = faceUp.map((uid) =>
        state.cards.find((c) => c.uid === uid)!
      );
      if (first.pairId === second.pairId) {
        const matched = [...state.matched, first.pairId];
        return {
          ...state,
          faceUp: [],
          matched,
          score: state.score + MEMORY_MATCH_POINTS,
          status: matched.length * 2 === state.cards.length ? 'won' : 'playing',
        };
      }
      return {
        ...state,
        faceUp,
        score: state.score + MEMORY_MISMATCH_POINTS,
        status: 'checking',
      };
    }
    case 'hideMismatch':
      if (state.status !== 'checking') return state;
      return { ...state, faceUp: [], status: 'playing' };
  }
}
