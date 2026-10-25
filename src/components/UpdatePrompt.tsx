import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/** Cada cuánto se busca una versión nueva mientras la app está abierta (ms). */
const CHECK_EVERY_MS = 60 * 60 * 1000;

/**
 * Avisos de la PWA: hay una versión nueva (el alumno decide cuándo actualizar, para no
 * recargar a media partida) y la app ya quedó lista para usarse sin conexión.
 */
export const UpdatePrompt: React.FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (registration)
        setInterval(() => void registration.update(), CHECK_EVERY_MS);
    },
  });

  if (!needRefresh && !offlineReady) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-3 bottom-20 z-40 mx-auto flex max-w-md items-center justify-between gap-3 rounded-xl border border-cyan-500 bg-gray-800 p-3 text-sm text-white shadow-2xl sm:bottom-4"
    >
      <p>
        {needRefresh
          ? 'Hay una nueva versión de Math Arcade.'
          : 'Listo: ya puedes jugar sin conexión.'}
      </p>
      <div className="flex shrink-0 gap-2">
        {needRefresh && (
          <button
            type="button"
            onClick={() => void updateServiceWorker(true)}
            className="min-h-[44px] rounded bg-cyan-600 px-3 py-2 font-bold hover:bg-cyan-500"
          >
            Actualizar
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            setNeedRefresh(false);
            setOfflineReady(false);
          }}
          className="min-h-[44px] rounded bg-gray-600 px-3 py-2 font-bold hover:bg-gray-500"
        >
          {needRefresh ? 'Después' : 'Entendido'}
        </button>
      </div>
    </div>
  );
};
