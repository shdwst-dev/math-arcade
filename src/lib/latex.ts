import katex from 'katex';

type RenderOptions = {
  /** Modo bloque (centrado y más grande), como el `$$…$$` de v1. */
  display?: boolean;
  /** Lanza un error si el LaTeX es inválido. En la interfaz se muestra el texto en rojo. */
  throwOnError?: boolean;
  /** Modo estricto de KaTeX: 'error' hace fallar también lo no estándar (lo usan las pruebas). */
  strict?: 'ignore' | 'warn' | 'error';
};

/** Convierte LaTeX a HTML con KaTeX. El resultado es seguro para `dangerouslySetInnerHTML`. */
export function renderLatex(
  latex: string,
  {
    display = false,
    throwOnError = false,
    strict = 'ignore',
  }: RenderOptions = {}
): string {
  return katex.renderToString(latex, {
    displayMode: display,
    throwOnError,
    strict,
    errorColor: '#f87171',
  });
}
