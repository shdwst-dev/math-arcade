import { describe, expect, it } from 'vitest';
import { fakeQuestions, seededRng } from '../../test/rng';
import {
  BOMB_MAX_SCORE,
  BOMB_START_SECONDS,
  bombReducer,
  createBomb,
  currentRound,
  formatBombTime,
  type BombState,
} from './logic';

const newGame = (seed = 3, count = 8) =>
  createBomb(fakeQuestions(count), seededRng(seed));
const correctIndex = (s: BombState) =>
  currentRound(s).options.findIndex((o) => o.correct);
const wrongIndex = (s: BombState) =>
  currentRound(s).options.findIndex((o) => !o.correct);
const answer = (s: BombState, optionIndex: number) =>
  bombReducer(s, { type: 'answer', optionIndex });
const tick = (s: BombState) => bombReducer(s, { type: 'tick' });
const advance = (s: BombState) => bombReducer(s, { type: 'advance' });

describe('Bomba: rondas', () => {
  it('cada ronda tiene 4 opciones y exactamente una correcta', () => {
    for (const round of newGame().rounds) {
      expect(round.options).toHaveLength(4);
      expect(round.options.filter((o) => o.correct)).toHaveLength(1);
    }
  });

  it('con pocas preguntas repite en ciclo y nunca se queda sin rondas', () => {
    const state = newGame(1, 3);
    const prompts = state.rounds.slice(0, 6).map((r) => r.prompt);
    expect(prompts.slice(0, 3)).toEqual(prompts.slice(3, 6));
    expect(new Set(prompts).size).toBe(3);
  });

  it('empieza con 30 s, sin puntos y esperando respuesta', () => {
    const state = newGame();
    expect(state).toMatchObject({
      timeLeft: BOMB_START_SECONDS,
      score: 0,
      status: 'answering',
    });
  });
});

describe('Bomba: reglas', () => {
  it('un acierto suma 50 puntos y 5 s y pasa a la siguiente pregunta', () => {
    let state = newGame();
    const firstPrompt = currentRound(state).prompt;
    state = answer(state, correctIndex(state));
    expect(state).toMatchObject({
      score: 50,
      timeLeft: 35,
      remaining: 4,
      status: 'answering',
    });
    expect(currentRound(state).prompt).not.toBe(firstPrompt);
  });

  it('un error resta 20 puntos y 5 s y muestra la respuesta antes de avanzar', () => {
    let state = newGame();
    const index = wrongIndex(state);
    const prompt = currentRound(state).prompt;
    state = answer(state, index);
    expect(state).toMatchObject({
      score: -20,
      timeLeft: 25,
      status: 'revealing',
      picked: index,
    });
    expect(currentRound(state).prompt).toBe(prompt);
    expect(answer(state, correctIndex(state))).toBe(state); // no se puede contestar mientras se revela
    state = advance(state);
    expect(state.status).toBe('answering');
    expect(state.picked).toBeNull();
    expect(currentRound(state).prompt).not.toBe(prompt);
  });

  it('gana al acertar 5 veces y el máximo posible es 250', () => {
    let state = newGame();
    for (let i = 0; i < 5; i++) state = answer(state, correctIndex(state));
    expect(state.status).toBe('won');
    expect(state.score).toBe(BOMB_MAX_SCORE);
    expect(BOMB_MAX_SCORE).toBe(250);
    expect(tick(state)).toBe(state);
  });

  it('pierde cuando el tiempo llega a 0', () => {
    let state = newGame();
    for (let i = 0; i < BOMB_START_SECONDS - 1; i++) state = tick(state);
    expect(state).toMatchObject({ timeLeft: 1, status: 'answering' });
    state = tick(state);
    expect(state).toMatchObject({ timeLeft: 0, status: 'lost' });
    expect(answer(state, 0)).toBe(state);
  });

  it('el reloj sigue corriendo mientras se muestra la respuesta correcta', () => {
    let state = answer(newGame(), wrongIndex(newGame()));
    state = tick(state);
    expect(state).toMatchObject({ timeLeft: 24, status: 'revealing' });
  });

  it('si un error deja el tiempo en 0 o menos, se pierde al terminar de revelar', () => {
    let state = newGame();
    for (let i = 0; i < 24; i++) state = tick(state); // quedan 6 s
    state = answer(state, wrongIndex(state));
    expect(state).toMatchObject({ timeLeft: 1, status: 'revealing' });
    state = tick(state);
    expect(state.status).toBe('lost');

    let late = newGame();
    for (let i = 0; i < 26; i++) late = tick(late); // quedan 4 s
    late = answer(late, wrongIndex(late));
    expect(late).toMatchObject({ timeLeft: -1, status: 'revealing' });
    expect(advance(late).status).toBe('lost');
  });

  it('ignora opciones inexistentes y "advance" fuera de lugar', () => {
    const state = newGame();
    expect(answer(state, 9)).toBe(state);
    expect(advance(state)).toBe(state);
  });
});

describe('Bomba: formato del reloj', () => {
  it('muestra mm:ss y nunca negativo', () => {
    expect(formatBombTime(30)).toBe('00:30');
    expect(formatBombTime(5)).toBe('00:05');
    expect(formatBombTime(75)).toBe('01:15');
    expect(formatBombTime(-3)).toBe('00:00');
  });
});
