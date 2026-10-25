import React from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';

export const PlayPage: React.FC = () => {
  const { topicId, subtopicId, gameId } = useParams<{
    topicId: string;
    subtopicId: string;
    gameId: string;
  }>();
  const [searchParams] = useSearchParams();
  const difficulty = searchParams.get('difficulty') || 'Normal';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to={`/topic/${topicId}/${subtopicId}`}
          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium min-h-[44px] flex items-center"
        >
          ← Salir del juego
        </Link>
        <span className="font-pixel text-xs text-yellow-400">
          PUNTOS: 0
        </span>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
        <h2 className="font-pixel text-lg text-yellow-400 mb-2">
          JUEGO: {gameId?.toUpperCase()}
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          Tema: {topicId} | Subtema: {subtopicId} | Dificultad: {difficulty}
        </p>
        <div className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg text-xs font-mono">
          El motor de juegos se integrará en la Fase 3.
        </div>
      </div>
    </div>
  );
};
