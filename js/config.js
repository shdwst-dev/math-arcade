// Credenciales públicas de Supabase (Project Settings → API).
// La "anon key" / "publishable key" es pública por diseño: la seguridad la dan
// las políticas RLS definidas en supabase/schema.sql.
// Si se dejan los valores de ejemplo, la app funciona solo con localStorage.
const SUPABASE_CONFIG = {
    url: 'https://vtopzwwnasxeywvykthg.supabase.co',
    anonKey: 'sb_publishable_3dxf043vaa5bWXjQ5hELUA_vrlH56Jq'
};
