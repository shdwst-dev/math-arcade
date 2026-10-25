import { describe, expect, it } from 'vitest';
import { QUESTIONS, filterQuestions, getQuestions } from './index';
import { questionBankSchema } from './schema';
import { findCoverageGaps } from './coverage';
import { renderLatex } from '../lib/latex';
import { ALL_SUBTOPICS, TOPICS } from './topics';

/**
 * Huecos de contenido ya conocidos (subtema + juego sin preguntas suficientes).
 * Se avisan pero no fallan; cualquier hueco nuevo sí hace fallar la prueba.
 * Al agregar preguntas, quita aquí la entrada correspondiente.
 */
const KNOWN_GAPS = ['fundamentos.ecuaciones_1.memory'];

describe('banco de preguntas', () => {
  it('cumple el esquema', () => {
    const result = questionBankSchema.safeParse(QUESTIONS);
    expect(result.success ? [] : result.error.issues.slice(0, 5)).toEqual([]);
  });

  it('tiene ids únicos', () => {
    const seen = new Set<string>();
    const duplicates = QUESTIONS.map((q) => q.id).filter(
      (id) => seen.size === seen.add(id).size
    );
    expect(duplicates).toEqual([]);
  });

  it('conserva las 293 preguntas de v1', () => {
    expect(QUESTIONS).toHaveLength(293);
    expect(getQuestions('fundamentos')).toHaveLength(143);
    expect(getQuestions('diferencial')).toHaveLength(60);
    expect(getQuestions('integral')).toHaveLength(90);
  });

  it('renderiza todo el LaTeX con KaTeX sin errores', () => {
    const failures: string[] = [];
    for (const q of QUESTIONS) {
      const fields = [
        ['prompt', q.prompt],
        ['answer', q.answer],
        ['distractors[0]', q.distractors[0]],
        ['distractors[1]', q.distractors[1]],
        ['distractors[2]', q.distractors[2]],
      ] as const;
      for (const [field, latex] of fields) {
        try {
          renderLatex(latex, { display: true, throwOnError: true });
        } catch (err) {
          failures.push(
            `${q.id} ${field}: ${(err as Error).message.split('\n')[0]}`
          );
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it('tiene tres distractores distintos entre sí y distintos de la respuesta', () => {
    const repeated = QUESTIONS.filter((q) => {
      const options = [q.answer, ...q.distractors].map((s) =>
        s.replace(/\s+/g, '')
      );
      return new Set(options).size !== options.length;
    }).map((q) => q.id);
    expect(repeated).toEqual([]);
  });

  it('cada subtema tiene preguntas suficientes para sus juegos (salvo los huecos conocidos)', () => {
    const gaps = findCoverageGaps();
    const keys = gaps.map((g) => `${g.topic}.${g.subtopic}.${g.game}`);
    for (const g of gaps) {
      console.warn(
        `Hueco de contenido: ${g.topic}/${g.subtopic} tiene ${g.have} preguntas y ${g.game} necesita ${g.need}`
      );
    }
    expect(keys.filter((k) => !KNOWN_GAPS.includes(k))).toEqual([]);
    // Si un hueco conocido ya se resolvió, hay que quitarlo de la lista.
    expect(KNOWN_GAPS.filter((k) => !keys.includes(k))).toEqual([]);
  });
});

describe('temas', () => {
  it('todos los subtemas tienen al menos una pregunta', () => {
    const empty = TOPICS.flatMap((t) =>
      t.subtopics
        .filter((s) => getQuestions(t.id, s.id).length === 0)
        .map((s) => s.id)
    );
    expect(empty).toEqual([]);
  });

  it('"todos" reúne las preguntas de todos los subtemas del tema', () => {
    for (const t of TOPICS) {
      const sum = t.subtopics.reduce(
        (n, s) => n + getQuestions(t.id, s.id).length,
        0
      );
      expect(getQuestions(t.id, ALL_SUBTOPICS)).toHaveLength(sum);
    }
  });
});

describe('filtro por juego', () => {
  const base = QUESTIONS.find((q) => q.subtopic === 'por_partes')!;
  const bank = [
    { ...base, id: 'integral.por_partes.90' },
    { ...base, id: 'integral.por_partes.91', games: ['bomb' as const] },
    {
      ...base,
      id: 'integral.por_partes.92',
      games: ['bomb' as const, 'race' as const],
    },
  ];
  const ids = (game?: 'memory' | 'bomb' | 'race') =>
    filterQuestions(bank, 'integral', 'por_partes', game).map((q) =>
      q.id.slice(-2)
    );

  it('sin juego devuelve todas', () => {
    expect(ids()).toEqual(['90', '91', '92']);
  });

  it('excluye las preguntas que declaran no usarse en ese juego', () => {
    expect(ids('memory')).toEqual(['90']);
    expect(ids('bomb')).toEqual(['90', '91', '92']);
    expect(ids('race')).toEqual(['90', '92']);
  });
});
