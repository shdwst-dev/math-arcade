const dataIntegral = [
    // ==========================================
    // 1. SUMAS DE RIEMANN (sumas_riemann)
    // ==========================================
    { subtema: "sumas_riemann", q: "\\text{La suma de Riemann aproxima el área usando:}", a: "\\text{Rectángulos}", distractors: ["\\text{Círculos}", "\\text{Triángulos}", "\\text{Trapecios}"] },
    { subtema: "sumas_riemann", q: "\\lim_{n \\to \\infty} \\sum_{i=1}^n f(x_i) \\Delta x", a: "\\int_a^b f(x) dx", distractors: ["f'(x)", "\\frac{d}{dx}f(x)", "\\infty"] },
    
    // ==========================================
    // 2. INTEGRALES DIRECTAS (integrales_directas)
    // ==========================================
    { subtema: "integrales_directas", q: "\\int 2x dx", a: "x^2 + C", distractors: ["2x + C", "x + C", "x^3 + C"] },
    { subtema: "integrales_directas", q: "\\int 5 dx", a: "5x + C", distractors: ["5 + C", "0", "x^5 + C"] },
    { subtema: "integrales_directas", q: "\\int x^2 dx", a: "\\frac{x^3}{3} + C", distractors: ["2x + C", "x^3 + C", "3x^3"] },
    { subtema: "integrales_directas", q: "\\int e^x dx", a: "e^x + C", distractors: ["xe^x", "\\ln x", "1"] },
    { subtema: "integrales_directas", q: "\\int \\frac{1}{x} dx", a: "\\ln|x| + C", distractors: ["x^{-1}", "e^x", "1"] },
    
    // ==========================================
    // 3. INTEGRALES POR MÉTODOS (integrales_metodos)
    // ==========================================
    { subtema: "integrales_metodos", q: "\\text{¿Qué método usarías para } \\int x e^x dx?", a: "\\text{Por Partes}", distractors: ["\\text{Sustitución}", "\\text{Fracciones Parciales}", "\\text{Directa}"] },
    
    // ==========================================
    // 4. INTEGRALES EVALUADAS (integrales_evaluadas)
    // ==========================================
    { subtema: "integrales_evaluadas", q: "\\int_0^1 2x dx", a: "1", distractors: ["0", "2", "\\frac{1}{2}"] },
    { subtema: "integrales_evaluadas", q: "\\int_1^2 3x^2 dx", a: "7", distractors: ["8", "1", "4"] },
    
    // ==========================================
    // 5. INTEGRALES TRIGONOMÉTRICAS (integrales_trig)
    // ==========================================
    { subtema: "integrales_trig", q: "\\int \\cos x dx", a: "\\sin x + C", distractors: ["-\\sin x", "\\cos x", "-\\cos x"] },
    { subtema: "integrales_trig", q: "\\int \\sin x dx", a: "-\\cos x + C", distractors: ["\\cos x + C", "\\sin x", "1"] },
    { subtema: "integrales_trig", q: "\\int \\sec^2 x dx", a: "\\tan x + C", distractors: ["\\sec x \tan x", "-\\cot x", "\\sin x"] },
    
    // ==========================================
    // 6. CAMBIO DE VARIABLE (cambio_variable)
    // ==========================================
    { subtema: "cambio_variable", q: "\\int 2x e^{x^2} dx", a: "e^{x^2} + C", distractors: ["2e^{x^2} + C", "x^2 e^{x^2} + C", "e^x + C"] },
    
    // ==========================================
    // 7. INTEGRACIÓN POR PARTES (por_partes)
    // ==========================================
    { subtema: "por_partes", q: "\\int x e^x dx", a: "x e^x - e^x + C", distractors: ["x e^x + C", "e^x - x e^x + C", "\\frac{x^2}{2} e^x + C"] },
    { subtema: "por_partes", q: "\\int \\ln x dx", a: "x \\ln x - x + C", distractors: ["\\frac{1}{x} + C", "x \\ln x + C", "\\ln x - x"] },
    
    // ==========================================
    // 8. FRACCIONES PARCIALES (fracciones_parciales)
    // ==========================================
    { subtema: "fracciones_parciales", q: "\\int \\frac{1}{x(x+1)} dx", a: "\\ln|x| - \\ln|x+1| + C", distractors: ["\\ln|x(x+1)|", "\\frac{1}{x^2+x}", "\\ln|x| + \\ln|x+1|"] },
    
    // ==========================================
    // 9. APLICACIONES (aplicaciones_int)
    // ==========================================
    { subtema: "aplicaciones_int", q: "\\text{El área bajo } y=x^3 \\text{ en } [0,2] \\text{ es:}", a: "4", distractors: ["8", "2", "6"] },
    { subtema: "aplicaciones_int", q: "\\text{Fórmula del volumen de revolución:}", a: "\\int_a^b \\pi (f(x))^2 dx", distractors: ["\\int_a^b 2\\pi f(x) dx", "\\int_a^b (f(x))^2 dx", "\\pi \\int_a^b f(x) dx"] }
];
