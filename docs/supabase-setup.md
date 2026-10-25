# Configurar Supabase para Math Arcade v2

Guía para conectar la app a un proyecto de Supabase (primero el de **desarrollo**; el de producción se
crea igual en la Fase 5). Lo que se puede automatizar ya está en `supabase/migrations`.

## 1. Aplicar las migraciones

Las migraciones están en `supabase/migrations`, en orden:

| Archivo | Qué hace |
|---|---|
| `20261025000000_v1_baseline.sql` | Tablas y funciones de v1. Se puede volver a ejecutar sin perder datos. |
| `20261025000100_v2_privacy_and_limits.sql` | Dominio institucional, perfiles privados con apodo, sin escritura directa, límites de puntaje y las funciones nuevas. |

**Opción A: Editor SQL del panel** (la más simple). *SQL Editor → New query*, pega el contenido de cada archivo
**en ese orden** y pulsa *Run*.

**Opción B: Supabase CLI.** `supabase link --project-ref <ref>` y luego `supabase db push`.

> Si tu proyecto ya tenía el esquema de v1 con cuentas de prueba: la segunda migración borra los nombres
> derivados del correo (los reemplaza por `jugador_xxxxxxxx`), elimina `full_name` y conserva récords y cuentas.
> Esas cuentas tendrán que elegir un apodo para salir en el ranking. No se borra ninguna cuenta, aunque su
> correo no sea de la UPQ (solo se bloquean los **registros nuevos**).

## 2. Inicio de sesión con Google

1. *Authentication → Providers → Google*: activar y pegar el Client ID y el Client Secret de Google Cloud
   (ya lo probaste en la Fase 0).
2. *Authentication → URL Configuration*:
   - **Site URL**: la del sitio (`https://math-arcade.vercel.app`, o `http://localhost:5173` mientras desarrollas).
   - **Redirect URLs**: agrega `http://localhost:5173/**` y `https://<tu-dominio>/**`. La app vuelve a `/account`.
3. *Authentication → Providers → Email*: **desactiva** "Enable email signups". Solo se entra con Google.
   (No hace falta confirmar correos ni configurar SMTP.)
4. En Google Cloud, en el cliente OAuth, agrega como URI de redirección autorizado
   `https://<ref>.supabase.co/auth/v1/callback` (si no estaba).

## 3. Quién puede registrarse

El servidor solo deja crear cuentas con correo `@upq.edu.mx`. La regla vive en la tabla
`public.signup_allowlist` (dominios o correos sueltos), que solo se ve desde el panel:

```sql
-- Dar de alta a quien pruebe con un correo personal (solo en desarrollo):
insert into public.signup_allowlist (kind, value) values ('email', 'tu.correo@gmail.com');

-- Aceptar a otro dominio completo (p. ej. profesores con otro dominio):
insert into public.signup_allowlist (kind, value) values ('domain', 'profes.example.org');
```

- Funciona sin configurar nada más (un *trigger* sobre `auth.users`).
- **Opcional, mensaje más claro**: *Authentication → Hooks → Before User Created* → elegir la función
  `public.hook_before_user_created`.
- El parámetro `hd=upq.edu.mx` que manda la app solo filtra las cuentas que muestra Google; **no es una medida
  de seguridad**. La validación real es la del servidor.

## 4. Variables de entorno

Copia `.env.example` a `.env.local` y llena los valores (*Project Settings → API*):

```
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon / publishable key>
```

La llave anon es pública por diseño. **Nunca** pongas la `service_role` en el frontend. Sin estas variables la
app funciona en modo invitado. En Vercel se cargan en *Settings → Environment Variables*.

## 5. Comprobar que quedó bien

Con `npm run dev`:

- [ ] Iniciar sesión con tu cuenta `@upq.edu.mx` → vuelve a la app con la sesión iniciada y pide elegir apodo.
- [ ] Iniciar sesión con una cuenta de otro dominio (que no esté en la lista) → vuelve con el aviso
      "Solo se permiten cuentas institucionales (@upq.edu.mx)" y **no** aparece un usuario nuevo en
      *Authentication → Users*.
- [ ] Elegir apodo; probar uno repetido y uno inválido (mensajes en español).
- [ ] Jugar una partida: aparece "guardada en la nube"; en *Table Editor* hay filas en `game_history` y
      `high_scores`.
- [ ] Abrir la app en otro dispositivo (o ventana de incógnito), entrar con la misma cuenta y ver el mismo progreso
      y el ranking.
- [ ] Con *DevTools → Network → Offline*, jugar: avisa "Sin conexión…". Al volver la conexión la partida se sube.
- [ ] En *Table Editor* comprobar que `profiles` **no** tiene nombre ni correo, y que el ranking solo muestra apodos.

## 6. Mantenimiento

- **Apodo inapropiado**: `update public.profiles set username = 'jugador_' || substr(replace(id::text,'-',''),1,8),
  has_chosen_username = false where username = 'el apodo';`
- **Tipos de TypeScript**: `src/lib/database.types.ts` está escrito a mano. Con la CLI:
  `supabase gen types typescript --project-id <ref> > src/lib/database.types.ts`.
- **Plan gratuito**: el proyecto se pausa tras una semana sin uso; se reactiva desde el panel.
- **Puntajes**: se calculan en el navegador, así que el ranking es para divertirse, no para calificar. El
  servidor solo rechaza puntajes imposibles (máximos por juego en `public.game_max_score`; si cambian las reglas de
  puntos hay que actualizar esa función con una migración nueva).

## 7. Probar las migraciones sin tocar Supabase

`supabase/tests/run.sh` crea una base desechable en un PostgreSQL local, emula los roles y el esquema `auth` de
Supabase, aplica las migraciones y corre ~180 comprobaciones de seguridad (RLS, límites de puntaje, dominio de
correo, permisos, actualización desde v1). Necesita `psql` y un superusuario:

```bash
PGHOST=localhost PGPORT=5432 PGUSER=postgres PGPASSWORD=... supabase/tests/run.sh
```

También corre en GitHub Actions (job `database`).
