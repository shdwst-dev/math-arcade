import React, { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import clsx from 'clsx';
import {
  ALL_SUBTOPICS,
  getQuestions,
  getSubtopics,
  getTopic,
  isSubtopicSelection,
  isTopicId,
} from '../content';
import {
  DEFAULT_DIFFICULTY,
  DIFFICULTIES,
  type Difficulty,
} from '../games/ids';
import { GAMES } from '../games/registry';
import {
  effectiveDifficulty,
  getBestScore,
} from '../features/records/localRecords';

export const GameSelectPage: React.FC = () => {
  const { topicId, subtopicId } = useParams<{
    topicId: string;
    subtopicId: string;
  }>();
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);

  if (!isTopicId(topicId)) return <Navigate to="/" replace />;
  if (!isSubtopicSelection(topicId, subtopicId)) {
    return <Navigate to={`/topic/${topicId}`} replace />;
  }

  const topic = getTopic(topicId);
  const subtopicName =
    subtopicId === ALL_SUBTOPICS
      ? 'Todos los temas'
      : (getSubtopics(topicId).find((s) => s.id === subtopicId)?.name ?? '');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to={`/topic/${topic.id}`}
          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium min-h-[44px] flex items-center"
        >
          ← Cambiar tema
        </Link>
        <div>
          <h2 className="font-pixel text-sm sm:text-base text-yellow-400">
            ELIGE EL DESAFÍO
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            {topic.name} › {subtopicName}
          </p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <p
          id="difficulty-label"
          className="block text-xs font-pixel text-gray-400 mb-2"
        >
          DIFICULTAD (SOLO CARRERA)
        </p>
        <div
          role="radiogroup"
          aria-labelledby="difficulty-label"
          className="grid grid-cols-3 gap-2"
        >
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              type="button"
              role="radio"
              aria-checked={difficulty === d}
              onClick={() => setDifficulty(d)}
              className={clsx(
                'py-2 px-3 rounded-lg text-sm font-bold min-h-[44px] transition-colors border',
                difficulty === d
                  ? 'bg-yellow-400 text-gray-900 border-yellow-300'
                  : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {GAMES.map((game) => {
          const available = getQuestions(topic.id, subtopicId, game.id).length;
          const playable = available >= game.minQuestions;
          const best = getBestScore({
            topic: topic.id,
            subtopic: subtopicId,
            game: game.id,
            difficulty: effectiveDifficulty(game.id, difficulty),
          });

          return (
            <div
              key={game.id}
              className="relative overflow-hidden p-5 rounded-xl bg-gray-800 border border-gray-600 flex flex-col justify-between gap-4"
            >
              <div
                className={clsx('absolute inset-0 opacity-10', game.accent)}
              />
              <div className="relative">
                <div className="text-3xl mb-2" aria-hidden="true">
                  {game.icon}
                </div>
                <h3 className="font-bold text-lg text-white">{game.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{game.description}</p>
                <p className="text-xs text-yellow-400 mt-2 font-bold">
                  🏆 Mejor: {best}
                </p>
              </div>

              {playable ? (
                <Link
                  to={`/play/${topic.id}/${subtopicId}/${game.id}?difficulty=${difficulty}`}
                  className="relative py-2 px-4 bg-yellow-400 hover:bg-yellow-300 text-gray-950 rounded-lg text-center text-sm font-pixel min-h-[44px] flex items-center justify-center transition-colors"
                >
                  JUGAR
                </Link>
              ) : (
                <p
                  role="status"
                  className="relative text-xs text-gray-300 bg-gray-900/70 border border-gray-600 rounded-lg p-3"
                >
                  Necesita al menos <b>{game.minQuestions}</b> preguntas y este
                  tema tiene <b>{available}</b>.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
