import { describe, expect, it } from 'vitest';
import { fakeQuestions, seededRng } from '../../test/rng';
import { DIFFICULTIES, type Difficulty } from '../ids';
import {
  RACE_CONFIG,
  RACE_FRAME_MS,
  RACE_HIT_FROM,
  RACE_HIT_TO,
  RACE_MAX_ITEMS,
  createRace,
  moveLane,
  raceMaxScore,
  stepRace,
  type RaceEvent,
  type RaceItem,
  type RaceState,
} from './logic';

const questions = fakeQuestions(6);
const newGame = (difficulty: Difficulty = 'Normal', seed = 1) =>
  createRace(questions, difficulty, seededRng(seed));

/** Un rng constante: todo cae en el carril 2 y es la respuesta correcta (sin chocar con el auto en el carril 1). */
const lane2 = () => 0.99;

function itemFor(state: RaceState, patch: Partial<RaceItem> = {}): RaceItem {
  return {
    id: 100,
    lane: state.lane,
    y: RACE_HIT_FROM, // el siguiente paso lo mete en la zona de choque
    latex: 'x',
    isAnswer: true,
    questionId: state.question.id,
    ...patch,
  };
}

/** Simula `seconds` a `fps` cuadros por segundo y devuelve el estado final y todos los eventos. */
function simulate(state: RaceState, seconds: number, fps: number, rng = lane2) {
  const dt = 60 / fps;
  const events: RaceEvent[] = [];
  const steps = Math.round(seconds * fps);
  for (let i = 0; i < steps; i++) {
    const result = stepRace(state, dt, rng);
    state = result.state;
    events.push(...result.events);
  }
  return { state, events };
}

describe('Carrera: configuración (igual que v1)', () => {
  it.each([
    ['Fácil', 1.0, 180, 300],
    ['Normal', 1.5, 150, 500],
    ['Difícil', 2.5, 100, 800],
  ] as const)(
    '%s: velocidad %d, aparición cada %d cuadros, meta %d',
    (d, speed, every, target) => {
      expect(RACE_CONFIG[d]).toMatchObject({
        speed,
        spawnEvery: every,
        target,
      });
    }
  );

  it('el puntaje máximo posible es la meta + 40', () => {
    expect(DIFFICULTIES.map(raceMaxScore)).toEqual([340, 540, 840]);
  });

  it('empieza en el carril central, sin objetos ni puntos', () => {
    expect(newGame()).toMatchObject({
      lane: 1,
      items: [],
      score: 0,
      status: 'playing',
    });
  });

  it('moveLane se queda dentro de los 3 carriles', () => {
    let state = newGame();
    state = moveLane(moveLane(state, -1), -1);
    expect(state.lane).toBe(0);
    state = moveLane(moveLane(moveLane(state, 1), 1), 1);
    expect(state.lane).toBe(2);
  });
});

describe('Carrera: apariciones', () => {
  it('el primer objeto aparece a los 150 cuadros (2.5 s) en Normal', () => {
    let state = newGame();
    for (let i = 0; i < 149; i++) state = stepRace(state, 1, lane2).state;
    expect(state.items).toHaveLength(0);
    const { state: after, events } = stepRace(state, 1, lane2);
    expect(after.items).toHaveLength(1);
    expect(events.find((e) => e.type === 'spawn')).toBeDefined();
  });

  it('cae desde arriba de la pista (fuera de la vista)', () => {
    const { state } = simulate(newGame(), 2.6, 60);
    expect(state.items[0].y).toBeLessThan(0);
  });

  it('nunca hay más de 8 objetos a la vez', () => {
    let state = { ...newGame(), sinceSpawn: 1000 };
    state = {
      ...state,
      items: Array.from({ length: RACE_MAX_ITEMS }, (_, i) =>
        itemFor(state, { id: i, y: 10, lane: 2 })
      ),
    };
    const { state: after, events } = stepRace(state, 1, lane2);
    expect(after.items).toHaveLength(RACE_MAX_ITEMS);
    expect(events.some((e) => e.type === 'spawn')).toBe(false);
  });

  it('aproximadamente el 40 % de los objetos son la respuesta correcta', () => {
    const rng = seededRng(42);
    let answers = 0;
    const total = 2000;
    for (let i = 0; i < total; i++) {
      const { events } = stepRace({ ...newGame(), sinceSpawn: 1000 }, 1, rng);
      const spawn = events.find((e) => e.type === 'spawn');
      if (spawn?.type === 'spawn' && spawn.item.isAnswer) answers++;
    }
    expect(answers / total).toBeGreaterThan(0.36);
    expect(answers / total).toBeLessThan(0.44);
  });

  it('cada objeto lleva la respuesta o uno de los distractores de la pregunta actual', () => {
    const state = newGame();
    for (let i = 0; i < 50; i++) {
      const { events } = stepRace(
        { ...state, sinceSpawn: 1000 },
        1,
        seededRng(i)
      );
      const spawn = events.find((e) => e.type === 'spawn');
      if (spawn?.type !== 'spawn') throw new Error('debió aparecer un objeto');
      const valid = spawn.item.isAnswer
        ? [state.question.answer]
        : state.question.distractors;
      expect(valid).toContain(spawn.item.latex);
      expect(spawn.item.questionId).toBe(state.question.id);
    }
  });
});

describe('Carrera: independencia de la tasa de cuadros', () => {
  const rates = [30, 60, 120, 144];

  // Se evita medir justo cuando la aparición (cada N cuadros) y el aumento de
  // dificultad (cada 300) caen en el mismo cuadro: ahí el redondeo decide el orden.
  it.each([
    ['Fácil', 9.2],
    ['Normal', 4.9],
  ] as const)(
    '%s: el reloj del juego avanza igual a 30, 60, 120 y 144 Hz',
    (difficulty, seconds) => {
      const results = rates.map((fps) =>
        simulate(newGame(difficulty), seconds, fps)
      );
      const [base, ...others] = results;
      expect(
        base.events.filter((e) => e.type === 'spawn').length
      ).toBeGreaterThan(0);
      for (const r of others) {
        expect(r.events.filter((e) => e.type === 'spawn')).toHaveLength(
          base.events.filter((e) => e.type === 'spawn').length
        );
        expect(r.state.spawnEvery).toBe(base.state.spawnEvery);
        expect(r.state.speed).toBeCloseTo(base.state.speed, 2);
        expect(r.state.items.map((i) => i.id)).toEqual(
          base.state.items.map((i) => i.id)
        );
        // Menos de 0.1 % del alto de la pista (< 1 px): error normal de integrar por cuadros.
        r.state.items.forEach((item, i) =>
          expect(Math.abs(item.y - base.state.items[i].y)).toBeLessThan(0.1)
        );
      }
    }
  );

  it('un objeto recorre la pista en el mismo tiempo sin importar los Hz (≈5.2 s en Normal)', () => {
    for (const fps of rates) {
      const item = itemFor(newGame(), { lane: 2, y: -10 });
      let state: RaceState = {
        ...newGame(),
        items: [item],
        sinceSpawn: -10000,
      };
      const dt = 60 / fps;
      let steps = 0;
      while (state.items.length > 0 && steps < 100000) {
        state = stepRace(state, dt, lane2).state;
        steps++;
      }
      const seconds = (steps * dt * RACE_FRAME_MS) / 1000;
      expect(seconds).toBeGreaterThan(5.5);
      expect(seconds).toBeLessThan(6.8);
    }
  });

  it('la velocidad deja de subir al llegar al máximo de la dificultad', () => {
    for (const d of DIFFICULTIES) {
      const { state } = simulate(newGame(d), 400, 60);
      expect(state.speed).toBeLessThan(RACE_CONFIG[d].maxSpeed + 0.01);
      expect(state.speed).toBeGreaterThan(RACE_CONFIG[d].maxSpeed - 0.01);
    }
  });

  it('las apariciones se aceleran de 5 en 5 cada 300 cuadros sin bajar del mínimo', () => {
    const { state: early } = simulate(newGame(), 5.1, 60);
    expect(early.spawnEvery).toBe(145);
    for (const d of DIFFICULTIES) {
      const { state } = simulate(newGame(d), 600, 60);
      expect(state.spawnEvery).toBe(RACE_CONFIG[d].minSpawnEvery);
    }
  });
});

describe('Carrera: choques', () => {
  it('recoger la respuesta correcta suma 50, acelera y cambia la pregunta', () => {
    const state = newGame();
    const start: RaceState = {
      ...state,
      items: [itemFor(state)],
      sinceSpawn: -10000,
    };
    const { state: after, events } = stepRace(start, 1, seededRng(5));
    const correct = events.find((e) => e.type === 'correct');
    expect(correct).toBeDefined();
    expect(after.score).toBe(50);
    expect(after.speed).toBeGreaterThan(start.speed + 0.09);
    expect(after.items).toHaveLength(0);
    expect(after.question).toBe(
      correct?.type === 'correct' ? correct.nextQuestion : null
    );
  });

  it('chocar con una respuesta incorrecta resta 20 y muestra la correcta', () => {
    const state = newGame();
    const start: RaceState = {
      ...state,
      items: [itemFor(state, { isAnswer: false })],
      sinceSpawn: -10000,
    };
    const { state: after, events } = stepRace(start, 1, lane2);
    expect(after.score).toBe(-20);
    expect(after.status).toBe('playing');
    expect(events).toContainEqual(
      expect.objectContaining({
        type: 'wrong',
        correctAnswer: state.question.answer,
      })
    );
  });

  it('no hay choque si el objeto está en otro carril o fuera de la zona', () => {
    const state = newGame();
    const otherLane = itemFor(state, { lane: 0 });
    const tooHigh = itemFor(state, { y: RACE_HIT_FROM - 5 });
    const tooLow = itemFor(state, { y: RACE_HIT_TO });
    const { state: after, events } = stepRace(
      { ...state, items: [otherLane, tooHigh, tooLow], sinceSpawn: -10000 },
      1,
      lane2
    );
    expect(after.score).toBe(0);
    expect(
      events.filter((e) => e.type === 'correct' || e.type === 'wrong')
    ).toEqual([]);
  });

  it('los objetos de una pregunta anterior quedan inertes (no puntúan ni restan)', () => {
    const state = newGame();
    const stale = itemFor(state, { questionId: 'otra.pregunta.01' });
    const { state: after, events } = stepRace(
      { ...state, items: [stale], sinceSpawn: -10000 },
      1,
      lane2
    );
    expect(after.score).toBe(0);
    expect(events).toEqual([]);
    expect(after.items).toHaveLength(1);
  });

  it('un objeto que sale por abajo se elimina', () => {
    const state = newGame();
    const gone = itemFor(state, { lane: 2, y: 104 });
    const { state: after, events } = stepRace(
      { ...state, items: [gone], sinceSpawn: -10000 },
      1,
      lane2
    );
    expect(after.items).toHaveLength(0);
    expect(events).toContainEqual({ type: 'leave', id: gone.id });
  });

  it('gana al llegar a la meta de la dificultad', () => {
    for (const d of DIFFICULTIES) {
      const state = newGame(d);
      const target = RACE_CONFIG[d].target;
      const start: RaceState = {
        ...state,
        score: target - 50,
        items: [itemFor(state)],
        sinceSpawn: -10000,
      };
      const { state: after, events } = stepRace(start, 1, lane2);
      expect(after.status).toBe('won');
      expect(events).toContainEqual({ type: 'finish', won: true });
      expect(stepRace(after, 1, lane2).events).toEqual([]);
    }
  });

  it('pierde solo al bajar de −100 (con −100 exactos sigue)', () => {
    const state = newGame();
    const hit = (score: number) =>
      stepRace(
        {
          ...state,
          score,
          items: [itemFor(state, { isAnswer: false })],
          sinceSpawn: -10000,
        },
        1,
        lane2
      );
    expect(hit(-80).state).toMatchObject({ score: -100, status: 'playing' });
    const lost = hit(-90);
    expect(lost.state).toMatchObject({ score: -110, status: 'lost' });
    expect(lost.events).toContainEqual({ type: 'finish', won: false });
  });

  it('con pasos grandes (3 cuadros) a máxima velocidad no atraviesa el auto', () => {
    const state = newGame('Difícil');
    const fast: RaceState = {
      ...state,
      speed: 6.6,
      items: [itemFor(state, { y: RACE_HIT_FROM - 3.9 })],
      sinceSpawn: -10000,
    };
    const { events } = stepRace(fast, 3, lane2);
    expect(events.some((e) => e.type === 'correct')).toBe(true);
  });
});

describe('Carrera: el puntaje nunca supera el máximo permitido por el servidor', () => {
  it.each(DIFFICULTIES)(
    '%s: agente que cambia de carril al azar durante muchas partidas',
    (difficulty) => {
      let best = -Infinity;
      for (let seed = 0; seed < 40; seed++) {
        const rng = seededRng(seed);
        let state = createRace(questions, difficulty, rng);
        for (
          let step = 0;
          step < 60 * 60 * 3 && state.status === 'playing';
          step++
        ) {
          if (step % 20 === 0) state = moveLane(state, rng() < 0.5 ? -1 : 1);
          // Un jugador "perfecto": va al carril de la respuesta correcta más cercana.
          const target = state.items.find(
            (i) => i.isAnswer && i.questionId === state.question.id && i.y > 40
          );
          if (target && step % 3 === 0 && state.lane !== target.lane) {
            state = moveLane(state, target.lane > state.lane ? 1 : -1);
          }
          state = stepRace(state, 1, rng).state;
          best = Math.max(best, state.score);
        }
      }
      expect(best).toBeLessThanOrEqual(raceMaxScore(difficulty));
      expect(best).toBeGreaterThan(0);
    }
  );
});
