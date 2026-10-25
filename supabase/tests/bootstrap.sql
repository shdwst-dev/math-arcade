-- Emula lo mínimo de Supabase que necesitan las migraciones y las pruebas: roles,
-- esquema `auth` (users y auth.uid()) y los permisos por defecto de `public`.
-- SOLO para bases de datos de prueba desechables; en Supabase real todo esto ya existe.

do $$
begin
  -- `authenticator` es el rol con el que PostgREST se conecta y luego cambia a anon/authenticated.
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'supabase_auth_admin') then
    create role supabase_auth_admin nologin noinherit;
  end if;
end $$;

create schema if not exists auth;
grant usage on schema auth to supabase_auth_admin;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  raw_user_meta_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Misma definición que Supabase: lee el `sub` del JWT de la petición.
create or replace function auth.uid() returns uuid
language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;

grant usage on schema public to anon, authenticated, service_role, supabase_auth_admin;

-- Supabase da por defecto todos los permisos de `public` a anon/authenticated/service_role.
-- Se emula para que las pruebas detecten lo que las migraciones deben revocar.
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
