import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CloudError, type RecordsApi } from './cloudApi';
import {
  getCloudBest,
  getCloudState,
  resetCloud,
  setCloudRecords,
} from './cloudStore';
import {
  getBestScore,
  getRecords,
  saveIfHighScore,
  type LocalRecord,
} from './localRecords';
import { enqueue, readPending, type PendingGame } from './pendingQueue';
import {
  flushPending,
  guestRecordsToImport,
  importGuestRecords,
  loadCloudRecords,
} from './sync';

const game = (score: number, userId = 'u1'): PendingGame => ({
  userId,
  topic: 'integral',
  subtopic: 'por_partes',
  game: 'memory',
  difficulty: 'Normal',
  score,
  won: true,
});

function apiWith(saveGame: RecordsApi['saveGame']) {
  return {
    saveGame,
    fetchMyRecords: vi.fn(),
    importRecords: vi.fn(),
    clearProgress: vi.fn(),
  } as unknown as RecordsApi;
}
const ok = (score: number) => ({ isNewRecord: true, bestScore: score });

beforeEach(() => {
  localStorage.clear();
  resetCloud();
});

describe('subir partidas pendientes', () => {
  it('sube en orden, vacía la cola y actualiza el mejor puntaje', async () => {
    enqueue(game(100));
    enqueue(game(300));
    enqueue(game(200));
    const sent: number[] = [];
    const api = apiWith(async (g) => {
      sent.push(g.score);
      return ok(g.score);
    });
    expect(await flushPending(api, 'u1')).toEqual({ sent: 3, pending: 0 });
    expect(sent).toEqual([100, 300, 200]);
    expect(readPending()).toEqual([]);
    expect(getCloudBest(game(0))).toBe(300);
  });

  it('con un fallo de red se detiene y conserva esa partida y las siguientes', async () => {
    enqueue(game(1));
    enqueue(game(2));
    enqueue(game(3));
    const api = apiWith(async (g) => {
      if (g.score === 2) throw new CloudError('retry', 'Failed to fetch');
      return ok(g.score);
    });
    expect(await flushPending(api, 'u1')).toEqual({ sent: 1, pending: 2 });
    expect(readPending().map((p) => p.score)).toEqual([2, 3]);
  });

  it('descarta las que el servidor rechaza y sigue con las demás', async () => {
    enqueue(game(1));
    enqueue(game(2));
    enqueue(game(3));
    const api = apiWith(async (g) => {
      if (g.score === 2)
        throw new CloudError('rejected', 'score_out_of_range', '22003');
      return ok(g.score);
    });
    expect(await flushPending(api, 'u1')).toEqual({ sent: 2, pending: 0 });
    expect(readPending()).toEqual([]);
  });

  it('no toca las partidas de otra cuenta', async () => {
    enqueue(game(1, 'u1'));
    enqueue(game(2, 'u2'));
    const saveGame = vi.fn(async (g: PendingGame) => ok(g.score));
    await flushPending(apiWith(saveGame as RecordsApi['saveGame']), 'u1');
    expect(saveGame).toHaveBeenCalledTimes(1);
    expect(readPending()).toEqual([game(2, 'u2')]);
  });

  it('una partida que se encola mientras se sube no se pierde', async () => {
    enqueue(game(1));
    const api = apiWith(async (g) => {
      if (g.score === 1) enqueue(game(99)); // otra partida sin conexión, a mitad del envío
      return ok(g.score);
    });
    await flushPending(api, 'u1');
    expect(readPending()).toEqual([]); // la 99 también se subió (se releyó la cola)
    const again = apiWith(async () => {
      throw new CloudError('retry', 'x');
    });
    enqueue(game(5));
    await flushPending(again, 'u1');
    expect(readPending().map((p) => p.score)).toEqual([5]);
  });

  it('dos llamadas a la vez comparten el mismo envío (no se duplica nada)', async () => {
    enqueue(game(1));
    enqueue(game(2));
    const saveGame = vi.fn(async (g: PendingGame) => ok(g.score));
    const api = apiWith(saveGame as RecordsApi['saveGame']);
    const [a, b] = await Promise.all([
      flushPending(api, 'u1'),
      flushPending(api, 'u1'),
    ]);
    expect(saveGame).toHaveBeenCalledTimes(2);
    expect(a).toBe(b);
  });

  it('con la cola vacía no hace nada', async () => {
    const saveGame = vi.fn();
    expect(await flushPending(apiWith(saveGame), 'u1')).toEqual({
      sent: 0,
      pending: 0,
    });
    expect(saveGame).not.toHaveBeenCalled();
  });
});

describe('cargar los récords de la nube', () => {
  const record: LocalRecord = {
    topic: 'integral',
    subtopic: 'todos',
    game: 'bomb',
    difficulty: 'Normal',
    score: 250,
    date: '2026-01-01T00:00:00Z',
  };

  it('los deja en el almacén', async () => {
    const api = {
      fetchMyRecords: vi.fn().mockResolvedValue([record]),
    } as unknown as RecordsApi;
    expect(await loadCloudRecords(api)).toEqual([record]);
    expect(getCloudState()).toMatchObject({
      status: 'ready',
      records: [record],
    });
  });

  it('si falla, marca error y devuelve null', async () => {
    const api = {
      fetchMyRecords: vi.fn().mockRejectedValue(new CloudError('retry', 'x')),
    } as unknown as RecordsApi;
    expect(await loadCloudRecords(api)).toBeNull();
    expect(getCloudState().status).toBe('error');
  });
});

describe('récords del modo invitado', () => {
  const target = {
    topic: 'integral',
    subtopic: 'todos',
    game: 'memory',
    difficulty: 'Normal',
  } as const;

  it('solo ofrece los que superan a los de la cuenta', () => {
    saveIfHighScore(target, 400);
    saveIfHighScore({ ...target, game: 'bomb' }, 100);
    saveIfHighScore({ ...target, subtopic: 'por_partes' }, 50);
    const cloud: LocalRecord[] = [
      { ...target, score: 300, date: 'x' }, // el local (400) es mayor → se ofrece
      { ...target, game: 'bomb', score: 100, date: 'x' }, // empate → no
      { ...target, subtopic: 'por_partes', score: 500, date: 'x' }, // la nube es mayor → no
    ];
    expect(
      guestRecordsToImport(cloud).map(
        (r) => `${r.subtopic}/${r.game}/${r.score}`
      )
    ).toEqual(['todos/memory/400']);
  });

  it('sin récords locales no hay nada que ofrecer', () => {
    expect(guestRecordsToImport([])).toEqual([]);
  });

  it('al importar, se suben y se borran de este dispositivo', async () => {
    saveIfHighScore(target, 400);
    const api = {
      importRecords: vi.fn().mockResolvedValue(1),
    } as unknown as RecordsApi;
    expect(await importGuestRecords(api, getRecords())).toBe(1);
    expect(getRecords()).toEqual([]);
    expect(getBestScore(target)).toBe(0);
  });

  it('si la importación falla, los récords locales se conservan', async () => {
    saveIfHighScore(target, 400);
    const api = {
      importRecords: vi.fn().mockRejectedValue(new CloudError('retry', 'x')),
    } as unknown as RecordsApi;
    await expect(importGuestRecords(api, getRecords())).rejects.toBeInstanceOf(
      CloudError
    );
    expect(getBestScore(target)).toBe(400);
  });
});

describe('estado del almacén tras varias subidas', () => {
  it('queda ordenado y sin duplicados', async () => {
    setCloudRecords([]);
    enqueue(game(100));
    enqueue(game(50));
    await flushPending(
      apiWith(async (g) => ok(Math.max(g.score, 100))),
      'u1'
    );
    expect(getCloudState().records).toHaveLength(1);
  });
});
