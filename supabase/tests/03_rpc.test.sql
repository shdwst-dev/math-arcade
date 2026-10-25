-- Las funciones que usa la app: apodo, guardar partida, ranking, importar, borrar.
select t.reset();

insert into auth.users (id, email) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a@upq.edu.mx'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b@upq.edu.mx'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'c@upq.edu.mx');

-- ====================== set_username ======================
set role anon;
select t.throws($$select public.set_username('Anonimo')$$, 'permission denied', 'anónimo no puede elegir apodo');
reset role;

set role authenticated;
select t.login('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
select t.throws($$select public.set_username(null)$$, 'username_invalid', 'apodo nulo');
select t.throws($$select public.set_username('ab')$$, 'username_invalid', 'apodo de 2 letras');
select t.throws($$select public.set_username('  ab  ')$$, 'username_invalid', 'los espacios no cuentan para el largo');
select t.throws($$select public.set_username('abcdefghijklmnopqrstu')$$, 'username_invalid', 'apodo de 21 letras');
select t.throws($$select public.set_username('con espacio')$$, 'username_invalid', 'apodo con espacio');
select t.throws($$select public.set_username('a@b.com')$$, 'username_invalid', 'apodo con arroba');
select t.throws($$select public.set_username('<script>')$$, 'username_invalid', 'apodo con caracteres de HTML');
select t.throws($$select public.set_username('jugador_hack')$$, 'username_invalid', 'no se puede imitar el apodo automático');
select t.throws($$select public.set_username('JUGADOR_X1')$$, 'username_invalid', 'ni en mayúsculas');
select t.eq(public.set_username('  Ana_M  '), 'Ana_M', 'elige un apodo válido (se recortan los espacios)');
select t.eq((select username from public.profiles), 'Ana_M', 'el apodo quedó guardado');
select t.eq((select has_chosen_username::text from public.profiles), 'true', 'y queda marcado como elegido');
select t.eq(public.set_username('Ñandú.2'), 'Ñandú.2', 'acepta ñ y acentos');
select t.eq(public.set_username('Ana_M'), 'Ana_M', 'puede volver a su propio apodo');
reset role;

set role authenticated;
select t.login('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
select t.throws($$select public.set_username('ana_m')$$, 'username_taken', 'rechaza un apodo ya usado (sin importar mayúsculas)');
select t.throws($$select public.set_username('ANA_M')$$, 'username_taken', 'ni en mayúsculas');
select t.eq(public.set_username('Beto.2'), 'Beto.2', 'otro alumno elige otro apodo');
reset role;
select t.eq((select username from public.profiles where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), 'Ana_M', 'el intento de B no cambió el apodo de A');

-- ====================== record_game_result ======================
set role anon;
select t.throws($$select public.record_game_result('integral','todos','memory','Normal',100,true)$$, 'permission denied', 'anónimo no puede guardar partidas');
reset role;

set role authenticated;
select t.login('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

select t.eq((public.record_game_result('fundamentos','productos_notables','memory','Normal',600,true)) ->> 'is_new_record', 'true', 'la primera partida con puntos es récord');
select t.eq((public.record_game_result('fundamentos','productos_notables','memory','Normal',600,true)) ->> 'is_new_record', 'false', 'empatar no es récord');
select t.eq((public.record_game_result('fundamentos','productos_notables','memory','Normal',100,false)) ->> 'best_score', '600', 'una partida peor no baja el récord');
select t.eq((select attempts::text from public.high_scores where subtopic = 'productos_notables' and game = 'memory'), '3', 'cuenta los intentos');
select t.eq((select count(*)::text from public.game_history where subtopic = 'productos_notables'), '3', 'guarda cada partida en el historial');
select t.eq((select total_games_played || '/' || total_wins from public.profiles), '3/2', 'contadores del perfil: 3 partidas, 2 victorias');

-- Límites reales por juego y dificultad (el máximo es válido; un punto más, no).
select t.lives($$select public.record_game_result('integral','todos','bomb','Normal',250,true)$$, 'Bomba: 250 es válido');
select t.throws($$select public.record_game_result('integral','todos','bomb','Normal',251,true)$$, 'score_out_of_range', 'Bomba: 251 se rechaza');
select t.throws($$select public.record_game_result('integral','todos','memory','Normal',601,true)$$, 'score_out_of_range', 'Memorama: 601 se rechaza');
select t.lives($$select public.record_game_result('integral','todos','race','Fácil',340,true)$$, 'Carrera Fácil: 340 es válido');
select t.throws($$select public.record_game_result('integral','todos','race','Fácil',341,true)$$, 'score_out_of_range', 'Carrera Fácil: 341 se rechaza');
select t.lives($$select public.record_game_result('integral','todos','race','Normal',540,true)$$, 'Carrera Normal: 540 es válido');
select t.throws($$select public.record_game_result('integral','todos','race','Normal',541,true)$$, 'score_out_of_range', 'Carrera Normal: 541 se rechaza');
select t.lives($$select public.record_game_result('integral','todos','race','Difícil',840,true)$$, 'Carrera Difícil: 840 es válido');
select t.throws($$select public.record_game_result('integral','todos','race','Difícil',841,true)$$, 'score_out_of_range', 'Carrera Difícil: 841 se rechaza');
select t.throws($$select public.record_game_result('integral','todos','race','Fácil',840,true)$$, 'score_out_of_range', 'no se puede usar el máximo de Difícil en Fácil');
select t.throws($$select public.record_game_result('integral','todos','memory','Normal',null,true)$$, 'score_out_of_range', 'puntaje nulo');
select t.throws($$select public.record_game_result('integral','todos','memory','Normal',2147483647,true)$$, 'score_out_of_range', 'puntaje enorme');

-- Datos inválidos
select t.throws($$select public.record_game_result('geometria','todos','memory','Normal',10,true)$$, 'invalid_game_data', 'tema inexistente');
select t.throws($$select public.record_game_result('integral','todos','ajedrez','Normal',10,true)$$, 'invalid_game_data', 'juego inexistente');
select t.throws($$select public.record_game_result('integral','todos','race','Imposible',10,true)$$, 'invalid_game_data', 'dificultad inexistente en Carrera');
select t.throws($$select public.record_game_result('integral','Bad Sub!','memory','Normal',10,true)$$, 'invalid_game_data', 'subtema con caracteres raros');
select t.throws($$select public.record_game_result('integral','a','memory','Normal',10,true)$$, 'invalid_game_data', 'subtema demasiado corto');
select t.throws($$select public.record_game_result(null,'todos','memory','Normal',10,true)$$, 'invalid_game_data', 'tema nulo');

-- Los intentos rechazados no dejaron rastro
select t.eq((select count(*)::text from public.game_history where score > 840), '0', 'no quedó ninguna partida imposible en el historial');

-- Dificultad: en los juegos que no la usan siempre se guarda Normal
select t.lives($$select public.record_game_result('diferencial','limites','memory','Difícil',100,true)$$, 'Memorama ignora la dificultad que mande el cliente');
select t.lives($$select public.record_game_result('diferencial','limites','memory','Fácil',200,true)$$, 'segunda partida con otra "dificultad"');
select t.eq((select count(*)::text || '/' || max(best_score)::text from public.high_scores where subtopic = 'limites' and game = 'memory'), '1/200', 'queda un solo récord de Memorama por subtema');
select t.eq((select difficulty from public.high_scores where subtopic = 'limites' and game = 'memory'), 'Normal', 'guardado como Normal');

-- Subtema vacío = todos; ganar es opcional
select t.lives($$select public.record_game_result('diferencial','','bomb','Normal',50,null)$$, 'subtema vacío y "ganó" nulo');
select t.eq((select count(*)::text from public.high_scores where subtopic = 'todos' and topic = 'diferencial' and game = 'bomb'), '1', 'el subtema vacío se guarda como "todos"');

-- Puntajes de 0 o negativos nunca son récord
select t.eq((public.record_game_result('integral','sumas_riemann','bomb','Normal',0,false)) ->> 'is_new_record', 'false', 'puntaje 0: no es récord');
select t.eq((public.record_game_result('integral','sumas_riemann','bomb','Normal',0,false)) ->> 'best_score', '0', 'y el mejor sigue en 0');
select t.eq((public.record_game_result('integral','por_partes','bomb','Normal',-80,false)) ->> 'is_new_record', 'false', 'puntaje negativo: no es récord');
select t.eq((public.record_game_result('integral','por_partes','bomb','Normal',-5000,false)) ->> 'best_score', '0', 'un puntaje muy negativo se acota y no baja el récord');
select t.eq((select min(score)::text from public.game_history), '-1000', 'el historial acota los puntajes a −1000');
reset role;

-- ====================== get_leaderboard ======================
-- Tres alumnos en integral / por_partes / Carrera Normal. C no ha elegido apodo.
insert into public.high_scores (user_id, topic, subtopic, game, difficulty, best_score, updated_at) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'integral', 'por_partes', 'race', 'Normal', 300, '2026-01-02'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'integral', 'por_partes', 'race', 'Normal', 400, '2026-01-03'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'integral', 'por_partes', 'race', 'Normal', 540, '2026-01-01');

set role anon;
select t.throws($$select * from public.get_leaderboard('integral','por_partes','race','Normal')$$, 'permission denied', 'anónimo no ve el ranking');
reset role;

set role authenticated;
select t.login('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
select t.eq((select string_agg(rank || ':' || username || ':' || best_score || ':' || is_me, ' | ' order by rank)
               from public.get_leaderboard('integral','por_partes','race','Normal')),
  '1:Beto.2:400:false | 2:Ana_M:300:true',
  'el ranking ordena por puntaje, marca "yo" y excluye a quien no eligió apodo');
select t.eq((select count(*)::text from public.get_leaderboard('integral','por_partes','race','Normal', 1)), '1', 'respeta el límite');
select t.eq((select count(*)::text from public.get_leaderboard('integral','por_partes','race','Normal', 0)), '1', 'un límite de 0 devuelve al menos 1');
select t.eq((select count(*)::text from public.get_leaderboard('integral','por_partes','race','Normal', 100000)), '2', 'un límite enorme se acota (y no falla)');
select t.eq((select count(*)::text from public.get_leaderboard('integral','por_partes','race','Fácil')), '0', 'otra dificultad es otro ranking');
select t.eq((select count(*)::text from public.get_leaderboard('integral','funciones','race','Normal')), '0', 'otro subtema es otro ranking');
select t.throws($$select * from public.get_leaderboard('integral','por_partes','ajedrez','Normal')$$, 'invalid_game_data', 'juego inválido');
select t.eq((select count(*)::text from public.get_leaderboard('integral','por_partes','memory','Fácil')), '0', 'Memorama ignora la dificultad pedida');
reset role;

-- Empate: gana quien llegó primero
insert into public.high_scores (user_id, topic, subtopic, game, difficulty, best_score, updated_at) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'integral', 'limites', 'bomb', 'Normal', 200, '2026-02-02'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'integral', 'limites', 'bomb', 'Normal', 200, '2026-02-01');
set role authenticated;
select t.login('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
select t.eq((select string_agg(username, ',' order by rank) from public.get_leaderboard('integral','limites','bomb','Normal')), 'Beto.2,Ana_M', 'en un empate va primero quien lo logró antes');
-- Los récords en 0 no aparecen
reset role;
select t.eq((select count(*)::text from public.high_scores where best_score = 0), '2', 'hay récords en 0 guardados (partidas sin puntos)');
set role authenticated;
select t.login('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
select t.eq((select count(*)::text from public.get_leaderboard('integral','sumas_riemann','bomb','Normal')), '0', 'pero no se muestran en el ranking');
reset role;

-- ====================== import_best_scores ======================
set role authenticated;
select t.login('cccccccc-cccc-cccc-cccc-cccccccccccc');
select t.eq((public.import_best_scores('[{"topic":"integral","subtopic":"todos","game":"race","difficulty":"Difícil","score":800},{"topic":"fundamentos","subtopic":"matrices","game":"memory","difficulty":"Normal","score":500}]'::jsonb)) ->> 'imported', '2', 'importa dos récords del modo invitado');
select t.eq((select count(*)::text from public.game_history), '0', 'importar no crea historial');
select t.eq((select total_games_played::text from public.profiles), '0', 'ni cuenta partidas jugadas');
select t.eq((select attempts::text from public.high_scores where game = 'memory' and subtopic = 'matrices'), '0', 'los intentos importados son 0');
select t.eq((public.import_best_scores('[{"topic":"integral","subtopic":"todos","game":"race","difficulty":"Difícil","score":700}]'::jsonb)) ->> 'imported', '0', 'un récord menor al de la nube no lo reemplaza');
select t.eq((select best_score::text from public.high_scores where game = 'race' and difficulty = 'Difícil' and subtopic = 'todos'), '800', 'se queda el mayor');
select t.eq((public.import_best_scores('[{"topic":"integral","subtopic":"todos","game":"race","difficulty":"Difícil","score":820}]'::jsonb)) ->> 'imported', '1', 'uno mayor sí lo reemplaza');
select t.eq((public.import_best_scores('[{"topic":"integral","subtopic":"todos","game":"bomb","difficulty":"Normal","score":0},{"topic":"integral","subtopic":"todos","game":"bomb","difficulty":"Normal","score":-5}]'::jsonb)) ->> 'imported', '0', 'puntajes de 0 o negativos se omiten');
select t.eq((public.import_best_scores('[]'::jsonb)) ->> 'imported', '0', 'una lista vacía no hace nada');

-- Una entrada inválida rechaza TODO el lote (nada a medias)
select t.throws($$select public.import_best_scores('[{"topic":"integral","subtopic":"limites","game":"bomb","difficulty":"Normal","score":100},{"topic":"integral","subtopic":"limites","game":"bomb","difficulty":"Normal","score":9999}]'::jsonb)$$, 'score_out_of_range', 'un puntaje imposible rechaza el lote');
select t.eq((select count(*)::text from public.high_scores where subtopic = 'limites'), '0', 'y no importó ni la parte válida');
select t.throws($$select public.import_best_scores('[{"topic":"x","subtopic":"todos","game":"bomb","difficulty":"Normal","score":1}]'::jsonb)$$, 'invalid_game_data', 'tema inválido');
select t.throws($$select public.import_best_scores('[{"topic":"integral","game":"bomb","score":"mucho"}]'::jsonb)$$, 'invalid_game_data', 'puntaje que no es número');
select t.throws($$select public.import_best_scores('{"a":1}'::jsonb)$$, 'invalid_game_data', 'lo que no es una lista');
select t.throws($$select public.import_best_scores(null)$$, 'invalid_game_data', 'nulo');
select t.throws($$select public.import_best_scores((select jsonb_agg(jsonb_build_object('topic','integral','subtopic','todos','game','bomb','difficulty','Normal','score',1)) from generate_series(1, 201)))$$, 'invalid_game_data', 'más de 200 elementos');
reset role;
set role anon;
select t.throws($$select public.import_best_scores('[]'::jsonb)$$, 'permission denied', 'anónimo no puede importar');
reset role;

-- ====================== clear_my_progress ======================
set role authenticated;
select t.login('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
select t.lives($$select public.clear_my_progress()$$, 'A borra su progreso');
select t.eq((select count(*)::text from public.high_scores), '0', 'sin récords');
select t.eq((select count(*)::text from public.game_history), '0', 'sin historial');
select t.eq((select total_games_played || '/' || total_wins from public.profiles), '0/0', 'contadores en cero');
select t.eq((select username from public.profiles), 'Ana_M', 'pero conserva su cuenta y apodo');
reset role;
select t.eq((select count(*)::text from public.high_scores where user_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'), '3', 'el progreso de otros alumnos no se tocó');
set role anon;
select t.throws($$select public.clear_my_progress()$$, 'permission denied', 'anónimo no puede borrar progreso');
reset role;

-- ====================== delete_my_account ======================
set role anon;
select t.throws($$select public.delete_my_account()$$, 'permission denied', 'anónimo no puede borrar cuentas');
reset role;
set role authenticated;
select t.login('cccccccc-cccc-cccc-cccc-cccccccccccc');
select t.lives($$select public.delete_my_account()$$, 'C borra su cuenta');
reset role;
select t.eq((select count(*)::text from auth.users where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'), '0', 'el usuario desapareció');
select t.eq((select count(*)::text from public.profiles where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'), '0', 'su perfil también');
select t.eq((select count(*)::text from public.high_scores where user_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'), '0', 'y sus récords');
select t.eq((select count(*)::text from auth.users), '2', 'los demás usuarios siguen');
select t.eq((select count(*)::text from public.profiles), '2', 'con sus perfiles');

select t.finish();
