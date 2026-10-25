import React from 'react';

export const AccountPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="font-pixel text-lg text-yellow-400">MI CUENTA</h2>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <div>
          <span className="text-xs font-pixel text-gray-400 block mb-1">
            ESTADO DE SESIÓN
          </span>
          <p className="text-sm text-gray-200">
            Modo Invitado (Progreso guardado localmente en este dispositivo)
          </p>
        </div>

        <div className="pt-2 border-t border-gray-800">
          <p className="text-xs text-gray-400 mb-3">
            Inicia sesión con tu cuenta @upq.edu.mx para guardar tus récords en
            la nube y participar en el ranking global.
          </p>
          <button className="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-sm min-h-[44px] flex items-center justify-center gap-2 transition-colors">
            <span>🔑</span>
            <span>Iniciar sesión con Google (@upq.edu.mx)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
