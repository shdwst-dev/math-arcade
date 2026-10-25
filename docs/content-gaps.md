# Reporte de huecos del banco de preguntas

Estado tras migrar v1 a v2 (Fase 2): **293 preguntas** (Fundamentos 143, Diferencial 60, Integral 90), idénticas a v1.
Las pruebas de `src/content/content.test.ts` validan el esquema, los ids únicos, que todo el LaTeX se renderice con KaTeX y que los distractores no se repitan.

## Hueco que impide jugar

| Subtema                                      | Juego    | Tiene | Necesita |
| -------------------------------------------- | -------- | ----- | -------- |
| Fundamentos › Ec. 1er Grado (`ecuaciones_1`) | Memorama | 4     | 6        |

Bomba y Carrera sí se pueden jugar en ese subtema (necesitan 3). En la app, la tarjeta del Memorama aparece deshabilitada con el motivo. Al agregar 2 preguntas o más, hay que quitar `fundamentos.ecuaciones_1.memory` de `KNOWN_GAPS` en `content.test.ts` (la prueba avisa si se olvida).

## Observaciones (no cambian el contenido; para decidir con el asesor)

- **`ecuaciones_1` tiene una pregunta que no es una ecuación:** `10 / 2` (respuesta `5`).
- **Desbalance:** Matrices tiene 65 preguntas, el 45 % de Fundamentos; en "Todos los temas" de Fundamentos pesa casi la mitad. Los demás subtemas tienen entre 10 y 20.
- **Cabida en pantalla (medida en Firefox, celular de 360 px).** En los juegos las fórmulas primero saltan de línea (el texto de `\text{…}`) y, si aun así no caben, se reducen hasta el 60 %. Con eso solo estas preguntas siguen sin caber y se desplazan en horizontal dentro de su carta, cable u objeto:
  - **Memorama (15 cartas):** Matrices 25, 43, 49, 57, 58 · Sumas de Riemann 01, 04, 07, 08, 09 · Aplicaciones (integral) 02, 07, 08, 10 · Aplicaciones (diferencial) 10.
  - **Bomba (1 opción):** Sumas de Riemann 07.
  - **Carrera (6 objetos):** Matrices 43, 49, 50, 57, 64 · Sumas de Riemann 07.

  Bomba y Carrera: sin ninguna pregunta que no quepa (enunciado). Si se quiere resolver sin tocar el texto, el campo opcional `games` permite sacar esas pocas preguntas del Memorama (ningún subtema se queda sin las 6 que necesita).

- **Un carácter fuera del conjunto de KaTeX:** `integral.integrales_metodos.01` empieza con "¿" dentro de `\text{}`. Se renderiza bien (usa la fuente del sistema), pero KaTeX en modo estricto lo marca como no estándar.
