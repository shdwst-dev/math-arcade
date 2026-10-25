import React, { Suspense, useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Question, SubtopicSelection, Topic } from '../content';
import type { Difficulty } from '../games/ids';
import type { GameMeta } from '../games/registry';
import type { GameResult } from '../games/types';
import { recordGameResult, type RecordSummary } from '../features/records';
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

type Finished = GameResult & RecordSummary;

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
  // Evita registrar dos veces la misma partida (p. ej. el doble efecto de StrictMode).
  const finishedRef = useRef(false);
  const Game = game.component;
  const selectPath = `/topic/${topic.id}/${subtopic}`;

  const handleFinish = useCallback(
    (result: GameResult) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      const summary = recordGameResult({
        topic: topic.id,
        subtopic,
        game: game.id,
        difficulty,
        score: result.score,
        won: result.won,
      });
      setScore(result.score);
      setFinished({ ...result, ...summary });
      if (result.won) celebrate();
    },
    [topic.id, subtopic, game.id, difficulty]
  );

  const restart = () => {
    finishedRef.current = false;
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
        />
      )}
    </div>
  );
};
