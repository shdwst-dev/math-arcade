import { afterEach, describe, expect, it, vi } from 'vitest';
import { fakeClient } from '../../test/fakeClient';
import { CloudError, createRecordsApi, toCloudError } from './cloudApi';
import type { GameOutcome } from './index';

const outcome: GameOutcome = {
  topic: 'integral',
  subtopic: 'por_partes',
  game: 'memory',
  difficulty: 'Difícil',
  score: 400,
  won: true,
};

afterEach(() => vi.restoreAllMocks());

describe('clasificación de errores', () => {
  it.each([
    [
      'sin código (falló la red)',
      { message: 'Failed to fetch' },
      undefined,
      'retry',
    ],
    ['código vacío', { message: 'TypeError', code: '' }, undefined, 'retry'],
    ['error del servidor 503', { message: 'x', code: '57P01' }, 503, 'retry'],
    [
      'sesión caducada',
      { message: 'JWT expired', code: 'PGRST301' },
      401,
      'retry',
    ],
    [
      'puntaje fuera de rango',
      { message: 'score_out_of_range', code: '22003' },
      400,
      'rejected',
    ],
    [
      'datos inválidos',
      { message: 'invalid_game_data', code: '22023' },
      400,
      'rejected',
    ],
    [
      'sin permiso',
      { message: 'permission denied', code: '42501' },
      403,
      'rejected',
    ],
  ] as const)('%s → %s', (_name, error, status, kind) => {
    expect(toCloudError(error, status).kind).toBe(kind);
  });

  it('sin conexión siempre se reintenta, aunque el error traiga código', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    expect(toCloudError({ message: 'x', code: '22003' }, 400).kind).toBe(
      'retry'
    );
  });
});

describe('guardar una partida', () => {
  it('envía los datos y lee la respuesta; en juegos sin dificultad manda Normal', async () => {
    const { client, calls } = fakeClient({
      rpc: () => ({ data: { is_new_record: true, best_score: 400 } }),
    });
    const result = await createRecordsApi(client).saveGame(outcome);
    expect(result).toEqual({ isNewRecord: true, bestScore: 400 });
    expect(calls[0]).toEqual({
      name: 'record_game_result',
      args: {
        p_topic: 'integral',
        p_subtopic: 'por_partes',
        p_game: 'memory',
        p_difficulty: 'Normal',
        p_score: 400,
        p_won: true,
      },
    });
  });

  it('en Carrera manda la dificultad elegida', async () => {
    const { client, calls } = fakeClient({
      rpc: () => ({ data: { is_new_record: false, best_score: 1 } }),
    });
    await createRecordsApi(client).saveGame({
      ...outcome,
      game: 'race',
      difficulty: 'Difícil',
    });
    expect(calls[0].args).toMatchObject({ p_difficulty: 'Difícil' });
  });

  it('rechazo del servidor → CloudError "rejected"', async () => {
    const { client } = fakeClient({
      rpc: () => ({ error: { message: 'score_out_of_range', code: '22003' } }),
    });
    await expect(
      createRecordsApi(client).saveGame(outcome)
    ).rejects.toMatchObject({
      name: 'CloudError',
      kind: 'rejected',
      code: '22003',
    });
  });

  it('fallo de red → CloudError "retry"', async () => {
    const { client } = fakeClient({
      rpc: () => ({ error: { message: 'Failed to fetch' } }),
    });
    const error = await createRecordsApi(client)
      .saveGame(outcome)
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(CloudError);
    expect(error).toMatchObject({ kind: 'retry' });
  });

  it('una respuesta con otra forma no se acepta', async () => {
    const { client } = fakeClient({ rpc: () => ({ data: { algo: 'raro' } }) });
    await expect(
      createRecordsApi(client).saveGame(outcome)
    ).rejects.toMatchObject({ kind: 'rejected' });
  });
});

describe('leer los récords de la cuenta', () => {
  it('convierte filas válidas e ignora lo que la app no conoce', async () => {
    const { client } = fakeClient({
      rows: {
        high_scores: [
          {
            topic: 'integral',
            subtopic: 'todos',
            game: 'race',
            difficulty: 'Difícil',
            best_score: 800,
            updated_at: '2026-03-01T00:00:00Z',
          },
          {
            topic: 'geometria',
            subtopic: 'todos',
            game: 'race',
            difficulty: 'Normal',
            best_score: 5,
            updated_at: 'x',
          },
          {
            topic: 'integral',
            subtopic: 'subtema_viejo',
            game: 'bomb',
            difficulty: 'Normal',
            best_score: 5,
            updated_at: 'x',
          },
          {
            topic: 'integral',
            subtopic: 'todos',
            game: 'ajedrez',
            difficulty: 'Normal',
            best_score: 5,
            updated_at: 'x',
          },
          {
            topic: 'integral',
            subtopic: 'todos',
            game: 'bomb',
            difficulty: 'Imposible',
            best_score: 5,
            updated_at: 'x',
          },
          {
            topic: 'integral',
            subtopic: 'todos',
            game: 'bomb',
            difficulty: 'Normal',
            best_score: 0,
            updated_at: 'x',
          },
        ],
      },
    });
    expect(await createRecordsApi(client).fetchMyRecords()).toEqual([
      {
        topic: 'integral',
        subtopic: 'todos',
        game: 'race',
        difficulty: 'Difícil',
        score: 800,
        date: '2026-03-01T00:00:00Z',
      },
    ]);
  });

  it('un error de lectura se propaga', async () => {
    const { client } = fakeClient({
      selectError: { message: 'Failed to fetch' },
    });
    await expect(
      createRecordsApi(client).fetchMyRecords()
    ).rejects.toMatchObject({ kind: 'retry' });
  });
});

describe('importar y borrar', () => {
  it('importa récords con la dificultad normalizada y devuelve cuántos mejoraron', async () => {
    const { client, calls } = fakeClient({
      rpc: () => ({ data: { imported: 2 } }),
    });
    const imported = await createRecordsApi(client).importRecords([
      {
        topic: 'integral',
        subtopic: 'todos',
        game: 'memory',
        difficulty: 'Fácil',
        score: 500,
      },
      {
        topic: 'integral',
        subtopic: 'todos',
        game: 'race',
        difficulty: 'Difícil',
        score: 800,
      },
    ]);
    expect(imported).toBe(2);
    expect(calls[0].args).toEqual({
      p_records: [
        {
          topic: 'integral',
          subtopic: 'todos',
          game: 'memory',
          difficulty: 'Normal',
          score: 500,
        },
        {
          topic: 'integral',
          subtopic: 'todos',
          game: 'race',
          difficulty: 'Difícil',
          score: 800,
        },
      ],
    });
  });

  it('borrar el progreso llama a la función del servidor', async () => {
    const { client, calls } = fakeClient();
    await createRecordsApi(client).clearProgress();
    expect(calls[0].name).toBe('clear_my_progress');
  });

  it('si el servidor rechaza la importación, se propaga el error', async () => {
    const { client } = fakeClient({
      rpc: () => ({ error: { message: 'score_out_of_range', code: '22003' } }),
    });
    await expect(
      createRecordsApi(client).importRecords([])
    ).rejects.toMatchObject({ kind: 'rejected' });
  });
});
