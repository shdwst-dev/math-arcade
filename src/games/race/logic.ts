import type { Question } from '../../content';
import type { Difficulty } from '../ids';
import { pickRandom, type Rng } from '../shuffle';

// Todos los números vienen de v1 (js/games/race.js). v1 los aplicaba "por cuadro"
// con una pista fija de 500 px. Aquí el tiempo se mide en cuadros a 60 FPS
// (`dt`, que puede ser fraccionario) y las posiciones en % del alto de la pista,
// así el juego dura lo mismo a 30, 60 o 144 Hz y en cualquier tamaño de pantalla.

export type RaceConfig = {
  /** Velocidad inicial en px de pista (de 500 px) por cuadro. */
  speed: number;
  maxSpeed: number;
  /** Cuadros entre apariciones al empezar y mínimo al que baja. */
  spawnEvery: number;
  minSpawnEvery: number;
  /** Puntos para ganar. */
  target: number;
};

export const RACE_CONFIG: Record<Difficulty, RaceConfig> = {
  Fácil: {
    speed: 1.0,
    maxSpeed: 2,
    spawnEvery: 180,
    minSpawnEvery: 120,
    target: 300,
  },
  Normal: {
    speed: 1.5,
    maxSpeed: 3.5,
    spawnEvery: 150,
    minSpawnEvery: 90,
    target: 500,
  },
  Difícil: {
    speed: 2.5,
    maxSpeed: 5,
    spawnEvery: 100,
    minSpawnEvery: 60,
    target: 800,
  },
};

export const RACE_LANES = 3;
export const RACE_CORRECT_POINTS = 50;
export const RACE_WRONG_POINTS = -20;
/** Se pierde al bajar de este puntaje tras chocar con una respuesta incorrecta. */
export const RACE_LOSE_BELOW = -100;
export const RACE_MAX_ITEMS = 8;
/** Probabilidad de que lo que cae sea la respuesta correcta (v1: `random > 0.6`). */
export const RACE_ANSWER_CHANCE = 0.4;

const TRACK_PX = 500; // alto de pista con el que se calibró v1
const PX_TO_PERCENT = 100 / TRACK_PX;
export const RACE_SPAWN_Y = -50 * PX_TO_PERCENT; // -10 %
/** Zona (en % del alto) donde un objeto choca con el auto si está en su carril. */
export const RACE_HIT_FROM = 420 * PX_TO_PERCENT; // 84 %
export const RACE_HIT_TO = 480 * PX_TO_PERCENT; // 96 %
export const RACE_REMOVE_Y = 520 * PX_TO_PERCENT; // 104 %

const SPEED_RAMP_PER_FRAME = 0.001;
const SPEED_BONUS_ON_CORRECT = 0.1;
const SPAWN_RAMP_EVERY_FRAMES = 300;
const SPAWN_RAMP_STEP = 5;

/** Un cuadro a 60 FPS, en ms. */
export const RACE_FRAME_MS = 1000 / 60;
/** Tope de `dt` por paso para que, tras volver a la pestaña, los objetos no "salten". */
export const RACE_MAX_DT = 3;

/** Lo máximo que se puede acabar sumando: el último acierto parte de (meta − 10). */
export function raceMaxScore(difficulty: Difficulty): number {
  return RACE_CONFIG[difficulty].target + RACE_CORRECT_POINTS - 10;
}

export type Lane = 0 | 1 | 2;

export type RaceItem = {
  id: number;
  lane: Lane;
  /** Posición vertical del borde superior, en % del alto de la pista. */
  y: number;
  latex: string;
  isAnswer: boolean;
  /** Pregunta para la que cayó. Si ya cambió, el objeto queda inerte. */
  questionId: string;
};

export type RaceState = {
  difficulty: Difficulty;
  questions: readonly Question[];
  question: Question;
  lane: Lane;
  items: RaceItem[];
  speed: number;
  spawnEvery: number;
  sinceSpawn: number;
  sinceRamp: number;
  nextId: number;
  score: number;
  status: 'playing' | 'won' | 'lost';
};

export type RaceEvent =
  | { type: 'spawn'; item: RaceItem }
  | { type: 'correct'; item: RaceItem; nextQuestion: Question }
  | { type: 'wrong'; item: RaceItem; correctAnswer: string }
  | { type: 'leave'; id: number }
  | { type: 'finish'; won: boolean };

export function createRace(
  questions: readonly Question[],
  difficulty: Difficulty,
  rng: Rng = Math.random
): RaceState {
  const config = RACE_CONFIG[difficulty];
  return {
    difficulty,
    questions,
    question: pickRandom(questions, rng),
    lane: 1,
    items: [],
    speed: config.speed,
    spawnEvery: config.spawnEvery,
    sinceSpawn: 0,
    sinceRamp: 0,
    nextId: 1,
    score: 0,
    status: 'playing',
  };
}

export function moveLane(state: RaceState, direction: -1 | 1): RaceState {
  const lane = Math.min(
    RACE_LANES - 1,
    Math.max(0, state.lane + direction)
  ) as Lane;
  return lane === state.lane ? state : { ...state, lane };
}

function spawnItem(state: RaceState, rng: Rng): RaceItem {
  const q = state.question;
  const isAnswer = rng() > 1 - RACE_ANSWER_CHANCE;
  return {
    id: state.nextId,
    lane: Math.floor(rng() * RACE_LANES) as Lane,
    y: RACE_SPAWN_Y,
    latex: isAnswer ? q.answer : pickRandom(q.distractors, rng),
    isAnswer,
    questionId: q.id,
  };
}

/**
 * Avanza el juego `dt` cuadros (a 60 FPS). Devuelve el nuevo estado y los
 * eventos ocurridos para que la interfaz los muestre; no toca el DOM.
 */
export function stepRace(
  prev: RaceState,
  dt: number,
  rng: Rng = Math.random
): { state: RaceState; events: RaceEvent[] } {
  if (prev.status !== 'playing') return { state: prev, events: [] };

  const config = RACE_CONFIG[prev.difficulty];
  const events: RaceEvent[] = [];
  const state: RaceState = { ...prev };

  // Dificultad progresiva: la velocidad sube y las apariciones se acercan.
  if (state.speed < config.maxSpeed) state.speed += SPEED_RAMP_PER_FRAME * dt;
  state.sinceRamp += dt;
  if (state.sinceRamp >= SPAWN_RAMP_EVERY_FRAMES) {
    state.sinceRamp -= SPAWN_RAMP_EVERY_FRAMES;
    if (state.spawnEvery > config.minSpawnEvery)
      state.spawnEvery -= SPAWN_RAMP_STEP;
  }

  // Aparición de un objeto.
  const every = Math.floor(state.spawnEvery);
  state.sinceSpawn += dt;
  if (state.sinceSpawn >= every) {
    state.sinceSpawn -= every;
    if (state.items.length < RACE_MAX_ITEMS) {
      const item = spawnItem(state, rng);
      // El objeto debió aparecer `sinceSpawn` cuadros antes del final de este paso:
      // se coloca más arriba para que, tras moverse el paso completo, quede donde
      // estaría con un reloj continuo (así no depende de los Hz de la pantalla).
      item.y -= (dt - state.sinceSpawn) * state.speed * PX_TO_PERCENT;
      state.nextId += 1;
      state.items = [...state.items, item];
      events.push({ type: 'spawn', item });
    }
  }

  // Movimiento, choques y salida de pantalla.
  const dy = state.speed * dt * PX_TO_PERCENT;
  const remaining: RaceItem[] = [];
  for (const original of state.items) {
    const item = { ...original, y: original.y + dy };

    const inHitZone = item.y > RACE_HIT_FROM && item.y < RACE_HIT_TO;
    const live = item.questionId === state.question.id;
    if (
      state.status === 'playing' &&
      inHitZone &&
      item.lane === state.lane &&
      live
    ) {
      if (item.isAnswer) {
        const nextQuestion = pickRandom(state.questions, rng);
        state.score += RACE_CORRECT_POINTS;
        state.speed += SPEED_BONUS_ON_CORRECT;
        state.question = nextQuestion;
        events.push({ type: 'correct', item, nextQuestion });
        if (state.score >= config.target) {
          state.status = 'won';
          events.push({ type: 'finish', won: true });
        }
      } else {
        state.score += RACE_WRONG_POINTS;
        events.push({
          type: 'wrong',
          item,
          correctAnswer: state.question.answer,
        });
        if (state.score < RACE_LOSE_BELOW) {
          state.status = 'lost';
          events.push({ type: 'finish', won: false });
        }
      }
      continue; // el objeto desaparece al chocar
    }

    if (item.y > RACE_REMOVE_Y) {
      events.push({ type: 'leave', id: item.id });
      continue;
    }
    remaining.push(item);
  }
  state.items = remaining;

  return { state, events };
}
