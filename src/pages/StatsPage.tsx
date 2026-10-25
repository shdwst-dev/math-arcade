import React from 'react';

export const StatsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="font-pixel text-lg text-yellow-400">
        TUS ESTADÍSTICAS
      </h2>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <p className="text-gray-300 text-sm">
          Aquí podrás consultar tus récords por tema, partidas ganadas y progreso de práctica.
        </p>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-gray-800 p-3 rounded-lg text-center">
            <span className="text-2xl font-bold text-yellow-400">0</span>
            <p className="text-xs text-gray-400 mt-1">Partidas</p>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg text-center">
            <span className="text-2xl font-bold text-green-400">0</span>
            <p className="text-xs text-gray-400 mt-1">Victorias</p>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg text-center col-span-2 sm:col-span-1">
            <span className="text-2xl font-bold text-blue-400">0</span>
            <p className="text-xs text-gray-400 mt-1">Mejor Puntaje</p>
          </div>
        </div>
      </div>
    </div>
  );
};
