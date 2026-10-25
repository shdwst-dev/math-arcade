# Reporte de huecos del banco de preguntas

Estado tras migrar v1 a v2 (Fase 2): **293 preguntas** (Fundamentos 143, Diferencial 60, Integral 90), idénticas a v1.
Las pruebas de `src/content/content.test.ts` validan el esquema, los ids únicos, que todo el LaTeX se renderice con KaTeX y que los distractores no se repitan.

## Hueco que impide jugar

| Subtema | Juego | Tiene | Necesita |
|---|---|---|---|
| Fundamentos › Ec. 1er Grado (`ecuaciones_1`) | Memorama | 4 | 6 |

Bomba y Carrera sí se pueden jugar en ese subtema (necesitan 3). En la app, la tarjeta del Memorama aparece deshabilitada con el motivo. Al agregar 2 preguntas o más, hay que quitar `fundamentos.ecuaciones_1.memory` de `KNOWN_GAPS` en `content.test.ts` (la prueba avisa si se olvida).

## Observaciones (no cambian el contenido; para decidir con el asesor)

- **`ecuaciones_1` tiene una pregunta que no es una ecuación:** `10 / 2` (respuesta `5`).
- **Desbalance:** Matrices tiene 65 preguntas, el 45 % de Fundamentos; en "Todos los temas" de Fundamentos pesa casi la mitad. Los demás subtemas tienen entre 10 y 20.
- **Memorama con opciones largas.** Estos subtemas tienen opciones con texto largo (`\text{…}`, hasta 46 caracteres) y podrían no caber en una carta de celular: Sumas de Riemann (7 de 10 con texto), Métodos de integración (5 de 10), Fracciones parciales (4 de 10), Matrices (33 de 65). Si se ve mal en un teléfono real (Fase 3), se pueden excluir del Memorama con el campo opcional `games` de la pregunta, sin cambiar su texto.
- **Un carácter fuera del conjunto de KaTeX:** `integral.integrales_metodos.01` empieza con "¿" dentro de `\text{}`. Se renderiza bien (usa la fuente del sistema), pero KaTeX en modo estricto lo marca como no estándar.
