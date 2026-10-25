import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { fakeQuestions } from '../../test/rng';
import { MemoryGame } from './MemoryGame';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

function setup() {
  const onScoreChange = vi.fn();
  const onFinish = vi.fn();
  render(
    <MemoryGame
      questions={fakeQuestions(10)}
      difficulty="Normal"
      onScoreChange={onScoreChange}
      onFinish={onFinish}
    />
  );
  const cards = screen.getAllByRole('button');
  const pairs = new Map<string, HTMLElement[]>();
  for (const card of cards) {
    const id = card.getAttribute('data-pair')!;
    pairs.set(id, [...(pairs.get(id) ?? []), card]);
  }
  return { cards, pairs: [...pairs.values()], onScoreChange, onFinish };
}

const lastScore = (fn: ReturnType<typeof vi.fn>) => fn.mock.calls.at(-1)?.[0];

describe('<MemoryGame>', () => {
  it('muestra 12 cartas boca abajo', () => {
    const { cards } = setup();
    expect(cards).toHaveLength(12);
    expect(cards.every((c) => c.getAttribute('aria-pressed') === 'false')).toBe(
      true
    );
  });

  it('una pareja correcta suma 100 y las cartas se quedan boca arriba', () => {
    const { pairs, onScoreChange } = setup();
    fireEvent.click(pairs[0][0]);
    fireEvent.click(pairs[0][1]);
    expect(lastScore(onScoreChange)).toBe(100);
    expect(pairs[0][0]).toHaveAttribute('aria-pressed', 'true');
    expect(pairs[0][1]).toHaveAttribute('aria-pressed', 'true');
  });

  it('una pareja incorrecta resta 10 y se voltea sola después de 1 s', () => {
    const { pairs, onScoreChange } = setup();
    fireEvent.click(pairs[0][0]);
    fireEvent.click(pairs[1][0]);
    expect(lastScore(onScoreChange)).toBe(-10);
    expect(pairs[0][0]).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(pairs[2][0]); // el tablero está bloqueado
    expect(pairs[2][0]).toHaveAttribute('aria-pressed', 'false');

    act(() => vi.advanceTimersByTime(1000));
    expect(pairs[0][0]).toHaveAttribute('aria-pressed', 'false');
    expect(pairs[1][0]).toHaveAttribute('aria-pressed', 'false');
  });

  it('al encontrar todas las parejas termina con 600 puntos tras 0.5 s', () => {
    const { pairs, onFinish } = setup();
    for (const [a, b] of pairs) {
      fireEvent.click(a);
      fireEvent.click(b);
    }
    expect(onFinish).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(500));
    expect(onFinish).toHaveBeenCalledExactlyOnceWith({ won: true, score: 600 });
  });
});
