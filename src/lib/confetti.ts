import confetti from 'canvas-confetti';

/** Confeti de victoria. Respeta `prefers-reduced-motion` y nunca rompe el juego si el canvas falla. */
export function celebrate(): void {
  try {
    void confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#fce18a', '#ff726d', '#b48def', '#f4306d'],
      disableForReducedMotion: true,
    })?.catch(() => undefined);
  } catch {
    // Sin canvas (p. ej. en pruebas) simplemente no hay confeti.
  }
}
