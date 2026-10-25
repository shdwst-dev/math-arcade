import React, { useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import {
  TOPICS,
  getSubtopics,
  getTopic,
  type SubtopicSelection,
  type TopicId,
} from '../content';
import { useAuth } from '../features/auth/AuthContext';
import { friendlyError } from '../features/auth/authErrors';
import { rankingApi, type LeaderboardRow } from '../features/ranking/api';
import {
  DEFAULT_DIFFICULTY,
  DIFFICULTIES,
  type Difficulty,
  type GameId,
} from '../games/ids';
import { GAMES } from '../games/registry';

const MEDALS = ['🥇', '🥈', '🥉'];
const selectClass =
  'min-h-[44px] w-full rounded-lg border border-gray-600 bg-gray-800 px-2 py-2 text-white disabled:opacity-40';

type View =
  | { kind: 'loading' }
  | { kind: 'ready'; rows: LeaderboardRow[] }
  | { kind: 'error'; message: string };

export const RankingPage: React.FC = () => {
  const auth = useAuth();
  const ids = {
    topic: useId(),
    subtopic: useId(),
    game: useId(),
    difficulty: useId(),
  };
  const [topic, setTopic] = useState<TopicId>(TOPICS[0].id);
  const [subtopic, setSubtopic] = useState<SubtopicSelection>('todos');
  const [game, setGame] = useState<GameId>('memory');
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);
  const [view, setView] = useState<{ key: string; state: View } | null>(null);

  const signedIn = auth.status === 'signedIn';
  const key = `${topic}|${subtopic}|${game}|${difficulty}`;

  useEffect(() => {
    if (!signedIn || !rankingApi) return;
    let cancelled = false;
    rankingApi
      .fetchLeaderboard({ topic, subtopic, game, difficulty })
      .then(
        (rows) => !cancelled && setView({ key, state: { kind: 'ready', rows } })
      )
      .catch(
        (err: Error) =>
          !cancelled &&
          setView({
            key,
            state: { kind: 'error', message: friendlyError(err) },
          })
      );
    return () => {
      cancelled = true;
    };
  }, [signedIn, topic, subtopic, game, difficulty, key]);

  // Mientras llega la respuesta de la combinación actual no se muestra la de otra.
  const state: View =
    view && view.key === key ? view.state : { kind: 'loading' };

  const changeTopic = (next: TopicId) => {
    setTopic(next);
    setSubtopic('todos');
  };

  return (
    <div className="space-y-6">
      <h2 className="font-pixel text-lg text-yellow-400">🌐 RANKING GLOBAL</h2>

      {!auth.enabled && (
        <p className="rounded-xl border border-gray-800 bg-gray-900 p-5 text-sm text-gray-300">
          El ranking necesita la conexión con la nube, que no está configurada
          en esta versión.
        </p>
      )}

      {auth.enabled && auth.status === 'loading' && (
        <p role="status" className="text-sm text-gray-400">
          Comprobando tu sesión…
        </p>
      )}

      {auth.enabled && auth.status === 'signedOut' && (
        <section className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <p className="mb-4 text-sm text-gray-300">
            Compite con tus compañeros de la UPQ. Inicia sesión con tu cuenta
            @upq.edu.mx para ver el ranking.
          </p>
          <Link
            to="/account"
            className="inline-flex min-h-[44px] items-center rounded-lg bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-500"
          >
            🔑 Ir a mi cuenta
          </Link>
        </section>
      )}

      {signedIn && (
        <>
          {auth.profile && !auth.profile.hasChosenUsername && (
            <p className="rounded-lg border border-yellow-600 bg-yellow-900/30 p-3 text-sm text-yellow-200">
              Todavía no eliges tu apodo, así que no apareces en el ranking.{' '}
              <Link to="/account" className="underline">
                Elegir apodo
              </Link>
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div>
              <label
                htmlFor={ids.topic}
                className="mb-1 block text-xs text-gray-400"
              >
                Tema
              </label>
              <select
                id={ids.topic}
                value={topic}
                onChange={(e) => changeTopic(e.target.value as TopicId)}
                className={selectClass}
              >
                {TOPICS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor={ids.subtopic}
                className="mb-1 block text-xs text-gray-400"
              >
                Subtema
              </label>
              <select
                id={ids.subtopic}
                value={subtopic}
                onChange={(e) =>
                  setSubtopic(e.target.value as SubtopicSelection)
                }
                className={selectClass}
              >
                <option value="todos">Todos los temas</option>
                {getSubtopics(getTopic(topic).id).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor={ids.game}
                className="mb-1 block text-xs text-gray-400"
              >
                Juego
              </label>
              <select
                id={ids.game}
                value={game}
                onChange={(e) => setGame(e.target.value as GameId)}
                className={selectClass}
              >
                {GAMES.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.icon} {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor={ids.difficulty}
                className="mb-1 block text-xs text-gray-400"
              >
                Dificultad
              </label>
              <select
                id={ids.difficulty}
                value={difficulty}
                disabled={game !== 'race'}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className={selectClass}
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            aria-live="polite"
            className="min-h-[120px] space-y-2 rounded-xl border-2 border-gray-600 bg-gray-800 p-4"
          >
            {state.kind === 'loading' && (
              <p className="mt-6 text-center text-gray-400">
                ☁️ Cargando ranking…
              </p>
            )}
            {state.kind === 'error' && (
              <p role="alert" className="mt-6 text-center text-red-400">
                No se pudo cargar el ranking: {state.message}
              </p>
            )}
            {state.kind === 'ready' && state.rows.length === 0 && (
              <p className="mt-6 text-center text-gray-400">
                Nadie ha jugado esta combinación todavía. ¡Sé el primero!
              </p>
            )}
            {state.kind === 'ready' && (
              <ol className="space-y-2">
                {state.rows.map((row) => (
                  <li
                    key={`${row.rank}-${row.username}`}
                    className={clsx(
                      'flex items-center justify-between rounded-lg border p-3',
                      row.isMe
                        ? 'border-yellow-500 bg-yellow-900/40'
                        : 'border-gray-600 bg-gray-700'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 text-center text-lg font-bold">
                        {MEDALS[row.rank - 1] ?? row.rank}
                      </span>
                      <span className="font-bold">
                        {row.username}
                        {row.isMe && (
                          <span className="ml-1 text-xs text-yellow-300">
                            (tú)
                          </span>
                        )}
                      </span>
                    </div>
                    <span className="text-xl font-bold text-green-400">
                      {row.bestScore}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </>
      )}
    </div>
  );
};
