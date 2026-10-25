import React, { useEffect, useReducer } from 'react';
import clsx from 'clsx';
import { Latex } from '../../components/Latex';
import { useLatest } from '../../lib/useLatest';
import type { GameProps } from '../types';
import {
  MEMORY_MISMATCH_DELAY_MS,
  MEMORY_WIN_DELAY_MS,
  createMemory,
  isCardVisible,
  memoryReducer,
} from './logic';

export const MemoryGame: React.FC<GameProps> = ({
  questions,
  onScoreChange,
  onFinish,
}) => {
  const [state, dispatch] = useReducer(memoryReducer, questions, (q) =>
    createMemory(q)
  );
  const onScoreChangeRef = useLatest(onScoreChange);
  const onFinishRef = useLatest(onFinish);

  useEffect(() => {
    onScoreChangeRef.current(state.score);
  }, [state.score, onScoreChangeRef]);

  // Dos cartas distintas: se muestran un momento y se voltean de nuevo.
  useEffect(() => {
    if (state.status !== 'checking') return;
    const timer = setTimeout(
      () => dispatch({ type: 'hideMismatch' }),
      MEMORY_MISMATCH_DELAY_MS
    );
    return () => clearTimeout(timer);
  }, [state.status]);

  // Todas las parejas encontradas: se deja ver el tablero completo antes de la victoria.
  useEffect(() => {
    if (state.status !== 'won') return;
    const timer = setTimeout(
      () => onFinishRef.current({ won: true, score: state.score }),
      MEMORY_WIN_DELAY_MS
    );
    return () => clearTimeout(timer);
  }, [state.status, state.score, onFinishRef]);

  return (
    <div className="mx-auto grid w-full max-w-3xl grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
      {state.cards.map((card) => {
        const visible = isCardVisible(state, card);
        return (
          <button
            key={card.uid}
            type="button"
            data-pair={card.pairId}
            aria-label={visible ? undefined : 'Carta boca abajo'}
            aria-pressed={visible}
            onClick={() => dispatch({ type: 'flip', uid: card.uid })}
            className={clsx('flip-card h-28 sm:h-36', visible && 'is-flipped')}
          >
            <span className="flip-card-inner">
              <span
                className="flip-card-face flip-card-front"
                aria-hidden="true"
              >
                ?
              </span>
              <span
                className="flip-card-face flip-card-back"
                aria-hidden={!visible}
              >
                <Latex display fit className="w-full">
                  {card.latex}
                </Latex>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
};
