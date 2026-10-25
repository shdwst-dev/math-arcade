import React, { useMemo } from 'react';
import clsx from 'clsx';
import { renderLatex } from '../lib/latex';

type LatexProps = {
  /** Expresión en LaTeX, sin delimitadores `$`. */
  children: string;
  display?: boolean;
  className?: string;
};

/**
 * Muestra una fórmula con KaTeX. En modo bloque las fórmulas largas se
 * desplazan en horizontal en lugar de desbordar la pantalla del celular.
 */
export const Latex: React.FC<LatexProps> = ({
  children,
  display = false,
  className,
}) => {
  const html = useMemo(
    () => renderLatex(children, { display }),
    [children, display]
  );

  return (
    <span
      className={clsx(
        display && 'block max-w-full overflow-x-auto overflow-y-hidden',
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
