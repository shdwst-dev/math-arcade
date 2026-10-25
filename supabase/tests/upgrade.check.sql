-- Qué debe pasar con los datos de v1 al aplicar la migración nueva.
select t.reset_results();

select t.eq((select count(*)::text from information_schema.columns
              where table_schema = 'public' and table_name = 'profiles' and column_name = 'full_name'), '0',
  'se eliminó la columna full_name');
select t.eq((select count(*)::text from public.profiles where username !~ '^jugador_[0-9a-f]{8}$'), '0',
  'los nombres derivados del correo se reemplazaron por apodos aleatorios');
select t.eq((select count(*)::text from public.profiles where username ilike '%maria%' or username ilike '%beto%'), '0',
  'no queda rastro del nombre ni del correo en los perfiles');
select t.eq((select count(*)::text from public.profiles where has_chosen_username), '0',
  'todos deberán elegir su apodo (quedan fuera del ranking mientras tanto)');
select t.eq((select count(*)::text from auth.users), '2',
  'no se borró ninguna cuenta existente (ni la de un correo que ya no podría registrarse)');
select t.eq((select count(*)::text from public.high_scores), '2', 'se conservan los récords');
select t.eq((select best_score::text from public.high_scores where game = 'race'), '700', 'con sus puntajes');
select t.eq((select count(*)::text from public.game_history), '1', 'se conserva el historial');
select t.eq((select total_games_played || '/' || total_wins from public.profiles
              where id = '11111111-1111-1111-1111-111111111111'), '5/2', 'se conservan los contadores');

-- Las cuentas anteriores ya no ven a los demás: la lectura quedó privada.
set role authenticated;
select t.login('22222222-2222-2222-2222-222222222222');
select t.eq((select count(*)::text from public.profiles), '1', 'cada quien ve solo su propio perfil');
select t.eq((select count(*)::text from public.high_scores), '1', 'y solo sus propios récords');
reset role;

-- Un correo no institucional sigue sin poder registrarse nuevo.
select t.throws($$insert into auth.users (email) values ('nueva@gmail.com')$$, 'signup_domain_not_allowed',
  'las cuentas nuevas sí deben ser institucionales');

select t.finish();
