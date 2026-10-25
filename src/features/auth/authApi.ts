import { supabase, type AppSupabaseClient } from '../../lib/supabase';
import { CloudError, toCloudError } from '../records/cloudApi';

export type Profile = {
  username: string;
  hasChosenUsername: boolean;
  totalGamesPlayed: number;
  totalWins: number;
};

/** Dominio que se sugiere a Google en el selector de cuentas (la validación real es del servidor). */
export const INSTITUTIONAL_DOMAIN = 'upq.edu.mx';

export function createAuthApi(client: AppSupabaseClient) {
  return {
    /** Abre Google. Al volver, Supabase deja la sesión en el navegador. */
    async signInWithGoogle(): Promise<void> {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/account`,
          // `hd` solo filtra las cuentas que muestra Google; NO es una medida de seguridad.
          queryParams: { hd: INSTITUTIONAL_DOMAIN, prompt: 'select_account' },
        },
      });
      if (error) throw toCloudError(error);
    },

    async signOut(): Promise<void> {
      const { error } = await client.auth.signOut();
      if (error) throw toCloudError(error);
    },

    /** Perfil propio (la base solo devuelve el de quien tiene la sesión). */
    async fetchProfile(userId: string): Promise<Profile | null> {
      const { data, error, status } = await client
        .from('profiles')
        .select('username, has_chosen_username, total_games_played, total_wins')
        .eq('id', userId)
        .maybeSingle();
      if (error) throw toCloudError(error, status);
      if (!data) return null;
      return {
        username: data.username,
        hasChosenUsername: data.has_chosen_username,
        totalGamesPlayed: data.total_games_played,
        totalWins: data.total_wins,
      };
    },

    /** Elige o cambia el apodo del ranking. Devuelve el apodo ya normalizado. */
    async setUsername(username: string): Promise<string> {
      const { data, error, status } = await client.rpc('set_username', {
        p_username: username,
      });
      if (error) throw toCloudError(error, status);
      if (typeof data !== 'string')
        throw new CloudError('rejected', 'Respuesta inesperada del servidor');
      return data;
    },

    /** Borra la cuenta y todos sus datos, y cierra la sesión de este navegador. */
    async deleteAccount(): Promise<void> {
      const { error, status } = await client.rpc('delete_my_account');
      if (error) throw toCloudError(error, status);
      // La sesión ya no es válida en el servidor: se cierra solo aquí.
      await client.auth.signOut({ scope: 'local' }).catch(() => undefined);
    },
  };
}

export type AuthApi = ReturnType<typeof createAuthApi>;

export const authApi: AuthApi | null = supabase
  ? createAuthApi(supabase)
  : null;
