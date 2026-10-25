import { lazy, type LazyExoticComponent, type ComponentType } from 'react';
import type { Difficulty, GameId } from './ids';
import type { GameProps } from './types';
import { MEMORY_MAX_SCORE } from './memory/logic';
import { BOMB_MAX_SCORE } from './bomb/logic';
import { raceMaxScore } from './race/logic';

export type Tutorial = {
  goal: string;
  steps: string[];
  tip: string;
  /** Clases de Tailwind del fondo y del botón del modal. */
  panel: string;
  button: string;
};

/** Metadatos y componente de cada juego. Agregar un juego es agregar una entrada aquí. */
export type GameMeta = {
  id: GameId;
  name: string;
  icon: string;
  description: string;
  /** Preguntas mínimas del subtema para poder jugar (mismos valores que v1). */
  minQuestions: number;
  /** Si el juego tiene selector de dificultad (en v1 solo Carrera). */
  hasDifficulty: boolean;
  /** Clases de Tailwind del color de acento de la tarjeta. */
  accent: string;
  tutorial: Tutorial;
  /** Máximo puntaje alcanzable; el servidor rechaza puntajes mayores (Fase 4). */
  maxScore: (difficulty: Difficulty) => number;
  /** Se descarga solo al jugar, para que cada juego sea su propio chunk. */
  component: LazyExoticComponent<ComponentType<GameProps>>;
};

export const GAMES: readonly GameMeta[] = [
  {
    id: 'memory',
    name: 'Memorama Matemático',
    icon: '🃏',
    description: 'Encuentra las parejas (Función y Resultado)',
    minQuestions: 6,
    hasDifficulty: false,
    accent: 'bg-blue-500',
    tutorial: {
      goal: 'Encuentra todas las parejas de cartas que correspondan entre una función matemática y su resultado.',
      steps: [
        'Toca una carta para voltearla',
        'Busca su pareja (función ↔ resultado)',
        'Si aciertas: +100 puntos ✅',
        'Si fallas: -10 puntos ❌',
        'Ganas al encontrar todas las parejas',
      ],
      tip: 'Usa tu memoria y razonamiento matemático para recordar dónde están las cartas.',
      panel: 'from-blue-900 to-blue-700 border-blue-400',
      button: 'bg-blue-500 hover:bg-blue-600',
    },
    maxScore: () => MEMORY_MAX_SCORE,
    component: lazy(() =>
      import('./memory/MemoryGame').then((m) => ({ default: m.MemoryGame }))
    ),
  },
  {
    id: 'bomb',
    name: 'Desactiva la Bomba',
    icon: '💣',
    description: 'Responde rápido antes de que explote',
    minQuestions: 3,
    hasDifficulty: false,
    accent: 'bg-red-500',
    tutorial: {
      goal: 'Desactiva la bomba resolviendo 5 problemas matemáticos antes de que se acabe el tiempo.',
      steps: [
        'Lee la pregunta matemática',
        'Selecciona el cable (respuesta) correcto',
        'Respuesta correcta: +50 puntos y +5 seg ⏱️',
        'Respuesta incorrecta: -20 puntos y -5 seg ⚠️',
        'Tienes 30 segundos iniciales',
      ],
      tip: '¡Piensa rápido pero con precisión! Un error te quita tiempo valioso.',
      panel: 'from-red-900 to-red-700 border-red-400',
      button: 'bg-red-500 hover:bg-red-600',
    },
    maxScore: () => BOMB_MAX_SCORE,
    component: lazy(() =>
      import('./bomb/BombGame').then((m) => ({ default: m.BombGame }))
    ),
  },
  {
    id: 'race',
    name: 'Carrera del Saber',
    icon: '🏎️',
    description: 'Esquiva los errores, atrapa los aciertos',
    minQuestions: 3,
    hasDifficulty: true,
    accent: 'bg-yellow-500',
    tutorial: {
      goal: 'Conduce tu auto recogiendo las respuestas correctas y evitando las incorrectas. Alcanza la meta de puntos para ganar: 300, 500 u 800 según la dificultad.',
      steps: [
        'Lee la pregunta en la parte superior',
        'Usa las flechas ← → (o toca los lados en el celular)',
        'Recoge la respuesta correcta: +50 puntos 🎯',
        'Evita respuestas incorrectas: -20 puntos 💥',
        'El juego se acelera progresivamente',
      ],
      tip: 'Mantén la concentración y anticipa los movimientos. ¡La velocidad aumenta!',
      panel: 'from-yellow-900 to-yellow-700 border-yellow-400',
      button: 'bg-yellow-500 hover:bg-yellow-600',
    },
    maxScore: raceMaxScore,
    component: lazy(() =>
      import('./race/RaceGame').then((m) => ({ default: m.RaceGame }))
    ),
  },
];

export function getGame(id: GameId): GameMeta {
  return GAMES.find((g) => g.id === id)!;
}
