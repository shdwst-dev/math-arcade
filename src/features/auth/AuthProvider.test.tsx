import { beforeEach, describe, expect, it } from 'vitest';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { fakeClient } from '../../test/fakeClient';
import { getCloudBest, getCloudState, resetCloud } from '../records/cloudStore';
import { getRecords, saveIfHighScore } from '../records/localRecords';
import { enqueue, readPending } from '../records/pendingQueue';
import { AuthProvider } from './AuthProvider';
import { useAuth } from './AuthContext';

const USER = { user: { id: 'u1' } };
const PROFILE = {
  username: 'jugador_ab12cd34',
  has_chosen_username: false,
  total_games_played: 3,
  total_wins: 1,
};
const CLOUD_ROW = {
  topic: 'integral',
  subtopic: 'todos',
  game: 'memory',
  difficulty: 'Normal',
  best_score: 300,
  updated_at: '2026-01-01T00:00:00Z',
};
const target = {
  topic: 'integral',
  subtopic: 'todos',
  game: 'memory',
  difficulty: 'Normal',
} as const;

const Probe = () => {
  const a = useAuth();
  return (
    <div>
      <span data-testid="enabled">{String(a.enabled)}</span>
      <span data-testid="status">{a.status}</span>
      <span data-testid="user">{a.userId ?? '-'}</span>
      <span data-testid="name">{a.profile?.username ?? '-'}</span>
      <span data-testid="chosen">
        {String(a.profile?.hasChosenUsername ?? '-')}
      </span>
      <span data-testid="offer">{a.guestOffer?.length ?? 0}</span>
      <span data-testid="notice">{a.notice ?? '-'}</span>
      <button onClick={() => void a.signInWithGoogle()}>entrar</button>
      <button onClick={() => void a.signOut()}>salir</button>
      <button onClick={() => void a.chooseUsername('Ana_M')}>apodo</button>
      <button onClick={() => void a.acceptGuestOffer()}>aceptar</button>
      <button onClick={a.declineGuestOffer}>rechazar</button>
      <button onClick={() => void a.deleteAccount()}>borrar</button>
    </div>
  );
};

const text = (id: string) => screen.getByTestId(id).textContent;

function setup(options: Parameters<typeof fakeClient>[0] = {}) {
  const fake = fakeClient({
    profile: PROFILE,
    rows: { high_scores: [CLOUD_ROW] },
    ...options,
  });
  render(
    <AuthProvider client={fake.client}>
      <Probe />
    </AuthProvider>
  );
  return fake;
}

beforeEach(() => {
  localStorage.clear();
  resetCloud();
  window.history.replaceState(null, '', '/');
});

describe('<AuthProvider> sin nube', () => {
  it('sin cliente de Supabase todo funciona como invitado', () => {
    render(
      <AuthProvider client={null}>
        <Probe />
      </AuthProvider>
    );
    expect(text('enabled')).toBe('false');
    expect(text('status')).toBe('signedOut');
    expect(text('user')).toBe('-');
  });
});

describe('<AuthProvider> con nube', () => {
  it('sin sesión guardada queda como invitado', async () => {
    setup({ session: null });
    expect(text('status')).toBe('loading');
    await waitFor(() => expect(text('status')).toBe('signedOut'));
    expect(text('enabled')).toBe('true');
  });

  it('con una sesión existente carga el perfil y los récords de la cuenta', async () => {
    setup({ session: USER });
    await waitFor(() => expect(text('status')).toBe('signedIn'));
    expect(text('user')).toBe('u1');
    await waitFor(() => expect(text('name')).toBe('jugador_ab12cd34'));
    expect(text('chosen')).toBe('false');
    await waitFor(() => expect(getCloudBest(target)).toBe(300));
  });

  it('al iniciar sesión sube las partidas que quedaron pendientes', async () => {
    enqueue({ ...target, userId: 'u1', score: 500, won: true });
    const fake = setup({
      session: USER,
      rpc: () => ({ data: { is_new_record: true, best_score: 500 } }),
    });
    await waitFor(() => expect(readPending()).toEqual([]));
    expect(fake.calls.map((c) => c.name)).toContain('record_game_result');
  });

  it('no sube partidas pendientes de otra cuenta', async () => {
    enqueue({ ...target, userId: 'otra', score: 500, won: true });
    const fake = setup({ session: USER });
    await waitFor(() => expect(getCloudState().status).toBe('ready'));
    expect(fake.calls.map((c) => c.name)).not.toContain('record_game_result');
    expect(readPending()).toHaveLength(1);
  });

  it('reacciona a entrar y a salir sin recargar', async () => {
    const fake = setup({ session: null });
    await waitFor(() => expect(text('status')).toBe('signedOut'));
    act(() => fake.emit(USER));
    await waitFor(() => expect(text('status')).toBe('signedIn'));
    await waitFor(() => expect(getCloudState().status).toBe('ready'));

    fireEvent.click(screen.getByText('salir'));
    await waitFor(() => expect(text('status')).toBe('signedOut'));
    expect(text('name')).toBe('-');
    expect(getCloudState().status).toBe('idle'); // la nube de esa persona se olvida
  });

  it('iniciar sesión pide a Google solo cuentas @upq.edu.mx y vuelve a la cuenta', async () => {
    const fake = setup({ session: null });
    await waitFor(() => expect(text('status')).toBe('signedOut'));
    fireEvent.click(screen.getByText('entrar'));
    await waitFor(() =>
      expect(fake.auth.signInWithOAuth).toHaveBeenCalledTimes(1)
    );
    const args = fake.auth.signInWithOAuth.mock.calls[0][0] as {
      provider: string;
      options: { redirectTo: string; queryParams: Record<string, string> };
    };
    expect(args.provider).toBe('google');
    expect(args.options.queryParams.hd).toBe('upq.edu.mx');
    expect(args.options.redirectTo).toMatch(/\/account$/);
  });

  it('elegir apodo lo guarda en el servidor y actualiza el perfil', async () => {
    const fake = setup({
      session: USER,
      rpc: (name) =>
        name === 'set_username' ? { data: 'Ana_M' } : { data: null },
    });
    await waitFor(() => expect(text('name')).toBe('jugador_ab12cd34'));
    fireEvent.click(screen.getByText('apodo'));
    await waitFor(() => expect(text('name')).toBe('Ana_M'));
    expect(text('chosen')).toBe('true');
    expect(fake.calls.find((c) => c.name === 'set_username')?.args).toEqual({
      p_username: 'Ana_M',
    });
  });

  it('borrar la cuenta llama al servidor, cierra la sesión local y olvida la nube', async () => {
    const fake = setup({ session: USER });
    await waitFor(() => expect(getCloudBest(target)).toBe(300));
    fireEvent.click(screen.getByText('borrar'));
    await waitFor(() => expect(getCloudBest(target)).toBe(0));
    expect(fake.calls.map((c) => c.name)).toContain('delete_my_account');
    expect(fake.auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
  });

  it('un error al volver de Google se muestra y se limpia de la URL', async () => {
    window.history.replaceState(
      null,
      '',
      '/account#error=server_error&error_description=Database+error+saving+new+user'
    );
    setup({ session: null });
    expect(text('notice')).toMatch(/institucionales/);
    await waitFor(() => expect(window.location.hash).toBe(''));
  });
});

describe('<AuthProvider> récords del dispositivo', () => {
  it('ofrece agregar los que superan a los de la cuenta (no los sube solo)', async () => {
    saveIfHighScore(target, 400); // la cuenta tiene 300
    saveIfHighScore({ ...target, game: 'bomb' }, 100); // sin récord en la nube
    const fake = setup({ session: USER });
    await waitFor(() => expect(text('offer')).toBe('2'));
    expect(fake.calls.map((c) => c.name)).not.toContain('import_best_scores');
    expect(getRecords()).toHaveLength(2);
  });

  it('no ofrece nada si la cuenta ya tiene récords iguales o mejores', async () => {
    saveIfHighScore(target, 300);
    setup({ session: USER });
    await waitFor(() => expect(getCloudState().status).toBe('ready'));
    expect(text('offer')).toBe('0');
  });

  it('al aceptar los sube y los borra del dispositivo (computadoras compartidas)', async () => {
    saveIfHighScore(target, 400);
    const fake = setup({
      session: USER,
      rpc: () => ({ data: { imported: 1 } }),
    });
    await waitFor(() => expect(text('offer')).toBe('1'));
    fireEvent.click(screen.getByText('aceptar'));
    await waitFor(() => expect(text('offer')).toBe('0'));
    expect(
      fake.calls.find((c) => c.name === 'import_best_scores')?.args
    ).toEqual({
      p_records: [{ ...target, score: 400 }],
    });
    expect(getRecords()).toEqual([]);
  });

  it('al rechazar la oferta no se sube nada y los récords quedan en el dispositivo', async () => {
    saveIfHighScore(target, 400);
    const fake = setup({ session: USER });
    await waitFor(() => expect(text('offer')).toBe('1'));
    fireEvent.click(screen.getByText('rechazar'));
    expect(text('offer')).toBe('0');
    expect(fake.calls.map((c) => c.name)).not.toContain('import_best_scores');
    expect(getRecords()).toHaveLength(1);
  });
});

describe('<AuthProvider> sin conexión', () => {
  it('al volver el internet sube las partidas pendientes', async () => {
    const fake = setup({
      session: USER,
      rpc: () => ({ data: { is_new_record: false, best_score: 200 } }),
    });
    await waitFor(() => expect(getCloudState().status).toBe('ready'));
    enqueue({ ...target, userId: 'u1', score: 200, won: false });
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    await waitFor(() => expect(readPending()).toEqual([]));
    expect(
      fake.calls.filter((c) => c.name === 'record_game_result')
    ).toHaveLength(1);
  });
});
