import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Latex } from './Latex';

describe('<Latex>', () => {
  it('renderiza la fórmula con KaTeX', () => {
    const { container } = render(<Latex>{'\\frac{x^2}{3} + C'}</Latex>);
    expect(container.querySelector('.katex')).not.toBeNull();
    expect(container.querySelector('.katex-display')).toBeNull();
  });

  it('en modo bloque permite desplazar fórmulas largas en horizontal', () => {
    const { container } = render(<Latex display>{'x'}</Latex>);
    expect(container.querySelector('.katex-display')).not.toBeNull();
    expect(container.firstElementChild).toHaveClass('overflow-x-auto');
  });

  it('no se rompe con LaTeX inválido: lo muestra en rojo', () => {
    const { container } = render(<Latex>{'\\frac{'}</Latex>);
    expect(container.querySelector('.katex-error')).not.toBeNull();
  });
});
