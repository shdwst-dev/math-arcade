import React, { Suspense, useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Question, SubtopicSelection, Topic } from '../content';
import type { Difficulty } from '../games/ids';
import type { GameMeta } from '../games/registry';
import type { GameResult } from '../games/types';
import {
  recordGameResult,
  type CloudOutcome,
  type RecordSummary,
} from '../features/records';
import { useAuth } from '../features/auth/AuthContext';
import { celebrate } from '../lib/confetti';
import { GameOverModal } from './GameOverModal';

type GameShellProps = {
  topic: Topic;
  subtopic: SubtopicSelection;
  subtopicName: string;
  game: GameMeta;
  difficulty: Difficulty;
  questions: readonly Question[];
};

type Finished = GameResult & RecordSummary & { cloud: CloudOutcome };

/** Marco común de los juegos: barra de puntos, salida, fin de partida y repetir. */
export const GameShell: React.FC<GameShellProps> = ({
  topic,
  subtopic,
  subtopicName,
  game,
  difficulty,
  questions,
}) => {
  const [runId, setRunId] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState<Finished | null>(null);
  const { userId, records } = useAuth();
  // Identifica la partida en curso: una respuesta tardía de la nube de una partida
  // anterior no debe pisar el resultado de la actual.
  const finishToken = useRef(0);
  // Evita registrar dos veces la misma partida (p. ej. el doble efecto de StrictMode).
  const finishedRef = useRef(false);
  const Game = game.component;
  const selectPath = `/topic/${topic.id}/${subtopic}`;

  const handleFinish = useCallback(
    (result: GameResult) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      const token = ++finishToken.current;
      const saved = recordGameResult(
        {
          topic: topic.id,
          subtopic,
          game: game.id,
          difficulty,
          score: result.score,
          won: result.won,
        },
        { userId, api: records }
      );
      setScore(result.score);
      setFinished({
        ...result,
        isRecord: saved.isRecord,
        best: saved.best,
        cloud: saved.cloud,
      });
      void saved.settled?.then((final) => {
        if (finishToken.current !== token) return;
        setFinished((prev) => (prev ? { ...prev, ...final } : prev));
      });
      if (result.won) celebrate();
    },
    [topic.id, subtopic, game.id, difficulty, userId, records]
  );

  const restart = () => {
    finishedRef.current = false;
    finishToken.current += 1;
    setFinished(null);
    setScore(0);
    setRunId((n) => n + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Link
          to={selectPath}
          className="flex min-h-[44px] items-center rounded-lg bg-gray-800 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700"
        >
          ← Salir
        </Link>
        <p
          className="font-pixel text-xs text-green-400"
          aria-live="polite"
          aria-label={`Puntos: ${score}`}
        >
          PUNTOS: {score}
        </p>
      </div>

      <p className="rounded-full border border-gray-600 bg-gray-800 px-4 py-2 text-center text-sm font-bold text-blue-300">
        {game.icon} {game.name} · {topic.name} › {subtopicName}
        {game.hasDifficulty && ` · ${difficulty}`}
      </p>

      <Suspense
        fallback={
          <p className="py-10 text-center text-gray-400">Cargando juego…</p>
        }
      >
        <Game
          key={runId}
          questions={questions}
          difficulty={difficulty}
          onScoreChange={setScore}
          onFinish={handleFinish}
        />
      </Suspense>

      {finished && (
        <GameOverModal
          won={finished.won}
          score={finished.score}
          best={finished.best}
          isRecord={finished.isRecord}
          selectPath={selectPath}
          onRestart={restart}
          footer={<CloudFooter cloud={finished.cloud} />}
        />
      )}
    </div>
  );
};

/** Línea bajo el puntaje final: qué pasó con la partida en la nube. */
const CloudFooter: React.FC<{ cloud: CloudOutcome }> = ({ cloud }) => {
  switch (cloud) {
    case 'off':
      return null;
    case 'guest':
      return (
        <>
          👤{' '}
          <Link to="/account" className="underline">
            Inicia sesión
          </Link>{' '}
          para guardar tus récords en la nube y aparecer en el ranking.
        </>
      );
    case 'saving':
      return <>☁️ Guardando en la nube…</>;
    case 'saved':
      return <>☁️ Partida guardada en la nube</>;
    case 'record':
      return <>☁️ ¡Nuevo récord guardado en la nube!</>;
    case 'queued':
      return <>📴 Sin conexión: se subirá cuando vuelva el internet</>;
    case 'rejected':
      return <>⚠️ La nube no aceptó esta partida</>;
  }
};
