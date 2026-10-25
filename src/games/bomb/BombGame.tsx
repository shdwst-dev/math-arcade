import React, { useEffect, useReducer } from 'react';
import clsx from 'clsx';
import { Latex } from '../../components/Latex';
import { useLatest } from '../../lib/useLatest';
import type { GameProps } from '../types';
import {
  BOMB_REVEAL_DELAY_MS,
  bombReducer,
  createBomb,
  currentRound,
  formatBombTime,
} from './logic';

// Colores de los cables, en el orden de v1.
const WIRE_COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
];

export const BombGame: React.FC<GameProps> = ({
  questions,
  onScoreChange,
  onFinish,
}) => {
  const [state, dispatch] = useReducer(bombReducer, questions, (q) =>
    createBomb(q)
  );
  const onScoreChangeRef = useLatest(onScoreChange);
  const onFinishRef = useLatest(onFinish);
  const finished = state.status === 'won' || state.status === 'lost';
  const revealing = state.status === 'revealing';
  const round = currentRound(state);

  useEffect(() => {
    onScoreChangeRef.current(state.score);
  }, [state.score, onScoreChangeRef]);

  // El reloj corre sin parar (también mientras se revela una respuesta), como en v1.
  useEffect(() => {
    if (finished) return;
    const timer = setInterval(() => dispatch({ type: 'tick' }), 1000);
    return () => clearInterval(timer);
  }, [finished]);

  useEffect(() => {
    if (!revealing) return;
    const timer = setTimeout(
      () => dispatch({ type: 'advance' }),
      BOMB_REVEAL_DELAY_MS
    );
    return () => clearTimeout(timer);
  }, [revealing]);

  useEffect(() => {
    if (finished)
      onFinishRef.current({ won: state.status === 'won', score: state.score });
  }, [finished, state.status, state.score, onFinishRef]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4">
      <div
        role="timer"
        aria-label="Tiempo restante"
        className={clsx(
          'rounded border-4 border-gray-700 bg-black px-6 py-2 font-pixel text-4xl text-red-500 shadow-xl sm:text-5xl',
          revealing && 'bomb-active'
        )}
      >
        {formatBombTime(state.timeLeft)}
      </div>

      <div className="min-h-28 w-full overflow-x-auto rounded-xl border-2 border-gray-600 bg-gray-800 p-4 text-center">
        <p className="mb-1 text-sm text-gray-400">
          Resuelve para cortar el cable ({state.remaining} por cortar):
        </p>
        <div className="my-2 text-xl font-bold">
          <Latex display fit>
            {round.prompt}
          </Latex>
        </div>
      </div>

      <div className="grid w-full grid-cols-2 gap-3">
        {round.options.map((option, index) => {
          const isPicked = revealing && state.picked === index;
          const isRightOne = revealing && option.correct;
          return (
            <button
              key={`${state.roundIndex}-${index}`}
              type="button"
              disabled={revealing}
              onClick={() => dispatch({ type: 'answer', optionIndex: index })}
              className={clsx(
                'flex min-h-14 items-center justify-center overflow-x-auto rounded px-2 py-3 text-sm font-bold text-white shadow-lg transition',
                isRightOne
                  ? 'scale-105 border-4 border-white bg-green-500'
                  : WIRE_COLORS[index % WIRE_COLORS.length],
                isPicked && 'opacity-60 ring-4 ring-red-300',
                revealing && !isRightOne && !isPicked && 'opacity-40',
                !revealing && 'hover:opacity-80 active:scale-95'
              )}
            >
              <Latex display fit className="w-full">
                {option.latex}
              </Latex>
            </button>
          );
        })}
      </div>
    </div>
  );
};
