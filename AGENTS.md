# Reglas y convenciones para agentes (Math Arcade v2)

Este documento define las pautas técnicas y convenciones para agentes de IA y desarrolladores trabajando en este repositorio. Complementa y sigue las directrices de `docs/plan-v2.md`.

---

## 1. Stack y Arquitectura

- **Frontend:** Vite + React + TypeScript (`strict: true`) + Tailwind CSS v4 (`@tailwindcss/vite`) + React Router (SPA).
- **Matemáticas:** KaTeX mediante componente `<Math>` propio (en línea y en bloque).
- **Backend:** Supabase (Auth con Google `@upq.edu.mx`, Postgres con RLS y RPC `record_game_result`).
- **Arquitectura de juegos:**
  - La lógica de cada juego es TypeScript puro (`logic.ts`), desacoplada de React (reducers / máquinas de estado).
  - La interfaz de React solo renderiza el estado.
  - El juego Carrera (`race`) utiliza `requestAnimationFrame` con `deltaTime` (base 60 FPS) y posiciones/colisiones en porcentaje del alto de la pista (no píxeles fijos).
  - Todo juego se registra en `src/games/registry.ts`.
- **Acceso a datos:** Solo los módulos dentro de `src/features/*` se comunican con Supabase. Los componentes no realizan llamadas directas al backend.

---

## 2. Convenciones de Código e Idioma

- **Idioma:**
  - Textos de interfaz de usuario y comentarios de código: **Español**.
  - Nombres de variables, funciones, tipos, clases y archivos: **Inglés**.
- **Gestor de paquetes:** `npm`.
  - Scripts estándar: `npm run dev`, `npm run build`, `npm test`, `npm run lint`, `npm run typecheck`.
- **Diseño Mobile-First:**
  - Diseñar y estilizar pensando primero en pantallas de celular (ancho 360–400 px).
  - Elementos interactivos táctiles (botones, tarjetas, opciones) con altura mínima de **44 px**.
- **Seguridad:**
  - **NUNCA** incluir ni usar la clave `service_role` de Supabase en el frontend. Usar únicamente `VITE_SUPABASE_PUBLISHABLE_KEY` (anon key).
  - Validar datos y dominios estrictamente en el backend (Postgres RLS y Auth Hooks).

---

## 3. Base de Datos y Migraciones

- Nunca modificar archivos de migración ya aplicados en `supabase/migrations/`; crear siempre un nuevo archivo de migración secuencial.
- Mantener las tablas sincronizadas con tipos TypeScript autogenerados (`src/lib/database.types.ts`).

---

## 4. Banco de Preguntas y Contenido

- No alterar enunciados, fórmulas ni distractores existentes en el banco de preguntas salvo que el usuario lo solicite expresamente.
- Todo el LaTeX debe validar con KaTeX con `throwOnError: true`.
- Cada subtema debe proveer suficientes preguntas válidas para los juegos en los que participa (mínimo 6 para Memorama, 3 para Bomba y Carrera).

---

## 5. Flujo de Trabajo

- Antes de iniciar una tarea, consultar la fase correspondiente en `docs/plan-v2.md`.
- Cada fase o cambio debe terminar con typecheck (`npm run typecheck`), pruebas unitarias (`npm test`) y lint (`npm run lint`) en verde.
- Al terminar tareas de una fase, actualizar las casillas de verificación correspondientes en `docs/plan-v2.md`.
