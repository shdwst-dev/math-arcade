const dataDiferencial = [
    // ==========================================
    // 1. FUNCIONES (funciones)
    // ==========================================
    { subtema: "funciones", q: "\\text{El dominio de } f(x) = \\sqrt{x} \\text{ es:}", a: "[0, \\infty)", distractors: ["(-\\infty, \\infty)", "(0, \\infty)", "x \\neq 0"] },
    
    // ==========================================
    // 2. LÍMITES (limites)
    // ==========================================
    { subtema: "limites", q: "\\lim_{x \\to 0} \\frac{\\sin x}{x}", a: "1", distractors: ["0", "\\infty", "\\text{No existe}"] },
    
    // ==========================================
    // 3. DERIVADAS DIRECTAS (derivadas_directas)
    // ==========================================
    { subtema: "derivadas_directas", q: "\\frac{d}{dx}(x^2)", a: "2x", distractors: ["x", "2", "x^2"] },
    { subtema: "derivadas_directas", q: "\\frac{d}{dx}(5x)", a: "5", distractors: ["5x", "x", "0"] },
    { subtema: "derivadas_directas", q: "\\frac{d}{dx}(\\sin x)", a: "\\cos x", distractors: ["-\\cos x", "\\sin x", "\\tan x"] },
    { subtema: "derivadas_directas", q: "\\frac{d}{dx}(e^x)", a: "e^x", distractors: ["x e^{x-1}", "0", "1"] },
    { subtema: "derivadas_directas", q: "\\frac{d}{dx}(7)", a: "0", distractors: ["7", "7x", "1"] },
    { subtema: "derivadas_directas", q: "\\frac{d}{dx}(\\cos x)", a: "-\\sin x", distractors: ["\\sin x", "\\cos x", "0"] },
    
    // ==========================================
    // 4. MÉTODOS DE DERIVADAS (metodos_derivadas)
    // ==========================================
    { subtema: "metodos_derivadas", q: "\\frac{d}{dx}(x e^x)", a: "e^x(x+1)", distractors: ["e^x", "x e^x", "1"] },
    
    // ==========================================
    // 5. LÍMITES AL INFINITO (limites_infinito)
    // ==========================================
    { subtema: "limites_infinito", q: "\\lim_{x \\to \\infty} \\frac{1}{x}", a: "0", distractors: ["\\infty", "1", "-\\\infty"] },
    
    // ==========================================
    // 6. APLICACIONES (aplicaciones_dif)
    // ==========================================
    { subtema: "aplicaciones_dif", q: "\\text{Si } f'(x)=0 \\text{ en } c \\text{, entonces } c \\text{ es:}", a: "\\text{Punto crítico}", distractors: ["\\text{Máximo}", "\\text{Mínimo}", "\\text{Punto de inflexión}"] }
];
