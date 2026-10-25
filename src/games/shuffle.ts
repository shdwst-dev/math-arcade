/** Generador de números en [0, 1). Los juegos lo reciben para poder probarse con semillas fijas. */
export type Rng = () => number;

/** Baraja con Fisher-Yates (el `sort(() => 0.5 - Math.random())` de v1 reparte de forma sesgada). */
export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Elige un elemento al azar de una lista no vacía. */
export function pickRandom<T>(items: readonly T[], rng: Rng = Math.random): T {
  return items[Math.floor(rng() * items.length)];
}
