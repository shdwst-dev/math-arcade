import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CloudError, type RecordsApi } from './cloudApi';
import { getCloudBest, rememberCloudBest, resetCloud } from './cloudStore';
import { recordGameResult, type GameOutcome } from './index';
import { getBestScore } from './localRecords';
import { readPending } from './pendingQueue';

const outcome = (score: number): GameOutcome => ({
  topic: 'integral',
  subtopic: 'por_partes',
  game: 'memory',
  difficulty: 'Normal',
  score,
  won: true,
});
const target = {
  topic: 'integral',
  subtopic: 'por_partes',
  game: 'memory',
  difficulty: 'Normal',
} as const;

const apiReturning = (impl: RecordsApi['saveGame']) =>
  ({ saveGame: impl }) as unknown as RecordsApi;

beforeEach(() => {
  localStorage.clear();
  resetCloud();
});

describe('guardar el resultado sin sesión (modo invitado)', () => {
  it('sin nube configurada guarda en este dispositivo', () => {
    const result = recordGameResult(outcome(300), { userId: null, api: null });
    expect(result).toMatchObject({
      isRecord: true,
      best: 300,
      cloud: 'off',
      settled: null,
    });
    expect(getBestScore(target)).toBe(300);
  });

  it('con nube configurada pero sin sesión, avisa que se puede iniciar sesión', () => {
    const api = apiReturning(vi.fn());
    const result = recordGameResult(outcome(300), { userId: null, api });
    expect(result.cloud).toBe('guest');
    expect(result.settled).toBeNull();
    expect(api.saveGame).not.toHaveBeenCalled();
  });

  it('solo es récord si supera al anterior', () => {
    recordGameResult(outcome(300), { userId: null, api: null });
    expect(
      recordGameResult(outcome(200), { userId: null, api: null })
    ).toMatchObject({ isRecord: false, best: 300 });
    expect(
      recordGameResult(outcome(0), { userId: null, api: null })
    ).toMatchObject({ isRecord: false, best: 300 });
  });
});

describe('guardar el resultado con sesión', () => {
  it('va a la cuenta y NO al dispositivo (computadoras compartidas)', async () => {
    const api = apiReturning(async () => ({
      isNewRecord: true,
      bestScore: 300,
    }));
    const result = recordGameResult(outcome(300), { userId: 'u1', api });
    expect(result.cloud).toBe('saving');
    expect(await result.settled).toEqual({
      isRecord: true,
      best: 300,
      cloud: 'record',
    });
    expect(getBestScore(target)).toBe(0);
    expect(getCloudBest(target)).toBe(300);
  });

  it('muestra al instante un resultado provisional según lo ya conocido', () => {
    rememberCloudBest(target, 500);
    const api = apiReturning(() => new Promise(() => undefined));
    expect(recordGameResult(outcome(300), { userId: 'u1', api })).toMatchObject(
      { isRecord: false, best: 500 }
    );
    expect(recordGameResult(outcome(600), { userId: 'u1', api })).toMatchObject(
      { isRecord: true, best: 600 }
    );
  });

  it('la respuesta del servidor manda sobre lo provisional', async () => {
    const api = apiReturning(async () => ({
      isNewRecord: false,
      bestScore: 900,
    }));
    const result = recordGameResult(outcome(300), { userId: 'u1', api });
    expect(result.isRecord).toBe(true); // provisional: la nube aún no sabía nada
    expect(await result.settled).toEqual({
      isRecord: false,
      best: 900,
      cloud: 'saved',
    });
  });

  it('sin conexión la guarda para después y ya cuenta en pantalla', async () => {
    const api = apiReturning(async () => {
      throw new CloudError('retry', 'Failed to fetch');
    });
    const result = recordGameResult(outcome(300), { userId: 'u1', api });
    expect(await result.settled).toMatchObject({ cloud: 'queued', best: 300 });
    expect(readPending()).toEqual([{ ...outcome(300), userId: 'u1' }]);
    expect(getCloudBest(target)).toBe(300);
  });

  it('si el servidor la rechaza no se reintenta ni se encola', async () => {
    const api = apiReturning(async () => {
      throw new CloudError('rejected', 'score_out_of_range', '22003');
    });
    const result = recordGameResult(outcome(300), { userId: 'u1', api });
    expect(await result.settled).toMatchObject({ cloud: 'rejected' });
    expect(readPending()).toEqual([]);
    expect(getCloudBest(target)).toBe(0);
  });

  it('un error cualquiera (no de la nube) también se trata como reintentable', async () => {
    const api = apiReturning(async () => {
      throw new TypeError('Failed to fetch');
    });
    const result = recordGameResult(outcome(300), { userId: 'u1', api });
    expect(await result.settled).toMatchObject({ cloud: 'queued' });
  });
});
