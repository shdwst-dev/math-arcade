# Plan de trabajo: Math Arcade v2

> Documento vivo. Lo usan el desarrollador y el agente de IA que ejecute cada fase.
> Si una decisión cambia, se actualiza aquí primero.

**En una frase:** rehacer la app en Vite + React + TypeScript + Supabase, con login de Google para cuentas `@upq.edu.mx`. Primero se iguala todo lo que ya hace v1 y se lanza (Fases 0 a 5); después se agregan funciones nuevas (Fase 6).

## 1. Contexto

Math Arcade ("Math Arcade: El Desafío") es una app web de minijuegos de matemáticas para alumnos de la UPQ, hecha como proyecto de servicio social. Los alumnos la usarán desde el celular y desde la computadora.

**Estado actual (v1, rama `main`):**

- HTML y JavaScript sin framework (unas 2,600 líneas), con Tailwind y MathJax desde CDN.
- Tres juegos: Memorama (`memory`), Bomba (`bomb`) y Carrera (`race`, con dificultad Fácil, Normal y Difícil).
- Tres temas con 23 subtemas y 293 preguntas, todas con el formato `{ subtema, q, a, distractors[3] }` en LaTeX.
- Récords en `localStorage`, pantalla de estadísticas, tutoriales por juego y PWA con un service worker escrito a mano.
- Integración con Supabase a medio terminar y **sin commitear**: registro con correo y contraseña, récords en la nube, ranking global y una cola para guardar partidas sin conexión (`js/cloud.js`, `supabase/schema.sql`).

## 2. Alcance

**v2.0 incluye:**

1. Paridad con v1: los tres juegos con las mismas reglas, temas, subtemas, dificultad, récords, estadísticas, ranking, tutoriales y funcionamiento sin conexión.
2. Inicio de sesión con Google restringido a cuentas `@upq.edu.mx`, y un modo invitado sin cuenta, como en v1.
3. Diseño pensado primero para celular.
4. El banco de preguntas como datos validados por pruebas automáticas.
5. Una base que permita agregar juegos nuevos sin tocar los existentes.

**Fuera de v2.0:**

- Respuesta libre con MathLive, gráficas interactivas y panel para profesores. Van en la Fase 6, después del lanzamiento.
- Phaser, Next.js o cualquier render del lado del servidor. Los juegos son de tipo quiz y todo corre en el navegador.
- Cambiar el contenido de las preguntas. En v2.0 solo se migra; las correcciones se proponen aparte.

## 3. Stack

| Pieza | Elección | Por qué |
|---|---|---|
| Base | Vite + React + TypeScript (modo `strict`) | Todo corre en el navegador, así que Next.js no aporta nada. TypeScript detecta errores en el banco de preguntas y evita que el agente rompa cosas sin darse cuenta. |
| Estilos | Tailwind CSS v4 (`@tailwindcss/vite`) | v1 ya usa clases de Tailwind, pero desde un CDN que no es para producción. |
| Rutas | React Router en modo SPA | Cada pantalla de v1 pasa a ser una ruta. |
| Fórmulas | KaTeX, con un componente `<Math>` propio | Es más rápido que MathJax, y un componente de pocas líneas evita depender de un envoltorio para React. |
| Backend | Supabase: Auth con Google, Postgres con RLS y funciones RPC | Ya está empezado y el plan gratis alcanza. |
| Datos del servidor | `@supabase/supabase-js` (hooks propios; TanStack Query opcional) | Solo hay dos lecturas (`loadMyScores` y `fetchLeaderboard`) y la escritura usa una cola offline propia en `localStorage`. |
| PWA | `vite-plugin-pwa` | Genera el service worker con los archivos versionados. Ya no hay que subir `CACHE_NAME` a mano. |
| Pruebas | Vitest + Testing Library; `zod` para validar el contenido | |
| Calidad | ESLint + Prettier; GitHub Actions corre typecheck, lint, pruebas y build en cada PR | |
| Hosting | Vercel, con un preview por rama o PR; migraciones con Supabase CLI | |
| Fase 6 | MathLive y Compute Engine (carga diferida); Mafs para gráficas | Mafs está hecho para React; JSXGraph es más potente pero imperativo. |

Todo cabe en planes gratuitos: Vercel Hobby (uso no comercial), Supabase Free y Google OAuth.

## 4. Arquitectura

```
math-arcade/
├── index.html
├── vercel.json            # build de Vite + rewrite de la SPA a index.html
├── public/                # íconos de la PWA
├── src/
│   ├── main.tsx, App.tsx, routes.tsx
│   ├── pages/             # Home, Topic, GameSelect, Play, Stats, Ranking, Account
│   ├── components/        # Math, Modal, Button, GameShell, GameOverModal, Tutorial…
│   ├── content/
│   │   ├── schema.ts      # tipos + esquema zod
│   │   ├── topics.ts      # temas y subtemas (antes subtemas.js)
│   │   └── questions/     # fundamentos.ts, diferencial.ts, integral.ts
│   ├── games/
│   │   ├── registry.ts    # lista de juegos y sus reglas
│   │   ├── memory/        # logic.ts, logic.test.ts, MemoryGame.tsx
│   │   ├── bomb/
│   │   └── race/
│   ├── features/
│   │   ├── auth/          # sesión y login con Google
│   │   ├── records/       # récords locales y en la nube, cola sin conexión
│   │   └── ranking/
│   └── lib/               # supabase.ts, storage.ts, database.types.ts (generado)
├── supabase/
│   ├── migrations/
│   └── tests/             # pruebas de RLS
└── docs/plan-v2.md
```

**Reglas:**

- **La lógica de cada juego es TypeScript puro**, separada de React: un reducer o máquina de estados en `logic.ts`. Así se prueba sin navegador y la interfaz solo dibuja el estado.
- **Cada juego se registra en `games/registry.ts`** con su id, nombre, mínimo de preguntas, si usa dificultad, puntaje máximo posible, tutorial y componente (cargado de forma diferida). Agregar un juego es crear una carpeta y una entrada en el registro.
- **Carrera no guarda posiciones en el estado de React.** El ciclo de animación usa `requestAnimationFrame` y refs, normalizando el movimiento y la aparición de obstáculos con `deltaTime` (base 60 FPS) para que el juego no corra al doble de velocidad en pantallas de 120 Hz. Las posiciones y colisiones van en porcentaje del alto de la pista; v1 usa una pista fija de 500 px y colisiones en píxeles, que no se adaptan al tamaño de pantalla. Los controles siguen siendo tocar cada mitad de la pista o usar las flechas del teclado.
- **Solo `features/*` habla con Supabase.** Los componentes no hacen consultas directas.
- **Los ids de temas, subtemas, juegos y dificultades no cambian** respecto a v1 (`fundamentos`, `productos_notables`, `race`, `Fácil`…), para no romper récords guardados.
- **Variables de entorno:** `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` (la anon key) en `.env.local`, que git ignora, y en Vercel. Sin ellas la app arranca en modo invitado, igual que v1 sin `config.js`.

## 5. Modelo de contenido

Formato propuesto, compatible con v1:

```ts
type Question = {
  id: string;                            // estable, p. ej. "integral.por_partes.03"
  topic: TopicId;                        // "fundamentos" | "diferencial" | "integral"
  subtopic: SubtopicId;                  // antes `subtema`
  prompt: string;                        // LaTeX, antes `q`
  answer: string;                        // LaTeX, antes `a`
  distractors: [string, string, string];
  games?: GameId[];                      // opcional: limitar la pregunta a ciertos juegos
};
```

- El `id` permitirá saber más adelante qué preguntas fallan más los alumnos. Se asigna una vez y nunca se reutiliza.
- `games` sirve para sacar del Memorama las preguntas de texto largo (por ejemplo, las conceptuales de Sumas de Riemann) si no caben en una carta en el celular.
- La conversión de v1 a este formato se hace con un script, no a mano, y el contenido debe quedar idéntico.

**Pruebas automáticas del contenido** (si fallan, falla el CI):

1. Todas las preguntas cumplen el esquema y los ids son únicos.
2. Todo el LaTeX se renderiza con KaTeX sin errores (`throwOnError: true`). Esto también detecta lo que MathJax aceptaba y KaTeX no.
3. Los tres distractores son distintos entre sí y distintos de la respuesta.
4. Cada subtema tiene suficientes preguntas para cada juego en el que aparece: 6 para Memorama y 3 para Bomba y Carrera. Hoy `ecuaciones_1` tiene solo 4, así que su Memorama no se puede jugar. Esta prueba lo marca como advertencia hasta que se agregue contenido.

## 6. Backend (Supabase)

Se parte de `supabase/schema.sql` de v1, convertido en migraciones (`supabase/migrations/`), con estos cambios:

- **Login con Google.** `signInWithOAuth` con `queryParams: { hd: 'upq.edu.mx' }`. Ese parámetro solo filtra las cuentas que muestra Google; **no es una medida de seguridad**.
- **El dominio se valida en el servidor.** Se rechaza el registro de cualquier correo que no termine en `@upq.edu.mx` mediante un Auth Hook "Before User Created" (función Postgres en Supabase Auth) o, como respaldo, un trigger `BEFORE INSERT` en `auth.users`.
- **Perfiles y privacidad.** En v1 cualquiera puede leer la tabla `profiles`, incluso sin sesión, y el trigger `handle_new_user` guarda `full_name` y toma el usuario del correo. Con cuentas de Google ahí quedarían nombres reales y matrículas de alumnos, así que:
  - se elimina la columna `full_name` de `profiles` (no se guarda el nombre real de Google) y se añade `has_chosen_username BOOLEAN NOT NULL DEFAULT FALSE`;
  - solo los usuarios con sesión pueden leer perfiles, y únicamente las columnas necesarias (`id`, `username`), con una vista o permisos por columna. El ranking se ve solo con sesión iniciada;
  - en el primer inicio de sesión (`has_chosen_username = false`), la app pide al alumno elegir un apodo antes de mostrar su perfil en el ranking. El correo y el nombre completo nunca aparecen;
  - debe haber una forma de cambiar un apodo inapropiado, aunque sea desde el panel de Supabase.
- **`record_game_result` con límites reales por juego y dificultad.** v1 acepta cualquier puntaje entre −1000 y 5000, pero con las reglas actuales el máximo posible es 600 en Memorama (6 pares × 100), 250 en Bomba (5 aciertos × 50) y la meta + 40 en Carrera (340, 540 u 840 según la dificultad). Si cambian las reglas de puntos, se actualizan estos límites. Aun así, el puntaje se calcula en el navegador, así que el ranking no debe usarse para calificar.
- **RLS como en v1:** cada alumno solo lee su propio historial, y `high_scores` y `game_history` solo se escriben a través de la RPC.
- **Tipos generados** con `supabase gen types typescript` en `src/lib/database.types.ts`.
- **Pruebas de RLS** con pgTAP (`supabase test db`) o, como mínimo, un checklist manual.
- **Dos proyectos de Supabase:** uno de desarrollo desde ya y otro de producción para el lanzamiento, los dos creados con las mismas migraciones.

## 7. Fases

Cada fase se trabaja en su propia rama que sale de `v2` y se fusiona a `v2` con un PR cuando cumple su criterio de "Listo cuando". `main` conserva v1 hasta el lanzamiento. Vercel publica un preview de cada rama, así que cada fase se prueba en el celular antes de fusionarla.

El tamaño (chica, mediana, grande) es el esfuerzo relativo entre fases.

### Fase 0: Preparación (chica)

- [x] Commitear lo pendiente de v1 y crear la etiqueta `v1.0` como punto de referencia.
- [ ] Decidir si se publica v1 ya, en modo invitado, para que los alumnos la usen mientras se hace v2. Mejor no publicarla con cuentas de correo y contraseña: después habría que pasar esas cuentas a Google.
- [ ] **Probar el login con Google antes de construir nada encima.** Crear el proyecto de desarrollo en Supabase y el cliente OAuth en Google Cloud, y entrar con 2 o 3 cuentas `@upq.edu.mx` reales.
  - Riesgos: que el Google Workspace de la UPQ bloquee apps externas, o que la pantalla de consentimiento se quede en modo de prueba.
  - Si el proyecto de Google Cloud se puede crear con una cuenta de la UPQ, el tipo de usuario "Interno" solo deja entrar cuentas de la escuela. Si no, se usa "Externo" y se publica la app.
  - Plan B si Google no funciona: enlace mágico al correo `@upq.edu.mx` con un servidor SMTP propio.
- [x] Crear la rama `v2`.
- [x] Crear `AGENTS.md` con las convenciones de la sección 8, y un `CLAUDE.md` (y `GEMINI.md`, si se usa Gemini) que solo apunte a él.
- [ ] Revisar si las ramas remotas `test` y `copilot/revisar-repositorio` todavía sirven; si no, borrarlas.
- [ ] Resolver las decisiones de la sección 10.

**Listo cuando:** v1 está etiquetada, el login con una cuenta de la UPQ funciona en el proyecto de desarrollo y las decisiones están tomadas.

### Fase 1: Esqueleto y despliegue (chica)

- [ ] Mover el código de v1 a `legacy/` como referencia. Se borra en la Fase 5.
- [ ] Crear el proyecto con Vite, React, TypeScript, Tailwind v4, React Router, ESLint, Prettier y Vitest.
- [ ] Layout mobile-first: encabezado, navegación y el estilo arcade de v1 (fuente Press Start 2P y sus colores).
- [ ] `vercel.json` con el comando de build, la carpeta `dist` y el rewrite de la SPA. Así cada rama compila bien aunque `main` siga siendo HTML estático.
- [ ] Conectar el repo a Vercel, con `main` como producción, y cargar las variables de entorno.
- [ ] GitHub Actions: typecheck, lint, pruebas y build.

**Listo cuando:** el preview de Vercel abre en celular y en PC, se puede navegar entre pantallas vacías y el CI pasa.

### Fase 2: Contenido y fórmulas (mediana)

- [ ] Esquema del contenido y script que convierte los tres bancos de preguntas y los subtemas.
- [ ] Componente `<Math>` con KaTeX: modo en línea y en bloque, con scroll horizontal para fórmulas largas.
- [ ] Pruebas del contenido (sección 5).
- [ ] Pantallas Tema → Subtema → Selección de juego, con selector de dificultad y mejores puntajes.

**Listo cuando:** las 293 preguntas están migradas, las pruebas pasan y hay un reporte de los huecos de contenido.

### Fase 3: Juegos (grande)

- [ ] `GameShell` común: barra de puntos, botón para salir, modal de fin de juego, confeti (respetando `prefers-reduced-motion`) y aviso de preguntas insuficientes.
- [ ] Memorama con las mismas reglas: 6 pares, +100 por acierto y −10 por error. Cuadrícula de 3 columnas en celular y 4 en PC, con fórmulas que se ajusten al tamaño de la carta.
- [ ] Bomba: 30 s, +5 s por acierto y −5 s por error, 5 aciertos para ganar, +50 y −20 puntos. Opciones en una cuadrícula de 2 × 2 con botones de al menos 44 px.
- [ ] Carrera: velocidades, frecuencia de aparición y metas por dificultad iguales a v1 (`legacy/js/games/race.js`), normalizadas con `deltaTime` a 60 FPS y posiciones en porcentaje.
- [ ] Tutoriales con el mismo texto de v1.
- [ ] Récords locales para el modo invitado. Si v1 llegó a publicarse en el mismo dominio, importar la llave `mathArcade_scores` de `localStorage`.
- [ ] Pruebas unitarias de la lógica de cada juego.

**Listo cuando:** los tres juegos se juegan igual que en v1, en celular y en PC, y las pruebas pasan.

### Fase 4: Cuentas y progreso en la nube (grande)

- [ ] Migraciones con los cambios de la sección 6.
- [ ] Login con Google, elección de apodo y pantalla de cuenta.
- [ ] Guardar partidas en la nube, con la cola sin conexión de v1 (`legacy/js/cloud.js`), e importar los récords previos de modo invitado (`mathArcade_scores` en `localStorage`) al iniciar sesión si superan a los de la nube.
- [ ] Estadísticas (locales y de la nube) y ranking.
- [ ] Pruebas de RLS.

**Listo cuando:**

- un alumno entra con su cuenta de la UPQ, juega y ve su progreso desde otro dispositivo;
- una cuenta que no es de la UPQ es rechazada;
- un alumno no puede leer el historial de otro ni escribir récords directamente;
- sin internet, la partida queda en cola y se sube al volver la conexión.

### Fase 5: PWA, pulido y lanzamiento (mediana)

- [ ] `vite-plugin-pwa` con actualización automática y aviso de "nueva versión".
- [ ] Íconos PNG reales (192 y 512 px, maskable) y `apple-touch-icon`. v1 usa un emoji en SVG, que el iPhone no usa como ícono de la pantalla de inicio.
- [ ] Si v1 estuvo publicada: dejar el service worker nuevo en `/sw.js`, la misma ruta que v1, para que reemplace al viejo, y borrar los cachés `math-arcade-v*`.
- [ ] Modo invitado funcionando sin conexión.
- [ ] Lighthouse en modo celular (rendimiento y accesibilidad), con cada juego en su propio chunk.
- [ ] Pruebas en un iPhone y un Android reales: rotación, fórmulas largas, tamaño de botones e instalación.
- [ ] Aviso de privacidad: preguntar al asesor si la UPQ pide uno.
- [ ] Producción: proyecto de Supabase con las migraciones, variables en Vercel, dominio, *Site URL* y *Redirect URLs* en Supabase Auth, y orígenes autorizados en Google.
- [ ] Borrar `legacy/`, fusionar `v2` en `main` y etiquetar `v2.0`.
- [ ] Piloto con un grupo y recoger sus comentarios.

**Listo cuando:** un grupo piloto la usa en producción sin bloqueos.

### Fase 6: Después del lanzamiento

Una función a la vez, cada una con su propio mini plan.

1. **Respuesta libre** con MathLive (trae teclado matemático virtual) y Compute Engine o math.js. Se cargan solo en ese juego porque pesan. Cada ejercicio declara cómo se revisa:
   - expresiones: evaluar ambas en varios puntos al azar, que es más robusto que comparar símbolos;
   - integrales indefinidas: aceptar respuestas que difieren solo en una constante;
   - ecuaciones: comparar el conjunto de soluciones;
   - números: comparar con tolerancia.

   Hay que revisar que el teclado virtual no tape la pregunta, ni en iOS ni en Android.
2. **Gráficas interactivas** con Mafs: tangentes, área bajo la curva y límites.
3. **Progreso por subtema** (dominio) y estadísticas por pregunta.
4. **Para profesores:** grupos, panel de progreso y editor de ejercicios. Implica mover el contenido a la base de datos, crear un rol de profesor y más reglas de RLS. Solo vale la pena si algún profe lo va a usar.

## 8. Convenciones (base para `AGENTS.md`)

- La interfaz y los comentarios van en español; los nombres de variables, funciones y archivos, en inglés.
- Gestor de paquetes: npm. Comandos: `npm run dev`, `npm run build`, `npm test`, `npm run lint`, `npm run typecheck`.
- No modificar el contenido de las preguntas sin que se pida.
- No editar migraciones ya aplicadas; crear una nueva.
- Nunca usar la llave `service_role` en el frontend.
- Mobile-first, con botones de al menos 44 px de alto.
- Cada fase termina con las pruebas en verde y el preview probado en un celular.

## 9. Riesgos

| Riesgo | Mitigación |
|---|---|
| La UPQ bloquea el login con Google | Probarlo en la Fase 0; plan B con enlace mágico. |
| La reescritura nunca termina | Paridad primero y funciones nuevas después; fases chicas con criterio de "Listo cuando". |
| Trampas en el ranking | Límites por juego en el servidor; no usar el ranking para calificar. |
| Datos personales de alumnos | Guardar lo mínimo, perfiles no públicos, apodos y aviso de privacidad. |
| Supabase Free pausa el proyecto tras 7 días sin uso (por ejemplo, en vacaciones) | Reactivarlo desde el panel antes de que vuelvan los alumnos. |
| La app pesa demasiado en celulares modestos | Carga diferida por juego; MathLive solo donde se use. |
| Los alumnos ven versiones viejas en caché | `vite-plugin-pwa` con aviso de actualización. |

## 10. Decisiones pendientes

| # | Decisión | Recomendación |
|---|---|---|
| 1 | ¿Usar TypeScript? | Sí. |
| 2 | ¿Publicar v1 ya, sin cuentas, mientras se hace v2? | Sí, si quieres que la usen este periodo. |
| 3 | ¿Modo invitado sin cuenta? | Sí, como en v1. |
| 4 | ¿Qué nombre aparece en el ranking? | Un apodo elegido por el alumno; nunca el correo ni el nombre completo. |
| 5 | ¿Ranking global o por grupo? | Global en v2.0; por grupo en la Fase 6. |
| 6 | ¿Algún profe va a cargar ejercicios? | La respuesta decide si vale la pena el punto 4 de la Fase 6. |
| 7 | ¿Qué dominio? | `math-arcade.vercel.app` si está libre, o uno de la UPQ. |

## 11. Cómo trabajar con el agente

- Una sesión por fase o por tarea. Empieza con: *"Lee `docs/plan-v2.md` y `AGENTS.md`. Vamos con la Fase N."*
- Pide que marque en este documento las tareas terminadas.
- Revisa cada PR y prueba el preview en tu celular antes de fusionarlo. En la Fase 4, haz además una revisión de seguridad del diff.
- Si una decisión cambia, actualiza este documento antes de seguir.
