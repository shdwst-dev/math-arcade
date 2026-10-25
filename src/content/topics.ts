// Temas y subtemas (antes js/data/subtemas.js). Los ids son los de v1 y no deben
// cambiar: forman parte de las llaves de los récords guardados.
export const TOPICS = [
  {
    id: 'fundamentos',
    name: 'Fundamentos',
    description: 'Álgebra y Aritmética básica',
    icon: '📐',
    color:
      'from-blue-900 to-blue-800 border-blue-500 hover:from-blue-800 hover:to-blue-700',
    subtopics: [
      { id: 'productos_notables', name: 'Productos Notables', emoji: '✖️' },
      { id: 'factorizacion', name: 'Factorización', emoji: '🔢' },
      { id: 'ecuaciones_1', name: 'Ec. 1er Grado', emoji: '📏' },
      { id: 'ecuaciones_2', name: 'Ec. 2do Grado', emoji: '📐' },
      { id: 'ecuaciones_3', name: 'Ec. 3er Grado', emoji: '🧊' },
      { id: 'desigualdades', name: 'Desigualdades', emoji: '⚖️' },
      { id: 'matrices', name: 'Matrices', emoji: '🔲' },
      { id: 'aplicaciones_fund', name: 'Aplicaciones', emoji: '🎯' },
    ],
  },
  {
    id: 'diferencial',
    name: 'Cálculo Diferencial',
    description: 'Límites y Derivadas',
    icon: '📉',
    color:
      'from-green-900 to-green-800 border-green-500 hover:from-green-800 hover:to-green-700',
    subtopics: [
      { id: 'funciones', name: 'Funciones', emoji: '📊' },
      { id: 'limites', name: 'Límites', emoji: '🎯' },
      { id: 'derivadas_directas', name: 'Derivadas Directas', emoji: '⚡' },
      { id: 'metodos_derivadas', name: 'Métodos de Derivadas', emoji: '🔧' },
      { id: 'limites_infinito', name: 'Límites al Infinito', emoji: '♾️' },
      { id: 'aplicaciones_dif', name: 'Aplicaciones', emoji: '🎯' },
    ],
  },
  {
    id: 'integral',
    name: 'Cálculo Integral',
    description: 'Áreas y Sumas',
    icon: '∫',
    color:
      'from-purple-900 to-purple-800 border-purple-500 hover:from-purple-800 hover:to-purple-700',
    subtopics: [
      { id: 'sumas_riemann', name: 'Sumas de Riemann', emoji: '📊' },
      { id: 'integrales_directas', name: 'Integrales Directas', emoji: '⚡' },
      { id: 'integrales_metodos', name: 'Int. por Métodos', emoji: '🔧' },
      { id: 'integrales_evaluadas', name: 'Int. Evaluadas', emoji: '📏' },
      { id: 'integrales_trig', name: 'Int. Trigonométricas', emoji: '📐' },
      { id: 'cambio_variable', name: 'Cambio de Variable', emoji: '🔄' },
      { id: 'por_partes', name: 'Int. por Partes', emoji: '✂️' },
      { id: 'fracciones_parciales', name: 'Fracciones Parciales', emoji: '➗' },
      { id: 'aplicaciones_int', name: 'Aplicaciones', emoji: '🎯' },
    ],
  },
] as const;

export type TopicId = (typeof TOPICS)[number]['id'];
export type Topic = (typeof TOPICS)[number];
export type SubtopicId = Topic['subtopics'][number]['id'];
export type Subtopic = Topic['subtopics'][number];

/** Valor de la URL y de las llaves de récord que significa "todos los subtemas". */
export const ALL_SUBTOPICS = 'todos';
export type SubtopicSelection = SubtopicId | typeof ALL_SUBTOPICS;

export const TOPIC_IDS = TOPICS.map((t) => t.id);

export function isTopicId(value: string | undefined): value is TopicId {
  return TOPICS.some((t) => t.id === value);
}

export function getTopic(id: TopicId): Topic {
  return TOPICS.find((t) => t.id === id)!;
}

/** Subtemas de un tema como lista de solo lectura sin literales fijos (para buscar por id). */
export function getSubtopics(topicId: TopicId): readonly Subtopic[] {
  return getTopic(topicId).subtopics;
}

export function isSubtopicOf(
  topicId: TopicId,
  value: string | undefined
): value is SubtopicId {
  return getSubtopics(topicId).some((s) => s.id === value);
}

export function isSubtopicSelection(
  topicId: TopicId,
  value: string | undefined
): value is SubtopicSelection {
  return value === ALL_SUBTOPICS || isSubtopicOf(topicId, value);
}
