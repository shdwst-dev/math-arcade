import { z } from 'zod';
import { GAME_IDS, type GameId } from '../games/ids';
import { TOPICS, isSubtopicOf, type SubtopicId, type TopicId } from './topics';

/**
 * Pregunta del banco. Compatible con v1: `prompt` = `q`, `answer` = `a`,
 * `subtopic` = `subtema`. Los textos son LaTeX.
 */
export type Question = {
  /** Estable y nunca reutilizado, p. ej. "integral.por_partes.03". */
  id: string;
  topic: TopicId;
  subtopic: SubtopicId;
  prompt: string;
  answer: string;
  distractors: [string, string, string];
  /** Si se define, la pregunta solo aparece en esos juegos (p. ej. quitarla del Memorama). */
  games?: GameId[];
};

const latex = z.string().trim().min(1);

export const questionSchema = z
  .object({
    id: z
      .string()
      .regex(
        /^[a-z]+\.[a-z0-9_]+\.\d{2,}$/,
        'Formato esperado: tema.subtema.NN'
      ),
    topic: z.enum(TOPICS.map((t) => t.id) as [TopicId, ...TopicId[]]),
    subtopic: z.string(),
    prompt: latex,
    answer: latex,
    distractors: z.tuple([latex, latex, latex]),
    games: z.array(z.enum(GAME_IDS)).min(1).optional(),
  })
  .superRefine((q, ctx) => {
    if (!isSubtopicOf(q.topic, q.subtopic)) {
      ctx.addIssue({
        code: 'custom',
        path: ['subtopic'],
        message: `El subtema "${q.subtopic}" no pertenece al tema "${q.topic}"`,
      });
    }
    if (!q.id.startsWith(`${q.topic}.${q.subtopic}.`)) {
      ctx.addIssue({
        code: 'custom',
        path: ['id'],
        message: `El id "${q.id}" debe empezar con "${q.topic}.${q.subtopic}."`,
      });
    }
  });

export const questionBankSchema = z.array(questionSchema);
