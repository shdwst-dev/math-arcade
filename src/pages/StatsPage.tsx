import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ConfirmModal } from '../components/ConfirmModal';
import { TOPICS, getSubtopics, type TopicId } from '../content';
import { useAuth } from '../features/auth/AuthContext';
import { useMyRecords } from '../features/records/useRecords';
import { GAMES } from '../games/registry';

const gameName = (id: string) => GAMES.find((g) => g.id === id)?.name ?? id;

export const StatsPage: React.FC = () => {
  const auth = useAuth();
  const mine = useMyRecords();
  const [confirmClear, setConfirmClear] = useState(false);

  const records = [...mine.records].sort(
    (a, b) =>
      a.game.localeCompare(b.game) || a.subtopic.localeCompare(b.subtopic)
  );
  const best = records.reduce((max, r) => Math.max(max, r.score), 0);

  const subtopicName = (topic: TopicId, subtopic: string) =>
    subtopic === 'todos'
      ? 'Todos los temas'
      : (getSubtopics(topic).find((s) => s.id === subtopic)?.name ?? subtopic);

  return (
    <div className="space-y-6">
      <h2 className="font-pixel text-lg text-yellow-400">TUS ESTADÍSTICAS</h2>

      <p className="text-xs text-gray-400">
        {mine.source === 'cloud'
          ? '☁️ Récords de tu cuenta (los ves igual desde cualquier dispositivo).'
          : '📱 Récords guardados en este dispositivo.'}
        {mine.source === 'device' && auth.enabled && (
          <>
            {' '}
            <Link to="/account" className="text-cyan-300 underline">
              Inicia sesión
            </Link>{' '}
            para guardarlos en la nube.
          </>
        )}
      </p>

      <div
        className={`grid gap-3 ${auth.profile ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'}`}
      >
        <div className="rounded-lg bg-gray-800 p-3 text-center">
          <span className="text-2xl font-bold text-yellow-400">
            {records.length}
          </span>
          <p className="mt-1 text-xs text-gray-400">Récords</p>
        </div>
        <div className="rounded-lg bg-gray-800 p-3 text-center">
          <span className="text-2xl font-bold text-blue-400">{best}</span>
          <p className="mt-1 text-xs text-gray-400">Mejor puntaje</p>
        </div>
        {auth.profile && (
          <>
            <div className="rounded-lg bg-gray-800 p-3 text-center">
              <span className="text-2xl font-bold text-yellow-400">
                {auth.profile.totalGamesPlayed}
              </span>
              <p className="mt-1 text-xs text-gray-400">Partidas</p>
            </div>
            <div className="rounded-lg bg-gray-800 p-3 text-center">
              <span className="text-2xl font-bold text-green-400">
                {auth.profile.totalWins}
              </span>
              <p className="mt-1 text-xs text-gray-400">Victorias</p>
            </div>
          </>
        )}
      </div>

      {mine.loading && (
        <p role="status" className="py-6 text-center text-gray-400">
          ☁️ Cargando récords…
        </p>
      )}
      {mine.failed && (
        <p role="alert" className="py-6 text-center text-red-400">
          No se pudieron cargar tus récords de la nube. Revisa tu conexión.
        </p>
      )}
      {!mine.loading && !mine.failed && records.length === 0 && (
        <p className="py-6 text-center text-gray-400">
          No hay récords guardados aún. ¡Juega para empezar!{' '}
          <Link to="/" className="text-cyan-300 underline">
            Elegir un tema
          </Link>
        </p>
      )}

      {TOPICS.map((topic) => {
        const ofTopic = records.filter((r) => r.topic === topic.id);
        if (ofTopic.length === 0) return null;
        return (
          <section key={topic.id}>
            <h3 className="mb-3 border-b border-gray-600 pb-2 text-xl font-bold text-blue-300">
              {topic.name}
            </h3>
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {ofTopic.map((r) => (
                <li
                  key={`${r.subtopic}-${r.game}-${r.difficulty}`}
                  className="flex items-center justify-between rounded-lg border border-gray-600 bg-gray-700 p-3"
                >
                  <div>
                    <div className="font-bold text-yellow-400">
                      {gameName(r.game)}
                      {r.game === 'race' && (
                        <span className="ml-1 text-xs font-normal text-gray-400">
                          ({r.difficulty})
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-white">
                      {subtopicName(r.topic, r.subtopic)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-400">
                      {r.score}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(r.date).toLocaleDateString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {records.length > 0 && (
        <button
          type="button"
          onClick={() => setConfirmClear(true)}
          className="min-h-[44px] rounded border border-red-500 bg-red-900 px-4 py-2 font-bold text-red-200 hover:bg-red-800"
        >
          🗑️ Borrar todo
        </button>
      )}

      {confirmClear && (
        <ConfirmModal
          title="¿Borrar todos tus récords?"
          confirmLabel="Sí, borrar"
          danger
          onCancel={() => setConfirmClear(false)}
          onConfirm={async () => {
            if (mine.source === 'cloud') await auth.clearProgress();
            else mine.clearDevice();
            setConfirmClear(false);
          }}
        >
          {mine.source === 'cloud'
            ? 'Se borrarán tus récords, tu historial y tus contadores de la nube. No se puede deshacer.'
            : 'Se borrarán los récords guardados en este dispositivo. No se puede deshacer.'}
        </ConfirmModal>
      )}
    </div>
  );
};
