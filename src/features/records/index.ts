import type { Difficulty, GameId } from '../../games/ids';
import type { SubtopicSelection, TopicId } from '../../content';
import { CloudError, type RecordsApi } from './cloudApi';
import { getCloudBest, rememberCloudBest } from './cloudStore';
import {
  effectiveDifficulty,
  getBestScore,
  saveIfHighScore,
} from './localRecords';
import { enqueue } from './pendingQueue';

export type GameOutcome = {
  topic: TopicId;
  subtopic: SubtopicSelection;
  game: GameId;
  difficulty: Difficulty;
  score: number;
  won: boolean;
};

/**
 * Qué pasó con la partida en la nube:
 * `off` no hay nube configurada · `guest` hay nube pero no hay sesión ·
 * `saving` subiéndose · `saved` guardada · `record` guardada y es récord ·
 * `queued` sin conexión, se subirá después · `rejected` el servidor la rechazó.
 */
export type CloudOutcome =
  'off' | 'guest' | 'saving' | 'saved' | 'record' | 'queued' | 'rejected';

export type RecordSummary = { isRecord: boolean; best: number };

export type RecordResult = RecordSummary & {
  /** Estado inicial de la nube (`saving` si hay envío en curso). */
  cloud: CloudOutcome;
  /** Se resuelve cuando termina el envío; `null` si no había nada que enviar. */
  settled: Promise<RecordSummary & { cloud: CloudOutcome }> | null;
};

/** Con quién se juega: nadie (modo invitado) o una cuenta con la API de la nube. */
export type RecordSession = { userId: string | null; api: RecordsApi | null };

/**
 * Guarda el resultado de una partida.
 * - Con sesión: va a la cuenta (y a la cola si no hay conexión). No se escribe en
 *   este dispositivo, para que en una computadora compartida no se mezclen alumnos.
 * - Sin sesión: se guarda en este dispositivo, como en v1.
 */
export function recordGameResult(
  outcome: GameOutcome,
  session: RecordSession
): RecordResult {
  const target = {
    topic: outcome.topic,
    subtopic: outcome.subtopic,
    game: outcome.game,
    difficulty: effectiveDifficulty(outcome.game, outcome.difficulty),
  };

  if (session.api && session.userId) {
    const { api, userId } = session;
    const previous = getCloudBest(target);
    const provisional = {
      isRecord: outcome.score > Math.max(previous, 0),
      best: Math.max(previous, outcome.score, 0),
    };

    const settled = api.saveGame(outcome).then(
      (saved): RecordSummary & { cloud: CloudOutcome } => {
        rememberCloudBest(target, saved.bestScore);
        return {
          isRecord: saved.isNewRecord,
          best: saved.bestScore,
          cloud: saved.isNewRecord ? 'record' : 'saved',
        };
      },
      (error: unknown): RecordSummary & { cloud: CloudOutcome } => {
        if (error instanceof CloudError && error.kind === 'rejected') {
          return { ...provisional, cloud: 'rejected' };
        }
        // Sin conexión: se guarda para subirla después y ya cuenta en pantalla.
        enqueue({ ...outcome, userId });
        rememberCloudBest(target, outcome.score);
        return { ...provisional, cloud: 'queued' };
      }
    );
    return { ...provisional, cloud: 'saving', settled };
  }

  const isRecord = saveIfHighScore(target, outcome.score);
  return {
    isRecord,
    best: getBestScore(target),
    cloud: session.api ? 'guest' : 'off',
    settled: null,
  };
}
