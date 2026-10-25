import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import clsx from 'clsx';
import { Latex } from '../../components/Latex';
import { useLatest } from '../../lib/useLatest';
import type { GameProps } from '../types';
import {
  RACE_CONFIG,
  RACE_FRAME_MS,
  RACE_LANES,
  RACE_MAX_DT,
  createRace,
  moveLane,
  stepRace,
  type Lane,
  type RaceEvent,
  type RaceItem,
} from './logic';

type Flash = 'good' | 'bad';
type RenderedItem = Pick<RaceItem, 'id' | 'lane' | 'latex' | 'questionId'> & {
  flash?: Flash;
};

const LANE_WIDTH = 100 / RACE_LANES;
/** Cuánto se ve un objeto recogido (verde) o equivocado (rojo) antes de desaparecer (ms). */
const FLASH_MS: Record<Flash, number> = { good: 100, bad: 600 };
const FEEDBACK_MS = 2000;

type FallingItemProps = {
  item: RenderedItem;
  stale: boolean;
  register: (id: number, el: HTMLDivElement | null) => void;
};

/**
 * Un objeto que cae. Su posición vertical no es estado de React: el ciclo de
 * animación la escribe directo en `style.top`, así no se re-renderiza por cuadro.
 */
const FallingItem = memo(({ item, stale, register }: FallingItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    register(item.id, ref.current);
    return () => register(item.id, null);
  }, [item.id, register]);

  return (
    <div
      ref={ref}
      data-testid="race-item"
      className="pointer-events-none absolute flex w-1/3 items-start justify-center p-1"
      style={{ left: `${item.lane * LANE_WIDTH}%` }}
    >
      <Latex
        fit
        className={clsx(
          'block max-w-full overflow-hidden rounded px-1 py-1 text-center text-xs font-bold text-white',
          item.flash === 'good' && 'bg-green-600',
          item.flash === 'bad' && 'border-2 border-white bg-red-600',
          !item.flash && (stale ? 'bg-gray-700/40 opacity-50' : 'bg-gray-700')
        )}
      >
        {item.latex}
      </Latex>
    </div>
  );
});

export const RaceGame: React.FC<GameProps> = ({
  questions,
  difficulty,
  onScoreChange,
  onFinish,
}) => {
  const [initial] = useState(() => createRace(questions, difficulty));
  const gameRef = useRef(initial);
  const elements = useRef(new Map<number, HTMLDivElement>());
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const onScoreChangeRef = useLatest(onScoreChange);
  const onFinishRef = useLatest(onFinish);

  const [lane, setLane] = useState<Lane>(initial.lane);
  const [question, setQuestion] = useState(initial.question);
  const [items, setItems] = useState<RenderedItem[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const register = useCallback((id: number, el: HTMLDivElement | null) => {
    if (!el) {
      elements.current.delete(id);
      return;
    }
    elements.current.set(id, el);
    const logic = gameRef.current.items.find((i) => i.id === id);
    if (logic) el.style.top = `${logic.y}%`;
  }, []);

  const later = useCallback((fn: () => void, ms: number) => {
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      fn();
    }, ms);
    timers.current.add(timer);
  }, []);

  const flashAndRemove = useCallback(
    (id: number, flash: Flash) => {
      setItems((list) => list.map((i) => (i.id === id ? { ...i, flash } : i)));
      later(
        () => setItems((list) => list.filter((i) => i.id !== id)),
        FLASH_MS[flash]
      );
    },
    [later]
  );

  const handleEvents = useCallback(
    (events: RaceEvent[], score: number) => {
      let scoreChanged = false;
      for (const event of events) {
        switch (event.type) {
          case 'spawn': {
            const { id, lane: itemLane, latex, questionId } = event.item;
            setItems((list) => [
              ...list,
              { id, lane: itemLane, latex, questionId },
            ]);
            break;
          }
          case 'correct':
            scoreChanged = true;
            setQuestion(event.nextQuestion);
            flashAndRemove(event.item.id, 'good');
            break;
          case 'wrong':
            scoreChanged = true;
            flashAndRemove(event.item.id, 'bad');
            setFeedback(event.correctAnswer);
            clearTimeout(feedbackTimer.current);
            feedbackTimer.current = setTimeout(
              () => setFeedback(null),
              FEEDBACK_MS
            );
            break;
          case 'leave':
            setItems((list) => list.filter((i) => i.id !== event.id));
            break;
          case 'finish':
            onFinishRef.current({ won: event.won, score });
            break;
        }
      }
      if (scoreChanged) onScoreChangeRef.current(score);
    },
    [flashAndRemove, onFinishRef, onScoreChangeRef]
  );

  // Ciclo de animación: avanza la lógica según el tiempo real transcurrido.
  useEffect(() => {
    let frameId = 0;
    let last = performance.now();
    let alive = true;

    const frame = (now: number) => {
      if (!alive) return;
      const dt = Math.min((now - last) / RACE_FRAME_MS, RACE_MAX_DT);
      last = now;
      const { state, events } = stepRace(gameRef.current, dt);
      gameRef.current = state;
      for (const item of state.items) {
        const el = elements.current.get(item.id);
        if (el) el.style.top = `${item.y}%`;
      }
      if (events.length > 0) handleEvents(events, state.score);
      if (state.status === 'playing') frameId = requestAnimationFrame(frame);
    };

    frameId = requestAnimationFrame(frame);
    const pending = timers.current;
    return () => {
      alive = false;
      cancelAnimationFrame(frameId);
      pending.forEach(clearTimeout);
      pending.clear();
      clearTimeout(feedbackTimer.current);
    };
  }, [handleEvents]);

  const steer = useCallback((direction: -1 | 1) => {
    const next = moveLane(gameRef.current, direction);
    gameRef.current = next;
    setLane(next.lane);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        steer(event.key === 'ArrowLeft' ? -1 : 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [steer]);

  return (
    <div className="mx-auto w-full max-w-md">
      <div
        className="relative w-full touch-none select-none overflow-hidden rounded-lg border-4 border-gray-600 bg-gray-800 shadow-2xl"
        style={{ height: 'clamp(380px, 64vh, 540px)' }}
      >
        {/* Carriles */}
        <div className="pointer-events-none absolute inset-0 grid grid-cols-3">
          <div className="lane" />
          <div className="lane" />
          <div className="lane" />
        </div>

        {/* Objetos que caen */}
        {items.map((item) => (
          <FallingItem
            key={item.id}
            item={item}
            stale={item.questionId !== question.id}
            register={register}
          />
        ))}

        {/* Pregunta actual y meta */}
        <div className="absolute inset-x-0 top-0 z-10">
          <div className="border-b border-yellow-500 bg-black/80 p-2 text-center text-white">
            <div className="text-lg font-bold">
              <Latex display fit>
                {question.prompt}
              </Latex>
            </div>
            <span className="mt-1 block text-xs text-yellow-300">
              Meta: {RACE_CONFIG[difficulty].target} puntos
            </span>
          </div>
          {feedback !== null && (
            <div
              role="status"
              className="border-b-2 border-red-400 bg-red-800 px-3 py-2 text-center text-xs font-bold text-white"
            >
              ❌ Incorrecto &nbsp;|&nbsp; ✅ Correcto: <Latex>{feedback}</Latex>
            </div>
          )}
        </div>

        {/* Auto del jugador */}
        <div
          data-testid="race-car"
          data-lane={lane}
          className="absolute bottom-4 flex w-1/3 items-center justify-center text-4xl transition-[left] duration-200"
          style={{ left: `${lane * LANE_WIDTH}%` }}
          aria-hidden="true"
        >
          🏎️
        </div>

        {/* Controles táctiles: tocar la mitad izquierda o derecha de la pista */}
        <div className="absolute inset-0 z-20 flex">
          <button
            type="button"
            aria-label="Mover a la izquierda"
            className="h-full w-1/2 cursor-pointer"
            onPointerDown={() => steer(-1)}
          />
          <button
            type="button"
            aria-label="Mover a la derecha"
            className="h-full w-1/2 cursor-pointer"
            onPointerDown={() => steer(1)}
          />
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-gray-500">
        Usa las flechas ← → o toca los lados
      </p>
    </div>
  );
};
