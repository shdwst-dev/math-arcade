import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase, type AppSupabaseClient } from '../../lib/supabase';
import { createRecordsApi } from '../records/cloudApi';
import { resetCloud, setCloudRecords } from '../records/cloudStore';
import type { LocalRecord } from '../records/localRecords';
import {
  flushPending,
  guestRecordsToImport,
  importGuestRecords,
  loadCloudRecords,
} from '../records/sync';
import { AuthContext, type AuthContextValue } from './AuthContext';
import { createAuthApi, type Profile } from './authApi';
import { authRedirectMessage, clearAuthRedirectParams } from './authErrors';

type AuthProviderProps = {
  children: React.ReactNode;
  /** Cliente de Supabase. Por defecto el de la app; `null` = sin nube (modo invitado). */
  client?: AppSupabaseClient | null;
};

// Estados "de una persona": llevan su `userId` para no mostrar datos de la sesión anterior.
type Owned<T> = { userId: string; value: T } | null;

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  client = supabase,
}) => {
  const auth = useMemo(() => (client ? createAuthApi(client) : null), [client]);
  const records = useMemo(
    () => (client ? createRecordsApi(client) : null),
    [client]
  );

  const [session, setSession] = useState<{
    loaded: boolean;
    userId: string | null;
  }>({
    loaded: !client,
    userId: null,
  });
  const [profileState, setProfileState] = useState<Owned<Profile | null>>(null);
  const [offerState, setOfferState] =
    useState<Owned<readonly LocalRecord[]>>(null);
  const [notice, setNotice] = useState<string | null>(() =>
    authRedirectMessage()
  );
  const [promptDismissed, setPromptDismissed] = useState(false);

  const userId = session.userId;
  const profile =
    profileState && profileState.userId === userId ? profileState.value : null;
  const guestOffer =
    offerState && offerState.userId === userId ? offerState.value : null;

  // Si Supabase devolvió un error en la URL ya se leyó; se limpia para que no reaparezca al recargar.
  useEffect(() => clearAuthRedirectParams(), []);

  // Sesión: la que ya hubiera en el navegador y los cambios (entrar, salir, renovar).
  useEffect(() => {
    if (!client) return;
    let active = true;
    void client.auth.getSession().then(({ data }) => {
      if (active)
        setSession({ loaded: true, userId: data.session?.user.id ?? null });
    });
    // El callback no debe hacer llamadas a Supabase (podría bloquearse): solo guarda el id.
    const { data } = client.auth.onAuthStateChange((_event, next) => {
      setSession({ loaded: true, userId: next?.user.id ?? null });
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [client]);

  // Al entrar: perfil, partidas pendientes, récords de la nube y, si hay, la oferta de los del dispositivo.
  useEffect(() => {
    if (!auth || !records) return;
    if (!userId) {
      resetCloud();
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const loaded = await auth.fetchProfile(userId);
        if (!cancelled) setProfileState({ userId, value: loaded });
      } catch {
        // Se reintenta al abrir la pantalla de cuenta.
      }
      await flushPending(records, userId);
      const cloud = await loadCloudRecords(records);
      if (cancelled || !cloud) return;
      const offer = guestRecordsToImport(cloud);
      if (offer.length > 0) setOfferState({ userId, value: offer });
    })();
    return () => {
      cancelled = true;
    };
  }, [auth, records, userId]);

  // Al volver la conexión se suben las partidas que quedaron pendientes.
  useEffect(() => {
    if (!records || !userId) return;
    const onOnline = () => void flushPending(records, userId);
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [records, userId]);

  const refreshProfile = useCallback(async () => {
    if (!auth || !userId) return;
    const loaded = await auth.fetchProfile(userId);
    setProfileState({ userId, value: loaded });
  }, [auth, userId]);

  const value = useMemo<AuthContextValue>(() => {
    const need = <T,>(api: T | null): T => {
      if (!api) throw new Error('La nube no está configurada');
      return api;
    };
    return {
      enabled: client !== null,
      status: !session.loaded ? 'loading' : userId ? 'signedIn' : 'signedOut',
      userId,
      profile,
      records,
      notice,
      dismissNotice: () => setNotice(null),
      guestOffer,
      acceptGuestOffer: async () => {
        if (!records || !guestOffer) return;
        await importGuestRecords(records, guestOffer);
        await loadCloudRecords(records);
        setOfferState(null);
      },
      declineGuestOffer: () => setOfferState(null),
      usernamePromptDismissed: promptDismissed,
      dismissUsernamePrompt: () => setPromptDismissed(true),
      signInWithGoogle: async () => {
        setNotice(null);
        await need(auth).signInWithGoogle();
      },
      signOut: async () => {
        await need(auth).signOut();
      },
      chooseUsername: async (username) => {
        const saved = await need(auth).setUsername(username);
        setProfileState((prev) =>
          prev && prev.userId === userId && prev.value
            ? {
                userId: prev.userId,
                value: {
                  ...prev.value,
                  username: saved,
                  hasChosenUsername: true,
                },
              }
            : prev
        );
      },
      refreshProfile,
      clearProgress: async () => {
        await need(records).clearProgress();
        setCloudRecords([]);
        await refreshProfile();
      },
      deleteAccount: async () => {
        await need(auth).deleteAccount();
        resetCloud();
      },
    };
  }, [
    client,
    session.loaded,
    userId,
    profile,
    records,
    notice,
    guestOffer,
    promptDismissed,
    auth,
    refreshProfile,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
