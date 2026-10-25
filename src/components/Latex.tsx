import React, { useMemo, useRef } from 'react';
import clsx from 'clsx';
import { renderLatex } from '../lib/latex';
import { useShrinkToFit } from '../lib/useShrinkToFit';

type LatexProps = {
  /** Expresión en LaTeX, sin delimitadores `$`. */
  children: string;
  display?: boolean;
  /**
   * Adapta la fórmula a su contenedor: deja que el texto salte de línea y, si aun
   * así no cabe, la reduce (hasta un mínimo legible).
   */
  fit?: boolean;
  className?: string;
};

/**
 * Muestra una fórmula con KaTeX. En modo bloque las fórmulas largas se
 * desplazan en horizontal en lugar de desbordar la pantalla del celular.
 */
export const Latex: React.FC<LatexProps> = ({
  children,
  display = false,
  fit = false,
  className,
}) => {
  const html = useMemo(
    () => renderLatex(children, { display }),
    [children, display]
  );
  const ref = useRef<HTMLSpanElement>(null);
  useShrinkToFit(ref, fit, html);

  return (
    <span
      ref={ref}
      className={clsx(
        display && 'block max-w-full overflow-x-auto overflow-y-hidden',
        fit && 'latex-wrap',
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
