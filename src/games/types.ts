import type { Question } from '../content';
import type { Difficulty } from './ids';

export type GameResult = { won: boolean; score: number };

/** Lo que recibe el componente de cada juego desde `GameShell`. */
export type GameProps = {
  questions: readonly Question[];
  difficulty: Difficulty;
  /** Se llama cada vez que cambia el puntaje (la barra superior lo muestra). */
  onScoreChange: (score: number) => void;
  /** Se llama una sola vez al ganar o perder. */
  onFinish: (result: GameResult) => void;
};
