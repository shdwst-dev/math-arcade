-- Quién puede registrarse: dominio institucional validado EN EL SERVIDOR.
select t.reset();

select t.throws($$insert into auth.users (email) values ('alumno@gmail.com')$$,
  'signup_domain_not_allowed', 'rechaza correos de otros dominios');
select t.throws($$insert into auth.users (email) values ('alumno@upq.edu.mx.evil.com')$$,
  'signup_domain_not_allowed', 'rechaza un dominio que solo empieza igual');
select t.throws($$insert into auth.users (email) values ('alumno@evil.upq.edu.mx')$$,
  'signup_domain_not_allowed', 'rechaza subdominios que no están en la lista');
select t.throws($$insert into auth.users (email) values ('a@b@upq.edu.mx')$$,
  'signup_domain_not_allowed', 'rechaza correos con dos arrobas');
select t.throws($$insert into auth.users (email) values ('alumno@upq.edu.mx@evil.com')$$,
  'signup_domain_not_allowed', 'rechaza un correo que esconde el dominio permitido entre arrobas');
select t.throws($$insert into auth.users (email) values ('alumno con espacio@upq.edu.mx')$$,
  'signup_domain_not_allowed', 'rechaza correos con espacios en medio');
select t.throws($$insert into auth.users (email) values ('upq.edu.mx')$$,
  'signup_domain_not_allowed', 'rechaza un texto sin arroba');
select t.throws($$insert into auth.users (email) values (null)$$,
  'signup_domain_not_allowed', 'rechaza el alta sin correo');
select t.throws($$insert into auth.users (email) values ('')$$,
  'signup_domain_not_allowed', 'rechaza correo vacío');
select t.eq((select count(*)::text from auth.users), '0', 'no se creó ningún usuario con los intentos rechazados');

select t.lives($$insert into auth.users (id, email) values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Alumno.Uno@UPQ.EDU.MX')$$,
  'acepta @upq.edu.mx sin importar las mayúsculas');
select t.lives($$insert into auth.users (id, email) values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '  alumno.dos@upq.edu.mx ')$$,
  'acepta @upq.edu.mx con espacios alrededor');

-- Cambiar el correo después también está protegido.
select t.throws($$update auth.users set email = 'otro@gmail.com' where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'$$,
  'signup_domain_not_allowed', 'no deja cambiar el correo a otro dominio');
select t.lives($$update auth.users set email = 'nuevo@upq.edu.mx' where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'$$,
  'deja cambiar el correo a otro de @upq.edu.mx');
select t.lives($$update auth.users set raw_user_meta_data = '{"x":1}' where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'$$,
  'otros cambios al usuario no se bloquean');

-- Excepciones controladas por el administrador (p. ej. quien desarrolla o un profesor externo).
insert into public.signup_allowlist (kind, value) values ('email', 'dev@gmail.com');
select t.lives($$insert into auth.users (email) values ('DEV@gmail.com')$$, 'acepta un correo suelto de la lista');
select t.throws($$insert into auth.users (email) values ('otro@gmail.com')$$,
  'signup_domain_not_allowed', 'un correo suelto no abre todo su dominio');
insert into public.signup_allowlist (kind, value) values ('domain', 'profes.example.org');
select t.lives($$insert into auth.users (email) values ('maestra@profes.example.org')$$, 'acepta un dominio agregado a la lista');

-- Auth Hook "Before User Created" (opcional): mismo criterio, mensaje claro.
select t.eq(public.hook_before_user_created('{"user":{"email":"a@gmail.com"}}'::jsonb) -> 'error' ->> 'http_code', '403',
  'el hook responde 403 a un correo no permitido');
select t.eq(public.hook_before_user_created('{"user":{"email":"a@gmail.com"}}'::jsonb) -> 'error' ->> 'message',
  'Solo se permiten cuentas institucionales (@upq.edu.mx).', 'el hook explica el motivo');
select t.eq(public.hook_before_user_created('{"user":{"email":"a@upq.edu.mx"}}'::jsonb)::text, '{}',
  'el hook deja pasar un correo permitido');
select t.eq(has_function_privilege('supabase_auth_admin', 'public.hook_before_user_created(jsonb)', 'execute')::text, 'true',
  'Auth puede ejecutar el hook');
select t.eq(has_function_privilege('authenticated', 'public.hook_before_user_created(jsonb)', 'execute')::text, 'false',
  'un alumno no puede ejecutar el hook');
select t.eq(has_function_privilege('anon', 'public.is_signup_allowed(text)', 'execute')::text, 'false',
  'nadie sin sesión puede preguntar qué correos están permitidos');

-- La lista de permitidos no se puede ver ni modificar desde la API.
set role authenticated;
select t.throws($$select * from public.signup_allowlist$$, 'permission denied', 'un alumno no puede leer la lista');
select t.throws($$insert into public.signup_allowlist values ('domain', 'gmail.com')$$, 'permission denied', 'un alumno no puede ampliar la lista');
reset role;
set role anon;
select t.throws($$select * from public.signup_allowlist$$, 'permission denied', 'anónimo no puede leer la lista');
reset role;

-- El perfil automático no contiene datos personales.
select t.eq(((select username from public.profiles where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') ~ '^jugador_[0-9a-f]{8}$')::text, 'true',
  'el apodo automático es aleatorio (no sale del correo)');
select t.eq((select has_chosen_username::text from public.profiles where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), 'false',
  'el perfil nuevo no ha elegido apodo');
select t.eq((select count(*)::text from information_schema.columns
              where table_schema = 'public' and table_name = 'profiles' and column_name in ('full_name', 'email')), '0',
  'el perfil no guarda nombre completo ni correo');

select t.finish();
