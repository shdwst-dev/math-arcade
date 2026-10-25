-- Qué puede leer y escribir cada rol. Dos alumnos (A y B) con datos propios.
select t.reset();

insert into auth.users (id, email) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'maria.perez@upq.edu.mx'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'beto.lopez@upq.edu.mx');

-- Datos de ejemplo escritos como dueño de la base (así los escribe la RPC).
insert into public.high_scores (user_id, topic, subtopic, game, difficulty, best_score)
values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'integral', 'todos', 'memory', 'Normal', 300),
       ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'integral', 'todos', 'memory', 'Normal', 500);
insert into public.game_history (user_id, topic, subtopic, game, difficulty, score, won)
values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'integral', 'todos', 'memory', 'Normal', 300, true),
       ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'integral', 'todos', 'memory', 'Normal', 500, true);

-- ---- Sin sesión (anon): no ve nada ----
set role anon;
select t.throws($$select * from public.profiles$$, 'permission denied', 'anónimo no lee perfiles');
select t.throws($$select * from public.high_scores$$, 'permission denied', 'anónimo no lee récords');
select t.throws($$select * from public.game_history$$, 'permission denied', 'anónimo no lee el historial');
select t.throws($$insert into public.profiles (id, username) values (gen_random_uuid(), 'intruso')$$, 'permission denied', 'anónimo no crea perfiles');
reset role;

-- ---- Alumna A ----
set role authenticated;
select t.login('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

select t.eq((select count(*)::text from public.profiles), '1', 'A solo ve su propio perfil (no el de B)');
select t.eq((select id::text from public.profiles), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'el perfil que ve es el suyo');
select t.eq((select count(*)::text from public.high_scores), '1', 'A solo ve sus propios récords');
select t.eq((select best_score::text from public.high_scores), '300', 'y es el suyo');
select t.eq((select count(*)::text from public.game_history), '1', 'A solo ve su propio historial');
select t.eq((select count(*)::text from public.profiles where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'), '0', 'pedir el perfil de B directamente no devuelve nada');

-- Ningún cambio directo a las tablas: todo pasa por funciones que validan.
select t.throws($$update public.profiles set username = 'hacker' where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'$$, 'permission denied', 'A no puede cambiar su apodo saltándose la validación');
select t.throws($$update public.profiles set has_chosen_username = true where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'$$, 'permission denied', 'A no puede marcar que eligió apodo');
select t.throws($$update public.profiles set total_wins = 999 where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'$$, 'permission denied', 'A no puede inventar victorias');
select t.throws($$insert into public.profiles (id, username) values (gen_random_uuid(), 'otro_perfil')$$, 'permission denied', 'A no puede crear perfiles');
select t.throws($$delete from public.profiles where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'$$, 'permission denied', 'A no puede borrar su perfil directamente');
select t.throws($$insert into public.high_scores (user_id, topic, subtopic, game, difficulty, best_score) values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'integral', 'todos', 'bomb', 'Normal', 99999)$$, 'permission denied', 'A no puede escribir un récord inventado');
select t.throws($$update public.high_scores set best_score = 99999$$, 'permission denied', 'A no puede subirse un récord');
select t.throws($$delete from public.high_scores$$, 'permission denied', 'A no puede borrar récords directamente');
select t.throws($$insert into public.game_history (user_id, topic, subtopic, game, difficulty, score, won) values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'integral', 'todos', 'bomb', 'Normal', 250, true)$$, 'permission denied', 'A no puede escribir historial inventado');
select t.throws($$update public.game_history set score = 250$$, 'permission denied', 'A no puede editar su historial');
select t.throws($$delete from public.game_history$$, 'permission denied', 'A no puede borrar historial directamente');

-- Tampoco a nombre de otra persona.
select t.throws($$insert into public.high_scores (user_id, topic, subtopic, game, difficulty, best_score) values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'integral', 'todos', 'bomb', 'Normal', 1)$$, 'permission denied', 'A no puede escribir récords a nombre de B');
reset role;

-- Los datos de B siguieron intactos.
select t.eq((select best_score::text from public.high_scores where user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'), '500', 'el récord de B no cambió');
select t.eq(((select username from public.profiles where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') ~ '^jugador_')::text, 'true', 'el apodo de A no cambió');

-- ---- Sin sesión pero con rol authenticated (token sin sub): no ve nada ----
set role authenticated;
select t.logout();
select t.eq((select count(*)::text from public.profiles), '0', 'sin identidad no se ve ningún perfil');
select t.eq((select count(*)::text from public.high_scores), '0', 'sin identidad no se ve ningún récord');
reset role;

-- ---- Privacidad de los datos ----
select t.eq((select count(*)::text from public.profiles where username ilike '%maria%' or username ilike '%perez%' or username ilike '%beto%'), '0',
  'ningún apodo automático sale del correo');
select t.eq((select count(*)::text from information_schema.columns
              where table_schema = 'public' and table_name = 'profiles'
                and column_name in ('full_name', 'email', 'name')), '0', 'el perfil no tiene columnas de datos personales');

select t.finish();
