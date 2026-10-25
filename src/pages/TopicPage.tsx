import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ALL_SUBTOPICS, getQuestions, getTopic, isTopicId } from '../content';

export const TopicPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  if (!isTopicId(topicId)) return <Navigate to="/" replace />;
  const topic = getTopic(topicId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium min-h-[44px] flex items-center"
        >
          ← Cambiar sección
        </Link>
        <h2 className="font-pixel text-sm sm:text-base text-yellow-400">
          {topic.name.toUpperCase()}
        </h2>
      </div>

      <p className="text-gray-400 text-sm">
        Elige el tema que quieres practicar.
      </p>

      <ul className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {topic.subtopics.map((subtopic) => (
          <li key={subtopic.id}>
            <Link
              to={`/topic/${topic.id}/${subtopic.id}`}
              className="h-full bg-gray-800 hover:bg-gray-700 p-4 rounded-xl border-2 border-gray-600 transition-all hover:scale-[1.03] flex flex-col items-center justify-center text-center min-h-[110px] focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
            >
              <span className="text-3xl mb-2" aria-hidden="true">
                {subtopic.emoji}
              </span>
              <span className="font-bold text-sm leading-tight">
                {subtopic.name}
              </span>
              <span className="text-xs text-gray-400 mt-1">
                {getQuestions(topic.id, subtopic.id).length} preguntas
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <Link
        to={`/topic/${topic.id}/${ALL_SUBTOPICS}`}
        className="w-full max-w-md mx-auto bg-gray-700 hover:bg-gray-600 border-2 border-gray-500 p-3 rounded-lg font-bold text-yellow-300 transition-all min-h-[48px] flex items-center justify-center"
      >
        🎲 Todos los temas (aleatorio)
      </Link>
    </div>
  );
};
