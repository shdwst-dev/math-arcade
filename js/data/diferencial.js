const dataDiferencial = [
    // ==========================================
    // 1. FUNCIONES (funciones)
    // ==========================================
    { subtema: "funciones", q: "\\text{El dominio de } f(x) = \\sqrt{x} \\text{ es:}", a: "[0, \\infty)", distractors: ["(-\\infty, \\infty)", "(0, \\infty)", "x \\neq 0"] },
    { subtema: "funciones", q: "\\text{El dominio de } f(x) = \\frac{1}{x-3} \\text{ es:}", a: "(-\\infty, 3) \\cup (3, \\infty)", distractors: ["(-\\infty, 3)", "(3, \\infty)", "(-\\infty, \\infty)"] },
    { subtema: "funciones", q: "\\text{El dominio de } f(x) = \\sqrt{4-x} \\text{ es:}", a: "(-\\infty, 4]", distractors: ["[4, \\infty)", "(-\\infty, 4)", "(-\\infty, \\infty)"] },
    { subtema: "funciones", q: "\\text{El dominio de } f(x) = \\ln(x-1) \\text{ es:}", a: "(1, \\infty)", distractors: ["[1, \\infty)", "(-\\infty, 1)", "(-\\infty, \\infty)"] },
    { subtema: "funciones", q: "\\text{Si } f(x)=2x+1\\text{, entonces }f(3)\\text{ es:}", a: "7", distractors: ["5", "6", "8"] },
    { subtema: "funciones", q: "\\text{La función } f(x)=x^3 \\text{ es:}", a: "\\text{Impar}", distractors: ["\\text{Par}", "\\text{Constante}", "\\text{No es función}"] },
    { subtema: "funciones", q: "\\text{El rango de } f(x) = x^2 \\text{ es:}", a: "[0, \\infty)", distractors: ["(-\\infty, \\infty)", "(0, \\infty)", "(-\\infty, 0]"] },
    { subtema: "funciones", q: "\\text{Si } f(x)=x^2 \\text{ y } g(x)=x+1, f(g(x))=?", a: "(x+1)^2", distractors: ["x^2+1", "x^2+x", "x^2+2x"] },
    { subtema: "funciones", q: "\\text{La inversa de } f(x)=2x \\text{ es:}", a: "f^{-1}(x) = \\frac{x}{2}", distractors: ["f^{-1}(x) = -2x", "f^{-1}(x) = x-2", "f^{-1}(x) = 2"] },
    { subtema: "funciones", q: "\\text{El dominio de } f(x) = e^x \\text{ es:}", a: "(-\\infty, \\infty)", distractors: ["(0, \\infty)", "[0, \\infty)", "x \\neq 0"] },
    
    // ==========================================
    // 2. LÍMITES (limites)
    // ==========================================
    { subtema: "limites", q: "\\lim_{x \\to 0} \\frac{\\sin x}{x}", a: "1", distractors: ["0", "\\infty", "\\text{No existe}"] },
    { subtema: "limites", q: "\\lim_{x \\to 2} \\frac{x^2-4}{x-2}", a: "4", distractors: ["0", "2", "\\text{No existe}"] },
    { subtema: "limites", q: "\\lim_{x \\to 0} \\frac{1-\\cos x}{x}", a: "0", distractors: ["1", "\\infty", "\\text{No existe}"] },
    { subtema: "limites", q: "\\lim_{x \\to 3} \\frac{x^2-9}{x-3}", a: "6", distractors: ["3", "9", "\\text{No existe}"] },
    { subtema: "limites", q: "\\lim_{x \\to 1} \\frac{x^3-1}{x-1}", a: "3", distractors: ["0", "1", "\\text{No existe}"] },
    { subtema: "limites", q: "\\lim_{x \\to 0} \\frac{\\tan x}{x}", a: "1", distractors: ["0", "-1", "\\text{No existe}"] },
    { subtema: "limites", q: "\\lim_{x \\to 0} \\frac{\\sin(2x)}{x}", a: "2", distractors: ["1", "0", "\\frac{1}{2}"] },
    { subtema: "limites", q: "\\lim_{x \\to 4} \\frac{\\sqrt{x}-2}{x-4}", a: "\\frac{1}{4}", distractors: ["0", "4", "1"] },
    { subtema: "limites", q: "\\lim_{x \\to 0} \\frac{e^x-1}{x}", a: "1", distractors: ["0", "e", "\\infty"] },
    { subtema: "limites", q: "\\lim_{x \\to 1} \\frac{\\ln x}{x-1}", a: "1", distractors: ["0", "\\infty", "-1"] },
    
    // ==========================================
    // 3. DERIVADAS DIRECTAS (derivadas_directas)
    // ==========================================
    { subtema: "derivadas_directas", q: "\\frac{d}{dx}(x^2)", a: "2x", distractors: ["x", "2", "x^2"] },
    { subtema: "derivadas_directas", q: "\\frac{d}{dx}(5x)", a: "5", distractors: ["5x", "x", "0"] },
    { subtema: "derivadas_directas", q: "\\frac{d}{dx}(\\sin x)", a: "\\cos x", distractors: ["-\\cos x", "\\sin x", "\\tan x"] },
    { subtema: "derivadas_directas", q: "\\frac{d}{dx}(e^x)", a: "e^x", distractors: ["x e^{x-1}", "0", "1"] },
    { subtema: "derivadas_directas", q: "\\frac{d}{dx}(7)", a: "0", distractors: ["7", "7x", "1"] },
    { subtema: "derivadas_directas", q: "\\frac{d}{dx}(\\cos x)", a: "-\\sin x", distractors: ["\\sin x", "\\cos x", "0"] },
    { subtema: "derivadas_directas", q: "\\frac{d}{dx}(x^3)", a: "3x^2", distractors: ["2x^3", "x^2", "3x"] },
    { subtema: "derivadas_directas", q: "\\frac{d}{dx}(\\ln x)", a: "\\frac{1}{x}", distractors: ["x", "e^x", "-\\frac{1}{x^2}"] },
    { subtema: "derivadas_directas", q: "\\frac{d}{dx}(\\tan x)", a: "\\sec^2 x", distractors: ["\\sec x", "-\\csc^2 x", "\\cot x"] },
    { subtema: "derivadas_directas", q: "\\frac{d}{dx}(\\sqrt{x})", a: "\\frac{1}{2\\sqrt{x}}", distractors: ["\\frac{1}{\\sqrt{x}}", "2\\sqrt{x}", "\\frac{-1}{2\\sqrt{x}}"] },
    
    // ==========================================
    // 4. MÉTODOS DE DERIVADAS (metodos_derivadas)
    // ==========================================
    { subtema: "metodos_derivadas", q: "\\frac{d}{dx}(x e^x)", a: "e^x(x+1)", distractors: ["e^x", "x e^x", "1"] },
    { subtema: "metodos_derivadas", q: "\\frac{d}{dx}(x^2\\sin x)", a: "2x\\sin x+x^2\\cos x", distractors: ["2x\\cos x", "x^2\\cos x", "2x\\sin x"] },
    { subtema: "metodos_derivadas", q: "\\frac{d}{dx}\\left(\\frac{x^2+1}{x-1}\\right)", a: "\\frac{x^2-2x-1}{(x-1)^2}", distractors: ["\\frac{2x}{x-1}", "\\frac{x^2+1}{(x-1)^2}", "\\frac{x^2-2x+1}{(x-1)^2}"] },
    { subtema: "metodos_derivadas", q: "\\frac{d}{dx}(3x-1)^5", a: "15(3x-1)^4", distractors: ["5(3x-1)^4", "15(3x-1)^5", "3(3x-1)^4"] },
    { subtema: "metodos_derivadas", q: "\\frac{d}{dx}\\ln(x^2+1)", a: "\\frac{2x}{x^2+1}", distractors: ["\\frac{1}{x^2+1}", "2x\\ln(x^2+1)", "\\frac{2}{x^2+1}"] },
    { subtema: "metodos_derivadas", q: "\\frac{d}{dx}\\sin(x^2)", a: "2x\\cos(x^2)", distractors: ["\\cos(x^2)", "2x\\sin(x^2)", "\\cos x^2"] },
    { subtema: "metodos_derivadas", q: "\\frac{d}{dx} e^{2x}", a: "2e^{2x}", distractors: ["e^{2x}", "2xe^{2x}", "\\frac{1}{2}e^{2x}"] },
    { subtema: "metodos_derivadas", q: "\\frac{d}{dx} (x \\ln x)", a: "\\ln x + 1", distractors: ["\\ln x", "\\frac{1}{x}", "x"] },
    { subtema: "metodos_derivadas", q: "\\frac{d}{dx} \\sqrt{x^2+1}", a: "\\frac{x}{\\sqrt{x^2+1}}", distractors: ["\\frac{1}{2\\sqrt{x^2+1}}", "\\frac{2x}{\\sqrt{x^2+1}}", "2x"] },
    { subtema: "metodos_derivadas", q: "\\frac{d}{dx} \\cos^2 x", a: "-2\\sin x \\cos x", distractors: ["2\\cos x", "-2\\sin x", "2\\sin x \\cos x"] },
    
    // ==========================================
    // 5. LÍMITES AL INFINITO (limites_infinito)
    // ==========================================
    { subtema: "limites_infinito", q: "\\lim_{x \\to \\infty} \\frac{1}{x}", a: "0", distractors: ["\\infty", "1", "-\\infty"] },
    { subtema: "limites_infinito", q: "\\lim_{x \\to \\infty} \\frac{3x^2-1}{x^2+5}", a: "3", distractors: ["0", "\\infty", "\\frac{1}{3}"] },
    { subtema: "limites_infinito", q: "\\lim_{x \\to \\infty} \\frac{2x+1}{x^2+1}", a: "0", distractors: ["2", "1", "\\infty"] },
    { subtema: "limites_infinito", q: "\\lim_{x \\to \\infty} \\frac{5x^3-x}{2x^3+4}", a: "\\frac{5}{2}", distractors: ["\\frac{2}{5}", "5", "0"] },
    { subtema: "limites_infinito", q: "\\lim_{x \\to \\infty} \\frac{\\sqrt{x^2+1}}{x}", a: "1", distractors: ["0", "\\infty", "-1"] },
    { subtema: "limites_infinito", q: "\\lim_{x \\to -\\infty} \\frac{4x^2+x}{x^2-7}", a: "4", distractors: ["-4", "0", "-\\infty"] },
    { subtema: "limites_infinito", q: "\\lim_{x \\to \\infty} e^{-x}", a: "0", distractors: ["1", "\\infty", "-1"] },
    { subtema: "limites_infinito", q: "\\lim_{x \\to \\infty} \\ln x", a: "\\infty", distractors: ["0", "1", "e"] },
    { subtema: "limites_infinito", q: "\\lim_{x \\to \\infty} \\frac{x^3}{e^x}", a: "0", distractors: ["\\infty", "1", "3"] },
    { subtema: "limites_infinito", q: "\\lim_{x \\to \\infty} \\left(1+\\frac{1}{x}\\right)^x", a: "e", distractors: ["1", "\\infty", "0"] },
    
    // ==========================================
    // 6. APLICACIONES (aplicaciones_dif)
    // ==========================================
    { subtema: "aplicaciones_dif", q: "\\text{Si } f'(x)=0 \\text{ en } c \\text{, entonces } c \\text{ es:}", a: "\\text{Punto crítico}", distractors: ["\\text{Máximo}", "\\text{Mínimo}", "\\text{Punto de inflexión}"] },
    { subtema: "aplicaciones_dif", q: "\\text{El punto crítico de } f(x)=x^2-4x \\text{ ocurre en:}", a: "x=2", distractors: ["x=-2", "x=4", "x=0"] },
    { subtema: "aplicaciones_dif", q: "\\text{La función } f(x)=-x^2+4x \\text{ alcanza su máximo en:}", a: "x=2", distractors: ["x=-2", "x=0", "x=4"] },
    { subtema: "aplicaciones_dif", q: "\\text{La recta tangente a } f(x)=x^2 \\text{ en } x=1 \\text{ es:}", a: "y=2x-1", distractors: ["y=x+1", "y=2x+1", "y=x-1"] },
    { subtema: "aplicaciones_dif", q: "\\text{Si } s(t)=t^2+3t\\text{, la velocidad en }t=2\\text{ es:}", a: "7", distractors: ["4", "5", "10"] },
    { subtema: "aplicaciones_dif", q: "\\text{Para } f(x)=x^3-3x\\text{, los puntos críticos ocurren en:}", a: "x=-1 \\text{ y } x=1", distractors: ["x=0", "x=-3 \\text{ y } x=3", "x=1"] },
    { subtema: "aplicaciones_dif", q: "\\text{Un punto de inflexión ocurre cuando:}", a: "f''(x) = 0", distractors: ["f'(x) = 0", "f(x) = 0", "f'(x) = \\infty"] },
    { subtema: "aplicaciones_dif", q: "\\text{Si } f''(c) > 0\\text{, el punto crítico } c \\text{ es un:}", a: "\\text{Mínimo local}", distractors: ["\\text{Máximo local}", "\\text{Punto de inflexión}", "\\text{No se puede saber}"] },
    { subtema: "aplicaciones_dif", q: "\\text{Si el costo es } C(x)=x^2+10x\\text{, el costo marginal es:}", a: "2x+10", distractors: ["x+10", "x^2", "10x"] },
    { subtema: "aplicaciones_dif", q: "\\text{La pendiente de la normal a } f(x)=x^2 \\text{ en } x=1 \\text{ es:}", a: "-\\frac{1}{2}", distractors: ["2", "-2", "\\frac{1}{2}"] },

    // ==========================================
    // 7. EXTRA: EJERCICIOS ADICIONALES (extra_diferencial)
    // ==========================================
    { subtema: "funciones", q: "\\text{La gráfica de } y=|x| \\text{ es:}", a: "\\text{Simétrica respecto al eje } y", distractors: ["\\text{Simétrica respecto al eje } x", "\\text{Siempre decreciente}", "\\text{Constante}"] },
    { subtema: "funciones", q: "\\text{La función } f(x)=x^2-4 \\text{ corta al eje } x \\text{ en:}", a: "x=2, x=-2", distractors: ["x=0", "x=4", "x=-4"] },
    { subtema: "limites", q: "\\lim_{x \\to 0} \\frac{\\sqrt{x+1}-1}{x}", a: "\\frac{1}{2}", distractors: ["1", "0", "-\\frac{1}{2}"] },
    { subtema: "limites", q: "\\lim_{x \\to -1} \\frac{x^2-1}{x+1}", a: "-2", distractors: ["0", "2", "1"] },
    { subtema: "derivadas_directas", q: "\\frac{d}{dx}(3x^4)", a: "12x^3", distractors: ["4x^3", "3x^3", "12x^2"] },
    { subtema: "derivadas_directas", q: "\\frac{d}{dx}(x^5-2x^3)", a: "5x^4-6x^2", distractors: ["5x^4-2x^2", "5x^3-6x", "x^5-6x^2"] },
    { subtema: "metodos_derivadas", q: "\\frac{d}{dx}(\\sin x \\cos x)", a: "\\cos^2 x - \\sin^2 x", distractors: ["\\sin^2 x - \\cos^2 x", "\\cos x - \\sin x", "0"] },
    { subtema: "metodos_derivadas", q: "\\frac{d}{dx}(\\ln(3x+1))", a: "\\frac{3}{3x+1}", distractors: ["\\frac{1}{3x+1}", "\\frac{3x}{3x+1}", "\\frac{3}{x+1}"] },
    { subtema: "limites_infinito", q: "\\lim_{x \\to \\infty} \\frac{x^2+3x}{x^2-1}", a: "1", distractors: ["3", "0", "\\infty"] },
    { subtema: "aplicaciones_dif", q: "\\text{La velocidad es la derivada de:}", a: "\\text{La posición respecto al tiempo}", distractors: ["\\text{La aceleración}", "\\text{La pendiente}", "\\text{La función inversa}"] },
    { subtema: "aplicaciones_dif", q: "\\text{Si } f'(x)>0 \\text{ en un intervalo, entonces } f \\text{ es:}", a: "\\text{Creciente}", distractors: ["\\text{Decreciente}", "\\text{Constante}", "\\text{Inflexión}"] },
    { subtema: "aplicaciones_dif", q: "\\text{La ecuación de la tangente a } y=x^2 \\text{ en } x=3 \\text{ es:}", a: "y=6x-9", distractors: ["y=3x-9", "y=6x+9", "y=9x-6"] },

    // ==========================================
    // 8. BANCO EXTRA AVANZADO (mega_diferencial)
    // ==========================================
    { subtema: "funciones", q: "\\text{El dominio de } f(x)=\\frac{x}{x^2-9} \\text{ es:}", a: "(-\\infty,-3) \\cup (-3,3) \\cup (3,\\infty)", distractors: ["(-\\infty,3)", "(-3,3)", "[-3,3]"] },
    { subtema: "funciones", q: "\\text{La función } f(x)=x^4-2x^2 \\text{ es:}", a: "\\text{Par}", distractors: ["\\text{Impar}", "\\text{Ni par ni impar}", "\\text{Constante}"] },
    { subtema: "funciones", q: "\\text{La función } f(x)=x^3+x \\text{ es:}", a: "\\text{Impar}", distractors: ["\\text{Par}", "\\text{Periódica}", "\\text{No es función}"] },
    { subtema: "funciones", q: "\\text{El valor de } f(0) \\text{ para } f(x)=3x^2-5x+2 \\text{ es:}", a: "2", distractors: ["0", "-2", "5"] },
    { subtema: "funciones", q: "\\text{La composición } g(f(x)) \\text{ para } f(x)=x+2, g(x)=x^2 \\text{ es:}", a: "(x+2)^2", distractors: ["x^2+2", "x^2+x+2", "2x^2"] },
    { subtema: "limites", q: "\\lim_{x \\to 2} \\frac{x^2-5x+6}{x-2}", a: "-1", distractors: ["1", "0", "\\infty"] },
    { subtema: "limites", q: "\\lim_{x \\to 0} \\frac{\\sin(3x)}{x}", a: "3", distractors: ["1", "0", "-3"] },
    { subtema: "limites", q: "\\lim_{x \\to 0} \\frac{1-\\cos(2x)}{x^2}", a: "2", distractors: ["0", "4", "1"] },
    { subtema: "limites", q: "\\lim_{x \\to 0} \\frac{\\sqrt{1+x}-1}{x}", a: "\\frac{1}{2}", distractors: ["1", "0", "-\\frac{1}{2}"] },
    { subtema: "limites", q: "\\lim_{x \\to 1} \\frac{x^4-1}{x-1}", a: "4", distractors: ["1", "0", "2"] },
    { subtema: "derivadas_directas", q: "\\frac{d}{dx}(x^6)", a: "6x^5", distractors: ["x^5", "6x^6", "5x^6"] },
    { subtema: "derivadas_directas", q: "\\frac{d}{dx}(5x^4 - 3x^2 + 7)", a: "20x^3 - 6x", distractors: ["20x^4 - 6x^2", "20x^3 - 3x", "5x^3 - 6x"] },
    { subtema: "derivadas_directas", q: "\\frac{d}{dx}(\\sqrt[3]{x})", a: "\\frac{1}{3x^{2/3}}", distractors: ["\\frac{1}{3\\sqrt{x}}", "x^{-1/3}", "\\frac{2}{3}x^{1/3}"] },
    { subtema: "derivadas_directas", q: "\\frac{d}{dx}(\\ln(2x+1))", a: "\\frac{2}{2x+1}", distractors: ["\\frac{1}{2x+1}", "\\frac{2x}{2x+1}", "\\frac{2}{x+1}"] },
    { subtema: "metodos_derivadas", q: "\\frac{d}{dx}(x^2 \\cos x)", a: "2x\\cos x - x^2\\sin x", distractors: ["2x\\cos x + x^2\\sin x", "2x\\sin x - x^2\\cos x", "x^2\\sin x"] },
    { subtema: "metodos_derivadas", q: "\\frac{d}{dx}(x^3+1)^4", a: "12x^2(x^3+1)^3", distractors: ["4(x^3+1)^3", "12x^2(x^3+1)^2", "4x^2(x^3+1)^3"] },
    { subtema: "metodos_derivadas", q: "\\frac{d}{dx} \\left(\\frac{x+1}{x-1}\\right)", a: "-\\frac{2}{(x-1)^2}", distractors: ["\\frac{2}{(x-1)^2}", "\\frac{1}{x-1}", "-\\frac{1}{(x-1)^2}"] },
    { subtema: "metodos_derivadas", q: "\\frac{d}{dx}(e^{x^2})", a: "2x e^{x^2}", distractors: ["e^{x^2}", "2e^{x^2}", "x e^{x^2}"] },
    { subtema: "metodos_derivadas", q: "\\frac{d}{dx}(\\tan(3x))", a: "3\\sec^2(3x)", distractors: ["\\sec^2(3x)", "3\\tan(3x)", "3\\sin(3x)"] },
    { subtema: "limites_infinito", q: "\\lim_{x \\to \\infty} \\frac{7x^3+2x}{x^3-5}", a: "7", distractors: ["2", "0", "\\infty"] },
    { subtema: "limites_infinito", q: "\\lim_{x \\to -\\infty} \\frac{3x+1}{2x-4}", a: "\\frac{3}{2}", distractors: ["-\\frac{3}{2}", "0", "\\infty"] },
    { subtema: "limites_infinito", q: "\\lim_{x \\to \\infty} \\frac{\\ln x}{x}", a: "0", distractors: ["1", "\\infty", "e"] },
    { subtema: "limites_infinito", q: "\\lim_{x \\to \\infty} \\frac{x^5}{e^x}", a: "0", distractors: ["1", "\\infty", "5"] },
    { subtema: "aplicaciones_dif", q: "\\text{La recta tangente a } y=x^2+1 \\text{ en } x=2 \\text{ es:}", a: "y=4x-3", distractors: ["y=2x+1", "y=4x+3", "y=2x-1"] },
    { subtema: "aplicaciones_dif", q: "\\text{Si } f'(x)<0 \\text{ en un intervalo, entonces } f \\text{ es:}", a: "\\text{Decreciente}", distractors: ["\\text{Creciente}", "\\text{Constante}", "\\text{Inflexión}"] },
    { subtema: "aplicaciones_dif", q: "\\text{La aceleración es la derivada de:}", a: "\\text{La velocidad}", distractors: ["\\text{La posición}", "\\text{La función inversa}", "\\text{La pendiente}"] },
    { subtema: "aplicaciones_dif", q: "\\text{El valor máximo de } f(x)= -x^2+4x+1 \\text{ ocurre en:}", a: "x=2", distractors: ["x=1", "x=4", "x=-2"] },
    { subtema: "aplicaciones_dif", q: "\\text{El radio de curvatura mide la:}", a: "\\text{Inverso de la curvatura}", distractors: ["\\text{Pendiente}", "\\text{Integral}", "\\text{Fracción de la recta}"] }
];
