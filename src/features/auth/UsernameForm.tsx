import React, { useId, useState } from 'react';
import { friendlyError } from './authErrors';
import { USERNAME_HELP, isValidUsername } from './usernameRules';

type UsernameFormProps = {
  initial?: string;
  submitLabel: string;
  onSubmit: (username: string) => Promise<void>;
  /** Se llama tras guardar con éxito. */
  onDone?: () => void;
  /** Botón secundario opcional (p. ej. "Más tarde"). */
  secondary?: { label: string; onClick: () => void };
};

/** Formulario para elegir o cambiar el apodo del ranking. Valida antes de ir al servidor. */
export const UsernameForm: React.FC<UsernameFormProps> = ({
  initial = '',
  submitLabel,
  onSubmit,
  onDone,
  secondary,
}) => {
  const inputId = useId();
  const helpId = useId();
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValidUsername(value)) {
      setError(`Apodo no válido. ${USERNAME_HELP}`);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit(value.trim());
      onDone?.();
    } catch (err) {
      setError(friendlyError(err as Error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <div>
        <label
          htmlFor={inputId}
          className="mb-1 block text-sm font-bold text-gray-200"
        >
          Apodo
        </label>
        <input
          id={inputId}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={30}
          autoComplete="nickname"
          autoCapitalize="off"
          spellCheck={false}
          aria-describedby={helpId}
          aria-invalid={error !== null}
          className="min-h-[44px] w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
        />
        <p id={helpId} className="mt-1 text-xs text-gray-400">
          {USERNAME_HELP}
        </p>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {secondary && (
          <button
            type="button"
            onClick={secondary.onClick}
            className="min-h-[44px] rounded bg-gray-600 px-5 py-2 font-bold text-white hover:bg-gray-500"
          >
            {secondary.label}
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="min-h-[44px] rounded bg-yellow-400 px-5 py-2 font-bold text-gray-900 hover:bg-yellow-300 disabled:opacity-50"
        >
          {saving ? 'Guardando…' : submitLabel}
        </button>
      </div>
    </form>
  );
};
