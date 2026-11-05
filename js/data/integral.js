const dataIntegral = [
    // ==========================================
    // 1. SUMAS DE RIEMANN (sumas_riemann)
    // ==========================================
    { subtema: "sumas_riemann", q: "\\text{La suma de Riemann aproxima el área usando:}", a: "\\text{Rectángulos}", distractors: ["\\text{Círculos}", "\\text{Triángulos}", "\\text{Trapecios}"] },
    { subtema: "sumas_riemann", q: "\\lim_{n \\to \\infty} \\sum_{i=1}^n f(x_i) \\Delta x", a: "\\int_a^b f(x) dx", distractors: ["f'(x)", "\\frac{d}{dx}f(x)", "\\infty"] },
    { subtema: "sumas_riemann", q: "\\text{En una partición uniforme de } [a,b], \\Delta x \\text{ es:}", a: "\\frac{b-a}{n}", distractors: ["b-a", "\\frac{n}{b-a}", "\\frac{a-b}{n}"] },
    { subtema: "sumas_riemann", q: "\\text{La suma de Riemann por la derecha evalúa } f \\text{ en:}", a: "x_i", distractors: ["x_{i-1}", "\\frac{x_{i-1}+x_i}{2}", "a"] },
    { subtema: "sumas_riemann", q: "\\int_0^2 x \\, dx", a: "2", distractors: ["1", "4", "\\frac{8}{3}"] },
    { subtema: "sumas_riemann", q: "\\lim_{n \\to \\infty} \\sum_{i=1}^{n} \\frac{i}{n}\\left(\\frac{1}{n}\\right)", a: "\\frac{1}{2}", distractors: ["0", "1", "\\infty"] },
    { subtema: "sumas_riemann", q: "\\text{Una suma de Riemann es más precisa cuando:}", a: "\\text{El ancho de los subintervalos disminuye}", distractors: ["\\text{El ancho de los subintervalos aumenta}", "\\text{Se usan menos rectángulos}", "\\text{Se elimina } \\Delta x"] },
    { subtema: "sumas_riemann", q: "\\text{La suma de Riemann por la izquierda evalúa } f \\text{ en:}", a: "x_{i-1}", distractors: ["x_i", "\\frac{x_{i-1}+x_i}{2}", "b"] },
    { subtema: "sumas_riemann", q: "\\text{Si } f(x)>0\\text{, la integral definida representa:}", a: "\\text{Área bajo la curva}", distractors: ["\\text{Longitud de curva}", "\\text{Pendiente}", "\\text{Volumen}"] },
    { subtema: "sumas_riemann", q: "\\text{El punto medio de } [x_{i-1}, x_i] \\text{ es:}", a: "\\frac{x_{i-1}+x_i}{2}", distractors: ["x_i - x_{i-1}", "\\frac{x_i - x_{i-1}}{2}", "x_{i-1} + x_i"] },

    // ==========================================
    // 2. INTEGRALES DIRECTAS (integrales_directas)
    // ==========================================
    { subtema: "integrales_directas", q: "\\int 2x dx", a: "x^2 + C", distractors: ["2x + C", "x + C", "x^3 + C"] },
    { subtema: "integrales_directas", q: "\\int 5 dx", a: "5x + C", distractors: ["5 + C", "0", "x^5 + C"] },
    { subtema: "integrales_directas", q: "\\int x^2 dx", a: "\\frac{x^3}{3} + C", distractors: ["2x + C", "x^3 + C", "3x^3"] },
    { subtema: "integrales_directas", q: "\\int e^x dx", a: "e^x + C", distractors: ["xe^x", "\\ln x", "1"] },
    { subtema: "integrales_directas", q: "\\int \\frac{1}{x} dx", a: "\\ln|x| + C", distractors: ["x^{-1}", "e^x", "1"] },
    { subtema: "integrales_directas", q: "\\int 3x^2 dx", a: "x^3 + C", distractors: ["3x^3 + C", "x^2 + C", "\\frac{x^3}{3} + C"] },
    { subtema: "integrales_directas", q: "\\int x^n dx \\text{ (}n \\neq -1\\text{)}", a: "\\frac{x^{n+1}}{n+1} + C", distractors: ["nx^{n-1} + C", "\\frac{x^n}{n+1} + C", "x^{n+1} + C"] },
    { subtema: "integrales_directas", q: "\\int a^x dx", a: "\\frac{a^x}{\\ln a} + C", distractors: ["a^x \\ln a + C", "a^x + C", "\\frac{a^{x+1}}{x+1} + C"] },
    { subtema: "integrales_directas", q: "\\int \\sqrt{x} dx", a: "\\frac{2}{3}x^{3/2} + C", distractors: ["\\frac{1}{2\\sqrt{x}} + C", "x^{3/2} + C", "\\frac{3}{2}x^{3/2} + C"] },
    { subtema: "integrales_directas", q: "\\int (x+1) dx", a: "\\frac{x^2}{2} + x + C", distractors: ["x^2 + x + C", "\\frac{x^2}{2} + C", "1 + C"] },

    // ==========================================
    // 3. INTEGRALES POR MÉTODOS (integrales_metodos)
    // ==========================================
    { subtema: "integrales_metodos", q: "\\text{¿Qué método usarías para } \\int x e^x dx?", a: "\\text{Por Partes}", distractors: ["\\text{Sustitución}", "\\text{Fracciones Parciales}", "\\text{Directa}"] },
    { subtema: "integrales_metodos", q: "\\int 2x e^{x^2} dx", a: "e^{x^2} + C", distractors: ["2e^{x^2} + C", "x^2e^{x^2} + C", "e^x + C"] },
    { subtema: "integrales_metodos", q: "\\int x \\cos x \\, dx", a: "x \\sin x + \\cos x + C", distractors: ["x \\sin x + C", "x \\cos x - \\sin x + C", "\\sin x + C"] },
    { subtema: "integrales_metodos", q: "\\int \\frac{2x}{x^2+1} dx", a: "\\ln(x^2+1) + C", distractors: ["\\frac{2x}{x^2+1} + C", "\\ln|x| + C", "\\frac{1}{x^2+1} + C"] },
    { subtema: "integrales_metodos", q: "\\int \\frac{1}{x^2-1} dx", a: "\\frac{1}{2}\\ln\\left|\\frac{x-1}{x+1}\\right| + C", distractors: ["\\ln|x^2-1| + C", "\\frac{1}{x^2-1} + C", "\\frac{1}{2}\\ln\\left|\\frac{x+1}{x-1}\\right| + C"] },
    { subtema: "integrales_metodos", q: "\\int \\sin x \\cos^3 x \\, dx", a: "-\\frac{\\cos^4 x}{4} + C", distractors: ["\\frac{\\sin^4 x}{4} + C", "\\frac{\\cos^4 x}{4} + C", "-\\cos^3 x + C"] },
    { subtema: "integrales_metodos", q: "\\text{El acrónimo ILATE se usa en:}", a: "\\text{Por Partes}", distractors: ["\\text{Sustitución}", "\\text{Fracciones Parciales}", "\\text{Sust. Trigonométrica}"] },
    { subtema: "integrales_metodos", q: "\\text{Para } \\int \\sqrt{1-x^2} dx \\text{, usarías:}", a: "x = \\sin \\theta", distractors: ["x = \\tan \\theta", "x = \\sec \\theta", "x = \\cos \\theta"] },
    { subtema: "integrales_metodos", q: "\\text{Para } \\int \\frac{1}{x^2+1} dx \\text{, el resultado es:}", a: "\\arctan x + C", distractors: ["\\ln(x^2+1) + C", "\\arcsin x + C", "\\tan x + C"] },
    { subtema: "integrales_metodos", q: "\\text{Para } \\int \\frac{1}{\\sqrt{1-x^2}} dx \\text{, el resultado es:}", a: "\\arcsin x + C", distractors: ["\\arccos x + C", "\\ln|1-x^2| + C", "\\arctan x + C"] },

    // ==========================================
    // 4. INTEGRALES EVALUADAS (integrales_evaluadas)
    // ==========================================
    { subtema: "integrales_evaluadas", q: "\\int_0^1 2x dx", a: "1", distractors: ["0", "2", "\\frac{1}{2}"] },
    { subtema: "integrales_evaluadas", q: "\\int_1^2 3x^2 dx", a: "7", distractors: ["8", "1", "4"] },
    { subtema: "integrales_evaluadas", q: "\\int_0^2 x^2 dx", a: "\\frac{8}{3}", distractors: ["4", "\\frac{4}{3}", "8"] },
    { subtema: "integrales_evaluadas", q: "\\int_0^{\\pi} \\sin x \\, dx", a: "2", distractors: ["0", "\\pi", "1"] },
    { subtema: "integrales_evaluadas", q: "\\int_0^1 e^x dx", a: "e-1", distractors: ["e", "1", "0"] },
    { subtema: "integrales_evaluadas", q: "\\int_{-1}^{1} x^3 dx", a: "0", distractors: ["2", "\\frac{1}{2}", "-\\frac{1}{2}"] },
    { subtema: "integrales_evaluadas", q: "\\int_0^1 (x+1) dx", a: "\\frac{3}{2}", distractors: ["1", "2", "\\frac{1}{2}"] },
    { subtema: "integrales_evaluadas", q: "\\int_0^2 4 dx", a: "8", distractors: ["4", "2", "0"] },
    { subtema: "integrales_evaluadas", q: "\\int_1^e \\frac{1}{x} dx", a: "1", distractors: ["0", "e", "e-1"] },
    { subtema: "integrales_evaluadas", q: "\\int_0^{\\pi/2} \\cos x dx", a: "1", distractors: ["0", "-1", "\\pi/2"] },

    // ==========================================
    // 5. INTEGRALES TRIGONOMÉTRICAS (integrales_trig)
    // ==========================================
    { subtema: "integrales_trig", q: "\\int \\cos x dx", a: "\\sin x + C", distractors: ["-\\sin x", "\\cos x", "-\\cos x"] },
    { subtema: "integrales_trig", q: "\\int \\sin x dx", a: "-\\cos x + C", distractors: ["\\cos x + C", "\\sin x", "1"] },
    { subtema: "integrales_trig", q: "\\int \\sec^2 x dx", a: "\\tan x + C", distractors: ["\\sec x \\tan x", "-\\cot x", "\\sin x"] },
    { subtema: "integrales_trig", q: "\\int \\csc^2 x dx", a: "-\\cot x + C", distractors: ["\\cot x + C", "\\csc x + C", "\\tan x + C"] },
    { subtema: "integrales_trig", q: "\\int \\sec x \\tan x dx", a: "\\sec x + C", distractors: ["\\tan x + C", "-\\csc x + C", "\\sec x \\tan x + C"] },
    { subtema: "integrales_trig", q: "\\int \\tan x dx", a: "-\\ln|\\cos x| + C", distractors: ["\\ln|\\cos x| + C", "\\ln|\\sin x| + C", "\\sec^2 x + C"] },
    { subtema: "integrales_trig", q: "\\int \\cot x dx", a: "\\ln|\\sin x| + C", distractors: ["-\\ln|\\cos x| + C", "-\\csc^2 x + C", "\\ln|\\cos x| + C"] },
    { subtema: "integrales_trig", q: "\\int \\sin^2 x dx", a: "\\frac{x}{2} - \\frac{\\sin(2x)}{4} + C", distractors: ["\\frac{\\sin^3 x}{3} + C", "\\frac{x}{2} + \\frac{\\sin(2x)}{4} + C", "\\cos^2 x + C"] },
    { subtema: "integrales_trig", q: "\\int \\cos^2 x dx", a: "\\frac{x}{2} + \\frac{\\sin(2x)}{4} + C", distractors: ["\\frac{\\cos^3 x}{3} + C", "\\frac{x}{2} - \\frac{\\sin(2x)}{4} + C", "\\sin^2 x + C"] },
    { subtema: "integrales_trig", q: "\\int \\csc x \\cot x dx", a: "-\\csc x + C", distractors: ["\\csc x + C", "\\cot x + C", "-\\cot x + C"] },

    // ==========================================
    // 6. CAMBIO DE VARIABLE (cambio_variable)
    // ==========================================
    { subtema: "cambio_variable", q: "\\int 2x e^{x^2} dx", a: "e^{x^2} + C", distractors: ["2e^{x^2} + C", "x^2 e^{x^2} + C", "e^x + C"] },
    { subtema: "cambio_variable", q: "\\int \\frac{x}{x^2+1} dx", a: "\\frac{1}{2}\\ln(x^2+1) + C", distractors: ["\\ln(x^2+1) + C", "\\frac{x^2}{x^2+1} + C", "\\frac{1}{x^2+1} + C"] },
    { subtema: "cambio_variable", q: "\\int \\cos(3x) dx", a: "\\frac{1}{3}\\sin(3x) + C", distractors: ["\\sin(3x) + C", "-\\frac{1}{3}\\cos(3x) + C", "3\\sin(3x) + C"] },
    { subtema: "cambio_variable", q: "\\int \\frac{1}{2x+1} dx", a: "\\frac{1}{2}\\ln|2x+1| + C", distractors: ["\\ln|2x+1| + C", "\\frac{1}{2x+1} + C", "2\\ln|2x+1| + C"] },
    { subtema: "cambio_variable", q: "\\int \\frac{3x^2}{x^3+4} dx", a: "\\ln|x^3+4| + C", distractors: ["\\frac{3x^2}{x^3+4} + C", "3\\ln|x^3+4| + C", "\\ln|x| + C"] },
    { subtema: "cambio_variable", q: "\\int (2x+1)^5 dx", a: "\\frac{(2x+1)^6}{12} + C", distractors: ["\\frac{(2x+1)^6}{6} + C", "\\frac{(2x+1)^5}{10} + C", "(2x+1)^6 + C"] },
    { subtema: "cambio_variable", q: "\\int e^{5x} dx", a: "\\frac{1}{5}e^{5x} + C", distractors: ["e^{5x} + C", "5e^{5x} + C", "\\frac{1}{5}e^x + C"] },
    { subtema: "cambio_variable", q: "\\int x\\sqrt{x^2+1} dx", a: "\\frac{1}{3}(x^2+1)^{3/2} + C", distractors: ["\\frac{2}{3}(x^2+1)^{3/2} + C", "(x^2+1)^{3/2} + C", "\\frac{1}{2}\\sqrt{x^2+1} + C"] },
    { subtema: "cambio_variable", q: "\\int \\frac{\\ln x}{x} dx", a: "\\frac{(\\ln x)^2}{2} + C", distractors: ["\\ln x + C", "\\frac{1}{x^2} + C", "x \\ln x + C"] },
    { subtema: "cambio_variable", q: "\\int \\sin^3 x \\cos x dx", a: "\\frac{\\sin^4 x}{4} + C", distractors: ["-\\frac{\\cos^4 x}{4} + C", "\\sin^4 x + C", "\\frac{\\cos^2 x}{2} + C"] },

    // ==========================================
    // 7. INTEGRACIÓN POR PARTES (por_partes)
    // ==========================================
    { subtema: "por_partes", q: "\\int x e^x dx", a: "x e^x - e^x + C", distractors: ["x e^x + C", "e^x - x e^x + C", "\\frac{x^2}{2} e^x + C"] },
    { subtema: "por_partes", q: "\\int \\ln x dx", a: "x \\ln x - x + C", distractors: ["\\frac{1}{x} + C", "x \\ln x + C", "\\ln x - x"] },
    { subtema: "por_partes", q: "\\int x \\cos x \\, dx", a: "x \\sin x + \\cos x + C", distractors: ["x \\sin x + C", "-x \\sin x + \\cos x + C", "x \\cos x - \\sin x + C"] },
    { subtema: "por_partes", q: "\\int x \\sin x \\, dx", a: "-x \\cos x + \\sin x + C", distractors: ["x \\cos x + \\sin x + C", "-x \\sin x + C", "x \\sin x - \\cos x + C"] },
    { subtema: "por_partes", q: "\\int x^2 e^x dx", a: "e^x(x^2-2x+2) + C", distractors: ["x^2e^x + C", "e^x(x^2+2x+2) + C", "e^x(2x-2) + C"] },
    { subtema: "por_partes", q: "\\int x \\ln x \\, dx", a: "\\frac{x^2}{2}\\ln x - \\frac{x^2}{4} + C", distractors: ["x^2\\ln x + C", "\\frac{x^2}{2}\\ln x + C", "\\frac{\\ln x}{2} + C"] },
    { subtema: "por_partes", q: "\\int e^x \\sin x dx", a: "\\frac{e^x}{2}(\\sin x - \\cos x) + C", distractors: ["e^x \\cos x + C", "\\frac{e^x}{2}(\\sin x + \\cos x) + C", "e^x \\sin x + C"] },
    { subtema: "por_partes", q: "\\int e^x \\cos x dx", a: "\\frac{e^x}{2}(\\sin x + \\cos x) + C", distractors: ["e^x \\sin x + C", "\\frac{e^x}{2}(\\sin x - \\cos x) + C", "e^x \\cos x + C"] },
    { subtema: "por_partes", q: "\\int x^2 \\cos x dx", a: "x^2 \\sin x + 2x \\cos x - 2\\sin x + C", distractors: ["x^2 \\sin x - 2x \\cos x + C", "x^2 \\cos x + 2x \\sin x + C", "\\frac{x^3}{3} \\sin x + C"] },
    { subtema: "por_partes", q: "\\text{Fórmula: } \\int u \\, dv =", a: "uv - \\int v \\, du", distractors: ["uv + \\int v \\, du", "u'v - uv'", "\\int u' \\, dv + \\int v \\, du"] },

    // ==========================================
    // 8. FRACCIONES PARCIALES (fracciones_parciales)
    // ==========================================
    { subtema: "fracciones_parciales", q: "\\int \\frac{1}{x(x+1)} dx", a: "\\ln|x| - \\ln|x+1| + C", distractors: ["\\ln|x(x+1)|", "\\frac{1}{x^2+x}", "\\ln|x| + \\ln|x+1|"] },
    { subtema: "fracciones_parciales", q: "\\int \\frac{1}{x(x+2)} dx", a: "\\frac{1}{2}\\ln|x| - \\frac{1}{2}\\ln|x+2| + C", distractors: ["\\ln|x| - \\ln|x+2| + C", "\\frac{1}{x(x+2)} + C", "\\frac{1}{2}\\ln|x+2| - \\frac{1}{2}\\ln|x| + C"] },
    { subtema: "fracciones_parciales", q: "\\int \\frac{3x+5}{x^2+3x+2} dx", a: "2\\ln|x+1| + \\ln|x+2| + C", distractors: ["3\\ln|x^2+3x+2| + C", "\\ln|x+1| + 2\\ln|x+2| + C", "\\frac{3x+5}{x^2+3x+2} + C"] },
    { subtema: "fracciones_parciales", q: "\\int \\frac{1}{x^2-4} dx", a: "\\frac{1}{4}\\ln\\left|\\frac{x-2}{x+2}\\right| + C", distractors: ["\\frac{1}{2}\\ln\\left|\\frac{x-2}{x+2}\\right| + C", "\\ln|x^2-4| + C", "\\frac{1}{x^2-4} + C"] },
    { subtema: "fracciones_parciales", q: "\\text{La descomposición de } \\frac{2x+3}{x(x+1)} \\text{ es:}", a: "\\frac{3}{x} - \\frac{1}{x+1}", distractors: ["\\frac{2}{x} + \\frac{3}{x+1}", "\\frac{3}{x} + \\frac{1}{x+1}", "\\frac{1}{x} + \\frac{2}{x+1}"] },
    { subtema: "fracciones_parciales", q: "\\int \\frac{1}{x^2(x+1)} dx", a: "-\\ln|x| - \\frac{1}{x} + \\ln|x+1| + C", distractors: ["\\ln|x| + \\frac{1}{x} + \\ln|x+1| + C", "\\frac{1}{x^2(x+1)} + C", "\\ln|x| - \\frac{1}{x} - \\ln|x+1| + C"] },
    { subtema: "fracciones_parciales", q: "\\text{Descomposición de } \\frac{1}{(x-1)(x-2)}", a: "\\frac{-1}{x-1} + \\frac{1}{x-2}", distractors: ["\\frac{1}{x-1} - \\frac{1}{x-2}", "\\frac{1}{x-1} + \\frac{1}{x-2}", "\\frac{2}{x-1} - \\frac{1}{x-2}"] },
    { subtema: "fracciones_parciales", q: "\\text{Fracciones de } \\frac{x+1}{(x+2)^2}", a: "\\frac{A}{x+2} + \\frac{B}{(x+2)^2}", distractors: ["\\frac{A}{x+2}", "\\frac{A}{x+2} + \\frac{Bx+C}{(x+2)^2}", "\\frac{A}{(x+2)^2}"] },
    { subtema: "fracciones_parciales", q: "\\text{Fracciones de } \\frac{1}{x(x^2+1)}", a: "\\frac{A}{x} + \\frac{Bx+C}{x^2+1}", distractors: ["\\frac{A}{x} + \\frac{B}{x^2+1}", "\\frac{A}{x} + \\frac{B}{(x+1)^2}", "\\frac{Ax+B}{x(x^2+1)}"] },
    { subtema: "fracciones_parciales", q: "\\int \\frac{2}{x^2-1} dx", a: "\\ln|x-1| - \\ln|x+1| + C", distractors: ["\\ln|x^2-1| + C", "\\frac{2x}{x^2-1} + C", "\\ln|x+1| - \\ln|x-1| + C"] },

    // ==========================================
    // 9. APLICACIONES (aplicaciones_int)
    // ==========================================
    { subtema: "aplicaciones_int", q: "\\text{El área bajo } y=x^3 \\text{ en } [0,2] \\text{ es:}", a: "4", distractors: ["8", "2", "6"] },
    { subtema: "aplicaciones_int", q: "\\text{Fórmula del volumen de revolución:}", a: "\\int_a^b \\pi (f(x))^2 dx", distractors: ["\\int_a^b 2\\pi f(x) dx", "\\int_a^b (f(x))^2 dx", "\\pi \\int_a^b f(x) dx"] },
    { subtema: "aplicaciones_int", q: "\\text{El área bajo } y=2x \\text{ en } [0,3] \\text{ es:}", a: "9", distractors: ["6", "18", "3"] },
    { subtema: "aplicaciones_int", q: "\\text{El área entre } y=x \\text{ y } y=x^2 \\text{ en } [0,1] \\text{ es:}", a: "\\frac{1}{6}", distractors: ["\\frac{1}{2}", "\\frac{1}{3}", "1"] },
    { subtema: "aplicaciones_int", q: "\\text{Al girar } y=x \\text{ en } [0,2] \\text{ alrededor del eje } x, \\text{ el volumen es:}", a: "\\frac{8\\pi}{3}", distractors: ["4\\pi", "2\\pi", "\\frac{4\\pi}{3}"] },
    { subtema: "aplicaciones_int", q: "\\text{Si } v(t)=3t^2, \\text{ el desplazamiento de } t=0 \\text{ a } t=2 \\text{ es:}", a: "8", distractors: ["4", "12", "6"] },
    { subtema: "aplicaciones_int", q: "\\text{Área de un círculo de radio } r \\text{ (por integración):}", a: "\\pi r^2", distractors: ["2\\pi r", "\\frac{4}{3}\\pi r^3", "\\frac{1}{2}\\pi r^2"] },
    { subtema: "aplicaciones_int", q: "\\text{Volumen de una esfera de radio } r:", a: "\\frac{4}{3}\\pi r^3", distractors: ["\\pi r^2 h", "\\frac{1}{3}\\pi r^2 h", "4\\pi r^2"] },
    { subtema: "aplicaciones_int", q: "\\text{Longitud de arco de } f(x):", a: "\\int_a^b \\sqrt{1+(f'(x))^2} dx", distractors: ["\\int_a^b (1+(f'(x))^2) dx", "\\int_a^b \\sqrt{1-(f'(x))^2} dx", "\\int_a^b f'(x) dx"] },
    { subtema: "aplicaciones_int", q: "\\text{Área entre } f(x) \\text{ y } g(x) \\text{ con } f \\geq g:", a: "\\int_a^b (f(x)-g(x)) dx", distractors: ["\\int_a^b (f(x)+g(x)) dx", "\\int_a^b f(x)g(x) dx", "\\int_a^b |f(x)+g(x)| dx"] },

    // ==========================================
    // 10. EXTRA: EJERCICIOS ADICIONALES (extra_integral)
    // ==========================================
    { subtema: "sumas_riemann", q: "\\text{La suma inferior usa:}", a: "\\text{Valores mínimos de } f \\text{ en cada subintervalo}", distractors: ["\\text{Valores máximos de } f", "\\text{Solo el extremo derecho}", "\\text{Solo la derivada}"] },
    { subtema: "integrales_directas", q: "\\int (4x^3-2x+5) dx", a: "x^4-x^2+5x+C", distractors: ["4x^4-2x^2+5x+C", "x^4-2x^2+5+C", "x^4-x^2+C"] },
    { subtema: "integrales_directas", q: "\\int \frac{1}{x^2} dx", a: "-\\frac{1}{x}+C", distractors: ["\\ln x + C", "\\frac{1}{x}+C", "-x + C"] },
    { subtema: "integrales_metodos", q: "\\int \frac{x}{x^2+1} dx", a: "\\frac{1}{2}\\ln(x^2+1)+C", distractors: ["\\ln(x^2+1)+C", "\\frac{x^2}{2}+C", "\\frac{x^2+1}{2}+C"] },
    { subtema: "integrales_metodos", q: "\\int \cos^2 x dx", a: "\\frac{x}{2}+\\frac{\\sin 2x}{4}+C", distractors: ["\\sin^2 x + C", "\\frac{\\sin 2x}{2}+C", "\\frac{x}{2}+C"] },
    { subtema: "integrales_evaluadas", q: "\\int_0^3 (x^2+1) dx", a: "12", distractors: ["9", "10", "15"] },
    { subtema: "integrales_evaluadas", q: "\\int_1^4 \\frac{1}{x} dx", a: "\\ln 4", distractors: ["\\ln 3", "1", "4"] },
    { subtema: "integrales_trig", q: "\\int \\sin^2 x dx", a: "\\frac{x}{2}-\\frac{\\sin 2x}{4}+C", distractors: ["\\frac{x}{2}+\\frac{\\sin 2x}{4}+C", "-\\frac{\\cos 2x}{2}+C", "\\sin x + C"] },
    { subtema: "cambio_variable", q: "\\int 3x^2(x^3+1)^4 dx", a: "\\frac{(x^3+1)^5}{5}+C", distractors: ["(x^3+1)^5+C", "\\frac{(x^3+1)^4}{4}+C", "\\frac{x^3+1}{5}+C"] },
    { subtema: "por_partes", q: "\\int x^2 \\ln x dx", a: "\\frac{x^3}{3}\\ln x - \\frac{x^3}{9}+C", distractors: ["\\frac{x^2}{2}\\ln x + C", "x^2\\ln x - x^2 + C", "\\frac{x^3}{9}\\ln x + C"] },
    { subtema: "fracciones_parciales", q: "\\int \\frac{5}{x^2-1} dx", a: "\\frac{5}{2}\\ln\\left|\\frac{x-1}{x+1}\\right| + C", distractors: ["\\ln|x^2-1|+C", "\\frac{5}{x^2-1}+C", "\\frac{5}{2}\\ln|x^2-1|+C"] },
    { subtema: "aplicaciones_int", q: "\\text{La integral de una función positiva da:}", a: "\\text{Área bajo la curva}", distractors: ["\\text{Pendiente}", "\\text{Máximo valor}", "\\text{Tiempo total}"] },

    // ==========================================
    // 11. BANCO EXTRA AVANZADO (mega_integral)
    // ==========================================
    { subtema: "integrales_directas", q: "\\int (3x^2 + 4x + 1) dx", a: "x^3 + 2x^2 + x + C", distractors: ["3x^3 + 4x^2 + x + C", "x^3 + 2x^2 + C", "x^3 + 4x + C"] },
    { subtema: "integrales_directas", q: "\\int (x^4 - 2x^2 + 5) dx", a: "\\frac{x^5}{5} - \\frac{2x^3}{3} + 5x + C", distractors: ["\\frac{x^5}{5} - 2x^3 + 5x + C", "x^5 - x^3 + 5x + C", "\\frac{x^5}{4} - \\frac{2x^3}{3} + 5 + C"] },
    { subtema: "integrales_directas", q: "\\int \\frac{1}{x^3} dx", a: "-\\frac{1}{2x^2} + C", distractors: ["-\\frac{1}{x^2} + C", "\\frac{1}{2x^2} + C", "-\\frac{1}{3x^3} + C"] },
    { subtema: "integrales_directas", q: "\\int \\sqrt{x^3} dx", a: "\\frac{2}{5}x^{5/2} + C", distractors: ["\\frac{3}{2}x^{1/2} + C", "x^{5/2} + C", "\\frac{2}{3}x^{3/2} + C"] },
    { subtema: "integrales_metodos", q: "\\int \\sin(3x) dx", a: "-\\frac{1}{3}\\cos(3x) + C", distractors: ["-\\cos(3x) + C", "\\frac{1}{3}\\sin(3x) + C", "-3\\cos(3x) + C"] },
    { subtema: "integrales_metodos", q: "\\int \\frac{1}{x^2+4} dx", a: "\\frac{1}{2}\\arctan\\left(\\frac{x}{2}\\right) + C", distractors: ["\\arctan(x^2+4) + C", "\\frac{1}{2}\\ln(x^2+4) + C", "\\frac{1}{4}\\arctan(x) + C"] },
    { subtema: "integrales_metodos", q: "\\int x e^{x^2} dx", a: "\\frac{1}{2}e^{x^2}+C", distractors: ["e^{x^2}+C", "x e^{x^2}+C", "\\frac{1}{2}x e^{x^2}+C"] },
    { subtema: "integrales_metodos", q: "\\int \\frac{2x}{x^2+1} dx", a: "\\ln(x^2+1)+C", distractors: ["\\frac{1}{x^2+1}+C", "2\\ln(x^2+1)+C", "\\ln|x|+C"] },
    { subtema: "integrales_metodos", q: "\\int \\frac{1}{\\sqrt{1-x^2}} dx", a: "\\arcsin x + C", distractors: ["\\arccos x + C", "\\ln|1-x^2| + C", "\\arctan x + C"] },
    { subtema: "integrales_evaluadas", q: "\\int_0^2 (2x+1) dx", a: "6", distractors: ["5", "4", "8"] },
    { subtema: "integrales_evaluadas", q: "\\int_0^1 (x^3+2x) dx", a: "\\frac{5}{4}", distractors: ["\\frac{3}{4}", "1", "\\frac{7}{4}"] },
    { subtema: "integrales_evaluadas", q: "\\int_0^{\\pi/2} \\sin x dx", a: "1", distractors: ["0", "\\pi/2", "-1"] },
    { subtema: "integrales_trig", q: "\\int \\cot x dx", a: "\\ln|\\sin x| + C", distractors: ["\\ln|\\cos x| + C", "-\\ln|\\sin x| + C", "\\tan x + C"] },
    { subtema: "integrales_trig", q: "\\int \\csc x \\cot x dx", a: "-\\csc x + C", distractors: ["\\csc x + C", "-\\cot x + C", "\\sec x + C"] },
    { subtema: "cambio_variable", q: "\\int (3x-2)^7 dx", a: "\\frac{(3x-2)^8}{24} + C", distractors: ["\\frac{(3x-2)^8}{8}+C", "\\frac{(3x-2)^7}{7}+C", "\\frac{(3x-2)^6}{6}+C"] },
    { subtema: "cambio_variable", q: "\\int x \\sqrt{1+x^2} dx", a: "\\frac{1}{3}(1+x^2)^{3/2}+C", distractors: ["\\frac{1}{2}(1+x^2)^{3/2}+C", "(1+x^2)^{3/2}+C", "\\sqrt{1+x^2}+C"] },
    { subtema: "por_partes", q: "\\int x^2 e^x dx", a: "e^x(x^2-2x+2)+C", distractors: ["e^x(x^2+2x+2)+C", "x^2 e^x + C", "e^x(x-1)+C"] },
    { subtema: "por_partes", q: "\\int e^x \\cos x dx", a: "\\frac{e^x}{2}(\\sin x + \\cos x) + C", distractors: ["\\frac{e^x}{2}(\\sin x - \\cos x) + C", "e^x \\sin x + C", "e^x \\cos x + C"] },
    { subtema: "fracciones_parciales", q: "\\int \\frac{1}{x^2+3x+2} dx", a: "\\ln|x+1| - \\ln|x+2| + C", distractors: ["\\ln|x+2| - \\ln|x+1| + C", "\\frac{1}{x^2+3x+2}+C", "\\ln(x^2+3x+2)+C"] },
    { subtema: "aplicaciones_int", q: "\\text{La integral definida de una velocidad respecto al tiempo da:}", a: "\\text{Desplazamiento}", distractors: ["\\text{Aceleración}", "\\text{Pendiente}", "\\text{Tiempo}"] },
    { subtema: "aplicaciones_int", q: "\\text{El volumen al rotar } y=f(x) \\text{ alrededor del eje } x \\text{ es:}", a: "\\pi \\int_a^b [f(x)]^2 dx", distractors: ["\\pi \\int_a^b f(x) dx", "\\int_a^b [f(x)]^2 dx", "2\\pi \\int_a^b f(x) dx"] }
];
