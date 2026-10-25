import React from 'react';

export const RankingPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="font-pixel text-lg text-yellow-400">RANKING GLOBAL</h2>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <p className="text-gray-300 text-sm mb-4">
          Compite con tus compañeros de la UPQ. El ranking se sincroniza en la
          nube para usuarios autenticados.
        </p>
        <div className="border border-gray-800 rounded-lg overflow-hidden">
          <div className="bg-gray-800 px-4 py-2 text-xs font-pixel text-gray-400 flex justify-between">
            <span>POS / ALUMNO</span>
            <span>PUNTOS</span>
          </div>
          <div className="p-6 text-center text-gray-500 text-sm">
            Inicia sesión con tu cuenta @upq.edu.mx para ver tu posición.
          </div>
        </div>
      </div>
    </div>
  );
};
