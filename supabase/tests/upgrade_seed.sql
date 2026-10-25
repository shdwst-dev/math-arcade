-- Datos como los dejaría v1 (esquema original) antes de aplicar las migraciones nuevas.
insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'maria.perez@gmail.com', '{"username":"maria","full_name":"María Pérez"}'),
  ('22222222-2222-2222-2222-222222222222', 'beto.lopez@upq.edu.mx', '{}');

insert into public.high_scores (user_id, topic, subtopic, game, difficulty, best_score, attempts) values
  ('11111111-1111-1111-1111-111111111111', 'integral', 'todos', 'race', 'Difícil', 700, 4),
  ('22222222-2222-2222-2222-222222222222', 'fundamentos', 'matrices', 'memory', 'Normal', 500, 2);
insert into public.game_history (user_id, topic, subtopic, game, difficulty, score, won) values
  ('11111111-1111-1111-1111-111111111111', 'integral', 'todos', 'race', 'Difícil', 700, true);
update public.profiles set total_games_played = 5, total_wins = 2
 where id = '11111111-1111-1111-1111-111111111111';
