/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL del proyecto de Supabase (Project Settings → API). */
  readonly VITE_SUPABASE_URL?: string;
  /** Llave publicable / anon de Supabase. */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
