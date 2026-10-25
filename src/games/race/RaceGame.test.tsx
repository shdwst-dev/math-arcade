import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { fakeQuestions } from '../../test/rng';
import { RaceGame } from './RaceGame';

beforeEach(() => {
  vi.useFakeTimers({
    toFake: [
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'performance',
      'setTimeout',
      'clearTimeout',
    ],
  });
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function setup(difficulty: 'Fácil' | 'Normal' | 'Difícil' = 'Normal') {
  const onScoreChange = vi.fn();
  const onFinish = vi.fn();
  render(
    <RaceGame
      questions={fakeQuestions(6)}
      difficulty={difficulty}
      onScoreChange={onScoreChange}
      onFinish={onFinish}
    />
  );
  return { onScoreChange, onFinish };
}

/** Avanza el reloj de a un cuadro, dejando que React procese cada evento. */
function run(seconds: number) {
  for (let t = 0; t < seconds * 1000; t += 16)
    act(() => vi.advanceTimersByTime(16));
}

const car = () => screen.getByTestId('race-car');

describe('<RaceGame>', () => {
  it('muestra la pregunta, la meta de la dificultad y el auto en el carril central', () => {
    setup('Difícil');
    expect(screen.getByText('Meta: 800 puntos')).toBeInTheDocument();
    expect(document.body).toHaveTextContent(/pregunta\d/);
    expect(car()).toHaveAttribute('data-lane', '1');
  });

  it('las flechas y los toques a los lados mueven el auto sin salirse de la pista', () => {
    setup();
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(car()).toHaveAttribute('data-lane', '0');
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(car()).toHaveAttribute('data-lane', '0');
    fireEvent.pointerDown(
      screen.getByRole('button', { name: 'Mover a la derecha' })
    );
    fireEvent.pointerDown(
      screen.getByRole('button', { name: 'Mover a la derecha' })
    );
    fireEvent.pointerDown(
      screen.getByRole('button', { name: 'Mover a la derecha' })
    );
    expect(car()).toHaveAttribute('data-lane', '2');
    fireEvent.pointerDown(
      screen.getByRole('button', { name: 'Mover a la izquierda' })
    );
    expect(car()).toHaveAttribute('data-lane', '1');
  });

  it('el primer objeto aparece a los 2.5 s y cae hacia el auto', () => {
    setup();
    run(2.3);
    expect(screen.queryAllByTestId('race-item')).toHaveLength(0);
    run(0.4);
    const [item] = screen.getAllByTestId('race-item');
    const top = () => parseFloat(item.style.top);
    const first = top();
    run(1);
    expect(top()).toBeGreaterThan(first);
  });

  it('recoger respuestas correctas hasta la meta gana la partida', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99); // todo cae en el carril 2 y es correcto
    const { onScoreChange, onFinish } = setup('Fácil');
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    run(120);
    expect(onScoreChange).toHaveBeenCalledWith(50);
    expect(onFinish).toHaveBeenCalledExactlyOnceWith({ won: true, score: 300 });
  });

  it('chocar con respuestas incorrectas hasta bajar de −100 pierde la partida', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5); // carril 1 (donde está el auto) y distractor
    const { onFinish } = setup('Normal');
    run(60);
    expect(onFinish).toHaveBeenCalledExactlyOnceWith({
      won: false,
      score: -120,
    });
  });

  it('un error muestra cuál era la respuesta correcta', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    setup('Normal');
    run(10);
    expect(screen.getByRole('status')).toHaveTextContent('Correcto');
  });

  it('se detiene al desmontarse (no sigue animando)', () => {
    const cancel = vi.spyOn(window, 'cancelAnimationFrame');
    const { unmount } = render(
      <RaceGame
        questions={fakeQuestions(6)}
        difficulty="Normal"
        onScoreChange={vi.fn()}
        onFinish={vi.fn()}
      />
    );
    unmount();
    expect(cancel).toHaveBeenCalled();
  });
});
