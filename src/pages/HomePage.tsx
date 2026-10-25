import React from 'react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const topics = [
    {
      id: 'fundamentos',
      title: 'Fundamentos de Álgebra',
      desc: 'Leyes de exponentes, productos notables, factorización y fracciones.',
      icon: '📐',
      color: 'from-amber-600 to-amber-800 border-amber-500',
    },
    {
      id: 'diferencial',
      title: 'Cálculo Diferencial',
      desc: 'Límites, derivadas algebraicas, regla de la cadena y trigonométricas.',
      icon: '📈',
      color: 'from-blue-600 to-blue-800 border-blue-500',
    },
    {
      id: 'integral',
      title: 'Cálculo Integral',
      desc: 'Antiderivadas inmediatas, cambio de variable y métodos de integración.',
      icon: '📉',
      color: 'from-emerald-600 to-emerald-800 border-emerald-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <h2 className="font-pixel text-xl sm:text-2xl text-yellow-400 mb-2">
          ELIGE UN TEMA
        </h2>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Pon a prueba tu agilidad matemática con minijuegos estilo arcade.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topics.map((t) => (
          <Link
            key={t.id}
            to={`/topic/${t.id}`}
            className={`block p-5 rounded-xl bg-gradient-to-br ${t.color} border-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 min-h-[140px] flex flex-col justify-between`}
          >
            <div>
              <div className="text-3xl mb-2">{t.icon}</div>
              <h3 className="font-bold text-lg text-white mb-1 leading-tight">
                {t.title}
              </h3>
              <p className="text-gray-200 text-xs line-clamp-2">{t.desc}</p>
            </div>
            <div className="mt-4 flex items-center text-xs font-pixel text-yellow-300">
              <span>EXPLORAR →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
