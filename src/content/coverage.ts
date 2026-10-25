import { getQuestions } from './index';
import { TOPICS, type SubtopicId, type TopicId } from './topics';
import { GAMES } from '../games/registry';
import type { GameId } from '../games/ids';

export type CoverageGap = {
  topic: TopicId;
  subtopic: SubtopicId;
  game: GameId;
  have: number;
  need: number;
};

/** Combinaciones subtema + juego que no llegan al mínimo de preguntas del juego. */
export function findCoverageGaps(): CoverageGap[] {
  const gaps: CoverageGap[] = [];
  for (const topic of TOPICS) {
    for (const subtopic of topic.subtopics) {
      for (const game of GAMES) {
        const have = getQuestions(topic.id, subtopic.id, game.id).length;
        if (have < game.minQuestions) {
          gaps.push({
            topic: topic.id,
            subtopic: subtopic.id,
            game: game.id,
            have,
            need: game.minQuestions,
          });
        }
      }
    }
  }
  return gaps;
}
