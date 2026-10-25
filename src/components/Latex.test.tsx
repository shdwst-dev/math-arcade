import { afterEach, describe, expect, it } from 'vitest';
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

describe('<Latex fit>', () => {
  // jsdom no calcula el layout: se simulan las medidas que daría el navegador.
  function mockWidths(scrollWidth: number, clientWidth: number) {
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
      configurable: true,
      get: () => scrollWidth,
    });
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get: () => clientWidth,
    });
  }
  afterEach(() => {
    // @ts-expect-error restaura el comportamiento original de jsdom
    delete HTMLElement.prototype.scrollWidth;
    // @ts-expect-error restaura el comportamiento original de jsdom
    delete HTMLElement.prototype.clientWidth;
  });

  it('permite que el texto salte de línea', () => {
    const { container } = render(<Latex fit>{'\\text{hola}'}</Latex>);
    expect(container.firstElementChild).toHaveClass('latex-wrap');
  });

  it('sin fit no cambia nada', () => {
    mockWidths(200, 100);
    const { container } = render(<Latex>{'x'}</Latex>);
    expect(container.firstElementChild).not.toHaveClass('latex-wrap');
    expect((container.firstElementChild as HTMLElement).style.fontSize).toBe(
      ''
    );
  });

  it('si cabe, no reduce la letra', () => {
    mockWidths(100, 100);
    const { container } = render(<Latex fit>{'x'}</Latex>);
    expect((container.firstElementChild as HTMLElement).style.fontSize).toBe(
      ''
    );
  });

  it('si no cabe, reduce la letra en proporción', () => {
    mockWidths(125, 100);
    const { container } = render(<Latex fit>{'x'}</Latex>);
    expect((container.firstElementChild as HTMLElement).style.fontSize).toBe(
      '0.8em'
    );
  });

  it('nunca baja del mínimo legible (60 %)', () => {
    mockWidths(400, 100);
    const { container } = render(<Latex fit>{'x'}</Latex>);
    expect((container.firstElementChild as HTMLElement).style.fontSize).toBe(
      '0.6em'
    );
  });
});
