import React, { useState } from 'react';
import { Modal } from '../../components/Modal';
import { friendlyError } from './authErrors';
import { useAuth } from './AuthContext';
import { UsernameForm } from './UsernameForm';

/**
 * Avisos que pueden aparecer en cualquier pantalla tras iniciar sesión:
 * primero elegir apodo (para salir en el ranking) y luego, si hay, agregar a la
 * cuenta los récords que se jugaron en este dispositivo como invitado.
 */
export const AccountPrompts: React.FC = () => {
  const auth = useAuth();
  const [offerError, setOfferError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const needsUsername =
    auth.status === 'signedIn' &&
    auth.profile !== null &&
    !auth.profile.hasChosenUsername;

  if (needsUsername && !auth.usernamePromptDismissed) {
    return (
      <Modal
        labelledBy="username-title"
        onClose={auth.dismissUsernamePrompt}
        className="rounded-xl border-2 border-yellow-500 bg-gray-800 p-6"
      >
        <h2
          id="username-title"
          className="mb-2 text-xl font-bold text-yellow-400"
        >
          Elige tu apodo
        </h2>
        <p className="mb-4 text-sm text-gray-300">
          Es el nombre que verán tus compañeros en el ranking. No se muestra tu
          nombre real ni tu correo.
        </p>
        <UsernameForm
          submitLabel="Guardar apodo"
          onSubmit={auth.chooseUsername}
          secondary={{
            label: 'Más tarde',
            onClick: auth.dismissUsernamePrompt,
          }}
        />
        <p className="mt-3 text-xs text-gray-500">
          Hasta que elijas uno no aparecerás en el ranking.
        </p>
      </Modal>
    );
  }

  if (
    auth.status === 'signedIn' &&
    !needsUsername &&
    auth.guestOffer &&
    auth.guestOffer.length > 0
  ) {
    const count = auth.guestOffer.length;
    const accept = async () => {
      setImporting(true);
      setOfferError(null);
      try {
        await auth.acceptGuestOffer();
      } catch (err) {
        setOfferError(friendlyError(err as Error));
      } finally {
        setImporting(false);
      }
    };
    return (
      <Modal
        labelledBy="import-title"
        onClose={auth.declineGuestOffer}
        className="rounded-xl border-2 border-cyan-500 bg-gray-800 p-6"
      >
        <h2 id="import-title" className="mb-2 text-xl font-bold text-cyan-300">
          Récords de este dispositivo
        </h2>
        <p className="mb-2 text-sm text-gray-300">
          Hay <b>{count}</b>{' '}
          {count === 1 ? 'récord guardado' : 'récords guardados'} aquí, de
          cuando jugaste sin iniciar sesión. ¿Quieres agregarlos a tu cuenta?
        </p>
        <p className="mb-4 text-xs text-yellow-300">
          Si usas una computadora compartida, hazlo solo si son tuyos.
        </p>
        {offerError && (
          <p role="alert" className="mb-3 text-sm text-red-400">
            {offerError}
          </p>
        )}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={auth.declineGuestOffer}
            disabled={importing}
            className="min-h-[44px] rounded bg-gray-600 px-5 py-2 font-bold text-white hover:bg-gray-500 disabled:opacity-50"
          >
            Ahora no
          </button>
          <button
            type="button"
            onClick={accept}
            disabled={importing}
            className="min-h-[44px] rounded bg-cyan-600 px-5 py-2 font-bold text-white hover:bg-cyan-500 disabled:opacity-50"
          >
            {importing ? 'Agregando…' : 'Sí, agregarlos'}
          </button>
        </div>
      </Modal>
    );
  }

  return null;
};
