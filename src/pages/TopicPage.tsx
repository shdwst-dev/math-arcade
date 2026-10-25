import React from 'react';
import { useParams, Link } from 'react-router-dom';

export const TopicPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium min-h-[44px] flex items-center"
        >
          ← Volver
        </Link>
        <h2 className="font-pixel text-base sm:text-lg text-yellow-400">
          SUBTEMAS: {topicId?.toUpperCase()}
        </h2>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
        <p className="text-gray-400 text-sm">
          Los subtemas del contenido se conectarán en la <b>Fase 2</b>.
        </p>
        <div className="mt-4 flex justify-center">
          <Link
            to={`/topic/${topicId}/todos`}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-500 font-bold rounded-lg text-sm min-h-[44px] flex items-center"
          >
            Jugar con todos los subtemas
          </Link>
        </div>
      </div>
    </div>
  );
};
