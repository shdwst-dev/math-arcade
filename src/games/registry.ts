import type { GameId } from './ids';

/** Metadatos de cada juego. En la Fase 3 se añaden aquí el tutorial y el componente. */
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
  },
  {
    id: 'bomb',
    name: 'Desactiva la Bomba',
    icon: '💣',
    description: 'Responde rápido antes de que explote',
    minQuestions: 3,
    hasDifficulty: false,
    accent: 'bg-red-500',
  },
  {
    id: 'race',
    name: 'Carrera del Saber',
    icon: '🏎️',
    description: 'Esquiva los errores, atrapa los aciertos',
    minQuestions: 3,
    hasDifficulty: true,
    accent: 'bg-yellow-500',
  },
];

export function getGame(id: GameId): GameMeta {
  return GAMES.find((g) => g.id === id)!;
}
