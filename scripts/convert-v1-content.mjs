// Convierte los bancos de preguntas de v1 (legacy/js/data/*.js) al formato de v2
// (src/content/questions/*.ts). El contenido no se modifica: solo cambian los
// nombres de los campos (q → prompt, a → answer, subtema → subtopic) y se
// asigna un id estable por pregunta (tema.subtema.NN, en orden de aparición).
//
// Uso:  node scripts/convert-v1-content.mjs && npx prettier --write src/content/questions
//
// Es una herramienta de migración de un solo uso: a partir de la Fase 2 los
// archivos de src/content/questions se editan a mano. Se borra junto con
// legacy/ en la Fase 5.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const TOPICS = [
  { id: 'fundamentos', variable: 'dataFundamentos', exportName: 'fundamentosQuestions' },
  { id: 'diferencial', variable: 'dataDiferencial', exportName: 'diferencialQuestions' },
  { id: 'integral', variable: 'dataIntegral', exportName: 'integralQuestions' },
];

mkdirSync('src/content/questions', { recursive: true });

for (const topic of TOPICS) {
  const source = readFileSync(`legacy/js/data/${topic.id}.js`, 'utf8');
  const legacy = runInNewContext(`${source}\n${topic.variable};`);

  const counters = new Map();
  const lines = legacy.map((item) => {
    const n = (counters.get(item.subtema) ?? 0) + 1;
    counters.set(item.subtema, n);
    const question = {
      id: `${topic.id}.${item.subtema}.${String(n).padStart(2, '0')}`,
      topic: topic.id,
      subtopic: item.subtema,
      prompt: item.q,
      answer: item.a,
      distractors: item.distractors,
    };
    return `  ${JSON.stringify(question)},`;
  });

  const output = `// Generado desde legacy/js/data/${topic.id}.js con scripts/convert-v1-content.mjs.
// A partir de aquí se edita a mano. Los ids son estables: no se renumeran ni se reutilizan.
import type { Question } from '../schema';

export const ${topic.exportName}: Question[] = [
${lines.join('\n')}
];
`;
  writeFileSync(`src/content/questions/${topic.id}.ts`, output);
  console.log(`${topic.id}: ${legacy.length} preguntas`);
}
