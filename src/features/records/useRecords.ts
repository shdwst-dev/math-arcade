import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getCloudBest, useCloudState } from './cloudStore';
import {
  clearAll,
  getBestScore,
  getRecords,
  type LocalRecord,
  type RecordTarget,
} from './localRecords';

/**
 * Mejor puntaje de una combinación para quien está jugando: el de su cuenta si
 * tiene sesión, o el de este dispositivo si juega como invitado. Se vuelve a
 * evaluar solo cuando llegan o cambian los datos de la nube.
 */
export function useBestScore(): (target: RecordTarget) => number {
  const { userId } = useAuth();
  useCloudState(); // suscribe el componente a cambios de la nube
  return (target) => (userId ? getCloudBest(target) : getBestScore(target));
}

export type MyRecords = {
  /** De dónde salen: la cuenta (con sesión) o este dispositivo (invitado). */
  source: 'cloud' | 'device';
  records: readonly LocalRecord[];
  loading: boolean;
  failed: boolean;
  /** Borra los récords de este dispositivo y vuelve a leerlos. */
  clearDevice: () => void;
};

/** Los récords que debe ver la persona: de su cuenta si tiene sesión, si no los del dispositivo. */
export function useMyRecords(): MyRecords {
  const { userId } = useAuth();
  const cloud = useCloudState();
  const [device, setDevice] = useState<readonly LocalRecord[]>(() =>
    getRecords()
  );

  if (userId) {
    return {
      source: 'cloud',
      records: cloud.records,
      loading: cloud.status === 'idle' || cloud.status === 'loading',
      failed: cloud.status === 'error',
      clearDevice: () => undefined,
    };
  }
  return {
    source: 'device',
    records: device,
    loading: false,
    failed: false,
    clearDevice: () => {
      clearAll();
      setDevice([]);
    },
  };
}
