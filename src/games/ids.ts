// Ids estables de juegos y dificultades. Son los mismos que usaba v1 para no
// romper los récords guardados. Viven aparte del registro para que el esquema
// de contenido pueda importarlos sin arrastrar los componentes de cada juego.
export const GAME_IDS = ['memory', 'bomb', 'race'] as const;
export type GameId = (typeof GAME_IDS)[number];

export const DIFFICULTIES = ['Fácil', 'Normal', 'Difícil'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const DEFAULT_DIFFICULTY: Difficulty = 'Normal';

export function isGameId(value: string | undefined): value is GameId {
  return GAME_IDS.some((id) => id === value);
}

export function isDifficulty(
  value: string | null | undefined
): value is Difficulty {
  return DIFFICULTIES.some((d) => d === value);
}
