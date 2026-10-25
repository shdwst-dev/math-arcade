import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export type AppSupabaseClient = SupabaseClient<Database>;

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * Cliente de Supabase, o `null` si faltan las variables de entorno: en ese caso
 * la app funciona solo en modo invitado (récords en este dispositivo).
 * La llave publicable (anon) es pública por diseño; la seguridad la dan las
 * políticas RLS y las funciones de supabase/migrations. Nunca usar `service_role` aquí.
 */
export const supabase: AppSupabaseClient | null =
  url && publishableKey
    ? createClient<Database>(url, publishableKey, {
        auth: {
          // PKCE: el navegador recibe un código de un solo uso en lugar del token en la URL.
          flowType: 'pkce',
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;

export const isCloudEnabled = supabase !== null;
