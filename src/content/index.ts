import type { GameId } from '../games/ids';
import { ALL_SUBTOPICS, type SubtopicSelection, type TopicId } from './topics';
import type { Question } from './schema';
import { fundamentosQuestions } from './questions/fundamentos';
import { diferencialQuestions } from './questions/diferencial';
import { integralQuestions } from './questions/integral';

export * from './topics';
export type { Question } from './schema';

export const QUESTIONS: readonly Question[] = [
  ...fundamentosQuestions,
  ...diferencialQuestions,
  ...integralQuestions,
];

/**
 * Filtra un banco por tema y subtema (o todos con `ALL_SUBTOPICS`). Si se indica
 * el juego, excluye las preguntas que declaran no usarse en él.
 */
export function filterQuestions(
  bank: readonly Question[],
  topic: TopicId,
  subtopic: SubtopicSelection = ALL_SUBTOPICS,
  game?: GameId
): Question[] {
  return bank.filter(
    (q) =>
      q.topic === topic &&
      (subtopic === ALL_SUBTOPICS || q.subtopic === subtopic) &&
      (game === undefined || q.games === undefined || q.games.includes(game))
  );
}

/** Preguntas del banco de la app para un tema, subtema y (opcionalmente) juego. */
export function getQuestions(
  topic: TopicId,
  subtopic: SubtopicSelection = ALL_SUBTOPICS,
  game?: GameId
): Question[] {
  return filterQuestions(QUESTIONS, topic, subtopic, game);
}
