// Credenciales públicas de Supabase (Project Settings → API).
// La "anon key" / "publishable key" es pública por diseño: la seguridad la dan
// las políticas RLS definidas en supabase/schema.sql.
// Si se dejan los valores de ejemplo, la app funciona solo con localStorage.
const SUPABASE_CONFIG = {
    url: 'https://TU-PROYECTO.supabase.co',
    anonKey: 'TU-ANON-KEY'
};
