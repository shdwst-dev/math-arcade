import { useSyncExternalStore } from 'react';
import {
  effectiveDifficulty,
  recordKey,
  type LocalRecord,
  type RecordTarget,
} from './localRecords';

// Lo que sabemos de la nube para la persona con sesión: se carga al iniciar
// sesión y se actualiza al guardar partidas. Los componentes lo leen con
// `useCloudRecords`; así los "Mejor:" se refrescan solos.

export type CloudStatus = 'idle' | 'loading' | 'ready' | 'error';

export type CloudState = {
  status: CloudStatus;
  records: readonly LocalRecord[];
};

const EMPTY: CloudState = { status: 'idle', records: [] };

let state: CloudState = EMPTY;
const listeners = new Set<() => void>();

function set(next: CloudState) {
  state = next;
  listeners.forEach((listener) => listener());
}

export function getCloudState(): CloudState {
  return state;
}

export function subscribeCloud(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setCloudLoading() {
  set({ ...state, status: 'loading' });
}

export function setCloudError() {
  set({ ...state, status: 'error' });
}

export function setCloudRecords(records: readonly LocalRecord[]) {
  set({ status: 'ready', records });
}

export function resetCloud() {
  set(EMPTY);
}

/** Mejor puntaje conocido en la nube para esa combinación (0 si ninguno). */
export function getCloudBest(target: RecordTarget): number {
  const key = recordKey(target);
  return state.records.find((r) => recordKey(r) === key)?.score ?? 0;
}

/** Recuerda un nuevo mejor puntaje (o lo ignora si no supera al conocido). */
export function rememberCloudBest(
  target: RecordTarget,
  score: number,
  now: Date = new Date()
) {
  if (score <= getCloudBest(target)) return;
  const key = recordKey(target);
  const entry: LocalRecord = {
    ...target,
    difficulty: effectiveDifficulty(target.game, target.difficulty),
    score,
    date: now.toISOString(),
  };
  set({
    ...state,
    records: [...state.records.filter((r) => recordKey(r) !== key), entry],
  });
}

export function useCloudState(): CloudState {
  return useSyncExternalStore(subscribeCloud, getCloudState, getCloudState);
}
