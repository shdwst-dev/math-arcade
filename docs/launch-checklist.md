# Lista de verificación para el lanzamiento (Math Arcade v2.0)

Pasos manuales que dependen de tus cuentas de Supabase, Google Cloud, Vercel y la revisión con tu asesor antes del piloto.

## 1. Base de datos de Supabase (Desarrollo y Producción)

Sigue [docs/supabase-setup.md](./supabase-setup.md):

- [ ] Aplicar `supabase/migrations/20261025000000_v1_baseline.sql` en el SQL Editor de Supabase.
- [ ] Aplicar `supabase/migrations/20261025000100_v2_privacy_and_limits.sql` en el SQL Editor de Supabase.
- [ ] En _Authentication → Providers → Email_: desactivar **Enable email signups** (solo inicio de sesión con Google).
- [ ] (Opcional) En _Authentication → Hooks → Before User Created_: activar `public.hook_before_user_created` para mostrar un mensaje más descriptivo al rechazar dominios externos.

## 2. Despliegue en Vercel

1. Entra a [vercel.com](https://vercel.com) e importa el repositorio `shdwst-dev/math-arcade`.
2. El archivo `vercel.json` ya configura el comando de compilación (`npm run build`), la carpeta `dist`, el rewrite de la SPA y las cabeceras de seguridad y caché.
3. En _Settings → Environment Variables_, agrega:
   - `VITE_SUPABASE_URL` = `https://vtopzwwnasxeywvykthg.supabase.co` (o el proyecto de producción)
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = `sb_publishable_...`
4. Anota el dominio asignado por Vercel (por ejemplo, `https://math-arcade.vercel.app`).

## 3. URLs de redirección en Supabase y Google Cloud

- [ ] En **Supabase** (_Authentication → URL Configuration_):
  - **Site URL**: `https://<tu-dominio>.vercel.app`
  - **Redirect URLs**: agregar `https://<tu-dominio>.vercel.app/**` y `https://*-<tu-usuario-vercel>.vercel.app/**` (para los previews de ramas).
- [ ] En **Google Cloud Console** (_Google Auth Platform → Público_):
  - Si la pantalla de consentimiento es **Externa**, pulsa **Publicar la aplicación** para que no quede limitada a 100 usuarios de prueba.

## 4. Aviso de privacidad y prueba en dispositivos reales

- [ ] Revisar con tu asesor de servicio social el borrador en `/privacidad` (`src/pages/PrivacyPage.tsx`) y confirmar si la UPQ solicita algún texto institucional adicional.
- [ ] Abrir la URL de Vercel desde un teléfono Android y un iPhone:
  - Instalar en pantalla de inicio ("Agregar a pantalla de inicio").
  - Probar los tres juegos en vertical y horizontal.
  - Activar modo avión y verificar que el modo invitado funciona sin conexión.
  - Iniciar sesión con una cuenta `@upq.edu.mx`, elegir apodo, jugar una partida y revisar que aparece en el ranking.
  - Intentar entrar con un `@gmail.com` personal y confirmar que es rechazado.

## 5. Piloto

- [ ] Compartir el enlace con el grupo piloto y recoger comentarios sobre dificultad, preguntas y usabilidad en celular.
