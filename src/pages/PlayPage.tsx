import React from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ALL_SUBTOPICS,
  getQuestions,
  getSubtopics,
  getTopic,
  isSubtopicSelection,
  isTopicId,
} from '../content';
import { DEFAULT_DIFFICULTY, isDifficulty, isGameId } from '../games/ids';
import { getGame } from '../games/registry';
import { GameShell } from '../components/GameShell';

export const PlayPage: React.FC = () => {
  const { topicId, subtopicId, gameId } = useParams<{
    topicId: string;
    subtopicId: string;
    gameId: string;
  }>();
  const [searchParams] = useSearchParams();

  if (!isTopicId(topicId)) return <Navigate to="/" replace />;
  if (!isSubtopicSelection(topicId, subtopicId)) {
    return <Navigate to={`/topic/${topicId}`} replace />;
  }
  const selectPath = `/topic/${topicId}/${subtopicId}`;
  if (!isGameId(gameId)) return <Navigate to={selectPath} replace />;

  const topic = getTopic(topicId);
  const game = getGame(gameId);
  const questions = getQuestions(topicId, subtopicId, gameId);
  // La pantalla de selección explica por qué este juego no está disponible.
  if (questions.length < game.minQuestions)
    return <Navigate to={selectPath} replace />;

  const requested = searchParams.get('difficulty');
  const difficulty = isDifficulty(requested) ? requested : DEFAULT_DIFFICULTY;
  const subtopicName =
    subtopicId === ALL_SUBTOPICS
      ? 'Todos los temas'
      : (getSubtopics(topicId).find((s) => s.id === subtopicId)?.name ?? '');

  return (
    <GameShell
      key={`${topicId}/${subtopicId}/${gameId}/${difficulty}`}
      topic={topic}
      subtopic={subtopicId}
      subtopicName={subtopicName}
      game={game}
      difficulty={difficulty}
      questions={questions}
    />
  );
};
