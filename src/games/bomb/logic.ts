import type { Question } from '../../content';
import { shuffle, type Rng } from '../shuffle';

// Reglas de v1: 30 s de inicio, 5 aciertos para ganar, +50/+5 s por acierto, −20/−5 s por error.
export const BOMB_START_SECONDS = 30;
export const BOMB_ANSWERS_TO_WIN = 5;
export const BOMB_CORRECT_POINTS = 50;
export const BOMB_WRONG_POINTS = -20;
export const BOMB_CORRECT_SECONDS = 5;
export const BOMB_WRONG_SECONDS = -5;
export const BOMB_MAX_SCORE = BOMB_ANSWERS_TO_WIN * BOMB_CORRECT_POINTS;
/** Tiempo que se muestra la respuesta correcta tras un error (ms). */
export const BOMB_REVEAL_DELAY_MS = 1500;
/** Rondas preparadas de antemano; sobra de largo para el tiempo máximo posible. */
const ROUND_BUDGET = 120;

export type BombOption = { latex: string; correct: boolean };
export type BombRound = { prompt: string; options: BombOption[] };

export type BombState = {
  rounds: BombRound[];
  roundIndex: number;
  timeLeft: number;
  /** Aciertos que faltan para desactivar la bomba. */
  remaining: number;
  score: number;
  /** `revealing`: se contestó mal y se muestra la respuesta correcta. */
  status: 'answering' | 'revealing' | 'won' | 'lost';
  /** Índice de la opción elegida en un error (para marcarla). */
  picked: number | null;
};

export type BombAction =
  | { type: 'answer'; optionIndex: number }
  | { type: 'tick' }
  | { type: 'advance' };

/**
 * Prepara todas las rondas desde el inicio (preguntas barajadas, repetidas en
 * ciclo, con las opciones barajadas en cada una). Así el reducer no usa azar.
 */
export function createBomb(
  questions: readonly Question[],
  rng: Rng = Math.random
): BombState {
  const order = shuffle(questions, rng);
  const rounds: BombRound[] = Array.from({ length: ROUND_BUDGET }, (_, i) => {
    const q = order[i % order.length];
    return {
      prompt: q.prompt,
      options: shuffle(
        [
          { latex: q.answer, correct: true },
          ...q.distractors.map((latex) => ({ latex, correct: false })),
        ],
        rng
      ),
    };
  });
  return {
    rounds,
    roundIndex: 0,
    timeLeft: BOMB_START_SECONDS,
    remaining: BOMB_ANSWERS_TO_WIN,
    score: 0,
    status: 'answering',
    picked: null,
  };
}

export function currentRound(state: BombState): BombRound {
  return state.rounds[state.roundIndex % state.rounds.length];
}

export function bombReducer(state: BombState, action: BombAction): BombState {
  switch (action.type) {
    case 'answer': {
      if (state.status !== 'answering') return state;
      const option = currentRound(state).options[action.optionIndex];
      if (!option) return state;

      if (option.correct) {
        const remaining = state.remaining - 1;
        return {
          ...state,
          score: state.score + BOMB_CORRECT_POINTS,
          timeLeft: state.timeLeft + BOMB_CORRECT_SECONDS,
          remaining,
          roundIndex: state.roundIndex + 1,
          status: remaining === 0 ? 'won' : 'answering',
        };
      }
      return {
        ...state,
        score: state.score + BOMB_WRONG_POINTS,
        timeLeft: state.timeLeft + BOMB_WRONG_SECONDS,
        status: 'revealing',
        picked: action.optionIndex,
      };
    }
    case 'tick': {
      if (state.status !== 'answering' && state.status !== 'revealing')
        return state;
      const timeLeft = state.timeLeft - 1;
      return {
        ...state,
        timeLeft,
        status: timeLeft <= 0 ? 'lost' : state.status,
      };
    }
    case 'advance': {
      if (state.status !== 'revealing') return state;
      if (state.timeLeft <= 0) return { ...state, status: 'lost' };
      return {
        ...state,
        roundIndex: state.roundIndex + 1,
        status: 'answering',
        picked: null,
      };
    }
  }
}

/** `mm:ss` como el temporizador de v1 (nunca negativo). */
export function formatBombTime(seconds: number): string {
  const s = Math.max(seconds, 0);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
