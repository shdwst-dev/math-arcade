import React from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { TOPICS, getQuestions } from '../content';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <h2 className="font-pixel text-xl sm:text-2xl text-yellow-400 mb-2">
          SELECCIONA TU MISIÓN
        </h2>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Pon a prueba tu agilidad matemática con minijuegos estilo arcade.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TOPICS.map((topic) => (
          <Link
            key={topic.id}
            to={`/topic/${topic.id}`}
            className={clsx(
              'block p-5 rounded-xl bg-gradient-to-br border-2 shadow-lg transition-all duration-200',
              'hover:scale-[1.02] active:scale-[0.98] min-h-[140px] flex flex-col justify-between',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400',
              topic.color
            )}
          >
            <div>
              <div className="text-4xl mb-2" aria-hidden="true">
                {topic.icon}
              </div>
              <h3 className="font-bold text-xl text-white mb-1 leading-tight">
                {topic.name}
              </h3>
              <p className="text-gray-200 text-sm">{topic.description}</p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="font-pixel text-yellow-300">EXPLORAR →</span>
              <span className="text-gray-300">
                {getQuestions(topic.id).length} preguntas
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
