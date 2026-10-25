import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { fakeQuestions } from '../../test/rng';
import { BombGame } from './BombGame';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

function setup() {
  const onScoreChange = vi.fn();
  const onFinish = vi.fn();
  render(
    <BombGame
      questions={fakeQuestions(8)}
      difficulty="Normal"
      onScoreChange={onScoreChange}
      onFinish={onFinish}
    />
  );
  return { onScoreChange, onFinish };
}

/** Número de la pregunta que se está mostrando (las de prueba se llaman "preguntaN"). */
function currentNumber(): number {
  const text =
    screen.getByText(/Resuelve para cortar/).parentElement!.textContent!;
  return Number(/pregunta(\d+)/.exec(text)![1]);
}
const options = () => screen.getAllByRole('button');
const findOption = (marker: string) =>
  options().find((b) => b.textContent!.includes(marker))!;
const correct = () => findOption(`correcta${currentNumber()}`);
const wrong = () => findOption(`mala${currentNumber()}a`);

describe('<BombGame>', () => {
  it('empieza con 30 s y cuatro cables', () => {
    setup();
    expect(screen.getByRole('timer')).toHaveTextContent('00:30');
    expect(options()).toHaveLength(4);
  });

  it('un acierto suma 50 puntos y 5 s', () => {
    const { onScoreChange } = setup();
    fireEvent.click(correct());
    expect(onScoreChange).toHaveBeenLastCalledWith(50);
    expect(screen.getByRole('timer')).toHaveTextContent('00:35');
  });

  it('un error resta 20 y 5 s, resalta el cable correcto y avanza tras 1.5 s', () => {
    const { onScoreChange } = setup();
    const before = currentNumber();
    const right = correct();
    fireEvent.click(wrong());
    expect(onScoreChange).toHaveBeenLastCalledWith(-20);
    expect(screen.getByRole('timer')).toHaveTextContent('00:25');
    expect(options().every((b) => b.hasAttribute('disabled'))).toBe(true);
    expect(right).toHaveClass('bg-green-500');

    act(() => vi.advanceTimersByTime(1500));
    expect(options().every((b) => !b.hasAttribute('disabled'))).toBe(true);
    expect(currentNumber()).not.toBe(before);
  });

  it('gana al acertar 5 veces con 250 puntos', () => {
    const { onFinish } = setup();
    for (let i = 0; i < 5; i++) fireEvent.click(correct());
    expect(onFinish).toHaveBeenCalledExactlyOnceWith({ won: true, score: 250 });
  });

  it('pierde cuando se acaba el tiempo', () => {
    const { onFinish } = setup();
    act(() => vi.advanceTimersByTime(29_000));
    expect(screen.getByRole('timer')).toHaveTextContent('00:01');
    expect(onFinish).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole('timer')).toHaveTextContent('00:00');
    expect(onFinish).toHaveBeenCalledExactlyOnceWith({ won: false, score: 0 });
  });

  it('deja de contar el tiempo al terminar', () => {
    const { onFinish } = setup();
    for (let i = 0; i < 5; i++) fireEvent.click(correct());
    act(() => vi.advanceTimersByTime(60_000));
    expect(onFinish).toHaveBeenCalledTimes(1);
  });
});
