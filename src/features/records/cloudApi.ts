import { z } from 'zod';
import { isSubtopicSelection, isTopicId } from '../../content';
import { isDifficulty, isGameId } from '../../games/ids';
import { supabase, type AppSupabaseClient } from '../../lib/supabase';
import type { GameOutcome } from './index';
import { effectiveDifficulty, type LocalRecord } from './localRecords';

/**
 * `retry`: no se pudo llegar al servidor o falló por algo pasajero (red, 5xx, sesión
 * por renovar); conviene reintentar. `rejected`: el servidor dijo que no (datos
 * inválidos o puntaje imposible); reintentar no sirve.
 */
export type CloudErrorKind = 'retry' | 'rejected';

export class CloudError extends Error {
  readonly kind: CloudErrorKind;
  readonly code: string | undefined;
  constructor(kind: CloudErrorKind, message: string, code?: string) {
    super(message);
    this.name = 'CloudError';
    this.kind = kind;
    this.code = code;
  }
}

type PostgrestLikeError = { message: string; code?: string | null };

/** Convierte el error de supabase-js en uno nuestro, decidiendo si vale la pena reintentar. */
export function toCloudError(
  error: PostgrestLikeError,
  status?: number
): CloudError {
  const code = error.code || undefined;
  const offline = typeof navigator !== 'undefined' && !navigator.onLine;
  // Sin código de PostgREST el fallo fue de red ("Failed to fetch"); los 5xx y la
  // sesión caducada (PGRST30x) también se reintentan.
  const retry =
    offline ||
    !code ||
    (status !== undefined && status >= 500) ||
    code.startsWith('PGRST3');
  return new CloudError(retry ? 'retry' : 'rejected', error.message, code);
}

const saveResultSchema = z.object({
  is_new_record: z.boolean(),
  best_score: z.number(),
});
const importResultSchema = z.object({ imported: z.number() });

export type CloudSaveResult = { isNewRecord: boolean; bestScore: number };
export type GuestRecord = Pick<
  LocalRecord,
  'topic' | 'subtopic' | 'game' | 'difficulty' | 'score'
>;

export function createRecordsApi(client: AppSupabaseClient) {
  return {
    /** Guarda una partida: historial, récord personal y contadores. */
    async saveGame(outcome: GameOutcome): Promise<CloudSaveResult> {
      const { data, error, status } = await client.rpc('record_game_result', {
        p_topic: outcome.topic,
        p_subtopic: outcome.subtopic,
        p_game: outcome.game,
        p_difficulty: effectiveDifficulty(outcome.game, outcome.difficulty),
        p_score: outcome.score,
        p_won: outcome.won,
      });
      if (error) throw toCloudError(error, status);
      const parsed = saveResultSchema.safeParse(data);
      if (!parsed.success)
        throw new CloudError('rejected', 'Respuesta inesperada del servidor');
      return {
        isNewRecord: parsed.data.is_new_record,
        bestScore: parsed.data.best_score,
      };
    },

    /** Todos los récords de la persona con sesión (la base solo devuelve los suyos). */
    async fetchMyRecords(): Promise<LocalRecord[]> {
      const { data, error, status } = await client
        .from('high_scores')
        .select('topic, subtopic, game, difficulty, best_score, updated_at');
      if (error) throw toCloudError(error, status);
      return data.flatMap((row) => {
        // Se ignora lo que la app no conoce (p. ej. un subtema que ya no existe).
        if (
          !isTopicId(row.topic) ||
          !isSubtopicSelection(row.topic, row.subtopic)
        )
          return [];
        if (
          !isGameId(row.game) ||
          !isDifficulty(row.difficulty) ||
          row.best_score <= 0
        )
          return [];
        return [
          {
            topic: row.topic,
            subtopic: row.subtopic,
            game: row.game,
            difficulty: row.difficulty,
            score: row.best_score,
            date: row.updated_at,
          },
        ];
      });
    },

    /** Sube los récords del modo invitado; devuelve cuántos mejoraron a los de la cuenta. */
    async importRecords(records: readonly GuestRecord[]): Promise<number> {
      const { data, error, status } = await client.rpc('import_best_scores', {
        p_records: records.map((r) => ({
          topic: r.topic,
          subtopic: r.subtopic,
          game: r.game,
          difficulty: effectiveDifficulty(r.game, r.difficulty),
          score: r.score,
        })),
      });
      if (error) throw toCloudError(error, status);
      const parsed = importResultSchema.safeParse(data);
      return parsed.success ? parsed.data.imported : 0;
    },

    /** Borra récords, historial y contadores (conserva la cuenta). */
    async clearProgress(): Promise<void> {
      const { error, status } = await client.rpc('clear_my_progress');
      if (error) throw toCloudError(error, status);
    },
  };
}

export type RecordsApi = ReturnType<typeof createRecordsApi>;

/** API con el cliente real, o `null` si la nube no está configurada. */
export const recordsApi: RecordsApi | null = supabase
  ? createRecordsApi(supabase)
  : null;
