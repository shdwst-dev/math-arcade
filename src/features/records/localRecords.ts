import type { Difficulty, GameId } from '../../games/ids';
import { DEFAULT_DIFFICULTY } from '../../games/ids';
import {
  ALL_SUBTOPICS,
  TOPICS,
  type SubtopicSelection,
  type TopicId,
} from '../../content';

// Récords del modo invitado. Mismo formato y llave que v1 para que los récords
// ya guardados en el navegador sigan funcionando sin migrar nada.
export const STORAGE_KEY = 'mathArcade_scores';

type StoredEntry = { score: number; date: string };
type StoredRecords = Record<string, StoredEntry>;

export type LocalRecord = {
  topic: TopicId;
  subtopic: SubtopicSelection;
  game: GameId;
  difficulty: Difficulty;
  score: number;
  date: string;
};

export type RecordTarget = Pick<
  LocalRecord,
  'topic' | 'subtopic' | 'game' | 'difficulty'
>;

// Las llaves tienen forma tema_subtema_juego[_dificultad]. Los subtemas contienen
// guiones bajos (p. ej. productos_notables), así que se separan con una regex.
const KEY_PATTERN =
  /^(fundamentos|diferencial|integral)_(.+)_(memory|bomb|race)(?:_(.+))?$/;

/** La dificultad solo cuenta en Carrera; en los demás juegos siempre es Normal. */
export function effectiveDifficulty(
  game: GameId,
  difficulty: Difficulty
): Difficulty {
  return game === 'race' ? difficulty : DEFAULT_DIFFICULTY;
}

function storageKey({ topic, subtopic, game, difficulty }: RecordTarget) {
  const suffix = game === 'race' ? `_${difficulty}` : '';
  return `${topic}_${subtopic}_${game}${suffix}`;
}

function isStoredEntry(value: unknown): value is StoredEntry {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Record<string, unknown>;
  return typeof entry.score === 'number' && typeof entry.date === 'string';
}

/** Lee todo el almacenamiento. Si no está disponible o está dañado, devuelve vacío. */
function readAll(): StoredRecords {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(([, entry]) => isStoredEntry(entry))
    );
  } catch {
    return {};
  }
}

function writeAll(records: StoredRecords): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return true;
  } catch {
    return false; // Modo privado o almacenamiento lleno: el juego sigue sin guardar.
  }
}

const KNOWN_DIFFICULTIES: readonly string[] = ['Fácil', 'Normal', 'Difícil'];

/** Todos los récords guardados, ya convertidos a objetos. Ignora llaves desconocidas. */
export function getRecords(): LocalRecord[] {
  const records: LocalRecord[] = [];
  for (const [key, entry] of Object.entries(readAll())) {
    const match = key.match(KEY_PATTERN);
    if (!match) continue;
    const [, topic, subtopic, game, difficulty] = match;
    const topicDef = TOPICS.find((t) => t.id === topic);
    const validSubtopic =
      subtopic === ALL_SUBTOPICS ||
      topicDef?.subtopics.some((s) => s.id === subtopic);
    if (!topicDef || !validSubtopic) continue;
    records.push({
      topic: topicDef.id,
      subtopic: subtopic as SubtopicSelection,
      game: game as GameId,
      difficulty: KNOWN_DIFFICULTIES.includes(difficulty)
        ? (difficulty as Difficulty)
        : DEFAULT_DIFFICULTY,
      score: entry.score,
      date: entry.date,
    });
  }
  return records;
}

/** Mejor puntaje guardado para esa combinación (0 si nunca se ha jugado). */
export function getBestScore(target: RecordTarget): number {
  return readAll()[storageKey(target)]?.score ?? 0;
}

/**
 * Guarda el puntaje si supera al récord anterior (o a 0 si no hay). Devuelve
 * `true` solo si fue un nuevo récord y se pudo guardar.
 */
export function saveIfHighScore(
  target: RecordTarget,
  score: number,
  now: Date = new Date()
): boolean {
  const all = readAll();
  const key = storageKey(target);
  // Sin récord previo cuenta como 0: un puntaje de 0 o negativo nunca es récord.
  if (score <= (all[key]?.score ?? 0)) return false;
  all[key] = { score, date: now.toISOString() };
  return writeAll(all);
}

export function clearAll(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nada que borrar si el almacenamiento no está disponible.
  }
}
