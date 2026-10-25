import React, { useState } from 'react';
import clsx from 'clsx';
import { friendlyError } from '../features/auth/authErrors';
import { Modal } from './Modal';

type ConfirmModalProps = {
  title: string;
  children: React.ReactNode;
  confirmLabel: string;
  /** Acción destructiva: el botón de confirmar va en rojo. */
  danger?: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
};

/** Confirmación antes de una acción que no se puede deshacer. Muestra el error si falla. */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  children,
  confirmLabel,
  danger = false,
  onConfirm,
  onCancel,
}) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError(friendlyError(err as Error));
      setBusy(false);
    }
  };

  return (
    <Modal
      labelledBy="confirm-title"
      onClose={busy ? undefined : onCancel}
      className="rounded-xl border-2 border-yellow-500 bg-gray-800 p-6"
    >
      <h2 id="confirm-title" className="mb-3 text-xl font-bold text-yellow-400">
        {title}
      </h2>
      <div className="mb-5 text-sm text-gray-300">{children}</div>
      {error && (
        <p role="alert" className="mb-4 text-sm text-red-400">
          {error}
        </p>
      )}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="min-h-[44px] rounded bg-gray-600 px-5 py-2 font-bold text-white hover:bg-gray-500 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={confirm}
          disabled={busy}
          className={clsx(
            'min-h-[44px] rounded px-5 py-2 font-bold text-white disabled:opacity-50',
            danger
              ? 'bg-red-700 hover:bg-red-600'
              : 'bg-blue-600 hover:bg-blue-500'
          )}
        >
          {busy ? 'Un momento…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
};
