import React, { useEffect, useState } from 'react';
import { ConfirmModal } from '../components/ConfirmModal';
import { useAuth } from '../features/auth/AuthContext';
import { friendlyError } from '../features/auth/authErrors';
import { UsernameForm } from '../features/auth/UsernameForm';

export const AccountPage: React.FC = () => {
  const auth = useAuth();
  const { status, refreshProfile } = auth;
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState<'progress' | 'account' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  // Los contadores (partidas, victorias) pueden haber cambiado desde que se cargó el perfil.
  useEffect(() => {
    if (status === 'signedIn') void refreshProfile().catch(() => undefined);
  }, [status, refreshProfile]);

  const run = async (action: () => Promise<void>) => {
    setWorking(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(friendlyError(err as Error));
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-pixel text-lg text-yellow-400">MI CUENTA</h2>

      {auth.notice && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-xl border border-red-500 bg-red-900/40 p-4 text-sm text-red-200"
        >
          <p>{auth.notice}</p>
          <button
            type="button"
            onClick={auth.dismissNotice}
            aria-label="Cerrar aviso"
            className="min-h-[44px] min-w-[44px] text-xl font-bold hover:text-white"
          >
            &times;
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      {!auth.enabled && (
        <section className="space-y-2 rounded-xl border border-gray-800 bg-gray-900 p-5">
          <h3 className="text-xs font-pixel text-gray-400">ESTADO DE SESIÓN</h3>
          <p className="text-sm text-gray-200">
            Modo invitado: tu progreso se guarda solo en este dispositivo.
          </p>
          <p className="text-xs text-gray-400">
            Esta versión no tiene la nube conectada, así que por ahora no hay
            cuentas ni ranking.
          </p>
        </section>
      )}

      {auth.enabled && auth.status === 'loading' && (
        <p className="text-sm text-gray-400" role="status">
          Comprobando tu sesión…
        </p>
      )}

      {auth.enabled && auth.status === 'signedOut' && (
        <section className="space-y-4 rounded-xl border border-gray-800 bg-gray-900 p-5">
          <div>
            <h3 className="mb-1 text-xs font-pixel text-gray-400">
              ESTADO DE SESIÓN
            </h3>
            <p className="text-sm text-gray-200">
              Modo invitado: tu progreso se guarda solo en este dispositivo.
            </p>
          </div>
          <div className="border-t border-gray-800 pt-4">
            <p className="mb-3 text-xs text-gray-400">
              Inicia sesión con tu cuenta @upq.edu.mx para guardar tus récords
              en la nube, verlos desde cualquier dispositivo y participar en el
              ranking.
            </p>
            <button
              type="button"
              disabled={working}
              onClick={() => run(auth.signInWithGoogle)}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-500 disabled:opacity-50 sm:w-auto"
            >
              <span aria-hidden="true">🔑</span>
              <span>Iniciar sesión con Google (@upq.edu.mx)</span>
            </button>
          </div>
        </section>
      )}

      {auth.enabled && auth.status === 'signedIn' && (
        <>
          <section className="space-y-4 rounded-xl border border-gray-800 bg-gray-900 p-5">
            <div>
              <h3 className="mb-1 text-xs font-pixel text-gray-400">
                APODO EN EL RANKING
              </h3>
              {auth.profile?.hasChosenUsername ? (
                <p className="text-xl font-bold text-yellow-400">
                  {auth.profile.username}
                </p>
              ) : (
                <p className="text-sm text-yellow-300">
                  Aún no eliges tu apodo, así que no apareces en el ranking.
                </p>
              )}
            </div>

            {editing || (auth.profile && !auth.profile.hasChosenUsername) ? (
              <UsernameForm
                initial={
                  auth.profile?.hasChosenUsername ? auth.profile.username : ''
                }
                submitLabel="Guardar apodo"
                onSubmit={auth.chooseUsername}
                onDone={() => setEditing(false)}
                secondary={
                  editing && auth.profile?.hasChosenUsername
                    ? { label: 'Cancelar', onClick: () => setEditing(false) }
                    : undefined
                }
              />
            ) : (
              auth.profile && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="min-h-[44px] rounded-lg bg-gray-800 px-4 py-2 text-sm font-bold text-gray-200 hover:bg-gray-700"
                >
                  Cambiar apodo
                </button>
              )
            )}

            <div className="grid grid-cols-2 gap-3 border-t border-gray-800 pt-4">
              <div className="rounded-lg bg-gray-800 p-3 text-center">
                <span className="text-2xl font-bold text-yellow-400">
                  {auth.profile?.totalGamesPlayed ?? '–'}
                </span>
                <p className="mt-1 text-xs text-gray-400">Partidas jugadas</p>
              </div>
              <div className="rounded-lg bg-gray-800 p-3 text-center">
                <span className="text-2xl font-bold text-green-400">
                  {auth.profile?.totalWins ?? '–'}
                </span>
                <p className="mt-1 text-xs text-gray-400">Victorias</p>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Tu correo institucional solo se usa para iniciar sesión y no se
              muestra a nadie. Tu perfil guarda únicamente tu apodo, tus
              puntajes y tu historial de partidas.
            </p>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={working}
              onClick={() => run(auth.signOut)}
              className="min-h-[44px] rounded-lg bg-gray-700 px-5 py-2 font-bold text-white hover:bg-gray-600 disabled:opacity-50"
            >
              Cerrar sesión
            </button>
          </div>

          <section className="space-y-3 rounded-xl border border-red-900 bg-gray-900 p-5">
            <h3 className="text-xs font-pixel text-red-400">ZONA DE PELIGRO</h3>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setConfirm('progress')}
                className="min-h-[44px] rounded-lg border border-red-700 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-900/40"
              >
                Borrar mi progreso
              </button>
              <button
                type="button"
                onClick={() => setConfirm('account')}
                className="min-h-[44px] rounded-lg border border-red-700 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-900/40"
              >
                Borrar mi cuenta
              </button>
            </div>
          </section>
        </>
      )}

      {confirm === 'progress' && (
        <ConfirmModal
          title="¿Borrar tu progreso?"
          confirmLabel="Sí, borrar todo"
          danger
          onCancel={() => setConfirm(null)}
          onConfirm={async () => {
            await auth.clearProgress();
            setConfirm(null);
          }}
        >
          Se borrarán tus récords, tu historial y tus contadores de la nube. Tu
          cuenta y tu apodo se conservan. No se puede deshacer.
        </ConfirmModal>
      )}
      {confirm === 'account' && (
        <ConfirmModal
          title="¿Borrar tu cuenta?"
          confirmLabel="Sí, borrar mi cuenta"
          danger
          onCancel={() => setConfirm(null)}
          onConfirm={async () => {
            await auth.deleteAccount();
            setConfirm(null);
          }}
        >
          Se borrarán tu cuenta, tu apodo, tus récords y tu historial. Para
          volver a jugar con tu cuenta tendrías que registrarte de nuevo. No se
          puede deshacer.
        </ConfirmModal>
      )}
    </div>
  );
};
