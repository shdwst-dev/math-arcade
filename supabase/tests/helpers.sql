-- Mini marco de pruebas en SQL puro (sin pgTAP) para poder correr en cualquier Postgres.
-- Cada archivo *.test.sql empieza con t.reset() y termina con t.finish(), que falla
-- (y hace que psql salga con error) si alguna comprobación no se cumplió.

create schema if not exists t;
grant usage on schema t to public;

create table if not exists t.results (
  n serial primary key,
  ok boolean not null,
  name text not null,
  detail text
);
grant all on t.results to public;
grant all on sequence t.results_n_seq to public;

-- Registra una comprobación. Corre con permisos del dueño para poder escribir aunque
-- la prueba esté actuando como `anon` o `authenticated`.
create or replace function t.check(p_ok boolean, p_name text, p_detail text default null)
returns void language plpgsql security definer as $$
begin
  insert into t.results (ok, name, detail) values (coalesce(p_ok, false), p_name, p_detail);
end $$;

-- Las siguientes se ejecutan con el rol actual de la sesión (anon, authenticated...),
-- por eso NO son security definer.

-- La sentencia debe fallar con un mensaje que cumpla la expresión regular.
create or replace function t.throws(p_sql text, p_pattern text, p_name text)
returns void language plpgsql as $$
declare v_msg text;
begin
  begin
    execute p_sql;
  exception when others then
    get stacked diagnostics v_msg = message_text;
    perform t.check(v_msg ~* p_pattern, p_name, 'mensaje: ' || v_msg || ' | esperado: ' || p_pattern);
    return;
  end;
  perform t.check(false, p_name, 'no lanzó ningún error; esperado: ' || p_pattern);
end $$;

-- La sentencia debe ejecutarse sin error.
create or replace function t.lives(p_sql text, p_name text)
returns void language plpgsql as $$
begin
  execute p_sql;
  perform t.check(true, p_name);
exception when others then
  perform t.check(false, p_name, 'error inesperado: ' || sqlerrm);
end $$;

-- Valor (como texto) de una consulta de una sola celda.
create or replace function t.val(p_sql text)
returns text language plpgsql as $$
declare v text;
begin
  execute p_sql into v;
  return v;
end $$;

create or replace function t.eq(p_actual text, p_expected text, p_name text)
returns void language plpgsql as $$
begin
  perform t.check(p_actual is not distinct from p_expected, p_name,
                  'obtenido: ' || coalesce(p_actual, 'NULL') || ' | esperado: ' || coalesce(p_expected, 'NULL'));
end $$;

-- Simula la sesión de una persona (el `sub` del JWT) o de nadie.
create or replace function t.login(p_user uuid)
returns void language sql as $$ select set_config('request.jwt.claim.sub', p_user::text, false) $$;
create or replace function t.logout()
returns void language sql as $$ select set_config('request.jwt.claim.sub', '', false) $$;

-- Solo vacía los resultados (sin tocar datos): para comprobaciones sobre datos ya sembrados.
create or replace function t.reset_results()
returns void language plpgsql security definer as $$
begin
  truncate t.results restart identity;
end $$;

-- Deja todo como recién migrado: sin usuarios ni datos y con la lista de dominios original.
create or replace function t.reset()
returns void language plpgsql security definer as $$
begin
  perform set_config('client_min_messages', 'warning', true); -- sin avisos de TRUNCATE ... CASCADE
  truncate t.results restart identity;
  truncate auth.users cascade; -- arrastra perfiles, récords e historial
  delete from public.signup_allowlist where not (kind = 'domain' and value = 'upq.edu.mx');
  perform set_config('request.jwt.claim.sub', '', false);
end $$;

create or replace function t.finish()
returns void language plpgsql security definer as $$
declare
  v_total int; v_failed int; r record;
begin
  select count(*), count(*) filter (where not ok) into v_total, v_failed from t.results;
  for r in select * from t.results where not ok order by n loop
    raise warning 'FALLÓ: % — %', r.name, r.detail;
  end loop;
  raise notice '% comprobaciones, % fallaron', v_total, v_failed;
  if v_failed > 0 then
    raise exception '% comprobaciones fallaron', v_failed;
  end if;
end $$;
