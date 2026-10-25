import { useLayoutEffect, type RefObject } from 'react';

/** Escala mínima a la que se reduce una fórmula antes de dejar que se desplace. */
export const MIN_FIT_SCALE = 0.6;

/**
 * Reduce el tamaño de letra del elemento hasta que su contenido quepa en su
 * ancho (sin bajar de `MIN_FIT_SCALE`; si aun así no cabe, se desplaza). Las
 * fórmulas de KaTeX usan `em`, así que escalan junto con el elemento.
 * `dependency` indica cuándo cambió el contenido y hay que volver a medir.
 */
export function useShrinkToFit(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
  dependency: unknown
) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const fit = () => {
      el.style.fontSize = '';
      const { scrollWidth, clientWidth } = el;
      if (clientWidth > 0 && scrollWidth > clientWidth) {
        el.style.fontSize = `${Math.max(MIN_FIT_SCALE, clientWidth / scrollWidth)}em`;
      }
    };

    fit();
    window.addEventListener('resize', fit);
    return () => {
      window.removeEventListener('resize', fit);
      el.style.fontSize = '';
    };
  }, [ref, enabled, dependency]);
}
