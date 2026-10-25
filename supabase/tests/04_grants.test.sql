-- Inventario de permisos: lo que NO debe estar expuesto por la API pública.
select t.reset();

-- RLS activo en todas las tablas de la app.
select t.eq((select string_agg(relname, ',' order by relname) from pg_class c join pg_namespace n on n.oid = c.relnamespace
              where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity), null, 'todas las tablas de public tienen RLS');

-- anon (sin sesión) no tiene ningún permiso sobre ninguna tabla.
select t.eq((select count(*)::text from information_schema.role_table_grants
              where grantee = 'anon' and table_schema = 'public'), '0', 'anon no tiene permisos en ninguna tabla');

-- authenticated: solo lectura (filtrada por RLS) de sus 3 tablas; nada de escribir.
select t.eq((select string_agg(table_name || ':' || privilege_type, ',' order by table_name, privilege_type)
               from information_schema.role_table_grants
              where grantee = 'authenticated' and table_schema = 'public'),
  'game_history:SELECT,high_scores:SELECT,profiles:SELECT',
  'authenticated solo puede leer game_history, high_scores y profiles');
select t.eq((select count(*)::text from information_schema.role_column_grants
              where grantee in ('anon', 'authenticated') and table_schema = 'public' and privilege_type in ('INSERT', 'UPDATE')), '0',
  'ninguna columna es escribible directamente');

-- Funciones: lista exacta de las que puede llamar un alumno con sesión.
select t.eq((select string_agg(p.proname, ',' order by p.proname)
               from pg_proc p join pg_namespace n on n.oid = p.pronamespace
              where n.nspname = 'public' and has_function_privilege('authenticated', p.oid, 'execute')),
  'clear_my_progress,delete_my_account,get_leaderboard,import_best_scores,record_game_result,set_username',
  'authenticated solo puede ejecutar las 6 funciones de la app');
select t.eq((select count(*)::text from pg_proc p join pg_namespace n on n.oid = p.pronamespace
              where n.nspname = 'public' and has_function_privilege('anon', p.oid, 'execute')), '0',
  'anon no puede ejecutar ninguna función');
select t.eq((select count(*)::text from pg_proc p join pg_namespace n on n.oid = p.pronamespace
              where n.nspname = 'public' and p.proname not in ('hook_before_user_created', 'is_signup_allowed')
                and has_function_privilege('supabase_auth_admin', p.oid, 'execute')
                and not has_function_privilege('authenticated', p.oid, 'execute')), '0',
  'Auth no recibe permisos de más');

-- Toda función con security definer fija su search_path (evita que alguien la engañe con objetos propios).
select t.eq((select string_agg(p.proname, ',') from pg_proc p join pg_namespace n on n.oid = p.pronamespace
              where n.nspname = 'public' and p.prosecdef
                and not exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%')),
  null, 'todas las funciones security definer fijan search_path');

select t.finish();
