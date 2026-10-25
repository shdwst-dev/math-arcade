/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  /** URL del proyecto de Supabase (Project Settings → API). */
  readonly VITE_SUPABASE_URL?: string;
  /** Llave publicable / anon de Supabase. */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
