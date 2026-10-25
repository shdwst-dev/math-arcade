import { z } from 'zod';
import { DIFFICULTIES, GAME_IDS } from '../../games/ids';
import { TOPICS } from '../../content';
import type { GameOutcome } from './index';

// Partidas que no se pudieron subir por falta de conexión. Misma llave y forma
// que v1; incluyen el usuario para no subirlas a la cuenta equivocada.
export const PENDING_KEY = 'mathArcade_pending';
/** Tope para que una cola olvidada no crezca sin límite. */
export const MAX_PENDING = 100;

export type PendingGame = GameOutcome & { userId: string };

const topicIds = TOPICS.map((t) => t.id) as [
  (typeof TOPICS)[number]['id'],
  ...(typeof TOPICS)[number]['id'][],
];

const pendingSchema = z.object({
  userId: z.string().min(1),
  topic: z.enum(topicIds),
  subtopic: z.string().min(1),
  game: z.enum(GAME_IDS),
  difficulty: z.enum(DIFFICULTIES),
  score: z.number().int(),
  won: z.boolean(),
});

export function readPending(): PendingGame[] {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      const result = pendingSchema.safeParse(item);
      return result.success ? [result.data as PendingGame] : [];
    });
  } catch {
    return [];
  }
}

export function writePending(items: PendingGame[]): void {
  try {
    if (items.length === 0) localStorage.removeItem(PENDING_KEY);
    else
      localStorage.setItem(
        PENDING_KEY,
        JSON.stringify(items.slice(-MAX_PENDING))
      );
  } catch {
    // Sin almacenamiento disponible: la partida simplemente no se podrá reintentar.
  }
}

export function enqueue(item: PendingGame): void {
  writePending([...readPending(), item]);
}
