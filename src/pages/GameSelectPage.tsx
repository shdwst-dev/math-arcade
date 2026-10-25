import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export const GameSelectPage: React.FC = () => {
  const { topicId, subtopicId } = useParams<{
    topicId: string;
    subtopicId: string;
  }>();

  const [difficulty, setDifficulty] = useState<'Fácil' | 'Normal' | 'Difícil'>(
    'Normal'
  );

  const games = [
    {
      id: 'memory',
      title: 'Memorama',
      desc: 'Encuentra las 6 parejas de problema y solución.',
      icon: '🧠',
      hasDifficulty: false,
    },
    {
      id: 'bomb',
      title: 'Desactiva la Bomba',
      desc: 'Responde rápido antes de que se acabe el tiempo.',
      icon: '💣',
      hasDifficulty: false,
    },
    {
      id: 'race',
      title: 'Carrera Matemática',
      desc: 'Esquiva obstáculos y recolecta las respuestas correctas.',
      icon: '🏎️',
      hasDifficulty: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to={`/topic/${topicId}`}
          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium min-h-[44px] flex items-center"
        >
          ← Subtemas
        </Link>
        <h2 className="font-pixel text-base sm:text-lg text-yellow-400">
          SELECCIONA MODO
        </h2>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <label className="block text-xs font-pixel text-gray-400 mb-2">
          DIFICULTAD (CARRERA)
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['Fácil', 'Normal', 'Difícil'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`py-2 px-3 rounded-lg text-sm font-bold min-h-[44px] transition-colors border ${
                difficulty === d
                  ? 'bg-yellow-400 text-gray-900 border-yellow-300'
                  : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {games.map((g) => (
          <div
            key={g.id}
            className="p-5 rounded-xl bg-gray-900 border-2 border-gray-800 flex flex-col justify-between"
          >
            <div>
              <div className="text-3xl mb-2">{g.icon}</div>
              <h3 className="font-bold text-lg text-white mb-1">{g.title}</h3>
              <p className="text-gray-400 text-xs">{g.desc}</p>
            </div>
            <Link
              to={`/play/${topicId}/${subtopicId}/${g.id}?difficulty=${difficulty}`}
              className="mt-4 py-2 px-4 bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-bold rounded-lg text-center text-sm font-pixel min-h-[44px] flex items-center justify-center transition-colors"
            >
              JUGAR
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
