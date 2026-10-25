import type { Difficulty, GameId } from '../../games/ids';
import type { SubtopicSelection, TopicId } from '../../content';
import {
  effectiveDifficulty,
  getBestScore,
  saveIfHighScore,
} from './localRecords';

export type GameOutcome = {
  topic: TopicId;
  subtopic: SubtopicSelection;
  game: GameId;
  difficulty: Difficulty;
  score: number;
  won: boolean;
};

export type RecordSummary = { isRecord: boolean; best: number };

/**
 * Guarda el resultado de una partida y dice si fue récord. Hoy solo escribe en
 * este dispositivo; en la Fase 4 también la enviará a la nube si hay sesión.
 */
export function recordGameResult(outcome: GameOutcome): RecordSummary {
  const target = {
    topic: outcome.topic,
    subtopic: outcome.subtopic,
    game: outcome.game,
    difficulty: effectiveDifficulty(outcome.game, outcome.difficulty),
  };
  const isRecord = saveIfHighScore(target, outcome.score);
  return { isRecord, best: getBestScore(target) };
}
