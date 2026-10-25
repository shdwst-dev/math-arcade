import React from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Modal } from './Modal';

type GameOverModalProps = {
  won: boolean;
  score: number;
  best: number;
  isRecord: boolean;
  /** Dónde elegir otro juego del mismo tema. */
  selectPath: string;
  onRestart: () => void;
  /** Línea extra bajo el puntaje (la Fase 4 muestra aquí el estado de la nube). */
  footer?: React.ReactNode;
};

const secondaryButton =
  'flex min-h-[44px] items-center justify-center rounded px-6 py-2 font-bold text-white transition-transform hover:scale-[1.02]';

export const GameOverModal: React.FC<GameOverModalProps> = ({
  won,
  score,
  best,
  isRecord,
  selectPath,
  onRestart,
  footer,
}) => (
  <Modal
    labelledBy="gameover-title"
    className="rounded-xl border-2 border-white bg-gray-800 p-6 text-center"
  >
    <h2
      id="gameover-title"
      className={clsx(
        'mb-4 font-pixel text-xl leading-relaxed',
        won ? 'text-green-400' : 'text-red-400'
      )}
    >
      {won ? '🎉 ¡VICTORIA! 🎉' : '💀 GAME OVER 💀'}
    </h2>
    <p className="mb-2 text-xl">Puntuación final: {score}</p>
    <p
      className={clsx(
        'mb-2 text-sm text-yellow-300',
        isRecord && 'new-record font-bold text-yellow-400'
      )}
    >
      🏆 Mejor: {best} {isRecord && '¡NUEVO RÉCORD!'}
    </p>
    <div className="mb-4 min-h-[1rem] text-xs text-cyan-300" aria-live="polite">
      {footer}
    </div>
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={onRestart}
        className={clsx(secondaryButton, 'bg-green-600 hover:bg-green-500')}
      >
        Jugar de nuevo
      </button>
      <Link
        to={selectPath}
        className={clsx(secondaryButton, 'bg-blue-600 hover:bg-blue-500')}
      >
        Elegir otro juego
      </Link>
      <Link
        to="/"
        className={clsx(secondaryButton, 'bg-gray-600 hover:bg-gray-500')}
      >
        Menú principal
      </Link>
    </div>
  </Modal>
);
