import { CloudError, type RecordsApi } from './cloudApi';
import {
  rememberCloudBest,
  setCloudError,
  setCloudLoading,
  setCloudRecords,
} from './cloudStore';
import {
  clearAll,
  getRecords,
  recordKey,
  type LocalRecord,
} from './localRecords';
import { readPending, writePending, type PendingGame } from './pendingQueue';

export type FlushResult = { sent: number; pending: number };

let inFlight: Promise<FlushResult> | null = null;

function samePending(a: PendingGame, b: PendingGame): boolean {
  return (
    a.userId === b.userId &&
    a.topic === b.topic &&
    a.subtopic === b.subtopic &&
    a.game === b.game &&
    a.difficulty === b.difficulty &&
    a.score === b.score &&
    a.won === b.won
  );
}

/** Quita de la cola (releída del almacenamiento) la primera entrada igual a `item`. */
function removeFromQueue(item: PendingGame): boolean {
  const queue = readPending();
  const index = queue.findIndex((p) => samePending(p, item));
  if (index === -1) return false;
  writePending(queue.filter((_, i) => i !== index));
  return true;
}

/**
 * Sube las partidas pendientes de esta cuenta, una por una y en orden. Se detiene
 * en el primer fallo de red (el resto sigue en la cola) y descarta las que el
 * servidor rechaza. Se relee la cola en cada paso, así que no pisa partidas
 * encoladas mientras se está subiendo. Solo hay un envío a la vez.
 */
export function flushPending(
  api: RecordsApi,
  userId: string
): Promise<FlushResult> {
  if (inFlight) return inFlight;
  inFlight = (async () => {
    let sent = 0;
    for (;;) {
      const next = readPending().find((p) => p.userId === userId);
      if (!next) break;
      try {
        const result = await api.saveGame(next);
        rememberCloudBest(next, result.bestScore);
        sent += 1;
      } catch (error) {
        if (!(error instanceof CloudError) || error.kind === 'retry') break;
        // Rechazada por el servidor: reintentar no sirve, se descarta.
      }
      if (!removeFromQueue(next)) break; // no se pudo actualizar la cola: no seguir
    }
    return {
      sent,
      pending: readPending().filter((p) => p.userId === userId).length,
    };
  })().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

/** Carga los récords de la nube en el almacén. Devuelve `null` si falló. */
export async function loadCloudRecords(
  api: RecordsApi
): Promise<LocalRecord[] | null> {
  setCloudLoading();
  try {
    const records = await api.fetchMyRecords();
    setCloudRecords(records);
    return records;
  } catch {
    setCloudError();
    return null;
  }
}

/** Récords de este dispositivo (modo invitado) que superan a los de la cuenta. */
export function guestRecordsToImport(
  cloudRecords: readonly LocalRecord[]
): LocalRecord[] {
  const cloudBest = new Map(cloudRecords.map((r) => [recordKey(r), r.score]));
  return getRecords().filter(
    (r) => r.score > (cloudBest.get(recordKey(r)) ?? 0)
  );
}

/**
 * Sube a la cuenta los récords del dispositivo y los borra de aquí, para que en
 * una computadora compartida el siguiente alumno no los reciba por error.
 */
export async function importGuestRecords(
  api: RecordsApi,
  records: readonly LocalRecord[]
): Promise<number> {
  const imported = await api.importRecords(records);
  clearAll();
  return imported;
}
