import { vi } from 'vitest';
import type { AppSupabaseClient } from '../lib/supabase';

type Reply = {
  data?: unknown;
  error?: { message: string; code?: string } | null;
  status?: number;
};
type RpcHandler = (name: string, args: unknown) => Reply | Promise<Reply>;
type FakeSession = { user: { id: string } } | null;
type AuthListener = (event: string, session: FakeSession) => void;

type Options = {
  rpc?: RpcHandler;
  /** Filas que devuelve `from(tabla).select(...)`. */
  rows?: Record<string, unknown[]>;
  selectError?: Reply['error'];
  /** Fila de `profiles` que devuelve `.select().eq().maybeSingle()`. */
  profile?: Record<string, unknown> | null;
  session?: FakeSession;
};

/** Cliente de Supabase falso con lo justo que usa la app: rpc, from().select() y auth. */
export function fakeClient(options: Options = {}) {
  const calls: { name: string; args: unknown }[] = [];
  const listeners = new Set<AuthListener>();
  let session: FakeSession = options.session ?? null;

  const auth = {
    getSession: async () => ({ data: { session }, error: null }),
    onAuthStateChange: (listener: AuthListener) => {
      listeners.add(listener);
      return {
        data: {
          subscription: { unsubscribe: () => listeners.delete(listener) },
        },
      };
    },
    signInWithOAuth: vi.fn(async (_args: unknown) => ({
      data: {},
      error: null as { message: string } | null,
    })),
    signOut: vi.fn(async (_args?: unknown) => {
      session = null;
      listeners.forEach((l) => l('SIGNED_OUT', null));
      return { error: null };
    }),
  };

  const client = {
    auth,
    rpc: async (name: string, args?: unknown) => {
      calls.push({ name, args });
      const reply = await (options.rpc?.(name, args) ?? { data: null });
      return {
        data: reply.data ?? null,
        error: reply.error ?? null,
        status: reply.status ?? (reply.error ? 400 : 200),
      };
    },
    from: (table: string) => ({
      select: () => {
        const result = {
          data: options.selectError ? null : (options.rows?.[table] ?? []),
          error: options.selectError ?? null,
          status: options.selectError ? 400 : 200,
        };
        return Object.assign(Promise.resolve(result), {
          eq: () => ({
            maybeSingle: async () => ({
              data: options.profile ?? null,
              error: null,
              status: 200,
            }),
          }),
        });
      },
    }),
  };

  return {
    client: client as unknown as AppSupabaseClient,
    calls,
    auth,
    /** Simula que alguien entra o sale (lo que dispararía Supabase tras volver de Google). */
    emit(next: FakeSession, event = next ? 'SIGNED_IN' : 'SIGNED_OUT') {
      session = next;
      listeners.forEach((l) => l(event, next));
    },
  };
}
