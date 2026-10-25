import { createContext, useContext } from 'react';
import type { RecordsApi } from '../records/cloudApi';
import type { LocalRecord } from '../records/localRecords';
import type { Profile } from './authApi';

export type AuthContextValue = {
  /** Hay un proyecto de Supabase configurado (si no, solo modo invitado). */
  enabled: boolean;
  /** `loading` mientras se comprueba si ya había una sesión. */
  status: 'loading' | 'signedOut' | 'signedIn';
  userId: string | null;
  /** `null` mientras carga o si no hay sesión. */
  profile: Profile | null;
  /** API de récords de la nube (`null` si no está configurada). Úsala con `userId`. */
  records: RecordsApi | null;
  /** Mensaje de un inicio de sesión fallido (p. ej. cuenta que no es de la UPQ). */
  notice: string | null;
  dismissNotice: () => void;
  /** Récords de este dispositivo que se pueden agregar a la cuenta (se pregunta antes). */
  guestOffer: readonly LocalRecord[] | null;
  acceptGuestOffer: () => Promise<void>;
  declineGuestOffer: () => void;
  /** Se puede ocultar el aviso "elige tu apodo" durante esta visita. */
  usernamePromptDismissed: boolean;
  dismissUsernamePrompt: () => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  chooseUsername: (username: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  /** Borra récords, historial y contadores (conserva la cuenta). */
  clearProgress: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const unavailable = async () => {
  throw new Error('La nube no está configurada');
};

/** Valor por defecto: sin nube y sin sesión (modo invitado). */
export const GUEST_AUTH: AuthContextValue = {
  enabled: false,
  status: 'signedOut',
  userId: null,
  profile: null,
  records: null,
  notice: null,
  dismissNotice: () => undefined,
  guestOffer: null,
  acceptGuestOffer: unavailable,
  declineGuestOffer: () => undefined,
  usernamePromptDismissed: false,
  dismissUsernamePrompt: () => undefined,
  signInWithGoogle: unavailable,
  signOut: unavailable,
  chooseUsername: unavailable,
  refreshProfile: unavailable,
  clearProgress: unavailable,
  deleteAccount: unavailable,
};

export const AuthContext = createContext<AuthContextValue>(GUEST_AUTH);

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
