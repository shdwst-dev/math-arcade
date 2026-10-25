-- ============================================================================
-- MATH ARCADE v2: privacidad, cuentas institucionales y límites reales
-- ============================================================================
-- Parte de la línea base de v1 (20261025000000_v1_baseline.sql). Esta migración:
--   1. restringe el registro a cuentas institucionales, validado en el servidor;
--   2. deja de guardar nombres reales y vuelve privados los perfiles (apodos);
--   3. cierra toda escritura directa a las tablas: solo funciones RPC validadas;
--   4. limita los puntajes a lo que cada juego permite.
--
-- Después de aplicarla, en el panel de Supabase (Authentication → Hooks) se puede
-- activar "Before User Created" con public.hook_before_user_created para mostrar
-- un mensaje más claro; el trigger de abajo protege aunque no se active.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. QUIÉN PUEDE REGISTRARSE
-- ---------------------------------------------------------------------------
-- Lista de dominios (o correos sueltos) permitidos. Sin políticas RLS: solo el
-- dueño de la base (panel de Supabase / service_role) la ve y la modifica.
create table if not exists public.signup_allowlist (
    kind TEXT NOT NULL CHECK (kind IN ('domain', 'email')),
    value TEXT NOT NULL CHECK (value = LOWER(BTRIM(value)) AND CHAR_LENGTH(value) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (kind, value)
);
alter table public.signup_allowlist enable row level security;
revoke all on public.signup_allowlist from public, anon, authenticated;

insert into public.signup_allowlist (kind, value) values ('domain', 'upq.edu.mx')
on conflict do nothing;

create or replace function public.is_signup_allowed(p_email text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    with normalized as (select LOWER(BTRIM(COALESCE(p_email, ''))) as email)
    select exists (
        select 1
        from normalized n
        join public.signup_allowlist a
          on (a.kind = 'email' and a.value = n.email)
          or (a.kind = 'domain' and SPLIT_PART(n.email, '@', 2) = a.value)
        -- Exactamente una "@": rechaza "a@b@upq.edu.mx" y correos vacíos.
        where n.email ~ '^[^@[:space:]]+@[^@[:space:]]+$'
    );
$$;

-- Respaldo que funciona sin configurar nada: rechaza el alta (o el cambio de correo).
create or replace function public.enforce_signup_allowlist()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if not public.is_signup_allowed(NEW.email) then
        raise exception 'signup_domain_not_allowed'
            using errcode = '42501',
                  hint = 'Solo se permiten cuentas institucionales (@upq.edu.mx).';
    end if;
    return NEW;
end;
$$;

drop trigger if exists before_auth_user_created on auth.users;
create trigger before_auth_user_created
    before insert on auth.users
    for each row execute function public.enforce_signup_allowlist();

drop trigger if exists before_auth_user_email_changed on auth.users;
create trigger before_auth_user_email_changed
    before update of email on auth.users
    for each row when (NEW.email is distinct from OLD.email)
    execute function public.enforce_signup_allowlist();

-- Mismo criterio como Auth Hook "Before User Created" (mensaje claro para el alumno).
create or replace function public.hook_before_user_created(event jsonb)
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
begin
    if not public.is_signup_allowed(event -> 'user' ->> 'email') then
        return jsonb_build_object(
            'error', jsonb_build_object(
                'message', 'Solo se permiten cuentas institucionales (@upq.edu.mx).',
                'http_code', 403
            )
        );
    end if;
    return '{}'::jsonb;
end;
$$;

revoke all on function public.is_signup_allowed(text) from public, anon, authenticated, service_role;
revoke all on function public.enforce_signup_allowlist() from public, anon, authenticated, service_role;
revoke all on function public.hook_before_user_created(jsonb) from public, anon, authenticated, service_role;
grant execute on function public.is_signup_allowed(text) to supabase_auth_admin;
grant execute on function public.hook_before_user_created(jsonb) to supabase_auth_admin;

-- ---------------------------------------------------------------------------
-- 2. PERFILES PRIVADOS CON APODO
-- ---------------------------------------------------------------------------
-- Ya no se guarda el nombre real de Google ni se deriva el usuario del correo
-- (traería nombres y matrículas). El apodo lo elige el alumno.
alter table public.profiles drop column if exists full_name;
alter table public.profiles add column if not exists has_chosen_username boolean not null default false;

-- Borra los nombres automáticos de v1 (derivados del correo) en perfiles que no eligieron apodo.
update public.profiles
   set username = 'jugador_' || SUBSTR(REPLACE(id::text, '-', ''), 1, 8)
 where not has_chosen_username;

create unique index if not exists profiles_username_lower_key on public.profiles (LOWER(username));

alter table public.profiles drop constraint if exists profiles_username_format;
alter table public.profiles add constraint profiles_username_format
    check (username ~ '^[A-Za-z0-9_.ñÑáéíóúÁÉÍÓÚüÜ-]{3,20}$');

-- Perfil automático al registrarse: apodo aleatorio, sin datos personales.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_username text;
begin
    loop
        v_username := 'jugador_' || SUBSTR(REPLACE(gen_random_uuid()::text, '-', ''), 1, 8);
        exit when not exists (
            select 1 from public.profiles where LOWER(username) = v_username
        );
    end loop;

    insert into public.profiles (id, username)
    values (NEW.id, v_username)
    on conflict (id) do nothing;

    return NEW;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 3. PERMISOS Y RLS: NADA SE ESCRIBE DIRECTO, SOLO LO PROPIO SE LEE
-- ---------------------------------------------------------------------------
revoke all on public.profiles, public.high_scores, public.game_history from public, anon, authenticated;

grant select on public.profiles, public.high_scores, public.game_history to authenticated;

drop policy if exists "Perfiles visibles para todos" on public.profiles;
drop policy if exists "Usuarios pueden insertar su propio perfil" on public.profiles;
drop policy if exists "Usuarios pueden actualizar su propio perfil" on public.profiles;
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
    for select to authenticated using (auth.uid() = id);

drop policy if exists "Récords visibles para ranking global" on public.high_scores;
drop policy if exists "Usuarios borran sus propios récords" on public.high_scores;
drop policy if exists high_scores_select_own on public.high_scores;
create policy high_scores_select_own on public.high_scores
    for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Usuarios ven su propio historial" on public.game_history;
drop policy if exists "Usuarios borran su propio historial" on public.game_history;
drop policy if exists game_history_select_own on public.game_history;
create policy game_history_select_own on public.game_history
    for select to authenticated using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 4. REGLAS DE LOS JUEGOS EN EL SERVIDOR
-- ---------------------------------------------------------------------------
-- Puntaje máximo alcanzable (debe coincidir con src/games/*/logic.ts):
--   Memorama 6 parejas × 100 = 600 · Bomba 5 aciertos × 50 = 250
--   Carrera: meta + 40 → Fácil 340, Normal 540, Difícil 840
-- Devuelve NULL si el juego o la dificultad no existen.
create or replace function public.game_max_score(p_game text, p_difficulty text)
returns integer
language sql
immutable
set search_path = ''
as $$
    select case p_game
        when 'memory' then 600
        when 'bomb' then 250
        when 'race' then case p_difficulty
            when 'Fácil' then 340
            when 'Normal' then 540
            when 'Difícil' then 840
        end
    end;
$$;

-- Dificultad que se guarda: solo Carrera la usa; en los demás juegos siempre es Normal.
create or replace function public.normalize_difficulty(p_game text, p_difficulty text)
returns text
language sql
immutable
set search_path = ''
as $$
    select case when p_game = 'race' then COALESCE(NULLIF(BTRIM(p_difficulty), ''), 'Normal') else 'Normal' end;
$$;

create or replace function public.assert_valid_game_entry(
    p_topic text, p_subtopic text, p_game text, p_difficulty text
)
returns void
language plpgsql
immutable
set search_path = ''
as $$
begin
    if p_topic is null or p_topic not in ('fundamentos', 'diferencial', 'integral')
       or p_subtopic is null or not (p_subtopic = 'todos' or p_subtopic ~ '^[a-z0-9_]{3,40}$')
       or public.game_max_score(p_game, p_difficulty) is null then
        raise exception 'invalid_game_data' using errcode = '22023';
    end if;
end;
$$;

revoke all on function public.game_max_score(text, text) from public, anon, authenticated, service_role;
revoke all on function public.normalize_difficulty(text, text) from public, anon, authenticated, service_role;
revoke all on function public.assert_valid_game_entry(text, text, text, text) from public, anon, authenticated, service_role;

-- Guardar una partida: historial, récord personal y contadores del perfil.
create or replace function public.record_game_result(
    p_topic text,
    p_subtopic text,
    p_game text,
    p_difficulty text,
    p_score integer,
    p_won boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user_id uuid := auth.uid();
    v_subtopic text := COALESCE(NULLIF(BTRIM(p_subtopic), ''), 'todos');
    v_difficulty text := public.normalize_difficulty(p_game, p_difficulty);
    v_won boolean := COALESCE(p_won, false);
    v_score integer;
    v_prev_best integer;
    v_best integer;
begin
    if v_user_id is null then
        raise exception 'not_authenticated' using errcode = '28000';
    end if;

    perform public.assert_valid_game_entry(p_topic, v_subtopic, p_game, v_difficulty);

    if p_score is null or p_score > public.game_max_score(p_game, v_difficulty) then
        raise exception 'score_out_of_range' using errcode = '22003';
    end if;
    -- Un puntaje muy negativo solo es una mala partida: no se rechaza, se acota.
    v_score := GREATEST(p_score, -1000);

    insert into public.game_history (user_id, topic, subtopic, game, difficulty, score, won)
    values (v_user_id, p_topic, v_subtopic, p_game, v_difficulty, v_score, v_won);

    select best_score into v_prev_best
      from public.high_scores
     where user_id = v_user_id and topic = p_topic and subtopic = v_subtopic
       and game = p_game and difficulty = v_difficulty;

    -- El récord parte de 0: un puntaje de 0 o negativo nunca es récord.
    insert into public.high_scores (user_id, topic, subtopic, game, difficulty, best_score, attempts, updated_at)
    values (v_user_id, p_topic, v_subtopic, p_game, v_difficulty, GREATEST(v_score, 0), 1, NOW())
    on conflict (user_id, topic, subtopic, game, difficulty) do update
        set best_score = GREATEST(public.high_scores.best_score, EXCLUDED.best_score),
            attempts = public.high_scores.attempts + 1,
            updated_at = case
                when EXCLUDED.best_score > public.high_scores.best_score then NOW()
                else public.high_scores.updated_at
            end
    returning best_score into v_best;

    update public.profiles
       set total_games_played = total_games_played + 1,
           total_wins = total_wins + (case when v_won then 1 else 0 end),
           updated_at = NOW()
     where id = v_user_id;

    return jsonb_build_object(
        'is_new_record', v_score > COALESCE(v_prev_best, 0),
        'best_score', v_best
    );
end;
$$;

-- Elegir o cambiar el apodo del ranking.
create or replace function public.set_username(p_username text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user_id uuid := auth.uid();
    v_username text := BTRIM(COALESCE(p_username, ''));
begin
    if v_user_id is null then
        raise exception 'not_authenticated' using errcode = '28000';
    end if;
    -- "jugador_…" es el prefijo de los apodos automáticos: no se puede elegir.
    if v_username !~ '^[A-Za-z0-9_.ñÑáéíóúÁÉÍÓÚüÜ-]{3,20}$'
       or LOWER(v_username) like 'jugador\_%' then
        raise exception 'username_invalid' using errcode = '22023';
    end if;

    begin
        update public.profiles
           set username = v_username, has_chosen_username = true, updated_at = NOW()
         where id = v_user_id;
    exception when unique_violation then
        raise exception 'username_taken' using errcode = '23505';
    end;

    return v_username;
end;
$$;

-- Ranking: solo con sesión, solo apodos elegidos, sin ids ni datos personales.
create or replace function public.get_leaderboard(
    p_topic text,
    p_subtopic text,
    p_game text,
    p_difficulty text,
    p_limit integer default 10
)
returns table (rank bigint, username text, best_score integer, is_me boolean)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
    v_subtopic text := COALESCE(NULLIF(BTRIM(p_subtopic), ''), 'todos');
    v_difficulty text := public.normalize_difficulty(p_game, p_difficulty);
begin
    if auth.uid() is null then
        raise exception 'not_authenticated' using errcode = '28000';
    end if;
    perform public.assert_valid_game_entry(p_topic, v_subtopic, p_game, v_difficulty);

    return query
    select ROW_NUMBER() over (order by hs.best_score desc, hs.updated_at asc, p.username),
           p.username,
           hs.best_score,
           hs.user_id = auth.uid()
      from public.high_scores hs
      join public.profiles p on p.id = hs.user_id
     where p.has_chosen_username
       and hs.best_score > 0
       and hs.topic = p_topic and hs.subtopic = v_subtopic
       and hs.game = p_game and hs.difficulty = v_difficulty
     order by 1
     limit LEAST(GREATEST(COALESCE(p_limit, 10), 1), 50);
end;
$$;

-- Pasar los récords del modo invitado a la cuenta: solo sube los que superan a los de la nube.
-- No toca el historial ni los contadores (no son partidas jugadas con esta cuenta).
-- Si algún elemento es inválido se rechaza todo (el cliente ya filtra con las mismas reglas).
create or replace function public.import_best_scores(p_records jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user_id uuid := auth.uid();
    v_item jsonb;
    v_subtopic text;
    v_difficulty text;
    v_score integer;
    v_changed integer := 0;
    v_rows integer;
begin
    if v_user_id is null then
        raise exception 'not_authenticated' using errcode = '28000';
    end if;
    if p_records is null or jsonb_typeof(p_records) <> 'array' or jsonb_array_length(p_records) > 200 then
        raise exception 'invalid_game_data' using errcode = '22023';
    end if;

    for v_item in select * from jsonb_array_elements(p_records) loop
        if jsonb_typeof(v_item) <> 'object' or jsonb_typeof(v_item -> 'score') <> 'number' then
            raise exception 'invalid_game_data' using errcode = '22023';
        end if;
        v_subtopic := COALESCE(NULLIF(BTRIM(v_item ->> 'subtopic'), ''), 'todos');
        v_difficulty := public.normalize_difficulty(v_item ->> 'game', v_item ->> 'difficulty');
        perform public.assert_valid_game_entry(v_item ->> 'topic', v_subtopic, v_item ->> 'game', v_difficulty);

        v_score := (v_item ->> 'score')::numeric::integer;
        if v_score > public.game_max_score(v_item ->> 'game', v_difficulty) then
            raise exception 'score_out_of_range' using errcode = '22003';
        end if;
        continue when v_score <= 0; -- nada que importar

        insert into public.high_scores (user_id, topic, subtopic, game, difficulty, best_score, attempts, updated_at)
        values (v_user_id, v_item ->> 'topic', v_subtopic, v_item ->> 'game', v_difficulty, v_score, 0, NOW())
        on conflict (user_id, topic, subtopic, game, difficulty) do update
            set best_score = EXCLUDED.best_score, updated_at = NOW()
            where EXCLUDED.best_score > public.high_scores.best_score;
        get diagnostics v_rows = row_count;
        v_changed := v_changed + v_rows;
    end loop;

    return jsonb_build_object('imported', v_changed);
end;
$$;

-- Borrar el progreso (récords, historial y contadores) sin borrar la cuenta.
create or replace function public.clear_my_progress()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user_id uuid := auth.uid();
begin
    if v_user_id is null then
        raise exception 'not_authenticated' using errcode = '28000';
    end if;
    delete from public.high_scores where user_id = v_user_id;
    delete from public.game_history where user_id = v_user_id;
    update public.profiles
       set total_games_played = 0, total_wins = 0, updated_at = NOW()
     where id = v_user_id;
end;
$$;

-- Borrar la cuenta y todos sus datos (los perfiles, récords e historial caen en cascada).
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    if auth.uid() is null then
        raise exception 'not_authenticated' using errcode = '28000';
    end if;
    delete from auth.users where id = auth.uid();
end;
$$;

-- Solo usuarios con sesión pueden llamar a estas funciones.
do $$
declare
    fn text;
begin
    foreach fn in array array[
        'public.record_game_result(text, text, text, text, integer, boolean)',
        'public.set_username(text)',
        'public.get_leaderboard(text, text, text, text, integer)',
        'public.import_best_scores(jsonb)',
        'public.clear_my_progress()',
        'public.delete_my_account()'
    ] loop
        execute format('revoke all on function %s from public, anon, authenticated, service_role', fn);
        execute format('grant execute on function %s to authenticated', fn);
    end loop;
end $$;
