import type { Rng } from '../games/shuffle';

/** Generador pseudoaleatorio con semilla (mulberry32): mismas semillas, mismos resultados. */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Banco de preguntas de prueba con respuestas fáciles de reconocer en pantalla. */
export function fakeQuestions(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `integral.por_partes.${String(i + 1).padStart(2, '0')}`,
    topic: 'integral' as const,
    subtopic: 'por_partes' as const,
    prompt: `\\text{pregunta${i + 1}}`,
    answer: `\\text{correcta${i + 1}}`,
    distractors: [
      `\\text{mala${i + 1}a}`,
      `\\text{mala${i + 1}b}`,
      `\\text{mala${i + 1}c}`,
    ] as [string, string, string],
  }));
}
