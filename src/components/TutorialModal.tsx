import React from 'react';
import clsx from 'clsx';
import type { GameMeta } from '../games/registry';
import { Modal } from './Modal';

type TutorialModalProps = { game: GameMeta; onClose: () => void };

export const TutorialModal: React.FC<TutorialModalProps> = ({
  game,
  onClose,
}) => {
  const { tutorial } = game;
  const titleId = `tutorial-title-${game.id}`;

  return (
    <Modal labelledBy={titleId} onClose={onClose}>
      <div
        className={clsx(
          'rounded-xl border-4 bg-gradient-to-br p-6 shadow-2xl',
          tutorial.panel
        )}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2
            id={titleId}
            className="flex items-center gap-2 text-xl font-bold text-white"
          >
            <span className="text-3xl" aria-hidden="true">
              {game.icon}
            </span>
            {game.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar tutorial"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center text-3xl font-bold text-white hover:text-gray-300"
          >
            &times;
          </button>
        </div>

        <div className="mb-4 rounded-lg bg-white/10 p-4">
          <h3 className="mb-2 font-bold text-yellow-300">🎯 Objetivo:</h3>
          <p className="mb-3 text-sm text-white">{tutorial.goal}</p>
          <h3 className="mb-2 font-bold text-yellow-300">📋 Cómo jugar:</h3>
          <ul className="list-inside list-disc space-y-1 text-sm text-white">
            {tutorial.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>

        <p className="rounded-lg border-2 border-yellow-400 bg-yellow-400/20 p-3 text-sm font-bold text-yellow-200">
          💡 Consejo: {tutorial.tip}
        </p>

        <button
          type="button"
          onClick={onClose}
          className={clsx(
            'mt-4 min-h-[44px] w-full rounded-lg py-2 font-bold text-white',
            tutorial.button
          )}
        >
          ¡Entendido!
        </button>
      </div>
    </Modal>
  );
};
